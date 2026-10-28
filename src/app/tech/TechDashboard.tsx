"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Booking, BookingStatus } from "@/lib/bookings";
import { getService, money } from "@/lib/services";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

type Row = Omit<Booking, "token"> & { trackUrl: string };
type Pos = { lat: number; lng: number; accuracy?: number };

const BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-400/15 text-amber-300",
  confirmed: "bg-sky-400/15 text-sky-300",
  en_route: "bg-glow/15 text-glow",
  arrived: "bg-violet-400/15 text-violet-300",
  completed: "bg-white/10 text-slate-400",
  cancelled: "bg-red-400/15 text-red-300",
};

const today = () => new Date().toLocaleDateString("en-CA");

export default function TechDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");
  const [sharing, setSharing] = useState<string | null>(null);
  const [me, setMe] = useState<Pos | null>(null);
  const [msg, setMsg] = useState("");
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/tech/bookings", { cache: "no-store" });
    if (res.status === 401) return window.location.reload();
    setRows((await res.json()).bookings ?? []);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const postLocation = useCallback(async (bookingId: string, p: Pos) => {
    await fetch("/api/tech/location", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingId, ...p }),
    });
  }, []);

  const stopSharing = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
    setSharing(null);
  }, []);

  useEffect(() => stopSharing, [stopSharing]);

  function getPosition(): Promise<Pos> {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        reject,
        { enableHighAccuracy: true, timeout: 15_000 },
      ),
    );
  }

  async function startSharing(bookingId: string) {
    stopSharing();
    setSharing(bookingId);
    // Keep the screen on so the browser keeps sending GPS while driving.
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      wakeLock.current = (await nav.wakeLock?.request("screen")) ?? null;
    } catch {}
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
        setMe(pos);
        if (Date.now() - lastSent.current > 8000) {
          lastSent.current = Date.now();
          postLocation(bookingId, pos).catch(() => {});
        }
      },
      () => setMsg("GPS error — check location permission for this site."),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }

  async function change(b: Row, status: BookingStatus) {
    setMsg("");
    if (status === "cancelled" && !confirm(`Cancel booking ${b.id}?`)) return;
    try {
      if (status === "en_route") {
        // Send a first position before the SMS goes out so it can include an ETA.
        const pos = await getPosition().catch(() => null);
        if (pos) {
          setMe(pos);
          await postLocation(b.id, pos);
        } else setMsg("Couldn't get GPS — the customer will see the map once it works.");
      }
      const res = await fetch(`/api/tech/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (status === "en_route") startSharing(b.id);
      else if (sharing === b.id) stopSharing();
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function logout() {
    stopSharing();
    await fetch("/api/tech/logout", { method: "POST" });
    window.location.reload();
  }

  const shown = rows.filter((b) =>
    filter === "all" ? true : b.date >= today() && !["completed", "cancelled"].includes(b.status),
  );
  const pending = rows.filter((b) => b.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Team panel</h1>
          <p className="text-sm text-slate-400">
            {pending} waiting for confirmation · {shown.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(filter === "all" ? "upcoming" : "all")} className="btn-ghost !py-2 text-sm">
            {filter === "all" ? "Show upcoming" : "Show all"}
          </button>
          <button onClick={logout} className="btn-ghost !py-2 text-sm">Log out</button>
        </div>
      </div>

      {sharing && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-glow/40 bg-glow/10 p-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-glow" />
            Sharing live location for {sharing}. Keep this page open while driving.
          </span>
          <button onClick={stopSharing} className="text-glow underline">Stop</button>
        </div>
      )}
      {msg && <p className="mt-4 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">{msg}</p>}

      <div className="mt-8 space-y-4">
        {shown.length === 0 && <p className="text-slate-500">No bookings here yet.</p>}
        {shown.map((b) => {
          const total = money(b.quoteTotal);
          const nav = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address)}`;
          return (
            <div key={b.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">
                    {b.date} · {b.slot} — {b.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {b.id} · {b.vehicle} ({b.vehicleSize}) · {total}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[b.status]}`}>{b.status.replace("_", " ")}</span>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-slate-300 sm:grid-cols-2">
                <p>📍 {b.address}</p>
                <p>
                  📞 <a href={`tel:${b.phone}`} className="underline">{b.phone}</a> · ✉️ {b.email}
                </p>
                <p>🧽 {b.services.map((s) => getService(s)?.name ?? s).join(", ")}</p>
                <p>
                  💧 {b.hasWater ? "Water ✓" : "No water"} · 🔌 {b.hasPower ? "Power ✓" : "No power"} · 🏠{" "}
                  {b.hasGarage ? "Garage ✓" : "No garage"}
                </p>
                {b.notes && <p className="sm:col-span-2">📝 {b.notes}</p>}
              </div>

              {sharing === b.id && (
                <div className="mt-4 h-64 overflow-hidden rounded-xl">
                  <LiveMap
                    customer={b.lat != null && b.lng != null ? { lat: b.lat, lng: b.lng } : null}
                    tech={me}
                    className="h-full w-full"
                  />
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {b.status === "pending" && <Action onClick={() => change(b, "confirmed")} primary>✅ Confirm & notify</Action>}
                {b.status === "confirmed" && <Action onClick={() => change(b, "en_route")} primary>🚗 On my way</Action>}
                {b.status === "en_route" && (
                  <>
                    <Action onClick={() => change(b, "arrived")} primary>📍 Arrived</Action>
                    {sharing !== b.id && <Action onClick={() => startSharing(b.id)}>Resume GPS</Action>}
                  </>
                )}
                {b.status === "arrived" && <Action onClick={() => change(b, "completed")} primary>✨ Job done</Action>}
                {b.status === "cancelled" && <Action onClick={() => change(b, "confirmed")}>Restore</Action>}
                {["pending", "confirmed", "en_route"].includes(b.status) && (
                  <Action onClick={() => change(b, "cancelled")}>Cancel</Action>
                )}
                <a href={nav} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-2 text-sm">🧭 Navigate</a>
                <a href={b.trackUrl} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-2 text-sm">👀 Customer view</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Action({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} className={`${primary ? "btn-primary" : "btn-ghost"} !px-3 !py-2 text-sm`}>
      {children}
    </button>
  );
}
