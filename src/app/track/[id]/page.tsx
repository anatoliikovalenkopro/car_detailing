"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-100" />,
});

type Track = {
  id: string;
  status: "pending" | "confirmed" | "en_route" | "arrived" | "completed" | "cancelled";
  firstName: string;
  date: string;
  slot: string;
  address: string;
  services: string[];
  customer: { lat: number; lng: number } | null;
  tech: { lat: number; lng: number; at: string } | null;
  km: number | null;
  eta: number | null;
};

const STEPS: { key: Track["status"]; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "en_route", label: "On the way" },
  { key: "arrived", label: "Arrived" },
  { key: "completed", label: "Done" },
];

const HEADLINE: Record<Track["status"], string> = {
  pending: "Waiting for confirmation",
  confirmed: "You're booked!",
  en_route: "Your detailer is on the way",
  arrived: "We're here!",
  completed: "All done — enjoy your clean car!",
  cancelled: "This booking was cancelled",
};

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Track | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t") ?? "";
    let stop = false;
    async function load() {
      try {
        const res = await fetch(`/api/track/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not found");
        if (!stop) setData(await res.json());
      } catch {
        if (!stop) setError("We couldn't find this booking. Check the link in your text message.");
      }
    }
    load();
    const t = setInterval(load, 8000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [id]);

  if (error) return <p className="mx-auto max-w-md px-4 py-24 text-center text-muted">{error}</p>;
  if (!data) return <p className="mx-auto max-w-md animate-pulse px-4 py-24 text-center text-muted">Loading…</p>;

  const idx = STEPS.findIndex((s) => s.key === data.status);

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <p className="text-xs text-muted">
        {data.id} · {data.date} at {data.slot}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold">
        {data.status === "en_route" && data.eta != null ? (
          <>
            Arriving in <span className="text-brand">~{data.eta} min</span>
          </>
        ) : (
          HEADLINE[data.status]
        )}
      </h1>

      <ol className="mt-4 grid grid-cols-4 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s.key} className="text-center">
            <div className={`h-1.5 rounded-full ${i <= idx ? "bg-brand" : "bg-slate-200"}`} />
            <p className={`mt-1.5 text-[11px] sm:text-xs ${i <= idx ? "font-semibold text-ink" : "text-muted"}`}>{s.label}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 h-[55vh] min-h-[320px] overflow-hidden rounded-2xl border border-line">
        <LiveMap customer={data.customer} tech={data.tech} className="h-full w-full" />
      </div>

      <p className="mt-3 text-sm text-muted">
        {data.status === "en_route"
          ? data.tech
            ? `${data.km != null ? `${data.km} km away · ` : ""}updated ${new Date(data.tech.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : "Waiting for your detailer's GPS…"
          : "You'll see your detailer on the map once they're on the way."}
      </p>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
        <p>📍 {data.address}</p>
        <p className="mt-1">🧽 {data.services.join(", ")}</p>
        <p className="mt-1">💧🔌 Please have water and power ready.</p>
      </div>
      <a href={`tel:${BRAND.phone.replace(/\D/g, "")}`} className="btn-ghost mt-4 w-full">
        Call / text us · {BRAND.phone}
      </a>
    </div>
  );
}
