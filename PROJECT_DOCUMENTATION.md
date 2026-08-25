# Project Documentation

Smart Channels corporate website — architecture, operation and maintenance.

---

## Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technologies Used](#3-technologies-used)
4. [Folder Structure](#4-folder-structure)
5. [Installation](#5-installation)
6. [Development Commands](#6-development-commands)
7. [Production Build](#7-production-build)
8. [Environment Variables](#8-environment-variables)
9. [Deployment](#9-deployment)
10. [Image Management](#10-image-management)
10a. [Industry Imagery](#10a-industry-imagery)
11. [Gallery Management](#11-gallery-management)
12. [Project Management](#12-project-management)
13. [Partner Management](#13-partner-management)
14. [Client Management](#14-client-management)
15. [Certification Management](#15-certification-management)
16. [Arabic / English System](#16-arabic--english-system)
17. [Theme System](#17-theme-system)
18. [SEO](#18-seo)
19. [Analytics](#19-analytics)
20. [Contact Form](#20-contact-form)
21. [Security](#21-security)
22. [Accessibility](#22-accessibility)
23. [Performance](#23-performance)
24. [Troubleshooting](#24-troubleshooting)
25. [Future Expansion](#25-future-expansion)

---

## 1. Project Overview

A bilingual (English / Arabic) corporate website for Smart Channels, a Saudi
technology and systems integration company established in 2019 and based in
Al Murabba, Riyadh.

**Scope.** Two pages, kept intentionally compact:

| Route | Contents |
| --- | --- |
| `/en`, `/ar` | Hero · About · Solutions · Industries · Why us · Work · Contact |
| `/en/company`, `/ar/company` | Company profile · Vision · Mission · Values · Capabilities · Approach · Certifications |

**Design direction.** Enterprise technology, premium corporate. Dark charcoal
with controlled brand magenta and purple, plus a matching light theme. The
approved tagline *"we take you to the future"* leads the hero.

**Content principle.** Nothing on this site is invented. There are no client
counts, no project totals, no years-of-experience figures, no partner logos and
no certifications, because none were supplied. Sections awaiting content exist
architecturally and appear the moment content is added — see §7 of DECISIONS.md
for why they are omitted rather than shown as "coming soon".

---

## 2. Architecture

### Rendering

Every page is **statically generated per locale** at build time
(`generateStaticParams` over `["en", "ar"]`). Four HTML documents are produced.
There is no server rendering per request except the contact API route.

### Request flow

```
Request  →  src/proxy.ts        locale prefix redirect (/ → /en)
         →  app/[locale]/layout  <html lang dir>, theme bootstrap, header/footer
         →  app/[locale]/page    section composition
```

### Layering

```
  src/data/*          content        — what the site says
  src/i18n/*          translations   — how the interface speaks
  src/lib/*           logic          — routing, SEO, validation, delivery
  src/components/*    presentation   — how it looks
```

Content never imports presentation. Components read from `src/data` and
`src/i18n` and render; they never define content inline. This is what makes
adding a project or a gallery image a one-file change.

### Server vs client components

Almost everything is a Server Component. Only these ship JavaScript:

| Component | Why it must be client-side |
| --- | --- |
| `ThemeProvider` | Reads `localStorage`, listens to `prefers-color-scheme` |
| `Header` | Scroll state, mobile menu, scroll-spy |
| `ThemeToggle`, `LocaleToggle` | Interaction / `usePathname` |
| `NetworkCanvas` | Canvas animation |
| `RevealObserver` | One IntersectionObserver for the whole page |
| `GalleryGrid` | Lightbox dialog and focus management |
| `ContactForm` | Validation and submission |

`<Reveal>` is deliberately a **server** component — it renders a `data-reveal`
attribute and nothing else. A single observer in the layout drives all ~62
instances.

---

## 3. Technologies Used

See **[TECH_STACK.md](./TECH_STACK.md)** for the full inventory with reasoning,
including what was deliberately *not* used.

Summary: Next.js 16 · React 19 · TypeScript 5.9 (strict) · Tailwind CSS v4 ·
Zod (server-only) · Resend · Lucide · Sharp (build-time).

---

## 4. Folder Structure

```
Smart-Channels/
├── public/
│   └── images/
│       ├── logo/            brand lockup, favicons, app icons  (generated)
│       ├── og/              social share card                  (generated)
│       ├── solutions/       service photography                (generated)
│       ├── industries/      photos (primary) + fallback art    (generated)
│       ├── hero/            reserved
│       ├── projects/        ← put project images here
│       ├── gallery/         ← put gallery images here
│       ├── partners/        ← put partner logos here
│       ├── clients/         ← put client logos here
│       └── certifications/  ← put certification badges here
│
├── source-assets/           ORIGINAL, unoptimised images. Not served.
│   └── industries/          ← industry photographs, named <industry-id>.jpg
│                            Drop new photos here and run npm run assets:photos
│
├── scripts/
│   ├── optimize-images.mjs      photos → WebP, favicons, OG card
│   └── generate-industry-art.mjs  16 industry SVG panels
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx       ROOT layout — <html lang dir>
│   │   │   ├── page.tsx         landing page
│   │   │   ├── company/page.tsx company profile
│   │   │   └── not-found.tsx    404
│   │   ├── api/contact/route.ts contact endpoint
│   │   ├── globals.css          design system — tokens, themes, utilities
│   │   ├── manifest.ts · robots.ts · sitemap.ts
│   │
│   ├── components/
│   │   ├── layout/      Header, Footer, Logo, ThemeToggle, LocaleToggle
│   │   ├── sections/    one file per page section
│   │   ├── ui/          Button, Section, SectionHeading, Reveal, Icon, …
│   │   ├── visuals/     NetworkCanvas
│   │   ├── seo/         StructuredData (JSON-LD)
│   │   ├── analytics/   Analytics
│   │   └── providers/   ThemeProvider
│   │
│   ├── data/            ← ALL EDITABLE CONTENT LIVES HERE
│   │   ├── services.ts        9 services + 12 hardware categories
│   │   ├── industries.ts      16 industries (photo-first, art fallback)
│   │   ├── projects.ts        (empty — pending)
│   │   ├── gallery.ts         (empty — pending)
│   │   ├── partners.ts        (empty — pending)
│   │   ├── clients.ts         (empty — pending)
│   │   ├── certifications.ts  (empty — pending)
│   │   └── navigation.ts
│   │
│   ├── i18n/
│   │   ├── config.ts          locales, direction, hreflang
│   │   ├── index.ts           getDictionary, format
│   │   └── dictionaries/      en.ts (source of truth) · ar.ts
│   │
│   ├── lib/
│   │   ├── site.ts            company facts, contact details, feature flags
│   │   ├── routes.ts          locale-aware URL building
│   │   ├── seo.ts             metadata construction
│   │   ├── collections.ts     empty-section rendering decision
│   │   ├── contact-rules.ts   shared validation rules (client + server)
│   │   ├── contact-schema.ts  Zod schema (SERVER ONLY)
│   │   ├── mailer.ts          Resend adapter (SERVER ONLY)
│   │   ├── rate-limit.ts      in-memory sliding window
│   │   ├── motion.ts · cn.ts
│   │
│   ├── types/content.ts       Localized<T>, Collection<T>, content types
│   └── proxy.ts               locale redirect (Next 16 replaces middleware.ts)
│
├── .env.example
├── next.config.ts             security headers, CSP, image config
└── [documentation files]
```

---

## 5. Installation

**Requirements:** Node.js ≥ 20.9, npm ≥ 10.

```bash
git clone <repository-url>
cd Smart-Channels
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000> — it redirects to `/en`.

The site runs without any environment variables. The contact form will return an
honest error until `RESEND_API_KEY` is set (see §20).

---

## 6. Development Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run check` | typecheck + lint + build — **run before pushing** |
| `npm run assets` | Regenerate all image assets |
| `npm run assets:photos` | Photos in `source-assets/` → optimised WebP |
| `npm run assets:industries` | Regenerate the 16 industry panels |

---

## 7. Production Build

```bash
npm run build
npm run start
```

Expected output — 9 routes, 4 of them prerendered HTML:

```
├   /[locale]              ● /en  ● /ar
├   /[locale]/company      ● /en/company  ● /ar/company
├ ƒ /api/contact
├ ○ /manifest.webmanifest · /robots.txt · /sitemap.xml
```

`●` = static HTML · `ƒ` = server-rendered on demand

The build fails on any TypeScript error. It does not fail on lint warnings —
run `npm run check` to catch those.

---

## 8. Environment Variables

Full annotated list in **`.env.example`**.

| Variable | Required | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **for production** | Canonical URLs, hreflang, sitemap, OG. **Until set, the site is `noindex`.** |
| `RESEND_API_KEY` | **for the form** | Contact delivery. Without it the form errors honestly. |
| `CONTACT_FROM_EMAIL` | recommended | Sender. Must be a Resend-verified domain. |
| `CONTACT_TO_EMAIL` | optional | Recipient. Defaults to `info@smartchannels.co`. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | GA4 ID. Unset = no analytics code served at all. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | optional | Search Console HTML-tag token. |
| `NEXT_PUBLIC_MAP_EMBED_URL` | optional | Renders a Maps iframe instead of the link card. |
| `NEXT_PUBLIC_SHOW_PENDING_SECTIONS` | optional | Force pending placeholders on/off. |

> `NEXT_PUBLIC_` variables are embedded in the browser bundle and readable by
> anyone. Never put a secret behind that prefix.

---

## 9. Deployment

### Vercel (assumed target)

1. Import the repository.
2. Framework preset: **Next.js**. Build command and output directory are detected.
3. Add environment variables (§8) to the **Production** environment.
   Leave `NEXT_PUBLIC_SITE_URL` unset on Preview so previews stay `noindex`.
4. Deploy.
5. Add the custom domain, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
   **This step is what makes the site indexable** — it is easy to forget.

### Any Node host / container

```bash
npm ci
npm run build
npm run start      # defaults to port 3000; override with PORT
```

Requires Node ≥ 20.9. Put a reverse proxy in front for TLS. Security headers and
CSP come from `next.config.ts`, so they apply regardless of host.

### Static export (no contact form)

If a fully static host is ever required, add `output: "export"` to
`next.config.ts`. Consequences:

- `/api/contact` **disappears** — point the form at a third-party endpoint
  (Web3Forms, Formspree) instead
- `src/proxy.ts` stops running — configure the `/` → `/en` redirect on the host
- Next.js image optimisation is unavailable — set `images.unoptimized: true`
  (all imagery is already pre-optimised WebP, so the impact is small)

---

## 10. Image Management

### Directories

`source-assets/` holds **originals** — full-resolution, never served.
`public/images/` holds **optimised output** — this is what ships.

### The pipeline

```bash
npm run assets:photos
```

For each image it: honours EXIF rotation, resizes to the width the layout
actually uses, encodes WebP at quality 78, and reports the saving. It also
regenerates the favicons, app icons and the Open Graph card from the logo.

Result on the supplied imagery: **22.8 MB → 1.58 MB (−93%)**.

### Adding an image anywhere

1. Put the original in `source-assets/`
2. Run `npm run assets:photos`
3. Anything the script does not recognise is treated as a gallery candidate,
   converted into `public/images/gallery/`, and a paste-ready data entry is
   written to `scripts/generated-gallery-entries.txt`

### Recommended sizes

| Use | Aspect | Recommended source |
| --- | --- | --- |
| Gallery | any | ≥ 1600 px wide |
| Projects | 16:10 | 1600 × 1000 |
| Industries | 16:10 | 1600 × 1000 |
| Partner / client logos | any | SVG preferred, else transparent PNG |

---

## 10a. Industry Imagery

**Photography is the primary imagery for the Industries section.** The
brand-generated SVG panels are a temporary fallback, used only while a
photograph is missing — they are not the intended final design.

### Current status

All 16 industries are on fallback art. `npm run dev` renders a notice above the
section listing which ids still need photography, and
`industryPhotoReadiness()` in `src/data/industries.ts` reports the same
programmatically. The notice never appears in production.

### Adding a photograph

```bash
# 1. Name the file after the industry id, exactly
cp ~/photos/hospital-corridor.jpg source-assets/industries/healthcare.jpg

# 2. Convert
npm run assets:photos
```

Step 2 produces an optimised WebP in `public/images/industries/` plus a blur
placeholder, and writes a paste-ready block to
`scripts/generated-industry-photos.txt`:

```ts
photo: {
  src: "/images/industries/healthcare.webp",
  width: 1600,
  height: 1065,
  blurDataURL: "data:image/webp;base64,…",
},
```

3. Paste that into the matching entry in `src/data/industries.ts`, alongside its
   existing `art:` line. The photograph is used automatically in preference to
   the fallback.

A file whose name is not a recognised industry id is skipped with a warning and
the list of valid ids — it is never silently ignored.

### The 16 ids

```
sporting-events    stadiums          motorsport       cultural-seasons
government         holy-sites        giga-projects    hospitality
healthcare         education         banking          industrial
transport          diplomatic        retail           media
```

### Image specification

| Requirement | Value |
| --- | --- |
| Aspect ratio | 16:10 landscape (cards crop to 16:11) |
| Minimum | 1600 × 1000 |
| Preferred | 2400 × 1500 or larger |
| Composition | Keep the **lower third relatively clear** — the title and note sit there over a scrim |
| Licensing | Owned outright, or licensed for commercial web use |

The pipeline warns when an image's aspect ratio is far from 16:10, because the
crop will then remove more than intended.

Avoid: stock clichés (handshakes, lens-flare server rooms), recognisable
third-party branding, identifiable faces without a model release.

### Shot briefs

Every entry in `src/data/industries.ts` carries a `shotBrief` field — a
commissioning specification for exactly that panel. Hand them to a photographer
or use them as stock search criteria. They live beside the data so they cannot
drift out of sync with it.

Two need particular care:

- **holy-sites** — must be handled respectfully. Prefer architecture,
  wayfinding or crowd-management infrastructure over worshippers, and confirm
  the image is appropriate before publishing.
- **diplomatic** — avoid identifiable flags and national emblems.

### Alt text

Both photographs and fallback panels render with `alt=""`. This is deliberate
and correct: the industry name sits on top of the image as real text, so
announcing "photograph of a stadium" next to the word "Stadiums" would just
repeat it. That is why `IndustryImage` has no `alt` field.

---

## 11. Gallery Management

**File:** `src/data/gallery.ts` — currently `status: "pending"`, empty.

```bash
# 1. Drop photos into source-assets/
cp ~/photos/*.jpg source-assets/

# 2. Convert and generate entries
npm run assets:photos
```

Step 2 writes `scripts/generated-gallery-entries.txt` containing a complete
entry per image, including measured dimensions and a blur placeholder:

```ts
{
  id: "network-closet-01",
  image: {
    src: "/images/gallery/network-closet-01.webp",
    width: 1600,
    height: 1067,
    blurDataURL: "data:image/webp;base64,…",
    alt: {
      en: "TODO — describe this image in English",
      ar: "TODO — صف هذه الصورة بالعربية",
    },
  },
},
```

3. Paste the entries you want into the `items` array in `src/data/gallery.ts`
4. **Replace the TODO alt text** — it is read aloud to screen-reader users
5. Set `status: "published"`

The section then appears automatically, with a responsive grid, lazy loading,
and a keyboard-accessible lightbox. Layout adapts to any number of images.

> Only add photographs confirmed to be Smart Channels' own work. The gallery
> presents images as the company's delivery work.

---

## 12. Project Management

**File:** `src/data/projects.ts`

Three fields per project, as specified — nothing more is demanded:

```ts
{
  id: "riyadh-campus-network",
  name: {
    en: "Riyadh Campus Network",
    ar: "شبكة الحرم في الرياض",
  },
  description: {
    en: "Structured cabling and wireless coverage across a multi-building campus.",
    ar: "كابلات مهيكلة وتغطية لاسلكية عبر حرم متعدد المباني.",
  },
  image: {
    src: "/images/projects/riyadh-campus-network.webp",
    width: 1600,
    height: 1000,
    alt: {
      en: "Network cabinet installed during the Riyadh campus project.",
      ar: "خزانة شبكة مركّبة خلال مشروع الحرم في الرياض.",
    },
  },
},
```

Then set `status: "published"`. The grid reflows for any number of projects.

---

## 13. Partner Management

**File:** `src/data/partners.ts`

```ts
{
  id: "vendor-name",
  name: "Vendor Name",
  logo: "/images/partners/vendor-name.svg",
  width: 200,
  height: 60,
  url: "https://vendor.example.com",   // optional
},
```

- Confirm Smart Channels is **authorised to display the mark** — most vendor
  brand guidelines require an active partner agreement
- SVG preferred; monochrome marks read best across both themes
- Logos render at a normalised height with aspect ratio preserved, so mixed
  dimensions need no manual adjustment
- Below 6 partners the rail renders as a static centred row rather than a
  marquee — four logos scrolling past looks thin

---

## 14. Client Management

**File:** `src/data/clients.ts`

```ts
{
  id: "client-id",
  name: { en: "Client Name", ar: "اسم العميل" },
  logo: "/images/clients/client-id.svg",
  width: 200,
  height: 60,
  usageApproved: true,   // ← REQUIRED
},
```

`usageApproved` is a deliberate guard. `renderableClients()` filters out
anything not explicitly approved, so a logo added during content entry
**cannot reach production** before permission is recorded. Brand usage rights
are a legal matter, not a data-entry detail.

---

## 15. Certification Management

**File:** `src/data/certifications.ts`. Appears on `/company`.

```ts
{
  id: "iso-9001",
  name:   { en: "ISO 9001:2015", ar: "آيزو 9001:2015" },
  issuer: { en: "Certification body", ar: "جهة المنح" },
  logo: "/images/certifications/iso-9001.svg",   // optional
  issuedYear: 2024,                              // optional
},
```

Confirm the certificate is current and that the issuing body permits display of
its mark. Procurement teams verify these.

---

## 16. Arabic / English System

### How it works

- **Routing** — every page is under an explicit locale prefix. `src/proxy.ts`
  redirects `/` to `/en` (or `/ar` if the browser's `Accept-Language` prefers
  Arabic). Deep links always resolve to the default locale so shared URLs never
  break.
- **`<html lang>` and `dir`** are set server-side in `app/[locale]/layout.tsx`.
  They are correct in the served HTML, not patched in after hydration.
- **Interface strings** live in `src/i18n/dictionaries/{en,ar}.ts`.
- **Content strings** live beside the content in `src/data/*` as
  `{ en: "…", ar: "…" }`.

### Type safety

`en.ts` defines the `Dictionary` type. `ar.ts` is typed `const ar: Dictionary`,
so a **missing or misnamed Arabic key is a compile error**, not a hole that
reaches production.

Content uses `Localized<T> = Record<Locale, T>` — a full record, not a partial,
so content added in one language but not the other fails to build.

### Adding a string

1. Add it to `src/i18n/dictionaries/en.ts`
2. TypeScript immediately errors on `ar.ts`
3. Add the Arabic

### RTL

Real RTL, not a mechanical mirror:

- Layout uses **logical properties** throughout (`ps-`, `pe-`, `ms-`, `me-`,
  `text-start`, `start-`, `end-`), so one stylesheet serves both directions
- Directional icons (arrows, lightbox chevrons) flip
- Arrow keys in the lightbox reverse, so "next" always means the direction the
  user reads toward
- The logo marquee reverses travel direction
- Arabic sets slightly larger and looser (`1.03em` / `1.75`) because Arial's
  Arabic glyphs have a smaller apparent x-height than its Latin ones
- Phone numbers, emails and years are wrapped with `dir="ltr"` and
  `.numerals-latin` so they stay readable and dialable inside RTL text

### The tagline

*"we take you to the future"* stays in English in both locales, wrapped in
`dir="ltr"` with `unicode-bidi: isolate`. It is part of the logo artwork;
translating it would create a second, unapproved tagline.

---

## 17. Theme System

Three states: **light**, **dark**, **system** (default).

### No flash

An inline script in `<head>` (`themeBootstrapScript`) runs before first paint,
reads the stored preference (or `prefers-color-scheme`), and sets
`data-theme` plus `color-scheme` on `<html>`. It also adds a `js` class used by
the scroll-reveal system.

### Token layers

```
@theme            brand ramps (magenta-*, purple-*, ink-*)  — fixed
:root             semantic tokens for light
[data-theme=dark] semantic tokens for dark
@theme inline     exposes semantics to Tailwind (bg-bg, text-fg-muted, …)
```

Components consume **only** semantic tokens. No component needs a `dark:`
variant for colour, and none can drift off-palette.

### Persistence

Stored in `localStorage` under `sc-theme`. "System" removes the key and follows
the OS live. All storage access is wrapped in `try/catch` (Safari private mode
can throw).

### Adding a colour

Add the raw value to `@theme`, then map it into **both** `:root` and
`[data-theme="dark"]`. Check contrast before committing — see the measured table
at the top of `globals.css`.

---

## 18. SEO

### Configured

- Per-locale `<title>` and `<meta name="description">`
- Canonical URL per page per locale
- `hreflang` for `en`, `ar-SA`, and `x-default` → English
- Open Graph + Twitter card, with a generated 1200×630 share image
- `sitemap.xml` with `xhtml:link` alternates per URL
- `robots.txt`
- JSON-LD: `Organization`, `ProfessionalService`, `WebSite`, plus
  `BreadcrumbList` on `/company`
- Favicons (32/192/512), Apple touch icon, web manifest
- Semantic HTML with one `<h1>` per page and correct heading order

### The domain switch

**Nothing is hard-coded.** Everything derives from `NEXT_PUBLIC_SITE_URL`.

Until it is set:

```
<meta name="robots" content="noindex, nofollow">
robots.txt:  User-Agent: *  Disallow: /
```

Once set, both flip to indexable and every canonical, hreflang and sitemap entry
points at the real domain. Verified end to end.

### Structured data honesty

Only confirmed facts are emitted. No `aggregateRating`, no `numberOfEmployees`,
no awards, no geo coordinates — a guessed coordinate would put a real business
pin in the wrong place. `sameAs` lists only social accounts that actually exist.

### Keyword approach

Natural corporate copy built around real services — IT solutions, systems
integration, networking, IT infrastructure, security systems, communications
systems, Saudi Arabia. No keyword stuffing, no invented capabilities.

---

## 19. Analytics

`src/components/analytics/Analytics.tsx` renders **nothing** unless
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set to a valid `G-XXXXXXXXXX` ID. No
placeholder ID ships, so a fresh clone sends no data anywhere.

When enabled:

- `anonymize_ip: true`
- `allow_google_signals: false` — no advertising profile is built
- `allow_ad_personalization_signals: false`
- `strategy="afterInteractive"` — off the critical path, cannot affect LCP or INP

**Switching provider.** Nothing else in the codebase references analytics.
A cookieless alternative (Plausible, Umami, Vercel Analytics) drops into this
one component.

**Note.** GA4 sets cookies. If the site needs a cookie banner for its audience,
either add consent gating around this component or switch to a cookieless
provider — the latter is simpler and is the recommendation.

---

## 20. Contact Form

**Fields:** Full name · Company (optional) · Email · Phone · Service · Message

### Delivery

`Browser → POST /api/contact → validate → Resend → info@smartchannels.co`

`replyTo` is set to the enquirer's address so staff can reply directly, while
`from` stays on a domain we control (spoofing the sender fails SPF/DKIM and
lands in spam).

### Setup

1. Create an account at [resend.com](https://resend.com)
2. **Verify the sending domain** (DNS records) — mail from an unverified domain
   goes to spam
3. Create an API key
4. Set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`
5. Submit a real test enquiry after deploying

### If the key is missing

The endpoint returns **503** with an honest error, and logs loudly server-side.
It never shows a success screen for an enquiry that was not delivered — the
worst possible failure mode for a contact form.

### Changing provider

Edit `src/lib/mailer.ts` only. The route calls `sendContactEnquiry()` and knows
nothing about Resend.

### Validation

Rules are defined **once** in `src/lib/contact-rules.ts` and consumed by both
the browser validator and the server's Zod schema, so they cannot drift.
Error messages come from the dictionary and are returned in the visitor's
language.

---

## 21. Security

### Headers (`next.config.ts`)

Content-Security-Policy · `X-Content-Type-Options: nosniff` ·
`X-Frame-Options: DENY` · `Referrer-Policy: strict-origin-when-cross-origin` ·
`Permissions-Policy` (camera, microphone, geolocation denied) ·
`Strict-Transport-Security` · `poweredByHeader: false`

Defined in code so they travel with the project rather than living in provider
configuration.

### Secrets

- No key, token or credential exists in client code
- `src/lib/mailer.ts` and `src/lib/contact-schema.ts` are marked `server-only`,
  so importing them into a client component is a **build error**
- `.env*` files are gitignored; `.env.example` contains no real values

### Contact endpoint — layered, cheapest check first

| # | Check | Response |
| --- | --- | --- |
| 1 | Content-Type must be JSON | 415 |
| 2 | Body ≤ 16 KB | 413 |
| 3 | Rate limit: 5 per IP per 10 min | 429 + `Retry-After` |
| 4 | Honeypot field empty | 200 (silently dropped) |
| 5 | Completion time ≥ 2.5 s | 200 (silently dropped) |
| 6 | Full schema validation | 400 + localised errors |
| 7 | Delivery | 200 / 502 / 503 |

Spam rejections return the **same response as success** so an automated filler
gets no signal to tune against.

### Injection

All user input is escaped before interpolation into the notification email — a
contact form that mails unescaped input to staff is a stored XSS vector aimed at
your own inbox. The `service` field is constrained to known IDs.

### Known limitation

Rate limiting is in-memory and therefore per-instance on serverless. See
DECISIONS.md §14 for the reasoning and the upgrade path.

---

## 22. Accessibility

**Target: WCAG 2.2 AA. Verified: 0 axe-core violations** across 6 combinations
of page × theme × viewport.

- Semantic HTML; one `<h1>` per page; correct heading order
- Skip link, first in tab order
- Visible focus rings on everything (`:focus-visible`, 2px brand outline)
- Contrast verified by measurement — the accent colour differs per theme
  precisely because the raw brand magenta fails AA on both backgrounds
  (DECISIONS.md §2)
- Alt text on every meaningful image, in both languages; decorative images have
  empty `alt` and `aria-hidden`
- Form: real `<label>` per control (never placeholder-as-label), `aria-invalid`,
  `aria-describedby`, an error summary that receives focus and links to each field
- Mobile menu and lightbox: focus trap, focus return, Escape to close, scroll lock
- The horizontal industries scroller is focusable so it can be panned by keyboard
- `prefers-reduced-motion` honoured — reveals resolve to visible with no
  transition; the hero canvas renders one static frame and never starts its loop
- **Full content renders with JavaScript disabled**

---

## 23. Performance

| Metric | Result |
| --- | --- |
| Cumulative Layout Shift | **0** |
| Largest Contentful Paint (local) | 0.70 – 1.10 s |
| First Contentful Paint | 0.12 – 0.29 s |
| JavaScript (gzipped) | ~159 KB |
| CSS (gzipped) | ~13 KB |
| Total page weight | 242 – 295 KB |

### What produces those numbers

- Static generation — HTML is served, not computed
- Server Components — most of the page ships no JavaScript
- **No webfont.** Arial is a system font: no payload, no FOUT/FOIT
- Every image is pre-optimised WebP with explicit dimensions (hence CLS 0)
- Industry artwork is SVG — ~6 KB each instead of ~150 KB WebP
- Zod kept server-side (−63 KB gzipped)
- No animation or carousel library (−75 KB gzipped combined)
- Canvas: node count capped and scaled to viewport, throttled to 30fps, DPR
  capped at 2, paused off-screen and in background tabs, static under
  reduced-motion

### Keeping it fast

- Check bundle impact before adding a client dependency
- Always give images explicit `width`/`height`
- Prefer a Server Component; add `"use client"` only when interaction requires it
- Run `npm run build` and watch the route table

---

## 24. Troubleshooting

**The site is not being indexed / shows `noindex`**
`NEXT_PUBLIC_SITE_URL` is not set in the production environment. This is the
intended default. Set it and redeploy.

**Contact form returns an error**
- 503 → `RESEND_API_KEY` missing. Check server logs for the explicit message.
- 502 → Resend rejected it, usually an unverified sending domain.
- 429 → rate limit; wait or use a different network.

**Styles are missing / the page renders unstyled**
Usually a stale dev or production server holding a build whose CSS chunk has
been deleted by a rebuild. Stop every Node process, `rm -rf .next`, rebuild.
*(This happened during development and briefly produced very confusing layout
measurements — worth checking first.)*

**Arabic text renders left-to-right**
Confirm the URL is under `/ar`. `dir` is set from the route parameter, so
`/en/…` will always render LTR whatever the content language.

**Content added to `src/data/*` does not appear**
Set `status: "published"` on the collection. Sections with `status: "pending"`
or an empty `items` array are hidden in production by design.

**A client logo does not render**
`usageApproved` must be `true`. This is deliberate — see §14.

**TypeScript errors about a missing key after adding a string**
Expected. Add the Arabic translation to `src/i18n/dictionaries/ar.ts`.

**Images look wrong after `npm run assets:photos`**
The script writes actual dimensions to its output. If you hand-edited
`width`/`height` in a data file to values that don't match the file, the aspect
ratio will be wrong. Use the reported numbers.

**Build fails on an unused variable**
`noUnusedLocals` and `noUnusedParameters` are on. Prefix intentionally unused
parameters with `_`.

---

## 25. Future Expansion

### Ready for content — no code changes needed

Projects, Gallery, Partners, Clients and Certifications are fully built. They
appear as soon as data is added; no code changes.

### Straightforward additions

| Addition | Approach |
| --- | --- |
| A third language | Add to `locales` in `src/i18n/config.ts`, create the dictionary, add the language to every `Localized` value. TypeScript will list every place needing translation. |
| A new page | Add to `routes` in `src/lib/routes.ts` (sitemap follows automatically), create `app/[locale]/<route>/page.tsx`, add a `buildMetadata` page key. |
| A new section | Create it in `src/components/sections/`, add a data module if it has content, compose it in `page.tsx`. |
| Case studies | Extend the `Project` type — it deliberately starts minimal. |
| A news / blog section | Would justify introducing MDX or a CMS; the current data-module pattern is not suited to long-form content. |

### Worth doing before the site grows

1. **Commit an automated test suite.** QA was run with Playwright + axe-core but
   is not committed. If the contact form or data layer grows, wire those checks
   into CI. (TECH_STACK.md documents exactly what was run.)
2. **Replace in-memory rate limiting** if enquiry volume rises
   (DECISIONS.md §14).
3. **Consider a CMS** if non-technical staff need to publish without a deploy.
   Not warranted for two pages.
4. **Request the vector logo** — would let the dark-theme plate be removed and
   sharpen the favicons (the current 200×75 source limits icon quality).
