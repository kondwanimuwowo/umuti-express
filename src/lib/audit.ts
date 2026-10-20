import { prisma } from "@/lib/prisma";

/** Record that someone opened or decided something sensitive. Written for every prescription view. */
export async function logAccess(actorId: string, action: string, subjectType: string, subjectId: string) {
  await prisma.accessLog.create({ data: { actorId, action, subjectType, subjectId } });
}
