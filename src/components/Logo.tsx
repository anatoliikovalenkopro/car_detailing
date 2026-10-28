import { BRAND } from "@/lib/brand";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[17px] font-extrabold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          {/* Water drop with a shine */}
          <path d="M12 2.5c3.5 4.4 6.5 8 6.5 11.3A6.5 6.5 0 0 1 5.5 13.8C5.5 10.5 8.5 6.9 12 2.5Z" fill="currentColor" />
          <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      {BRAND.name}
    </span>
  );
}
