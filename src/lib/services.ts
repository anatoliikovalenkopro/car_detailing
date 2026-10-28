// Service catalog and pricing. Edit prices here — the whole site, the chat bot
// and the AI estimator all read from this file.
//
// Prices are regular mid-market Edmonton mobile-detailing rates (CAD, before GST).
// The site shows them crossed out next to the launch promo price (PROMO_DISCOUNT off).

export const PROMO_DISCOUNT = 0.25;
export const PROMO_LABEL = "Launch promo: 25% off everything";
export const GST_RATE = 0.05;

export const VEHICLE_SIZES = [
  { id: "car", label: "Car / Coupe", hint: "Sedans, hatchbacks, coupes" },
  { id: "suv", label: "SUV / Crossover", hint: "5-seat SUVs, small crossovers" },
  { id: "truck", label: "Truck / Van / 3-row", hint: "Pickups, minivans, 7-seaters" },
] as const;

export type VehicleSize = (typeof VEHICLE_SIZES)[number]["id"];

export type Service = {
  id: string;
  name: string;
  kind: "package" | "addon";
  tagline: string;
  includes: string[];
  /** Regular price per vehicle size: [car, suv, truck] */
  price: [number, number, number];
  /** Rough time on site, in hours (for the biggest vehicle) */
  hours: number;
  popular?: boolean;
  /** Needs the car outside (water) — limited in winter unless the customer has a garage */
  needsWater?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "express-wash",
    name: "Express Wash",
    kind: "package",
    tagline: "Hand wash that makes Monday feel like Friday.",
    includes: [
      "Foam pre-wash + two-bucket hand wash",
      "Wheels, tires & wheel wells",
      "Streak-free exterior glass",
      "Tire shine + door jambs wiped",
    ],
    price: [60, 75, 90],
    hours: 1,
    needsWater: true,
  },
  {
    id: "interior-refresh",
    name: "Interior Refresh",
    kind: "package",
    tagline: "Crumbs, dust and coffee rings — gone.",
    includes: [
      "Full vacuum incl. trunk & under seats",
      "Dash, console, doors wiped & UV-protected",
      "Interior glass & mirrors",
      "Floor mats cleaned",
    ],
    price: [120, 140, 165],
    hours: 1.5,
  },
  {
    id: "full-glow",
    name: "Full Detail",
    kind: "package",
    tagline: "Inside + out. The one everybody books.",
    includes: [
      "Everything in Express Wash + Interior Refresh",
      "Spray sealant (3-month gloss & protection)",
      "Plastics dressed, vents & crevices detailed",
      "Light stain spot-treatment",
    ],
    price: [240, 280, 325],
    hours: 3.5,
    popular: true,
    needsWater: true,
  },
  {
    id: "deep-interior",
    name: "Deep Interior Reset",
    kind: "package",
    tagline: "Hot-water extraction for seats and carpets that saw things.",
    includes: [
      "Everything in Interior Refresh",
      "Shampoo + hot-water extraction of seats & carpets",
      "Steam clean of cup holders, vents, seams",
      "Winter salt-stain removal",
    ],
    price: [220, 250, 290],
    hours: 3.5,
  },
  {
    id: "decon-seal",
    name: "Decon & Seal",
    kind: "package",
    tagline: "Glass-smooth paint and 6 months of protection.",
    includes: [
      "Hand wash + iron fallout remover",
      "Clay bar decontamination",
      "6-month paint sealant",
      "Wheels sealed, glass cleaned",
    ],
    price: [170, 200, 235],
    hours: 2.5,
    needsWater: true,
  },
  {
    id: "paint-enhance",
    name: "One-Step Paint Enhancement",
    kind: "package",
    tagline: "Machine polish that removes most swirls and dullness.",
    includes: [
      "Full wash, decon & clay",
      "Single-stage machine polish (~60–70% swirl removal)",
      "Paint sealant",
      "Trim dressed, glass polished",
    ],
    price: [450, 525, 600],
    hours: 6,
    needsWater: true,
  },
  {
    id: "ceramic",
    name: "Ceramic Shield (2-Year)",
    kind: "package",
    tagline: "Ultra-glossy, hydrophobic, easy to wash all winter.",
    includes: [
      "Full wash, decon & clay",
      "One-step paint enhancement",
      "2-year ceramic coating on paint",
      "Ceramic on wheels faces + glass repellent",
    ],
    price: [900, 1050, 1200],
    hours: 8,
    needsWater: true,
  },
  {
    id: "glow-club",
    name: "Monthly Maintenance",
    kind: "package",
    tagline: "Monthly maintenance visit for returning clients.",
    includes: [
      "Hand wash + quick interior vacuum & wipe",
      "Sealant top-up",
      "Priority booking",
      "Price per monthly visit, cancel anytime",
    ],
    price: [99, 115, 135],
    hours: 1.5,
    needsWater: true,
  },

  // ---- Add-ons ----
  {
    id: "headlights",
    name: "Headlight Restoration",
    kind: "addon",
    tagline: "Yellow, foggy lenses back to clear + UV coat.",
    includes: ["Wet sand + polish both lenses", "UV-protective coating"],
    price: [100, 100, 100],
    hours: 1,
  },
  {
    id: "engine-bay",
    name: "Engine Bay Detail",
    kind: "addon",
    tagline: "Safe degrease and dress.",
    includes: ["Low-pressure degrease", "Plastics & rubber dressed"],
    price: [80, 80, 90],
    hours: 0.75,
    needsWater: true,
  },
  {
    id: "pet-hair",
    name: "Pet Hair Removal",
    kind: "addon",
    tagline: "For the good boys who shed.",
    includes: ["Rubber-brush + air-blow pet hair extraction"],
    price: [50, 60, 75],
    hours: 1,
  },
  {
    id: "leather",
    name: "Leather Clean & Condition",
    kind: "addon",
    tagline: "Soft, matte, factory feel.",
    includes: ["pH-neutral leather clean", "Conditioner with UV protection"],
    price: [70, 80, 90],
    hours: 0.75,
  },
  {
    id: "odor",
    name: "Odor Elimination",
    kind: "addon",
    tagline: "Smoke, pets, gym bags — neutralized, not masked.",
    includes: ["Enzyme treatment", "Ozone treatment (car stays empty ~1h)"],
    price: [100, 100, 120],
    hours: 1.5,
  },
  {
    id: "salt-stains",
    name: "Salt Stain Removal",
    kind: "addon",
    tagline: "Edmonton winter special for carpets & mats.",
    includes: ["Salt dissolver + extraction on carpets and mats"],
    price: [60, 70, 80],
    hours: 1,
  },
  {
    id: "glass-repel",
    name: "Glass Rain Repellent",
    kind: "addon",
    tagline: "Rain and slush slide right off.",
    includes: ["All exterior glass treated"],
    price: [45, 50, 55],
    hours: 0.5,
  },
  {
    id: "trim-restore",
    name: "Trim Restoration",
    kind: "addon",
    tagline: "Faded grey plastics back to deep black.",
    includes: ["Exterior plastic trim cleaned & restored"],
    price: [60, 70, 80],
    hours: 0.75,
  },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id) as [string, ...string[]];

