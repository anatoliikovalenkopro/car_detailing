import { verifySignature } from "@/lib/auth";
import { getBooking, setStatus } from "@/lib/bookings";
import { notifyCustomerConfirmed } from "@/lib/notify";

// One-click confirm link from the owner's "new booking" email.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  const page = (title: string, body: string) =>
    new Response(
      `<!doctype html><meta name="viewport" content="width=device-width"><title>${title}</title>
       <body style="font-family:system-ui;background:#05070d;color:#e2e8f0;display:grid;place-items:center;min-height:100vh;margin:0">
       <div style="text-align:center;padding:24px"><h1>${title}</h1><p>${body}</p><p><a style="color:#34d399" href="/tech">Open tech panel →</a></p></div></body>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );

  if (!id || !sig || !verifySignature(`confirm:${id}`, sig)) {
    return page("Invalid link", "This confirmation link is not valid.");
  }
  const b = await getBooking(id);
  if (!b) return page("Not found", `Booking ${id} doesn't exist.`);
  if (b.status !== "pending") return page("Already handled", `Booking ${id} is ${b.status}.`);

  await setStatus(b, "confirmed");
  await notifyCustomerConfirmed(b);
  return page("Confirmed ✅", `${b.name} has been notified by SMS and email. ${b.date} at ${b.slot}.`);
}
