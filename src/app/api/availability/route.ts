import { NextResponse } from "next/server";
import { takenSlots } from "@/lib/bookings";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ taken: [] });
  return NextResponse.json({ taken: await takenSlots(date) });
}
