"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICES, VEHICLE_SIZES, money, promo, sizeIndex, type VehicleSize } from "@/lib/services";

const packages = SERVICES.filter((s) => s.kind === "package");
const addons = SERVICES.filter((s) => s.kind === "addon");

/** Compact, tappable price list. Tapping a row opens booking with it pre-selected. */
export default function PriceList() {
  const [size, setSize] = useState<VehicleSize>("car");
  const i = sizeIndex(size);

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
        {VEHICLE_SIZES.map((v) => (
          <button
            key={v.id}
            onClick={() => setSize(v.id)}
            className={`rounded-lg py-2 transition ${size === v.id ? "bg-white text-brand shadow-sm" : "text-muted"}`}
          >
            {v.id === "car" ? "Car" : v.id === "suv" ? "SUV" : "Truck / Van"}
          </button>
        ))}
      </div>

      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {packages.map((s) => (
          <li key={s.id}>
            <Link href={`/book?service=${s.id}&size=${size}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {s.name}
                  {s.popular && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">Popular</span>}
                </p>
                <p className="truncate text-sm text-muted">{s.tagline}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand">{money(promo(s.price[i]))}</p>
                <p className="text-xs text-slate-400 line-through">{money(s.price[i])}</p>
              </div>
              <span className="text-slate-300">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <details className="group mt-3 rounded-2xl border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-semibold">
          Add-ons ({addons.length})
          <span className="text-brand transition group-open:rotate-45">+</span>
        </summary>
        <ul className="divide-y divide-line border-t border-line">
          {addons.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>
                <span className="font-medium">{s.name}</span>
                <span className="block text-muted">{s.tagline}</span>
              </span>
              <span className="whitespace-nowrap font-semibold text-brand">+{money(promo(s.price[i]))}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
