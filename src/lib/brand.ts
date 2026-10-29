// Change the business name here — the whole site, emails, SMS and the chat
// assistant use these values.
export const BRAND = {
  name: "Glossmith",
  full: "Glossmith Mobile Detailing",
  tagline: "Pro detailing at your door.",
  city: "Edmonton & area",
  phone: process.env.NEXT_PUBLIC_PHONE || "(587) 000-0000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@glossmith.ca",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "glossmith.yeg",
  hours: "Mon–Sat, 8am – 7pm",
  /** Prefix for booking reference numbers, e.g. GS-7K3P9Q */
  idPrefix: "GS",
};

// Edmonton city centre — default map view
export const HQ = { lat: 53.5461, lng: -113.4938 };

export const SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00"];
