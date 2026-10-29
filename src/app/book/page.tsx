"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SLOTS } from "@/lib/brand";
import { SERVICES, money, promo, quote, sizeIndex, type VehicleSize } from "@/lib/services";

const packages = SERVICES.filter((s) => s.kind === "package");
const addons = SERVICES.filter((s) => s.kind === "addon");
const SIZES: { id: VehicleSize; label: string }[] = [
  { id: "car", label: "Car" },
  { id: "suv", label: "SUV" },
  { id: "truck", label: "Truck / Van" },
];

/** Next 14 days starting tomorrow, as YYYY-MM-DD in local time. */
function nextDays(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}
const ymd = (d: Date) => d.toLocaleDateString("en-CA");

function isWinter(date: string) {
  const m = Number(date.slice(5, 7));
  return m >= 11 || m <= 3;
}

export default function BookPage() {
  const days = useMemo(() => nextDays(), []);
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<VehicleSize>("car");
  const [pkg, setPkg] = useState("full-glow");
  const [extras, setExtras] = useState<string[]>([]);
  const [showAddons, setShowAddons] = useState(false);
  const [date, setDate] = useState(ymd(days[0]));
  const [slot, setSlot] = useState("");
  const [taken, setTaken] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", vehicle: "", notes: "" });
  const [hasWater, setHasWater] = useState(false);
  const [hasPower, setHasPower] = useState(false);
  const [hasGarage, setHasGarage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState("");

  // Prefill from links like /book?services=full-glow,pet-hair&size=suv (price list & photo quote)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("size");
    if (s === "car" || s === "suv" || s === "truck") setSize(s);
    const ids = (p.get("services") ?? p.get("service") ?? "").split(",").filter(Boolean);
    const main = ids.find((id) => packages.some((x) => x.id === id));
    if (main) setPkg(main);
    const ex = ids.filter((id) => addons.some((x) => x.id === id));
    setExtras(ex);
    if (ex.length) setShowAddons(true);
  }, []);

  useEffect(() => {
    setSlot("");
    fetch(`/api/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => setTaken(d.taken ?? []))
      .catch(() => setTaken([]));
  }, [date]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const services = useMemo(() => [pkg, ...extras], [pkg, extras]);
  const q = quote(services, size);
  const winterOutside = isWinter(date) && !hasGarage && SERVICES.some((s) => services.includes(s.id) && s.needsWater);
  const i = sizeIndex(size);

  const toggleExtra = (id: string) => setExtras((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
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
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-3xl text-brand">✓</div>
        <h1 className="mt-5 text-2xl font-extrabold">Request sent!</h1>
        <p className="mt-2 text-muted">
          Booking <b className="text-ink">{doneId}</b> · {date} at {slot}. We&apos;ll confirm by text shortly.
        </p>
        <Link href="/" className="btn-ghost mt-8">Back home</Link>
      </div>
    );
  }

  const formValid =
    form.name.trim().length >= 2 &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.address.trim().length >= 6 &&
    form.vehicle.trim().length >= 2 &&
    hasWater &&
    hasPower;

  const next =
    step === 1
      ? { label: "Choose time", ok: true, go: () => setStep(2) }
      : step === 2
        ? { label: "Continue", ok: Boolean(slot), go: () => setStep(3) }
        : { label: busy ? "Sending…" : "Request booking", ok: formValid && !busy, go: submit };

  return (
    <div className="mx-auto max-w-xl px-4 pt-5 pb-40">
      {/* Progress */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="-ml-1 rounded-lg px-1 text-2xl text-muted" aria-label="Back">
            ‹
          </button>
        )}
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted">Step {step} of 3</p>
          <h1 className="text-xl font-extrabold">{["Choose service", "Pick a time", "Your details"][step - 1]}</h1>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1 rounded-full ${n <= step ? "bg-brand" : "bg-slate-200"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            {SIZES.map((v) => (
              <button
                key={v.id}
                onClick={() => setSize(v.id)}
                className={`rounded-lg py-2.5 transition ${size === v.id ? "bg-white text-brand shadow-sm" : "text-muted"}`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {packages.map((s) => (
              <button key={s.id} onClick={() => setPkg(s.id)} data-on={pkg === s.id} className="pick flex w-full items-center gap-3 px-4 py-3">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${pkg === s.id ? "border-brand" : "border-slate-300"}`}>
                  {pkg === s.id && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block truncate text-xs text-muted">{s.tagline}</span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-brand">{money(promo(s.price[i]))}</span>
                  <span className="block text-xs text-slate-400 line-through">{money(s.price[i])}</span>
                </span>
              </button>
            ))}
          </div>

          <div>
            <button onClick={() => setShowAddons((v) => !v)} className="flex w-full items-center justify-between py-1 font-semibold">
              <span>
                Add-ons {extras.length > 0 && <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{extras.length}</span>}
              </span>
              <span className="text-brand">{showAddons ? "−" : "+"}</span>
            </button>
            {showAddons && (
              <div className="mt-2 space-y-2">
                {addons.map((s) => (
                  <label key={s.id} data-on={extras.includes(s.id)} className="pick flex cursor-pointer items-center gap-3 px-4 py-3">
                    <input type="checkbox" checked={extras.includes(s.id)} onChange={() => toggleExtra(s.id)} className="h-5 w-5 accent-blue-700" />
                    <span className="flex-1 text-sm font-medium">{s.name}</span>
                    <span className="text-sm font-semibold text-brand">+{money(promo(s.price[i]))}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="label">Day</p>
            <div className="chips">
              {days.map((d) => {
                const v = ymd(d);
                return (
                  <button
                    key={v}
                    onClick={() => setDate(v)}
                    data-on={date === v}
                    className="pick flex w-16 shrink-0 flex-col items-center py-2.5"
                  >
                    <span className="text-xs text-muted">{d.toLocaleDateString("en-CA", { weekday: "short" })}</span>
                    <span className="text-lg font-bold">{d.getDate()}</span>
                    <span className="text-[11px] text-muted">{d.toLocaleDateString("en-CA", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="label">Arrival time</p>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map((s) => {
                const off = taken.includes(s);
                return (
                  <button
                    key={s}
                    disabled={off}
                    onClick={() => setSlot(s)}
                    data-on={slot === s}
                    className={`pick py-3 text-center font-semibold ${off ? "cursor-not-allowed text-slate-300 line-through" : ""}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">Takes about {q.hours.toFixed(1)} hours.</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 space-y-4">
          <Field id="name" label="Name" value={form.name} onChange={set("name")} autoComplete="name" />
          <Field id="phone" label="Mobile (for text updates)" type="tel" value={form.phone} onChange={set("phone")} placeholder="780 555 0123" autoComplete="tel" />
          <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          <Field id="address" label="Address" value={form.address} onChange={set("address")} placeholder="123 Jasper Ave NW, Edmonton" autoComplete="street-address" />
          <Field id="vehicle" label="Vehicle" value={form.vehicle} onChange={set("vehicle")} placeholder="2019 Honda CR-V, grey" />

          <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">At your place we need:</p>
            <Check checked={hasWater} onChange={setHasWater}>💧 Outdoor water tap</Check>
            <Check checked={hasPower} onChange={setHasPower}>🔌 Power outlet</Check>
            <Check checked={hasGarage} onChange={setHasGarage}>🏠 Garage we can use (optional)</Check>
            {winterOutside && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                In cold months exterior washing needs a heated garage. Without one we may do the interior only — we&apos;ll
                confirm with you.
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" rows={2} maxLength={1000} value={form.notes} onChange={set("notes")} placeholder="Gate code, pet hair…" className="input" />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <p className="text-xs text-muted">No payment now — pay after the job. Free cancellation up to 24h before.</p>
        </div>
      )}

      {/* Sticky total + action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-muted">
              Total incl. GST <span className="line-through">{money(q.regular * 1.05)}</span>
            </p>
            <p className="text-xl font-extrabold">{money(q.total)}</p>
          </div>
          <button className="btn-primary flex-1 !py-3.5" disabled={!next.ok} onClick={next.go}>
            {next.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="label" htmlFor={props.id}>{label}</label>
      <input {...rest} className="input" />
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-blue-700" />
      <span>{children}</span>
    </label>
  );
}
