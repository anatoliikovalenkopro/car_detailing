import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BUSINESS_FACTS, MODEL, anthropic } from "@/lib/ai";
import { BRAND } from "@/lib/brand";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const SYSTEM = `You are the friendly assistant on the ${BRAND.name} mobile car detailing website.
Answer questions about our services, prices, service area, booking and car care. Be warm, concise (2–5 short sentences or a tiny list), and use plain language. A light emoji now and then is fine.
Only quote prices from the list below and say they are approximate; the true cost is confirmed with our consultant. Mention the launch promo when relevant.
To book, point people to the "Book now" page (/book). For a quick price from photos, point them to the photo quote page (/quote).
If you don't know something (e.g. exact availability), say so and suggest calling or texting us. Never invent services, discounts or policies. Stay on topic; politely decline unrelated requests.

${BUSINESS_FACTS}`;

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1500) }))
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  if (!rateLimit(`chat:${clientIp(req)}`, 30, 600_000)) {
    return NextResponse.json({ reply: "You're chatting fast! Give me a minute, or text us directly 🙂" });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // Keep the last turns only and make sure the conversation starts with the user.
  const history = parsed.data.messages.slice(-12);
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  try {
    const response = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: history as Anthropic.MessageParam[],
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ reply: "I can only help with car detailing questions — ask me anything about that!" });
    }
    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" });
  } catch (e) {
    console.error("[chat]", e);
    return NextResponse.json({
      reply: "I'm having trouble right now. Please text or call us and a real human will help!",
    });
  }
}
