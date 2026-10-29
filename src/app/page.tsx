import Link from "next/link";
import PriceList from "@/components/PriceList";
import { BRAND } from "@/lib/brand";
import { PROMO_LABEL, SERVICE_AREA } from "@/lib/services";

const FAQ = [
  {
    q: "What do I need to provide?",
    a: "An outdoor water tap and a power outlet within about 30 m, and space around the car (driveway, garage or private stall). We bring everything else.",
  },
  {
    q: "Do you work in winter?",
    a: "Yes. Interiors all year. For exterior washes below ~5°C we need a heated garage — otherwise we do the inside and come back for the outside when it's warmer.",
  },
  {
    q: "Is the price final?",
    a: "Website prices and photo quotes are estimates for normal condition. We confirm the final price with you before starting — no surprises.",
  },
  {
    q: "How do I pay? Can I cancel?",
    a: "Pay after the job: e-Transfer, card or cash. Free cancellation up to 24h before.",
  },
];

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4">
        {/* Hero */}
        <section className="pt-8 pb-6 sm:pt-14">
          <p className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">{PROMO_LABEL}</p>
          <h1 className="mt-4 text-[34px] leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
            Car detailing that <span className="text-brand">comes to you.</span>
          </h1>
          <p className="mt-3 text-muted">
            Hand wash, interior and paint care at your home or work — {BRAND.city}.
          </p>
          <div className="mt-6 hidden gap-3 sm:flex">
            <Link href="/book" className="btn-primary">Book now</Link>
            <Link href="/quote" className="btn-ghost">Get a quote from photos</Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <li>✓ Book in 1 minute</li>
            <li>✓ Pay after the job</li>
            <li>✓ Live arrival map + SMS</li>
          </ul>
        </section>

        {/* Prices */}
        <section id="services" className="scroll-mt-16">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold">Prices</h2>
            <span className="text-xs text-muted">Tap to book · before GST</span>
          </div>
          <PriceList />
        </section>

        {/* How it works */}
        <section className="mt-10 grid grid-cols-3 gap-2 text-center text-sm">
          {[
            ["📅", "Book online"],
            ["📍", "Track us live"],
            ["✨", "Enjoy the shine"],
          ].map(([icon, label]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-2 py-4">
              <p className="text-2xl">{icon}</p>
              <p className="mt-1 font-semibold">{label}</p>
            </div>
          ))}
        </section>

        {/* Quote */}
        <section className="mt-3 flex items-center gap-4 rounded-2xl bg-brand p-5 text-white">
          <div className="flex-1">
            <p className="font-bold">Not sure what you need?</p>
            <p className="text-sm text-white/80">Send 1–4 photos and get a price in seconds.</p>
          </div>
          <Link href="/quote" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand">
            Get quote
          </Link>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-10 scroll-mt-16">
          <h2 className="mb-3 text-xl font-bold">Good to know</h2>
          <div className="divide-y divide-line rounded-2xl border border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-4">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-medium">
                  {f.q}
                  <span className="ml-3 text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            <span className="font-semibold text-ink">We come to:</span> {SERVICE_AREA.join(", ")}.
          </p>
        </section>
      </div>

      {/* Sticky actions on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-white/95 p-3 backdrop-blur sm:hidden">
        <Link href="/quote" className="btn-ghost flex-1 !py-3">Quote</Link>
        <Link href="/book" className="btn-primary flex-[2] !py-3">Book now</Link>
      </div>
    </>
  );
}
