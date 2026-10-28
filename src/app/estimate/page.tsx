"use client";

import Link from "next/link";
import { useState } from "react";
import { VEHICLE_SIZES, money, type VehicleSize } from "@/lib/services";

type Result = {
  assessment: {
    vehicle_guess: string;
    exterior_condition: string;
    interior_condition: string;
    findings: string[];
    summary: string;
  };
  size: VehicleSize;
  items: { id: string; name: string; price: number; regular: number }[];
  low: number;
  high: number;
  regular: number;
  hours: number;
};

type Photo = { preview: string; mediaType: "image/jpeg"; data: string };

const MAX = 4;

/** Downscale in the browser so uploads are small and cheap to analyse. */
function resize(file: File, maxSide = 1280): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(img.src);
      resolve({ preview: url, mediaType: "image/jpeg", data: url.split(",")[1] });
    };
    img.onerror = () => reject(new Error("Couldn't read that image"));
    img.src = URL.createObjectURL(file);
  });
}

const LABEL: Record<string, string> = {
  not_visible: "Not visible",
  light: "Light",
  moderate: "Moderate",
  heavy: "Heavy",
  extreme: "Extreme",
};

export default function EstimatePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [size, setSize] = useState<VehicleSize | "">("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    try {
      const list = await Promise.all([...files].slice(0, MAX - photos.length).map((f) => resize(f)));
      setPhotos((p) => [...p, ...list].slice(0, MAX));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read image");
    }
  }

  async function analyse() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          images: photos.map(({ mediaType, data }) => ({ mediaType, data })),
          vehicleSize: size || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Estimate failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Estimate failed");
    } finally {
      setBusy(false);
    }
  }

  const bookHref = result ? `/book?size=${result.size}&services=${result.items.map((i) => i.id).join(",")}` : "/book";

  return (
    <div className="relative">
      <div className="aurora-bg opacity-60" />
      <div className="relative mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm font-semibold text-glow-3">AI photo quote · beta</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">What will my car cost?</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Upload 1–4 clear photos (outside + inside works best). Our AI looks at the condition and suggests the right
          package with a rough price range.
        </p>

        <div className="glass mt-10 rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => setPhotos((ph) => ph.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/70 px-2 text-sm"
                  aria-label="Remove photo"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < MAX && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 text-slate-400 transition hover:border-glow/50 hover:text-glow">
                <span className="text-3xl">📸</span>
                <span className="text-xs">Add photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="size">Vehicle size (optional)</label>
              <select id="size" value={size} onChange={(e) => setSize(e.target.value as VehicleSize | "")} className="input">
                <option value="">Let the AI guess</option>
                {VEHICLE_SIZES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="note">Anything specific? (optional)</label>
              <input id="note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Dog hair, smoke smell, swirls…" className="input" />
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button className="btn-primary mt-6 w-full sm:w-auto" disabled={!photos.length || busy} onClick={analyse}>
            {busy ? "Analysing your photos…" : "Get my estimate"}
          </button>
        </div>

        {result && (
          <div className="glass mt-8 rounded-3xl p-6 sm:p-8">
            <p className="text-sm text-slate-400">{result.assessment.vehicle_guess}</p>
            <p className="mt-2 font-display text-5xl font-bold">
              <span className="aurora-text">
                {money(result.low)} – {money(result.high)}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Estimated range with launch promo, before GST · ~{result.hours.toFixed(1)}h on site
            </p>

            <p className="mt-6 text-slate-200">{result.assessment.summary}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="label">Recommended</p>
                <ul className="space-y-2 text-sm">
                  {result.items.map((i) => (
                    <li key={i.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span>{i.name}</span>
                      <span className="text-glow">{money(i.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label">What we noticed</p>
                <p className="text-xs text-slate-400">
                  Exterior: {LABEL[result.assessment.exterior_condition]} · Interior:{" "}
                  {LABEL[result.assessment.interior_condition]}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {result.assessment.findings.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 rounded-xl bg-amber-400/10 p-4 text-sm text-amber-200">
              ⚠️ This is a rough AI estimate from photos. The true cost is confirmed by our consultant (by phone or on
              site) before any work starts — no surprises.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={bookHref} className="btn-primary">Book these services →</Link>
              <button className="btn-ghost" onClick={() => { setResult(null); setPhotos([]); }}>
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
