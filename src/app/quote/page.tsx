"use client";

import Link from "next/link";
import { useState } from "react";
import { money, type VehicleSize } from "@/lib/services";

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
const SIZES: { id: VehicleSize | ""; label: string }[] = [
  { id: "", label: "Not sure" },
  { id: "car", label: "Car" },
  { id: "suv", label: "SUV" },
  { id: "truck", label: "Truck / Van" },
];

/** Downscale in the browser so uploads are small and fast on mobile data. */
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
  not_visible: "not visible",
  light: "light",
  moderate: "moderate",
  heavy: "heavy",
  extreme: "very heavy",
};

export default function QuotePage() {
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

  async function getQuote() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          images: photos.map(({ mediaType, data }) => ({ mediaType, data })),
          vehicleSize: size || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't get a quote");
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't get a quote");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const bookHref = `/book?size=${result.size}&services=${result.items.map((i) => i.id).join(",")}`;
    return (
      <div className="mx-auto max-w-xl px-4 pt-6 pb-16">
        <p className="text-sm text-muted">{result.assessment.vehicle_guess}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand">
          {money(result.low)} – {money(result.high)}
        </h1>
        <p className="text-sm text-muted">Estimated, before GST · about {result.hours.toFixed(1)}h</p>

        <p className="mt-5">{result.assessment.summary}</p>

        <ul className="mt-5 divide-y divide-line rounded-2xl border border-line">
          {result.items.map((i) => (
            <li key={i.id} className="flex justify-between px-4 py-3 text-sm">
              <span className="font-medium">{i.name}</span>
              <span className="font-semibold text-brand">{money(i.price)}</span>
            </li>
          ))}
        </ul>

        {result.assessment.findings.length > 0 && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
            <p className="font-semibold">
              What we see · outside {LABEL[result.assessment.exterior_condition]}, inside {LABEL[result.assessment.interior_condition]}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              {result.assessment.findings.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          This is a rough estimate from photos. The final price is confirmed with our consultant before we start.
        </p>

        <Link href={bookHref} className="btn-primary mt-6 w-full !py-3.5">Book this</Link>
        <button className="btn-ghost mt-2 w-full" onClick={() => { setResult(null); setPhotos([]); }}>
          New quote
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 pb-16">
      <h1 className="text-2xl font-extrabold">Get a quote</h1>
      <p className="mt-1 text-muted">Add 1–4 photos — outside and inside. We&apos;ll suggest a service and a price.</p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              onClick={() => setPhotos((ph) => ph.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}
        {photos.length < MAX && (
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand/30 bg-brand-soft text-brand ${
              photos.length === 0 ? "col-span-4 py-8" : "aspect-square"
            }`}
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs font-semibold">{photos.length === 0 ? "Take or upload photos" : "Add"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
        )}
      </div>

      <p className="label mt-6">Vehicle</p>
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold sm:text-sm">
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

      <label className="label mt-5" htmlFor="note">Anything specific? (optional)</label>
      <input id="note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Dog hair, smoke smell, scratches…" className="input" />

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-primary mt-6 w-full !py-3.5" disabled={!photos.length || busy} onClick={getQuote}>
        {busy ? "Looking at your photos…" : "Get my price"}
      </button>
    </div>
  );
}
