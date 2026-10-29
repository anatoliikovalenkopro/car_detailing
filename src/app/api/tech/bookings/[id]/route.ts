import { NextResponse } from "next/server";
import { z } from "zod";
import { isTech } from "@/lib/auth";
import { getBooking, getTechLocation, setStatus, type BookingStatus } from "@/lib/bookings";
import { distanceKm, etaMinutes } from "@/lib/geo";
import {
  notifyCustomerArrived,
  notifyCustomerCompleted,
  notifyCustomerConfirmed,
  notifyCustomerEnRoute,
} from "@/lib/notify";

const schema = z.object({
  status: z.enum(["confirmed", "en_route", "arrived", "completed", "cancelled"]),
});

// Allowed transitions — keeps accidental double-taps from re-sending SMS.
const NEXT: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["en_route", "cancelled"],
  en_route: ["arrived", "confirmed", "cancelled"],
  arrived: ["completed"],
  completed: [],
  cancelled: ["confirmed"],
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isTech())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad status" }, { status: 400 });

  const b = await getBooking(id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const status = parsed.data.status;
  if (!NEXT[b.status].includes(status)) {
    return NextResponse.json({ error: `Can't go from ${b.status} to ${status}` }, { status: 409 });
  }
  await setStatus(b, status);

  if (status === "confirmed" && b.history.filter((h) => h.status === "confirmed").length === 1) {
    await notifyCustomerConfirmed(b);
  } else if (status === "en_route") {
    const loc = await getTechLocation(b.id);
    const eta = loc && b.lat != null && b.lng != null ? etaMinutes(distanceKm(loc, { lat: b.lat, lng: b.lng })) : undefined;
    await notifyCustomerEnRoute(b, eta);
  } else if (status === "arrived") {
    await notifyCustomerArrived(b);
  } else if (status === "completed") {
    await notifyCustomerCompleted(b);
  }
  return NextResponse.json({ ok: true, status });
}
