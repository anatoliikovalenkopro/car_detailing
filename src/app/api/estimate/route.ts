import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BUSINESS_FACTS, MODEL, anthropic } from "@/lib/ai";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { SERVICE_IDS, quote, type VehicleSize } from "@/lib/services";

export const maxDuration = 60;

const MAX_IMAGES = 4;
const MAX_B64 = 1_000_000; // ~750 KB per image; browser resize keeps them far smaller

const requestSchema = z.object({
  images: z
    .array(
      z.object({
        mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        data: z.string().min(100).max(MAX_B64),
      }),
    )
    .min(1)
    .max(MAX_IMAGES),
  vehicleSize: z.enum(["car", "suv", "truck"]).optional(),
  note: z.string().max(500).optional(),
});

const assessment = z.object({
  is_vehicle: z.boolean().describe("false if the photos don't show a car/truck"),
  vehicle_guess: z.string().describe("e.g. 'white Toyota RAV4 (SUV)'"),
  vehicle_size: z.enum(["car", "suv", "truck"]),
  exterior_condition: z.enum(["not_visible", "light", "moderate", "heavy", "extreme"]),
  interior_condition: z.enum(["not_visible", "light", "moderate", "heavy", "extreme"]),
  findings: z.array(z.string()).describe("Short observations, e.g. 'road salt on lower panels', 'pet hair on rear seats'"),
  recommended_services: z.array(z.enum(SERVICE_IDS)).describe("1 package plus any useful add-ons"),
  summary: z.string().describe("2–3 friendly sentences for the customer"),
});

const SYSTEM = `You assess car photos for a mobile detailing company in Edmonton and recommend services from our menu.
Look at dirt level, salt, stains, pet hair, swirls/oxidation, foggy headlights, faded trim, odour hints (ashtrays etc.).
Recommend exactly one main package that fits the visible condition plus only add-ons that are clearly useful. Prefer the simplest package that will get a great result; recommend paint enhancement or ceramic only if the paint visibly needs correction or the customer asks for protection.
Pick vehicle_size from the vehicle type (car = sedan/coupe/hatch, suv = 5-seat SUV/crossover, truck = pickup/minivan/3-row).
If an image is not a vehicle, set is_vehicle=false and leave recommendations empty.

${BUSINESS_FACTS}`;

// Heavier soiling = more time. Applied on top of the promo menu price.
const SOIL: Record<string, number> = { not_visible: 1, light: 1, moderate: 1.1, heavy: 1.25, extreme: 1.45 };
const round5 = (n: number) => Math.round(n / 5) * 5;

export async function POST(req: Request) {
  if (!rateLimit(`estimate:${clientIp(req)}`, 6, 3600_000)) {
    return NextResponse.json({ error: "Estimate limit reached. Please try again later or call us." }, { status: 429 });
  }
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please upload 1–4 photos (JPG/PNG/WebP)." }, { status: 400 });
  }
  const { images, vehicleSize, note } = parsed.data;

  const content: Anthropic.ContentBlockParam[] = images.map((img) => ({
    type: "image",
    source: { type: "base64", media_type: img.mediaType, data: img.data },
  }));
  content.push({
    type: "text",
    text: [
      "Please assess these photos of my vehicle.",
      vehicleSize ? `I said my vehicle is: ${vehicleSize}.` : "",
      note ? `My note: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const response = await anthropic().messages.parse({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "low", format: zodOutputFormat(assessment) },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content }],
    });
    const a = response.parsed_output;
    if (response.stop_reason === "refusal" || !a) {
      return NextResponse.json({ error: "We couldn't analyse these photos. Try different ones." }, { status: 422 });
    }
    if (!a.is_vehicle || a.recommended_services.length === 0) {
      return NextResponse.json({ error: "We couldn't see a vehicle in those photos. Try a wider shot." }, { status: 422 });
    }

    // Prices come from OUR menu, never from the model.
    const size: VehicleSize = vehicleSize ?? a.vehicle_size;
    const q = quote(a.recommended_services, size);
    const mult = Math.max(SOIL[a.exterior_condition], SOIL[a.interior_condition]);
    return NextResponse.json({
      assessment: a,
      size,
      items: q.items,
      low: round5(q.subtotal * mult * 0.9),
      high: round5(q.subtotal * mult * 1.2),
      regular: q.regular,
      hours: q.hours,
    });
  } catch (e) {
    console.error("[estimate]", e);
    return NextResponse.json({ error: "The estimator is busy right now. Please try again in a minute." }, { status: 502 });
  }
}
