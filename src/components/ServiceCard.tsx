import { money, promo, type Service } from "@/lib/services";

export default function ServiceCard({ s }: { s: Service }) {
  const from = s.price[0];
  return (
    <div
      className={`glass relative flex flex-col rounded-2xl p-6 transition hover:-translate-y-1 hover:border-glow/40 ${
        s.popular ? "ring-1 ring-glow/50" : ""
      }`}
    >
      {s.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-glow px-3 py-1 text-xs font-bold text-ink">Most popular</span>
      )}
      <h3 className="font-display text-xl font-semibold">{s.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{s.tagline}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-xs text-slate-500">from</span>
        <span className="font-display text-3xl font-bold aurora-text">{money(promo(from))}</span>
        <span className="text-sm text-slate-500 line-through">{money(from)}</span>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
        {s.includes.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="text-glow">✓</span>
            {i}
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-5 text-xs text-slate-500">
        SUV {money(promo(s.price[1]))} · Truck/Van {money(promo(s.price[2]))} · ~{s.hours}h
      </p>
    </div>
  );
}
