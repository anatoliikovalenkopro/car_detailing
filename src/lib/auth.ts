import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ng_tech";
const SESSION_HOURS = 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set (at least 32 characters).");
  }
  return s;
}

export function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  // Hash both sides so lengths always match for timingSafeEqual.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifySignature(value: string, signature: string): boolean {
  return safeEqual(sign(value), signature);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.TECH_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionValue(): { value: string; maxAge: number } {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  return { value: `${exp}.${sign(`tech:${exp}`)}`, maxAge: SESSION_HOURS * 3600 };
}

export function isValidSession(value: string | undefined): boolean {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return verifySignature(`tech:${exp}`, sig);
}

export async function isTech(): Promise<boolean> {
  const jar = await cookies();
  return isValidSession(jar.get(SESSION_COOKIE)?.value);
}