export const SERVICE_AREA = [
  "Edmonton",
  "St. Albert",
  "Sherwood Park",
  "Spruce Grove",
  "Stony Plain",
  "Leduc",
  "Beaumont",
  "Fort Saskatchewan",
  "Devon",
  "Nisku",
];

export function sizeIndex(size: VehicleSize): 0 | 1 | 2 {
  return size === "car" ? 0 : size === "suv" ? 1 : 2;
}

export function promo(price: number): number {
  return Math.round(price * (1 - PROMO_DISCOUNT));
}

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function quote(serviceIds: string[], size: VehicleSize) {
  const items = serviceIds
    .map(getService)
    .filter((s): s is Service => Boolean(s))
    .map((s) => {
      const regular = s.price[sizeIndex(size)];
      return { id: s.id, name: s.name, regular, price: promo(regular), hours: s.hours };
    });
  const regular = items.reduce((a, i) => a + i.regular, 0);
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const hours = items.reduce((a, i) => a + i.hours, 0);
  return { items, regular, subtotal, gst, total: subtotal + gst, hours };
}

export function money(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

/** Plain-text price list, used in the AI system prompts. */
export function priceListText(): string {
  return SERVICES.map((s) => {
    const p = s.price
      .map((r, i) => `${VEHICLE_SIZES[i].label}: ${money(promo(r))} (reg. ${money(r)})`)
      .join("; ");
    return `- [${s.id}] ${s.name} (${s.kind}, ~${s.hours}h): ${s.tagline} Includes: ${s.includes.join(", ")}. Prices: ${p}`;
  }).join("\n");
}
