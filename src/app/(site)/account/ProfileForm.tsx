"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/account";
import { useToast } from "@/components/Toast";

export function ProfileForm({
  fullName,
  phone,
  address,
}: {
  fullName: string;
  phone: string;
  address: string;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <form
      className="rounded-card bg-white p-6 shadow-card"
      action={(formData) =>
        startTransition(async () => {
          const res = await updateProfile(formData);
          if (res.ok) {
            toast(res.message);
            router.refresh();
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" defaultValue={fullName} />
        <Field label="Mobile number" name="phone" type="tel" defaultValue={phone} placeholder="0977123456" />
      </div>

      <div className="mt-4">
        <Field label="Delivery address" name="address" defaultValue={address} placeholder="Plot 14, Kabulonga Road" />
      </div>

      <button type="submit" className="btn btn-primary mt-5" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink-70">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
      />
    </label>
  );
}
