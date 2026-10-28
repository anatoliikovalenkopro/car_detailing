import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";
import { BRAND } from "@/lib/brand";
import { PROMO_LABEL, SERVICES, SERVICE_AREA, money, promo } from "@/lib/services";

const packages = SERVICES.filter((s) => s.kind === "package");
const addons = SERVICES.filter((s) => s.kind === "addon");

const STEPS = [
  { n: "01", title: "Book in 60 seconds", text: "Pick a package, a time and your address. No phone tag." },
  { n: "02", title: "Watch us roll in", text: "Get a text when we're on the way and follow us live on the map." },
  { n: "03", title: "Enjoy the glow", text: "We detail in your driveway while you work, nap or binge a show." },
];

const PROMISES = [
  { icon: "💸", title: "Prices on the website", text: "No “starting at… actually it's double” surprises. Final price agreed before we start." },
  { icon: "📍", title: "Live arrival tracking", text: "No 4-hour windows. You see exactly where we are and when we'll arrive." },
  { icon: "📸", title: "Before & after photos", text: "Every job documented and sent to you. Proof, not promises." },
  { icon: "🤝", title: "Glow guarantee", text: "Missed a spot? Tell us within 48h and we come back to fix it, free." },
];

const FAQ = [
  {
    q: "What do I need to provide?",
    a: "Access to an outdoor water tap and a regular power outlet within about 30 m, and space around your car (driveway, garage or private stall). We bring everything else — soaps, towels, vacuum, extractor, polisher.",
  },
  {
    q: "Do you work in winter?",
    a: "Yes! Interior services run all year. For exterior washes when it's below ~5°C we need a heated garage. If you don't have one, we'll suggest an interior package and come back for the outside when it warms up.",
  },
  {
    q: "Is the online / AI price final?",
    a: "It's a solid estimate. Extreme dirt, heavy pet hair, mould or paint damage can change the time needed. We always confirm the true price with you before starting — no surprises.",
  },
  {
    q: "How do I pay?",
    a: "After the job: e-Transfer, card tap or cash. No deposit for standard bookings.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Free up to 24 hours before your appointment — just reply to your confirmation text.",
  },
  {
    q: "Which areas do you cover?",
    a: `${SERVICE_AREA.join(", ")}. Somewhere else nearby? Ask our chat assistant or text us.`,
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="aurora-bg" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:pt-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-glow/30 bg-glow/10 px-3 py-1 text-xs font-medium text-glow">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-glow" /> {PROMO_LABEL}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-7xl">
            Showroom shine. <span className="aurora-text">Your driveway.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            {BRAND.full} brings premium hand detailing to your home or office across {BRAND.city}. Honest prices, live
            arrival tracking, zero hassle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn-primary text-base">
              Book your detail →
            </Link>
            <Link href="/estimate" className="btn-ghost text-base">
              📸 Get an AI photo quote
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
            <span>✓ 100% mobile</span>
            <span>✓ Live tracking + SMS</span>
            <span>✓ Prices you can see</span>
            <span>✓ Fully insured</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6">
              <p className="font-display text-sm font-bold aurora-text">{s.n}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold">Packages</h2>
            <p className="mt-2 text-slate-400">Car prices shown — SUVs and trucks below each card. Before GST.</p>
          </div>
          <span className="rounded-full bg-glow/10 px-3 py-1 text-sm text-glow">25% off during launch</span>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>

        <h3 className="mt-16 font-display text-2xl font-bold">Add-ons</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {addons.map((s) => (
            <div key={s.id} className="glass rounded-xl p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-slate-400">{s.tagline}</p>
              <p className="mt-3 text-sm">
                <span className="font-bold text-glow">+{money(promo(s.price[0]))}</span>{" "}
                <span className="text-slate-500 line-through">{money(s.price[0])}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI ESTIMATE + TRACKING */}
      <section className="mx-auto mt-24 grid max-w-6xl gap-5 px-4 lg:grid-cols-2">
        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-glow-3/20 blur-3xl" />
          <p className="text-sm font-semibold text-glow-3">AI photo quote</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Snap. Upload. Know the price.</h2>
          <p className="mt-3 text-slate-400">
            Upload up to 4 photos of your car. Our AI checks the dirt, salt, stains and paint, recommends the right
            package and gives you a price range in seconds.
          </p>
          <Link href="/estimate" className="btn-primary mt-6">
            Try the AI quote
          </Link>
        </div>
        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-glow-2/20 blur-3xl" />
          <p className="text-sm font-semibold text-glow-2">Live tracking</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Like a food delivery app — for your car.</h2>
          <p className="mt-3 text-slate-400">
            On the day, you get a text with a live map link. Watch your detailer drive over with a real-time ETA. No
            more waiting by the window.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-2 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-glow-2" />
            </span>
            “Your detailer is 6 min away”
          </div>
        </div>
      </section>

      {/* PROMISES */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <h2 className="font-display text-4xl font-bold">
          Detailing, <span className="aurora-text">minus the sketchy.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          We started NorthGlow because booking a detailer shouldn't feel like a gamble. Here's our deal with you:
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="glass rounded-2xl p-6">
              <p className="text-2xl">{p.icon}</p>
              <h3 className="mt-3 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-24">
        <h2 className="text-center font-display text-4xl font-bold">Questions</h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="glass group rounded-2xl p-5 open:border-glow/30">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {f.q}
                <span className="text-glow transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 text-center sm:p-16">
          <div className="aurora-bg !inset-0 !h-full" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready to glow?</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">Launch prices won&apos;t last. Grab a spot this week.</p>
            <Link href="/book" className="btn-primary mt-8 text-base">
              Book now — 25% off
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
