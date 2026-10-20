"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { requireStaff } from "@/lib/staff";
import { getOrCreateThread, threadsVisibleTo } from "@/lib/queries";

export async function sendChatMessage(input: { body: string }) {
  const { body } = z.object({ body: z.string().trim().min(1).max(2000) }).parse(input);
  const profile = await requireProfile("/chat");
  const thread = await getOrCreateThread(profile.id);

  await prisma.chatMessage.create({
    data: { threadId: thread.id, authorId: profile.id, authorRole: profile.role, body },
  });
  await prisma.chatThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  revalidatePath("/chat");
  revalidatePath("/dashboard/chats");
  return { ok: true as const };
}

/** A pharmacist replying into a patient's thread. */
export async function replyToThread(input: { threadId: string; body: string }) {
  const { threadId, body } = z
    .object({ threadId: z.string().min(1), body: z.string().trim().min(1).max(2000) })
    .parse(input);
  const { profile: staff, pharmacy } = await requireStaff("/dashboard/chats");

  const thread = await prisma.chatThread.findFirst({ where: { id: threadId, ...threadsVisibleTo(pharmacy.id) } });
  if (!thread) return { ok: false as const, error: "Conversation not found." };

  await prisma.chatMessage.create({
    data: { threadId, authorId: staff.id, authorRole: staff.role, body },
  });
  await prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  revalidatePath("/chat");
  revalidatePath("/dashboard/chats");
  return { ok: true as const };
}
