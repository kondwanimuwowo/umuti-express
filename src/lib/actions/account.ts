"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { recordAcceptance } from "@/lib/legal";

const phoneRule = z
  .string()
  .trim()
  .regex(/^(\+?260|0)(9[5-7]|7[5-7])\d{7}$/, "Enter a valid MTN or Airtel number, e.g. 0977123456");

export async function signUp(formData: FormData) {
  const parsed = z
    .object({
      fullName: z.string().trim().min(2, "Enter your name.").max(120),
      email: z.string().trim().email("Enter a valid email address."),
      phone: phoneRule,
      password: z.string().min(8, "Use at least 8 characters."),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  if (formData.get("acceptTerms") !== "on") {
    return { ok: false as const, error: "Agree to the Terms of Service and Privacy Policy to create an account." };
  }

  const { fullName, email, phone, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });
  if (error) return { ok: false as const, error: error.message };
  if (!data.user) return { ok: false as const, error: "Sign-up failed. Please try again." };

  await prisma.profile.upsert({
    where: { id: data.user.id },
    create: { id: data.user.id, email, fullName, phone },
    update: { email, fullName, phone },
  });
  await recordAcceptance({ profileId: data.user.id, types: ["TERMS", "PRIVACY"] });

  if (!data.session) {
    return { ok: true as const, message: "Check your email to confirm your account." };
  }
  redirect("/account");
}

export async function signIn(formData: FormData) {
  const parsed = z
    .object({
      email: z.string().trim().email("Enter a valid email address."),
      password: z.string().min(1, "Enter your password."),
      next: z.string().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false as const, error: "Those details don't match an account." };

  revalidatePath("/", "layout");
  redirect(parsed.data.next?.startsWith("/") ? parsed.data.next : "/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const profile = await requireProfile("/account");
  const parsed = z
    .object({
      fullName: z.string().trim().min(2, "Enter your name.").max(120),
      phone: phoneRule,
      address: z.string().trim().max(300).optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };

  await prisma.profile.update({ where: { id: profile.id }, data: parsed.data });
  revalidatePath("/account");
  return { ok: true as const, message: "Details saved" };
}
