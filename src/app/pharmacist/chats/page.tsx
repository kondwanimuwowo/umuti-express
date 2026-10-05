import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtDate, fmtTime } from "@/lib/format";
import { ReplyForm } from "./ReplyForm";

export const metadata = { title: "Patient chats | Umuti Express" };

export default async function PharmacistChatsPage() {
  await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist/chats");

  const threads = await prisma.chatThread.findMany({
    orderBy: { updatedAt: "desc" },
    take: 25,
    include: {
      profile: { select: { fullName: true, email: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="shell-container max-w-[860px] py-12">
      <h1 className="font-display text-[28px] font-bold">Patient chats</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">Replies are sent as the pharmacy team.</p>

      {threads.length === 0 ? (
        <p className="mt-9 rounded-card bg-white p-8 text-center text-[15px] text-ink-55 shadow-card">
          No conversations yet.
        </p>
      ) : (
        <div className="mt-9 flex flex-col gap-5">
          {threads.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            const waiting = last?.authorRole === "CUSTOMER";

            return (
              <section key={thread.id} className="rounded-card bg-white p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15.5px] font-bold">
                      {thread.profile.fullName ?? thread.profile.email}
                    </h2>
                    {thread.profile.phone && (
                      <div className="text-[12.5px] text-ink-50">{thread.profile.phone}</div>
                    )}
                  </div>
                  {waiting && (
                    <span className="shrink-0 rounded-full bg-amber-tint px-3 py-1.5 text-[12px] font-bold text-amber">
                      Awaiting reply
                    </span>
                  )}
                </div>

                <div className="mt-4 flex max-h-[260px] flex-col gap-2.5 overflow-y-auto rounded-inner bg-surface p-4">
                  {thread.messages.map((m) => {
                    const fromStaff = m.authorRole !== "CUSTOMER";
                    return (
                      <div key={m.id} className={`flex ${fromStaff ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                            fromStaff ? "bg-green text-white" : "bg-white text-ink shadow-nav"
                          }`}
                        >
                          {m.body}
                          <span className={`mt-1 block text-[11px] ${fromStaff ? "text-white/70" : "text-ink-40"}`}>
                            {fmtDate(m.createdAt)} {fmtTime(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ReplyForm threadId={thread.id} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
