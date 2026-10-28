"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SLOTS } from "@/lib/brand";
import { SERVICES, VEHICLE_SIZES, money, promo, quote, sizeIndex, type VehicleSize } from "@/lib/services";

const packages = SERVICES.filter((s) => s.kind === "package");
const addons = SERVICES.filter((s) => s.kind === "addon");

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

function isWinter(date: string) {
  const m = Number(date.slice(5, 7));
  return m >= 11 || m <= 3;
}

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<VehicleSize>("car");
  const [pkg, setPkg] = useState("full-glow");
  const [extras, setExtras] = useState<string[]>([]);
  const [date, setDate] = useState(tomorrow());
  const [slot, setSlot] = useState("");
  const [taken, setTaken] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", vehicle: "", notes: "" });
  const [hasWater, setHasWater] = useState(false);
  const [hasPower, setHasPower] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  // Prefill from links like /book?services=full-glow,pet-hair&size=suv (used by the AI estimate)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("size");
    if (s === "car" || s === "suv" || s === "truck") setSize(s);
    const ids = (p.get("services") ?? p.get("service") ?? "").split(",").filter(Boolean);
    const main = ids.find((id) => packages.some((x) => x.id === id));
    if (main) setPkg(main);
    setExtras(ids.filter((id) => addons.some((x) => x.id === id)));
  }, []);

  useEffect(() => {
    setSlot("");
    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => setTaken(d.taken ?? []))
      .catch(() => setTaken([]));
  }, [date]);

  const services = useMemo(() => [pkg, ...extras], [pkg, extras]);
  const q = quote(services, size);
  const winterOutside = isWinter(date) && !hasGarage && SERVICES.some((s) => services.includes(s.id) && s.needsWater);

  const toggleExtra = (id: string) => setExtras((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          notes: form.notes || undefined,
          date,
          slot,
          vehicleSize: size,
          services,
          hasWater,
          hasPower,
          hasGarage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDoneId(data.id);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (doneId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">✨</p>
        <h1 className="mt-6 font-display text-4xl font-bold">Request received!</h1>
        <p className="mt-4 text-slate-300">
          Booking <b className="text-glow">{doneId}</b> for {date} at {slot}. We&apos;ll confirm by text and email
          shortly. On the day you&apos;ll get a live tracking link.
        </p>
        <Link href="/" className="btn-ghost mt-8">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-4xl font-bold">Book your detail</h1>
        <ol className="mt-6 flex gap-2 text-sm">
          {["Services", "Date & time", "Your details"].map((label, i) => (
            <li
              key={label}
              className={`flex-1 rounded-full px-3 py-1.5 text-center ${
                step === i + 1 ? "bg-glow text-ink font-semibold" : step > i + 1 ? "bg-glow/15 text-glow" : "bg-white/5 text-slate-500"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <section className="mt-8 space-y-8">
            <div>
              <p className="label">Vehicle size</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {VEHICLE_SIZES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSize(v.id)}
                    className={`glass rounded-xl p-4 text-left transition ${size === v.id ? "!border-glow ring-2 ring-glow/30" : ""}`}
                  >
                    <p className="font-semibold">{v.label}</p>
                    <p className="text-xs text-slate-400">{v.hint}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Main package</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((s) => {
                  const r = s.price[sizeIndex(size)];
                  return (
                    <button
                      key={s.id}
                      onClick={() => setPkg(s.id)}
                      className={`glass rounded-xl p-4 text-left transition ${pkg === s.id ? "!border-glow ring-2 ring-glow/30" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-right">
                          <span className="font-bold text-glow">{money(promo(r))}</span>
                          <br />
                          <span className="text-xs text-slate-500 line-through">{money(r)}</span>
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{s.tagline}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="label">Add-ons (optional)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {addons.map((s) => (
                  <label key={s.id} className="glass flex cursor-pointer items-center gap-3 rounded-xl p-3">
                    <input type="checkbox" checked={extras.includes(s.id)} onChange={() => toggleExtra(s.id)} className="h-4 w-4 accent-emerald-400" />
                    <span className="flex-1 text-sm">{s.name}</span>
                    <span className="text-sm font-semibold text-glow">+{money(promo(s.price[sizeIndex(size)]))}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full sm:w-auto" onClick={() => setStep(2)}>
              Continue →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="mt-8 space-y-6">
            <div>
              <label className="label" htmlFor="date">Date</label>
              <input id="date" type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-xs [color-scheme:dark]" />
            </div>
            <div>
              <p className="label">Arrival time</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {SLOTS.map((s) => {
                  const off = taken.includes(s);
                  return (
                    <button
                      key={s}
                      disabled={off}
                      onClick={() => setSlot(s)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        off
                          ? "cursor-not-allowed border-white/5 text-slate-600 line-through"
                          : slot === s
                            ? "border-glow bg-glow text-ink"
                            : "border-white/10 hover:border-glow/50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">Estimated time on site: ~{q.hours.toFixed(1)}h</p>
            </div>
            <div className="flex gap-3">
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={!slot} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" required minLength={2} value={form.name} onChange={set("name")} className="input" autoComplete="name" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Mobile (for SMS updates)</label>
                <input id="phone" required type="tel" value={form.phone} onChange={set("phone")} placeholder="780 555 0123" className="input" autoComplete="tel" />
              </div>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" required type="email" value={form.email} onChange={set("email")} className="input" autoComplete="email" />
              </div>
              <div>
                <label className="label" htmlFor="vehicle">Vehicle</label>
                <input id="vehicle" required minLength={2} value={form.vehicle} onChange={set("vehicle")} placeholder="2019 Honda CR-V, grey" className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="address">Address where we detail</label>
              <input id="address" required minLength={6} value={form.address} onChange={set("address")} placeholder="123 Jasper Ave NW, Edmonton" className="input" autoComplete="street-address" />
            </div>

            <fieldset className="glass space-y-3 rounded-2xl p-5">
              <legend className="px-1 text-sm font-semibold">At your location we need:</legend>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={hasWater} onChange={(e) => setHasWater(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-400" required />
                <span>💧 An outdoor water tap we can use (within ~30 m)</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={hasPower} onChange={(e) => setHasPower(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-400" required />
                <span>🔌 A standard power outlet we can use (within ~30 m)</span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={hasGarage} onChange={(e) => setHasGarage(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-400" />
                <span>🏠 We can work in a garage (needed for exterior work in cold weather)</span>
              </label>
              {winterOutside && (
                <p className="rounded-lg bg-amber-400/10 p-3 text-xs text-amber-300">
                  Heads up: for exterior washing between Nov and Mar we need a heated garage. Without one we may
                  switch you to interior-only — we&apos;ll confirm with you first.
                </p>
              )}
            </fieldset>

            <div>
              <label className="label" htmlFor="notes">Anything we should know? (optional)</label>
              <textarea id="notes" rows={3} maxLength={1000} value={form.notes} onChange={set("notes")} placeholder="Gate code, pet hair, coffee spill on back seat…" className="input" />
            </div>

            {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <div className="flex gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary flex-1 sm:flex-none" disabled={busy || !hasWater || !hasPower}>
                {busy ? "Sending…" : "Request booking"}
              </button>
            </div>
            <p className="text-xs text-slate-500">No payment now. Pay after the job. Free cancellation up to 24h before.</p>
          </form>
        )}
      </div>

      {/* Summary */}
      <aside className="glass h-fit rounded-2xl p-6 lg:sticky lg:top-24">
        <p className="font-display text-lg font-semibold">Your quote</p>
        <ul className="mt-4 space-y-2 text-sm">
          {q.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span className="text-slate-300">{i.name}</span>
              <span>{money(i.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
          <p className="flex justify-between text-slate-500">
            <span>Regular price</span>
            <span className="line-through">{money(q.regular)}</span>
          </p>
          <p className="flex justify-between text-glow">
            <span>Launch promo −25%</span>
            <span>−{money(q.regular - q.subtotal)}</span>
          </p>
          <p className="flex justify-between text-slate-400">
            <span>GST 5%</span>
            <span>{money(q.gst)}</span>
          </p>
          <p className="flex justify-between pt-2 font-display text-2xl font-bold">
            <span>Total</span>
            <span className="aurora-text">{money(q.total)}</span>
          </p>
        </div>
        {slot && (
          <p className="mt-4 rounded-lg bg-white/5 p-3 text-sm">
            📅 {date} at {slot}
          </p>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Estimate based on normal condition. Final price confirmed with you before we start.
        </p>
      </aside>
    </div>
  );
}
