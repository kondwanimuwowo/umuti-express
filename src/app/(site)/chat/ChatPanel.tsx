"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { sendChatMessage } from "@/lib/actions/chat";
import { useToast } from "@/components/Toast";
import { fmtTime } from "@/lib/format";

type Message = { id: string; body: string; mine: boolean; createdAt: string };

export function ChatPanel({ messages }: { messages: Message[] }) {
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Poll for a pharmacist's reply while the tab is open.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15000);
    return () => clearInterval(id);
  }, [router]);

  const send = () => {
    const body = input.trim();
    if (!body) return;

    startTransition(async () => {
      const res = await sendChatMessage({ body });
      if (res.ok) {
        setInput("");
        router.refresh();
      } else {
        toast("Message not sent. Please try again.", "error");
      }
    });
  };

  return (
    <>
      <div
        ref={scroller}
        aria-live="polite"
        className="flex h-[420px] flex-col gap-3.5 overflow-y-auto rounded-card bg-surface p-6 shadow-card"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.mine ? "bg-green text-white" : "bg-white text-ink shadow-nav"
                }`}
              >
                {m.body}
                <span className={`mt-1 block text-[11px] ${m.mine ? "text-white/70" : "text-ink-40"}`}>
                  {fmtTime(new Date(m.createdAt))}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        className="mt-4 flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-[14.5px] text-ink shadow-nav outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending || !input.trim()}>
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </>
  );
}
