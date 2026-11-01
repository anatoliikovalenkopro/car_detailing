"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICE_PHOTOS } from "@/lib/photos";
import { SERVICES, money, promo, sizeIndex, type VehicleSize } from "@/lib/services";

const MEMBERSHIP_ID = "glow-club";
const packages = SERVICES.filter((s) => s.kind === "package" && s.id !== MEMBERSHIP_ID);
const membership = SERVICES.find((s) => s.id === MEMBERSHIP_ID);
const addons = SERVICES.filter((s) => s.kind === "addon");
const SIZES: { id: VehicleSize; label: string }[] = [
  { id: "car", label: "Car" },
  { id: "suv", label: "SUV" },
  { id: "truck", label: "Truck / Van" },
];

/** Photo cards: swipe sideways on phones, grid on bigger screens. Tap to book. */
export default function ServiceCards() {
  const [size, setSize] = useState<VehicleSize>("car");
  const i = sizeIndex(size);

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold sm:max-w-sm">
        {SIZES.map((v) => (
          <button
            key={v.id}
            onClick={() => setSize(v.id)}
            aria-pressed={size === v.id}
            className={`rounded-lg py-2 transition ${size === v.id ? "bg-white text-brand shadow-sm" : "text-muted"}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {packages.map((s) => {
          const photo = SERVICE_PHOTOS[s.id];
          return (
            <Link
              key={s.id}
              href={`/book?service=${s.id}&size=${size}`}
              className="group relative flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-800 to-brand-dark">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                {s.popular && (
                  <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand">
                    Most popular
                  </span>
                )}
                <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  ~{s.hours}h · at your place
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-heading text-lg font-bold">{s.name}</p>
                <p className="mt-0.5 text-sm text-muted">{s.tagline}</p>
                <ul className="mt-3 space-y-1 text-[13px] text-slate-600">
                  {s.includes.slice(0, 3).map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-brand">✓</span>
                      {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between pt-4">
                  <p>
                    <span className="font-heading text-2xl font-extrabold text-brand">{money(promo(s.price[i]))}</span>{" "}
                    <span className="text-sm text-slate-400 line-through">{money(s.price[i])}</span>
                  </p>
                  <span className="rounded-lg bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand transition group-hover:bg-brand group-hover:text-white">
                    Book →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {membership && (
        <Link
          href={`/book?service=${membership.id}&size=${size}`}
          className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-5 text-white transition hover:shadow-lg"
        >
          <div>
            <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase">Membership</p>
            <p className="font-heading text-xl font-extrabold">{membership.name}</p>
            <p className="text-sm text-white/80">{membership.includes.slice(0, 3).join(" · ")}</p>
          </div>
          <p className="text-right">
            <span className="font-heading text-2xl font-extrabold">{money(promo(membership.price[i]))}</span>
            <span className="text-sm text-white/70"> / visit</span>
            <span className="block text-xs text-white/60 line-through">{money(membership.price[i])}</span>
          </p>
        </Link>
      )}

      <details className="group mt-4 rounded-2xl border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-semibold">
          Add-ons ({addons.length})
          <span className="text-brand transition group-open:rotate-45">+</span>
        </summary>
        <ul className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
          {addons.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-sm">
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
