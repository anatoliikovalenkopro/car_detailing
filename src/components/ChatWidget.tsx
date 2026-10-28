"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hey! I'm Glow ✨ Ask me about services, prices, or whether we cover your area.",
};
const SUGGESTIONS = ["How much is a full detail?", "Do you come to Sherwood Park?", "What do I need to provide?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, open]);

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

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="glass flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-display font-semibold">Glow assistant</p>
              <p className="text-xs text-slate-400">AI · answers are approximate</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-white" aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 ${
                    m.role === "user" ? "bg-glow text-ink" : "bg-white/5 text-slate-200"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {busy && <p className="animate-pulse text-slate-500">Glow is typing…</p>}
            <div ref={end} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
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
        className="btn-primary h-14 w-14 !rounded-full !p-0 text-2xl"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
