"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-white/5" />,
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
  { key: "completed", label: "Done ✨" },
];

const HEADLINE: Record<Track["status"], string> = {
  pending: "Waiting for confirmation",
  confirmed: "You're booked!",
  en_route: "Your detailer is on the way",
  arrived: "We're here!",
  completed: "All done — enjoy the glow",
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

  if (error) return <p className="mx-auto max-w-md px-4 py-32 text-center text-slate-400">{error}</p>;
  if (!data) return <p className="mx-auto max-w-md animate-pulse px-4 py-32 text-center text-slate-500">Loading…</p>;

  const idx = STEPS.findIndex((s) => s.key === data.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-slate-500">Booking {data.id}</p>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
        {data.status === "en_route" && data.eta != null ? (
          <>
            Arriving in <span className="aurora-text">~{data.eta} min</span>
          </>
        ) : (
          HEADLINE[data.status]
        )}
      </h1>
      <p className="mt-2 text-slate-400">
        Hi {data.firstName} 👋 {data.date} at {data.slot} · {data.address}
      </p>

      <ol className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s.key} className="text-center">
            <div className={`h-1.5 rounded-full ${i <= idx ? "bg-gradient-to-r from-glow to-glow-2" : "bg-white/10"}`} />
            <p className={`mt-2 text-xs sm:text-sm ${i <= idx ? "text-white" : "text-slate-500"}`}>{s.label}</p>
          </li>
        ))}
      </ol>

      <div className="glass mt-8 h-[60vh] min-h-[360px] overflow-hidden rounded-3xl">
        <LiveMap customer={data.customer} tech={data.tech} className="h-full w-full" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <p>
          {data.status === "en_route"
            ? data.tech
              ? `${data.km} km away · updated ${new Date(data.tech.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : "Waiting for the detailer's GPS signal…"
            : "The live location appears here once your detailer is on the way."}
        </p>
        <p>Services: {data.services.join(", ")}</p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Questions? Call or text {BRAND.phone}. Please have water and power access ready 💧🔌
      </p>
    </div>
  );
}
