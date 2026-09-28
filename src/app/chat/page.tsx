"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { ImageSlot } from "@/components/ImageSlot";

export default function ChatPage() {
  const { chatMessages, sendChat } = useStore();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendChat(text);
    setInput("");
  };

  return (
    <div className="container" style={{ maxWidth: 700, paddingTop: 48, paddingBottom: 96 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <ImageSlot id="pharmacist-photo" placeholder="Photo" style={{ width: 52, height: 52, borderRadius: 999, flexShrink: 0, fontSize: 11 }} />
        <div>
          <h1 style={{ fontFamily: "var(--font-body)", fontSize: 16, margin: 0 }}>Chanda M., pharmacist</h1>
          <div style={{ fontSize: 12.5, color: "var(--green-dark)", fontWeight: 700 }}>Online now</div>
        </div>
      </div>
      <div
        ref={scroller}
        className="panel"
        style={{ padding: 24, height: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}
        aria-live="polite"
      >
        {chatMessages.map((m, i) => {
          const mine = m.from === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "70%",
                  background: mine ? "var(--green)" : "#fff",
                  color: mine ? "#fff" : "var(--ink)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form
        style={{ display: "flex", gap: 10 }}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          aria-label="Message"
          style={{ flex: 1, minWidth: 0, borderRadius: 999, padding: "14px 20px" }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: "14px 26px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
