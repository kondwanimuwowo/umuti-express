"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile, requireRole } from "@/lib/auth";
import { getOrCreateThread } from "@/lib/queries";

export async function sendChatMessage(input: { body: string }) {
  const { body } = z.object({ body: z.string().trim().min(1).max(2000) }).parse(input);
  const profile = await requireProfile("/chat");
  const thread = await getOrCreateThread(profile.id);

  await prisma.chatMessage.create({
    data: { threadId: thread.id, authorId: profile.id, authorRole: profile.role, body },
  });
  await prisma.chatThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

  revalidatePath("/chat");
  revalidatePath("/pharmacist/chats");
  return { ok: true as const };
}

/** A pharmacist replying into a patient's thread. */
export async function replyToThread(input: { threadId: string; body: string }) {
  const { threadId, body } = z
    .object({ threadId: z.string().min(1), body: z.string().trim().min(1).max(2000) })
    .parse(input);
  const staff = await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist/chats");

  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ok: false as const, error: "Conversation not found." };

  await prisma.chatMessage.create({
    data: { threadId, authorId: staff.id, authorRole: staff.role, body },
  });
  await prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  revalidatePath("/chat");
  revalidatePath("/pharmacist/chats");
  return { ok: true as const };
}
