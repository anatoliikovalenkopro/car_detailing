import Link from "next/link";
import ServiceAreaMap from "@/components/ServiceAreaMap";
import ServiceCards from "@/components/ServiceCards";
import { BRAND } from "@/lib/brand";
import { CTA_PHOTO, HERO, QUOTE_PHOTO, SPECIAL_PHOTO } from "@/lib/photos";
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

const PERKS = [
  ["🚗", "We come to you", "Home, office or condo stall"],
  ["💳", "Pay after", "e-Transfer, card or cash"],
  ["📍", "Live tracking", "Text + map when we're close"],
  ["🏷️", "Prices online", "No surprise quotes"],
];

const STEPS = [
  ["Book in a minute", "Pick a package, a time and your address."],
  ["We confirm by text", "On the day you get a live map as we drive over."],
  ["Enjoy the shine", "Pay after the job. That's it."],
];

const SPECIAL = ["RVs & trailers", "Boats", "Motorcycles", "Company fleets"];

function Photo({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} className={`h-full w-full object-cover ${className}`} />;
}

export default function Home() {
  return (
    <>
      {/* Hero: full-bleed photo */}
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 -z-10">
          <Photo src={HERO.src} alt={HERO.alt} eager />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 sm:bg-gradient-to-r sm:from-slate-950/90 sm:via-slate-950/50 sm:to-transparent" />
        </div>
        <div className="mx-auto flex min-h-[540px] max-w-6xl flex-col justify-end px-4 pt-24 pb-10 sm:min-h-[600px] sm:justify-center sm:pb-16">
          <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{PROMO_LABEL}</p>
          <h1 className="mt-4 max-w-xl font-heading text-[40px] leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Showroom shine, <span className="text-blue-300">in your driveway.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/80 sm:text-lg">
            Mobile hand wash, interior and paint care across {BRAND.city}. Book in a minute, pay after the job.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary !px-6 !py-3.5 text-base">Book now</Link>
            <Link href="/quote" className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold backdrop-blur transition hover:bg-white/20">
              Quote from photos
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Perks */}
        <section className="relative z-10 -mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {PERKS.map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <p className="text-xl">{icon}</p>
              <p className="mt-1.5 text-sm font-bold">{title}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
          ))}
        </section>

        {/* Services */}
        <section id="services" className="mt-14 scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-brand">Services & prices</p>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight">Pick your shine</h2>
            </div>
            <p className="text-sm text-muted">Tap a card to book · prices before GST</p>
          </div>
          <ServiceCards />
        </section>

        {/* How it works */}
        <section className="mt-14 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([title, text], n) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-heading font-bold text-white">{n + 1}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Photo quote + special jobs */}
        <section className="mt-14 grid gap-4 lg:grid-cols-2">
          <Link href="/quote" className="group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl p-6 text-white">
            <div className="absolute inset-0 -z-10">
              <Photo src={QUOTE_PHOTO.src} alt={QUOTE_PHOTO.alt} className="transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/60 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-blue-200">Not sure what you need?</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">Send photos, get a price in seconds</p>
            <span className="mt-4 w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand">Get my quote →</span>
          </Link>
          <div className="relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl p-6 text-white">
            <div className="absolute inset-0 -z-10">
              <Photo src={SPECIAL_PHOTO.src} alt={SPECIAL_PHOTO.alt} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />
            </div>
            <p className="text-sm font-semibold text-blue-200">Bigger jobs</p>
            <p className="mt-1 font-heading text-2xl font-extrabold">We detail more than cars</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPECIAL.map((s) => (
                <span key={s} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{s}</span>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/75">Custom quote — send photos or ask in the chat.</p>
          </div>
        </section>

        {/* Service area */}
        <section id="area" className="mt-14 grid scroll-mt-20 items-center gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
          <div>
            <p className="text-sm font-semibold text-brand">Service area</p>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Where we work</h2>
            <p className="mt-3 max-w-md text-muted">
              Based in Edmonton and driving to 9 nearby communities. No shop visits, no waiting rooms — we come to your
              driveway, garage or office parking.
            </p>
            <ul className="mt-5 hidden grid-cols-2 gap-x-6 gap-y-1.5 text-sm font-medium lg:grid">
              {SERVICE_AREA.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ServiceAreaMap />
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-14 scroll-mt-20">
          <h2 className="mb-4 font-heading text-3xl font-extrabold tracking-tight">Good to know</h2>
          <div className="divide-y divide-line rounded-2xl border border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-4">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold">
                  {f.q}
                  <span className="ml-3 text-xl text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative isolate mt-14 overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:py-20">
          <div className="absolute inset-0 -z-10">
            <Photo src={CTA_PHOTO.src} alt={CTA_PHOTO.alt} />
            <div className="absolute inset-0 bg-slate-950/70" />
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Ready for the shine?</h2>
          <p className="mx-auto mt-2 max-w-sm text-white/80">Launch prices won&apos;t last. Grab a spot this week.</p>
          <Link href="/book" className="btn-primary mt-6 !px-6 !py-3.5 text-base">Book now — 25% off</Link>
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
