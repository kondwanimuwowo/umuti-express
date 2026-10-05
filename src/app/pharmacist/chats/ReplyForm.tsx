"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyToThread } from "@/lib/actions/chat";
import { useToast } from "@/components/Toast";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <form
      className="mt-4 flex gap-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const text = body.trim();
        if (!text) return;

        startTransition(async () => {
          const res = await replyToThread({ threadId, body: text });
          if (res.ok) {
            setBody("");
            router.refresh();
          } else {
            toast(res.error, "error");
          }
        });
      }}
    >
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Reply to this patient"
        aria-label="Reply"
        className="min-w-0 flex-1 rounded-full bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
      />
      <button type="submit" className="btn btn-primary" disabled={pending || !body.trim()}>
        {pending ? "Sending…" : "Reply"}
      </button>
    </form>
  );
}
