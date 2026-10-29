"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hi! 👋 Ask me about prices, services, or if we come to your area.",
};
const SUGGESTIONS = ["How much is a full detail?", "Do you come to Sherwood Park?", "What do I need to provide?"];

export default function ChatWidget() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Keep the booking, quote, tracking and team screens uncluttered on phones.
  if (["/book", "/quote", "/tech", "/track"].some((p) => path.startsWith(p))) return null;

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Connection problem — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  // Sits above the sticky bottom bars on phones.
  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-3 sm:bottom-5">
      {open && (
        <div className="card flex h-[min(520px,70vh)] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Questions? Ask here</p>
              <p className="text-xs text-white/70">Usually instant · prices are approximate</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/80 hover:text-white" aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 ${
                    m.role === "user" ? "bg-brand text-white" : "border border-line bg-white text-ink"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-brand/30 bg-white px-3 py-1.5 text-xs text-brand hover:bg-brand-soft">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {busy && <p className="animate-pulse text-muted">Typing…</p>}
            <div ref={end} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1500}
              placeholder="Type a question…"
              className="input !py-2.5"
            />
            <button className="btn-primary !px-4 !py-2.5" disabled={busy || !input.trim()} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-13 w-13 place-items-center rounded-full bg-brand text-xl text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
