export const BRAND = {
  name: "NorthGlow",
  full: "NorthGlow Mobile Detailing",
  tagline: "The shine comes to you.",
  city: "Edmonton & area",
  phone: process.env.NEXT_PUBLIC_PHONE || "(587) 000-0000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@northglow.ca",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "northglow.yeg",
  hours: "Mon–Sat, 8am – 7pm",
};

// Edmonton city centre — default map view
export const HQ = { lat: 53.5461, lng: -113.4938 };

export const SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"];
