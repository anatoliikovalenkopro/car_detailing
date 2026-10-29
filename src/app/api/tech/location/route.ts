import { NextResponse } from "next/server";
import { z } from "zod";
import { isTech } from "@/lib/auth";
import { getBooking, setTechLocation } from "@/lib/bookings";

const schema = z.object({
  bookingId: z.string().max(20),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

// Technician's phone posts its GPS position here while driving to a customer.
export async function POST(req: Request) {
  if (!(await isTech())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad location" }, { status: 400 });
  const { bookingId, lat, lng, accuracy } = parsed.data;
  if (!(await getBooking(bookingId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await setTechLocation(bookingId, { lat, lng, accuracy, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
