import "server-only";
import { Resend } from "resend";
import twilio from "twilio";
import { BRAND } from "./brand";
import { sign } from "./auth";
import type { Booking } from "./bookings";
import { getService, money } from "./services";

// Email via Resend, SMS via Twilio. When keys are missing (local dev),
// messages are printed to the server console instead of being sent.

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function trackUrl(b: Booking): string {
  return `${siteUrl()}/track/${b.id}?t=${b.token}`;
}

export function confirmUrl(b: Booking): string {
  return `${siteUrl()}/api/bookings/confirm?id=${b.id}&sig=${sign(`confirm:${b.id}`)}`;
}

/** Canadian numbers → E.164 (+1XXXXXXXXXX). Returns null if it doesn't look valid. */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    console.log(`[email:dev] to=${to} subject=${subject}${links.length ? `\n  links: ${links.join(" ")}` : ""}`);
    return;
  }
  const { error } = await new Resend(key).emails.send({ from, to, subject, html });
  if (error) console.error("[email] failed", error);
}

export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const e164 = toE164(to);
  if (!e164) return console.warn(`[sms] invalid phone ${to}`);
  if (!sid || !token || !from) {
    console.log(`[sms:dev] to=${e164}: ${body}`);
    return;
  }
  try {
    await twilio(sid, token).messages.create({ to: e164, from, body });
  } catch (e) {
    console.error("[sms] failed", e);
  }
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function bookingTable(b: Booking): string {
  const rows: [string, string][] = [
    ["Booking", b.id],
    ["When", `${b.date} at ${b.slot}`],
    ["Name", b.name],
    ["Phone", b.phone],
    ["Email", b.email],
    ["Address", b.address],
    ["Vehicle", `${b.vehicle} (${b.vehicleSize})`],
    ["Services", b.services.map((s) => getService(s)?.name ?? s).join(", ")],
    ["Water / Power / Garage", `${b.hasWater ? "yes" : "NO"} / ${b.hasPower ? "yes" : "NO"} / ${b.hasGarage ? "yes" : "no"}`],
    ["Quote (promo, incl. GST)", money(b.quoteTotal)],
    ["Notes", b.notes || "—"],
  ];
  return `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#64748b">${k}</td><td><b>${esc(v)}</b></td></tr>`)
    .join("")}</table>`;
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:12px 20px;border-radius:10px;font-weight:700;text-decoration:none;font-family:sans-serif">${label}</a>`;

/** New booking request → owner gets an email with a one-click confirm button. */
export async function notifyOwnerNewBooking(b: Booking) {
  const to = process.env.OWNER_EMAIL;
  if (!to) return console.warn("[email] OWNER_EMAIL not set");
  await sendEmail(
    to,
    `New booking request ${b.id} — ${b.date} ${b.slot}`,
    `<h2 style="font-family:sans-serif">New booking request</h2>${bookingTable(b)}
     <p style="margin:24px 0">${button(confirmUrl(b), "Confirm booking")}</p>
     <p style="font-family:sans-serif;color:#64748b;font-size:13px">Confirming texts and emails the customer. Or open the tech panel: ${siteUrl()}/tech</p>`,
  );
}

export async function notifyCustomerReceived(b: Booking) {
  await sendEmail(
    b.email,
    `We got your request — ${BRAND.name} ${b.id}`,
    `<h2 style="font-family:sans-serif">Thanks, ${esc(b.name.split(" ")[0])}! ✨</h2>
     <p style="font-family:sans-serif">We received your booking request and will confirm it shortly (usually within a couple of hours).</p>
     ${bookingTable(b)}`,
  );
}

export async function notifyCustomerConfirmed(b: Booking) {
  const link = trackUrl(b);
  await sendSms(
    b.phone,
    `${BRAND.name}: you're booked! ${b.date} at ${b.slot}, ref ${b.id}. Track your detailer on the day: ${link}`,
  );
  await sendEmail(
    b.email,
    `Confirmed: ${b.date} at ${b.slot} — ${BRAND.name}`,
    `<h2 style="font-family:sans-serif">You're booked ✅</h2>${bookingTable(b)}
     <p style="font-family:sans-serif">Please make sure we can reach an outdoor water tap and a power outlet${b.hasGarage ? " (or your garage)" : ""}.</p>
     <p style="margin:24px 0">${button(link, "Live tracking page")}</p>`,
  );
}

export async function notifyCustomerEnRoute(b: Booking, eta?: number) {
  await sendSms(
    b.phone,
    `${BRAND.name}: your detailer is on the way${eta ? `, ETA ~${eta} min` : ""}! Watch live: ${trackUrl(b)}`,
  );
}

export async function notifyCustomerArrived(b: Booking) {
  await sendSms(b.phone, `${BRAND.name}: we've arrived! See you outside 👋`);
}

export async function notifyCustomerCompleted(b: Booking) {
  await sendSms(
    b.phone,
    `${BRAND.name}: all done — enjoy your clean car ✨ A quick Google review or Instagram tag @${BRAND.instagram} would mean the world to us!`,
  );
}
