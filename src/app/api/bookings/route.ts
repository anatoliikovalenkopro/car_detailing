import { NextResponse } from "next/server";
import { z } from "zod";
import { SLOTS } from "@/lib/brand";
import { newId, newToken, saveBooking, takenSlots, type Booking } from "@/lib/bookings";
import { geocode } from "@/lib/geo";
import { notifyCustomerReceived, notifyOwnerNewBooking, toE164 } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { SERVICE_IDS, getService, quote } from "@/lib/services";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().refine((p) => toE164(p) !== null, "Enter a 10-digit phone number"),
  email: z.email().max(120),
  address: z.string().trim().min(6).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(SLOTS as [string, ...string[]]),
  vehicleSize: z.enum(["car", "suv", "truck"]),
  vehicle: z.string().trim().min(2).max(80),
  services: z.array(z.enum(SERVICE_IDS)).min(1).max(12),
  notes: z.string().trim().max(1000).optional(),
  hasWater: z.literal(true, { error: "We need access to water" }),
  hasPower: z.literal(true, { error: "We need access to a power outlet" }),
  hasGarage: z.boolean(),
});

export async function POST(req: Request) {
  if (!rateLimit(`book:${clientIp(req)}`, 5, 3600_000)) {
    return NextResponse.json({ error: "Too many bookings from this device. Please call us." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid booking" }, { status: 400 });
  }
  const d = parsed.data;

  if (!d.services.some((s) => getService(s)?.kind === "package")) {
    return NextResponse.json({ error: "Pick at least one main package." }, { status: 400 });
  }
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
  if (d.date <= today) {
    return NextResponse.json({ error: "Please pick a date from tomorrow onwards." }, { status: 400 });
  }
  if ((await takenSlots(d.date)).includes(d.slot)) {
    return NextResponse.json({ error: "Sorry, that time was just taken. Pick another slot." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const coords = await geocode(d.address);
  const booking: Booking = {
    ...d,
    id: newId(),
    token: newToken(),
    createdAt: now,
    status: "pending",
    lat: coords?.lat,
    lng: coords?.lng,
    quoteTotal: quote(d.services, d.vehicleSize).total,
    history: [{ status: "pending", at: now }],
  };
  await saveBooking(booking);
  await Promise.all([notifyOwnerNewBooking(booking), notifyCustomerReceived(booking)]);

  return NextResponse.json({ id: booking.id });
}
