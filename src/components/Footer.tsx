import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-slate-50 pb-24 sm:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted">
        <p className="font-semibold text-ink">{BRAND.full}</p>
        <p className="mt-1">
          <a href={`tel:${BRAND.phone.replace(/\D/g, "")}`} className="hover:text-ink">{BRAND.phone}</a> ·{" "}
          <a href={`mailto:${BRAND.email}`} className="hover:text-ink">{BRAND.email}</a> ·{" "}
          <a href={`https://instagram.com/${BRAND.instagram}`} target="_blank" rel="noreferrer" className="hover:text-ink">
            @{BRAND.instagram}
          </a>
        </p>
        <p className="mt-1">{BRAND.hours} · Prices in CAD before GST</p>
        <div className="mt-4 flex justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} {BRAND.name}</span>
          <Link href="/tech" className="hover:text-muted">Team login</Link>
        </div>
      </div>
    </footer>
  );
}
