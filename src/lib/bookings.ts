import "server-only";
import { randomBytes } from "crypto";
import { kv } from "./store";
import type { VehicleSize } from "./services";

export type BookingStatus =
  | "pending" // waiting for owner confirmation
  | "confirmed"
  | "en_route"
  | "arrived"
  | "completed"
  | "cancelled";

export type Booking = {
  id: string;
  /** Secret token that unlocks the customer tracking page */
  token: string;
  createdAt: string;
  status: BookingStatus;
  name: string;
  phone: string;
  email: string;
  address: string;
  lat?: number;
  lng?: number;
  date: string; // YYYY-MM-DD
  slot: string; // HH:MM
  vehicleSize: VehicleSize;
  vehicle: string;
  services: string[];
  notes?: string;
  hasWater: boolean;
  hasPower: boolean;
  hasGarage: boolean;
  quoteTotal: number;
  history: { status: BookingStatus; at: string }[];
};

export type TechLocation = { lat: number; lng: number; at: string; accuracy?: number };

const INDEX = "bookings";

export function newId(): string {
  // Short, readable booking reference, e.g. NG-7K3P9Q
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  return "NG-" + [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

export function newToken(): string {
  return randomBytes(18).toString("base64url");
}

export async function saveBooking(b: Booking) {
  await kv.set(`booking:${b.id}`, b);
  await kv.sadd(INDEX, b.id);
}

export async function getBooking(id: string) {
  return kv.get<Booking>(`booking:${id}`);
}

export async function listBookings(): Promise<Booking[]> {
  const ids = await kv.smembers(INDEX);
  const all = await Promise.all(ids.map(getBooking));
  return all
    .filter((b): b is Booking => Boolean(b))
    .sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
}

export async function setStatus(b: Booking, status: BookingStatus) {
  b.status = status;
  b.history.push({ status, at: new Date().toISOString() });
  await saveBooking(b);
  return b;
}

export async function takenSlots(date: string): Promise<string[]> {
  const all = await listBookings();
  return all.filter((b) => b.date === date && b.status !== "cancelled").map((b) => b.slot);
}

export async function setTechLocation(bookingId: string, loc: TechLocation) {
  await kv.set(`techloc:${bookingId}`, loc);
}

export async function getTechLocation(bookingId: string) {
  return kv.get<TechLocation>(`techloc:${bookingId}`);
}
