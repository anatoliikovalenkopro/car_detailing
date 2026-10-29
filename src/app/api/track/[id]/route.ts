import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getBooking, getTechLocation } from "@/lib/bookings";
import { distanceKm, etaMinutes } from "@/lib/geo";
import { getService } from "@/lib/services";

// Public tracking data for one booking, unlocked by the secret token in the SMS link.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const b = await getBooking(id);
  const ok =
    b && token.length === b.token.length && timingSafeEqual(Buffer.from(token), Buffer.from(b.token));
  if (!b || !ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only reveal the technician's position while they're actually driving over.
  const loc = b.status === "en_route" ? await getTechLocation(b.id) : null;
  const fresh = loc && Date.now() - new Date(loc.at).getTime() < 10 * 60_000 ? loc : null;
  const km = fresh && b.lat != null && b.lng != null ? distanceKm(fresh, { lat: b.lat, lng: b.lng }) : null;

  return NextResponse.json({
    id: b.id,
    status: b.status,
    firstName: b.name.split(" ")[0],
    date: b.date,
    slot: b.slot,
    address: b.address,
    services: b.services.map((s) => getService(s)?.name ?? s),
    customer: b.lat != null && b.lng != null ? { lat: b.lat, lng: b.lng } : null,
    tech: fresh ? { lat: fresh.lat, lng: fresh.lng, at: fresh.at } : null,
    km: km != null ? Math.round(km * 10) / 10 : null,
    eta: km != null ? etaMinutes(km) : null,
    history: b.history,
  });
}
