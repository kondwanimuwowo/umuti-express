import { requireProfile } from "@/lib/auth";
import { getOrCreateThread } from "@/lib/queries";
import { ChatPanel } from "./ChatPanel";

export const metadata = { title: "Chat with a pharmacist | Umuti Express" };

export default async function ChatPage() {
  const profile = await requireProfile("/chat");
  const thread = await getOrCreateThread(profile.id);

  return (
    <div className="shell-container max-w-[700px] py-12">
      <div className="mb-6 flex items-center gap-3.5">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-green-tint font-display text-[17px] font-bold text-green-dark">
          PT
        </div>
        <div>
          <h1 className="text-[16px] font-bold">Partner pharmacy team</h1>
          <p className="text-[12.5px] font-bold text-green-dark">
            Replies come from pharmacy staff. Not for emergencies.
          </p>
        </div>
      </div>

      <ChatPanel
        messages={thread.messages.map((m) => ({
          id: m.id,
          body: m.body,
          mine: m.authorRole === "CUSTOMER",
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
