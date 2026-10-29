// Distance / ETA helpers shared by server and client.

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough driving ETA: straight-line distance × road factor at average city speed. */
export function etaMinutes(km: number): number {
  const roadKm = km * 1.35;
  const avgKmh = 45;
  return Math.max(1, Math.round((roadKm / avgKmh) * 60));
}

/** Geocode an address with OpenStreetMap Nominatim, biased to the Edmonton region. */
export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");
  // Bounding box around Edmonton metro (left, top, right, bottom)
  url.searchParams.set("viewbox", "-114.3,53.9,-112.9,53.1");
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MobileDetailingBooking/1.0 (booking geocoder)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch {
    return null;
  }
}
