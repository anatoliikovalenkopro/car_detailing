import { NextResponse } from "next/server";
import { isTech } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";
import { trackUrl } from "@/lib/notify";

export async function GET() {
  if (!(await isTech())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await listBookings();
  return NextResponse.json({
    bookings: bookings.map(({ token: _token, ...b }) => ({ ...b, trackUrl: trackUrl({ ...b, token: _token }) })),
  });
}
