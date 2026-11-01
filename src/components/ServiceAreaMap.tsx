import Link from "next/link";

// Stylized "network" map of the area we serve. Positions come from real
// coordinates, projected onto a 640×560 box (lng −114.08…−113.12, lat 53.74…53.24).
const W = 640;
const H = 560;
const LNG0 = -114.08;
const LAT0 = 53.74;
const PX_PER_LNG = 667; // 640px / 0.96°
const PX_PER_LAT = 1121; // corrected for latitude so the map isn't stretched

function project(lat: number, lng: number) {
  return { x: (lng - LNG0) * PX_PER_LNG, y: (LAT0 - lat) * PX_PER_LAT };
}

type Side = "top" | "bottom" | "bottomStart" | "left" | "right";
type Town = { name: string; code: string; lat: number; lng: number; color: string; label: Side };

const HOME = { name: "Edmonton", lat: 53.5461, lng: -113.4938 };

const TOWNS: Town[] = [
  { name: "St. Albert", code: "STA", lat: 53.63, lng: -113.626, color: "#f472b6", label: "top" },
  { name: "Fort Sask", code: "FSK", lat: 53.713, lng: -113.213, color: "#facc15", label: "left" },
  { name: "Sherwood Park", code: "SHP", lat: 53.541, lng: -113.296, color: "#4ade80", label: "top" },
  { name: "Spruce Grove", code: "SPG", lat: 53.545, lng: -113.9, color: "#facc15", label: "top" },
  { name: "Stony Plain", code: "STP", lat: 53.526, lng: -114.0, color: "#f472b6", label: "bottomStart" },
  { name: "Devon", code: "DEV", lat: 53.364, lng: -113.734, color: "#4ade80", label: "left" },
  { name: "Beaumont", code: "BMT", lat: 53.355, lng: -113.415, color: "#f472b6", label: "right" },
  { name: "Nisku", code: "NSK", lat: 53.33, lng: -113.533, color: "#facc15", label: "left" },
  { name: "Leduc", code: "LDC", lat: 53.259, lng: -113.551, color: "#60a5fa", label: "right" },
];

// North Saskatchewan River, roughly from Devon through downtown to Fort Saskatchewan.
const RIVER = [
  [53.36, -113.75], [53.42, -113.66], [53.47, -113.6], [53.52, -113.55], [53.545, -113.5],
  [53.535, -113.45], [53.56, -113.41], [53.6, -113.38], [53.64, -113.3], [53.7, -113.22], [53.74, -113.15],
] as const;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

const LABEL_POS: Record<Side, string> = {
  top: "-translate-x-1/2 -translate-y-[calc(100%+10px)]",
  bottom: "-translate-x-1/2 translate-y-[10px]",
  bottomStart: "-translate-x-[8px] translate-y-[10px]",
  left: "-translate-x-[calc(100%+10px)] -translate-y-1/2",
  right: "translate-x-[10px] -translate-y-1/2",
};

export default function ServiceAreaMap() {
  const home = project(HOME.lat, HOME.lng);
  const river = RIVER.map(([lat, lng]) => project(lat, lng));

  return (
    <div className="overflow-hidden rounded-2xl bg-[#081126] text-white">
      <div className="flex items-center justify-between px-4 pt-4 font-mono text-[10px] tracking-[0.2em] text-blue-200/70 sm:px-5 sm:text-[11px]">
        <span>SERVICE AREA</span>
        <span>{TOWNS.length + 1} COMMUNITIES · 1 TEAM</span>
      </div>

      <div className="relative mx-3 my-3 aspect-[640/560] sm:mx-5">
        {/* Map graphics scale with the box; labels are HTML so they stay readable on phones. */}
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="#1e3a8a" />
            </pattern>
            <radialGradient id="glow">
              <stop offset="0" stopColor="#3b82f6" stopOpacity=".45" />
              <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#dots)" />
          <polyline
            points={river.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#1d4ed8"
            strokeOpacity=".55"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {TOWNS.map((t) => {
            const p = project(t.lat, t.lng);
            return (
              <line
                key={t.code}
                x1={home.x}
                y1={home.y}
                x2={p.x}
                y2={p.y}
                stroke="#60a5fa"
                strokeOpacity=".5"
                strokeWidth="1.5"
                strokeDasharray="3 6"
                className="ng-route"
              />
            );
          })}
          <circle cx={home.x} cy={home.y} r="90" fill="url(#glow)" />
          <circle cx={home.x} cy={home.y} r="46" fill="none" stroke="#60a5fa" strokeWidth="3" className="ng-ring" />
          {TOWNS.map((t) => {
            const p = project(t.lat, t.lng);
            return <rect key={t.code} x={p.x - 5} y={p.y - 5} width="10" height="10" fill={t.color} />;
          })}
          <rect x={home.x - 7} y={home.y - 7} width="14" height="14" fill="#ffffff" />
        </svg>

        {TOWNS.map((t) => {
          const p = project(t.lat, t.lng);
          return (
            <span
              key={t.code}
              className={`absolute whitespace-nowrap rounded border border-white/15 bg-[#081126]/90 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider sm:text-[11px] ${LABEL_POS[t.label]}`}
              style={{ left: pct(p.x, W), top: pct(p.y, H), color: t.color }}
            >
              {t.name}
            </span>
          );
        })}

        <span
          className="absolute -translate-x-1/2 translate-y-[18px] whitespace-nowrap rounded border border-blue-300/60 bg-[#0b1d4a] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs"
          style={{ left: pct(home.x, W), top: pct(home.y, H) }}
        >
          YEG Edmonton · Home base
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 sm:px-5">
        <p className="font-mono text-[11px] tracking-wider text-blue-100/80 sm:text-xs">
          WE DRIVE TO YOU · NO SHOP VISITS
        </p>
        <Link href="/book" className="rounded-lg bg-brand px-3.5 py-2 font-mono text-xs font-bold tracking-wider text-white hover:bg-brand-dark">
          BOOK IN YOUR AREA →
        </Link>
      </div>
    </div>
  );
}
