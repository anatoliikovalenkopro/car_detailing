"use client";

import { useState } from "react";

export default function TechLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/tech/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.reload();
    else {
      setError((await res.json().catch(() => ({}))).error ?? "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-28">
      <form onSubmit={submit} className="glass rounded-3xl p-8">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Team panel</h1>
        <p className="mt-1 text-sm text-slate-400">Technicians only.</p>
        <label className="label mt-6" htmlFor="pw">Password</label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          autoFocus
          required
        />
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={busy || !password}>
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
