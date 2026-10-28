# Glossmith Mobile Detailing

> **Pro detailing at your door.** Mobile car detailing for Edmonton & area.

> The name is a placeholder: change it in `src/lib/brand.ts` (name, tagline, contacts, booking-number prefix) and the whole site, emails and SMS follow.

A compact, phone-first website (white + royal blue) for a 100% mobile detailing business. It has:

- **One-page home** with a tappable price list (switch Car / SUV / Truck), a sticky "Book now" bar on phones,, Edmonton-market prices and a **25% launch promo** (crossed-out regular price).
- **Online booking** (`/book`), 3 short steps made for phones: service → day chips + time → contact details, with the total always visible at the bottom. Live quote with GST. The customer must confirm they have **water and power access**. Shows a winter warning if they need exterior work without a garage.
- **Email to you for every new booking**, with a one-click **Confirm** button. Confirming sends the customer an **SMS and email** with their tracking link.
- **Live tracking** (`/track/NG-XXXXXX?t=…`): an Uber-style map with the technician's live GPS position, ETA and a status timeline. The customer gets an SMS when you're on the way, when you arrive and when the job is done.
- **Password-protected team panel** (`/tech`): list of bookings, Confirm / On my way / Arrived / Job done buttons, Google Maps navigation, and live GPS sharing from the technician's phone.
- **Quote from photos** (`/quote`): the customer uploads 1–4 photos and Claude Haiku (behind the scenes) rates the condition and recommends services. The **price range comes from your own price list**, never invented by the AI, and the page tells customers that a consultant confirms the true cost.
- **Chat assistant** on the home page: answers questions about services, prices, area and policies using your real price list.

Tech: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, Claude Haiku (`claude-haiku-5-5`, the cheapest current model), Resend (email), Twilio (SMS), Leaflet + OpenStreetMap/CARTO (free maps), and Upstash Redis (free tier) for the database.

---

## 1. Run it on your PC

Requires Node.js 20+.

```bash
git clone <this repo>
cd car_detailing
npm install
cp .env.example .env.local   # then fill in values (see below)
npm run dev                  # http://localhost:3000
```

With only `TECH_PASSWORD` and `SESSION_SECRET` set, everything works locally. Emails and SMS are printed in the terminal instead of being sent, and bookings are saved in `.data/db.json`. Add `ANTHROPIC_API_KEY` to turn on the chat and the photo quote.

Generate a session secret: `openssl rand -hex 32` (or any 64 random characters).

## 2. Accounts you need (all have free or cheap tiers)

| What | Where | Env vars | Cost |
|---|---|---|---|
| Claude AI | console.anthropic.com → API keys | `ANTHROPIC_API_KEY` | Haiku is ~$0.10 / $0.50 per million tokens: a chat reply or photo quote costs a fraction of a cent |
| Email | resend.com → verify your domain | `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL` | Free up to 3,000 emails/month |
| SMS | twilio.com → buy a local 587/780 number | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | ~$1.50/month number + ~1–2¢ per SMS in Canada |
| Database | upstash.com → create Redis database | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Free tier is plenty |
| Hosting | vercel.com → import the GitHub repo | add all env vars above + `SITE_URL` | Free (Hobby) to start |
| Domain | e.g. yourname.ca on Namecheap / Cloudflare | — | ~$15/year |

> On Vercel you **must** set the Upstash variables, because the local `.data` file doesn't persist there.

Optional public vars: `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM`.

## 3. How a booking flows

1. The customer books on `/book` → status **pending**. You get an email, and the customer gets a "request received" email.
2. You click **Confirm booking** in the email (or ✅ in `/tech`). The customer gets an SMS and email with the tracking link.
3. On the day, the technician opens `/tech` on their phone and taps **🚗 On my way**. The phone's GPS is shared, and the customer gets an SMS with an ETA and the live map. *Keep the page open while driving (the screen stays awake automatically).*
4. **📍 Arrived** → SMS. **✨ Job done** → SMS asking for a review / Instagram tag.

## 4. Change prices, services and text

- Prices, services, add-ons, promo % and service area: **`src/lib/services.ts`**. The site, chat and photo quote all update automatically.
- Name, phone, hours, time slots: **`src/lib/brand.ts`**
- Home page copy and FAQ: **`src/app/page.tsx`**

## 5. Project map

```
src/app/page.tsx              Home page (compact)
src/components/PriceList.tsx  Tappable price list
src/app/book/                 Booking wizard
src/app/quote/                Quote from photos
src/app/track/[id]/           Customer live-tracking map
src/app/tech/                 Password-protected team panel
src/app/api/…                 Booking, confirm, chat, quote, tracking, tech APIs
src/lib/services.ts           Service catalog + pricing (edit me)
src/lib/notify.ts             Email + SMS templates
src/lib/ai.ts                 Claude client + business facts for the AI
src/lib/store.ts              Redis / local-file database
src/components/               Header, footer, chat widget, map
```

## 6. Security notes

- `/tech` and all `/api/tech/*` routes require the password. Sessions are signed, http-only, `SameSite=strict` cookies that last 12h, and login is rate-limited to 5 tries per 15 minutes.
- Tracking links include a random secret token, so booking IDs can't be guessed.
- The email confirm link is HMAC-signed.
- The technician's location is only visible to the customer while the booking is "on the way".
- The chat and quote endpoints are rate-limited per IP to protect your API bill.

---

## Business launch notes (Edmonton)

**Services were chosen to need no van and no big equipment.** Everything runs on the customer's tap and outlet, and the kit fits in an SUV or hatchback:

- Hose + quick connectors, 25 m extension cord, foam sprayer, 2–3 buckets with grit guards
- Shop vac + cordless blower, portable hot-water extractor (e.g. Bissell SpotClean Pro), small steamer
- Dual-action polisher + pads (for Paint Enhancement / Ceramic later)
- Microfibre towels (lots), brushes, iron remover, clay, sealant, ceramic coating, interior cleaner, dressing
- Small ozone generator (odor add-on), headlight restoration kit
- Optional: small electric pressure washer (~1,900 PSI) for quicker rinses

**Before you launch, make the promises on the site true:**

- Get **commercial general liability insurance** plus garage-keepers coverage if possible.
- Register the business name in Alberta and get an **Edmonton business licence** (and check St. Albert / Strathcona County rules). Register for GST once you pass $30k revenue.
- Once you pick the final name, check that the **.ca domain** and **Instagram handle** are free, and search the Alberta corporate registry.
- Take before/after photos of every job: they're your Instagram content.

**Pricing:** regular prices sit around the middle of the Edmonton mobile-detailing market (full detail usually $220–$350, ceramic $800–$1,500). The 25% launch promo is set in one line (`PROMO_DISCOUNT`), so set it to `0` when the launch period ends.

**Winter:** from roughly November to March, exterior washing needs a heated garage. The booking form warns customers, and the chat assistant knows this rule.
