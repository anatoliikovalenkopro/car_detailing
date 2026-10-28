import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SERVICE_AREA } from "@/lib/services";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-400">{BRAND.tagline} Mobile detailing for {BRAND.city}.</p>
        </div>
        <div className="text-sm text-slate-400">
          <p className="font-semibold text-slate-200">Contact</p>
          <p className="mt-2">{BRAND.phone}</p>
          <p>{BRAND.email}</p>
          <a className="hover:text-white" href={`https://instagram.com/${BRAND.instagram}`} target="_blank" rel="noreferrer">
            Instagram @{BRAND.instagram}
          </a>
          <p className="mt-2">{BRAND.hours}</p>
        </div>
        <div className="text-sm text-slate-400">
          <p className="font-semibold text-slate-200">We come to</p>
          <p className="mt-2">{SERVICE_AREA.join(" · ")}</p>
          <Link href="/tech" className="mt-4 inline-block text-xs text-slate-600 hover:text-slate-400">
            Team login
          </Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {BRAND.full}. Prices in CAD before GST.
      </p>
    </footer>
  );
}
