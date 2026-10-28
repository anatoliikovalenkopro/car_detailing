import { NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, createSessionValue } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Wait 15 minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const { value, maxAge } = createSessionValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}
