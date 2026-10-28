import { BRAND } from "@/lib/brand";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="ng" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset=".5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* North star sparkle */}
        <path d="M16 2 L19 13 L30 16 L19 19 L16 30 L13 19 L2 16 L13 13 Z" fill="url(#ng)" />
        <circle cx="16" cy="16" r="2.4" fill="#05070d" />
      </svg>
      <span>
        North<span className="aurora-text">Glow</span>
        <span className="sr-only"> — {BRAND.full}</span>
      </span>
    </span>
  );
}
