import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { BRAND } from "./brand";
import { GST_RATE, PROMO_LABEL, SERVICE_AREA, priceListText } from "./services";

// Claude Haiku is the cheapest current model — plenty for a support chat and
// for looking at a few car photos.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic();
  return client;
}

// Kept stable (no dates/IDs) so the prompt prefix can be cached.
export const BUSINESS_FACTS = `
Business: ${BRAND.full} — "${BRAND.tagline}"
We are a 100% mobile detailing team: we come to the customer's home or workplace. We don't have a shop.
Service area: ${SERVICE_AREA.join(", ")} (Edmonton, Alberta and surrounding area). Outside this area: ask us.
Hours: ${BRAND.hours}. Contact: ${BRAND.phone}, ${BRAND.email}, Instagram @${BRAND.instagram}.
Requirements at the customer's location: access to an outdoor water tap (hose bib) and a standard power outlet within ~30 m, plus space to work around the car. Customer must be able to park on their driveway / private parking (not a busy street).
Winter (roughly Nov–Mar, or below ~5°C): exterior washes need a heated garage. Without a garage we can still do interior services.
Prices are in CAD, before ${Math.round(GST_RATE * 100)}% GST. ${PROMO_LABEL} — the promo price is what customers pay right now.
Payment: e-Transfer, card (tap) or cash after the job. Booking: online at /book; we confirm by text and email. Free cancellation up to 24h before.
Online prices and AI photo estimates are approximate; extreme dirt, mould, heavy pet hair, biohazards or paint damage can change the price — the final quote is confirmed with our consultant on site or by phone before we start.

Services and prices (promo price first, regular price in brackets):
${priceListText()}
`.trim();
