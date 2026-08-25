# Final Project Report

**Smart Channels Corporate Website** · v1.0.0 · 16 August 2026

---

## Status: NOT approved for launch

The build is complete, verified and deployable. It is **not** signed off for
public launch, and this report does not claim it is.

Launch requires two things that are not yet done:

1. **Outstanding content** — industry photography, projects, gallery, partners,
   clients, certifications, the LinkedIn URL, and the confirmed wording for one
   service name (§3)
2. **The production checklist** in §5, completed and ticked

Everything blocking launch is content or configuration, not engineering. Each
item has working, documented architecture behind it and appears the moment the
content is supplied.

---

## 1. Completed

### Design and brand
- Palette sampled from the actual logo pixels — magenta `#D9088C`,
  purple `#7B388B` — with tonal ramps generated at those exact hue angles
- Dark charcoal theme (primary) and a matching light theme built from one
  semantic token layer, so the two read as the same brand rather than an inversion
- Arial throughout, as mandated; no webfont, and therefore no font-loading cost
- Enterprise-corporate visual language: restrained motion, controlled brand
  colour, an engineering grid motif, no glassmorphism or gradient excess

### Bilingual system
- English (default) and Arabic, with genuine RTL — logical properties, mirrored
  icons, reversed lightbox arrow keys, reversed marquee, Arabic-specific type sizing
- `<html lang>` and `dir` correct in the **server-rendered HTML**
- Language switch preserves the current page (`/en/company` → `/ar/company`)
- Type-safe dictionaries: a missing Arabic string is a build error
- The approved tagline stays in English in both locales, correctly isolated
  inside RTL text

### Pages
- **Landing** — Hero, About, Solutions (9 services in 3 capability groups plus
  12 hardware categories), Industries (16 panels), Why us, Projects, Gallery,
  Partners, Clients, Contact
- **Company profile** — intro, vision, mission, values, capabilities generated
  from the same service data as the landing page, delivery approach,
  certifications area, CTA
- **404** — localised, inside the site chrome

### Functionality
- Theme switcher (light / dark / system) with persistence and no flash
- Language switcher preserving path
- Contact form with validation, accessible errors, loading and success states
- Working tel, WhatsApp, email and Google Maps links
- Gallery lightbox with full keyboard support
- Mobile menu with focus trap, Escape, scroll lock and focus return
- Scroll-spy navigation

### Engineering
- Static generation per locale; 4 prerendered HTML documents
- Build-time image pipeline: **22.8 MB → 1.58 MB (−93%)**
- Photo-first industry panels with a generated fallback and readiness tracking
- Favicons, app icons and OG card derived from the logo
- CSP and full security-header set defined in code
- `server-only` guards preventing secrets or Zod reaching the browser

---

## 2. Key decisions

Full reasoning in **[DECISIONS.md](./DECISIONS.md)**. The ones worth knowing:

| Decision | Why |
| --- | --- |
| **Accent colour differs per theme** | The raw brand magenta measures 4.04:1 on the dark background and 4.44:1 on the light subtle surface — both fail AA. Dark uses `magenta-400`, light uses `magenta-700`. The vivid brand magenta is preserved on the primary button and hero gradient. |
| **Industry panels are photo-first** | Photography is the intended primary imagery. Generated brand art is a temporary fallback while photographs are sourced, tracked by `industryPhotoReadiness()` and flagged in the development build. |
| **⚠ Framer Motion removed** | Its `opacity: 0` initial state meant the entire page body was invisible without JavaScript. Rewritten as progressive enhancement; also saved ~35 KB. |
| **⚠ Swiper removed** | CSS scroll-snap, a purpose-built lightbox and a CSS marquee deliver the same behaviour with better RTL support and ~40 KB less JavaScript. |
| **Zod is server-only** | It was 72.6 KB gzipped — a third of all JavaScript — shipped purely for client-side validation the server repeats anyway. Rules are shared via a dependency-free module so the two cannot drift. |
| **Empty sections are hidden in production** | An empty "Our Clients — coming soon" panel reads to a procurement team as evidence there are none. |
| **Logo on a light plate in dark theme** | The wordmark is `#282A28` — about 1.3:1 on the dark background. The brand rules forbid recolouring it, so the artwork is placed unchanged on a plate. |
| **Maps is a link, not an embed** | An embed costs ~800 KB and third-party cookies for something most visitors open in their own app. Enable with one env var if wanted. |
| **`noindex` until a domain is set** | Prevents a preview deployment being indexed and competing with the real site. |

The two ⚠ items deviate from the suggested stack. Both were made to satisfy
other explicit requirements in the brief — "avoid unnecessary third-party
libraries", "minimal client-side JavaScript", "performance is a first-class
requirement" — and in the Framer Motion case to fix a genuine defect. Both are
reversible; nothing is architecturally dependent on their absence.

---

## 3. Outstanding content — blocks launch

Nothing here is a defect. Each has working, documented architecture.

| # | Item | What is needed | Where it goes |
| --- | --- | --- | --- |
| 1 | **Industry photography** | 16 photographs, one per industry | `source-assets/industries/<id>.jpg` |
| 2 | **Image provenance** | Which supplied photos are your own work | Unblocks items 3 and 4 |
| 3 | **Projects** | Name, image, short description per project | `src/data/projects.ts` |
| 4 | **Gallery** | Photographs of your own delivery work | `src/data/gallery.ts` |
| 5 | **Technology partners** | Vendor list + permission to display each mark | `src/data/partners.ts` |
| 6 | **Clients** | Client list + **written permission** per logo | `src/data/clients.ts` |
| 7 | **Certifications** | Certificates, issuers, years | `src/data/certifications.ts` |
| 8 | **LinkedIn URL** | The official company page URL | `src/lib/site.ts` → `socials` |
| 9 | **Service wording** | Confirm "Computer Applications & Fiber Optic Solutions" | `src/data/services.ts` |
| 10 | **Logo vector** | An SVG or light-on-dark variant | Removes the dark-theme plate, sharpens favicons |

### 1 — Industry photography (largest item)

All 16 panels currently show brand-generated fallback art. Photography is the
required primary imagery.

Every entry in `src/data/industries.ts` carries a **`shotBrief`** — a
commissioning specification for that exact panel. Use them as a brief for a
photographer or as stock search criteria. Specification and the full procedure
are in PROJECT_DOCUMENTATION.md §10a; the short version:

```bash
cp yourphoto.jpg source-assets/industries/healthcare.jpg
npm run assets:photos          # converts + prints a paste-ready block
```

Two need particular care: **holy-sites** must be handled respectfully (prefer
architecture and crowd-management infrastructure over worshippers), and
**diplomatic** should avoid identifiable flags or national emblems.

Partial delivery is fine — supply what you have and those panels switch to
photography while the rest stay on fallback art.

### 2 — Image provenance

A **duplicate** and a **labelling conflict** were found: `Access control.jpg`
and `Fingerprint.jpg` are byte-for-byte identical, so at least one label is wrong.

Currently used as **illustrative service imagery** (safe — illustrating a
capability makes no claim about who installed the equipment):

`Security.jpg` · `Wifi.jpg` · `PC.jpg` · `Servers.jpg` ·
`Management devices.jpg` · `Surveillance Cameras.jpg` ·
`network communications and cabling.jpg` · `data and specialized systems.jpg` ·
`cwe audio and video solution in eevents.jpg`

**Not published anywhere** pending your confirmation:

`Access control.jpg` · `Cable solutions.jpg` · `Dallmayr CCTV system.jpg` ·
`Fingerprint.jpg` · `Network closet.jpg` · `Network infrastructure.jpg` ·
`Peripherals.jpg` · `Point of contact.jpg` · `Point of sale device.jpg` ·
`Printers.jpg` · `Printers1.jpg` · `Routers.jpg`

For each: **our own work** / **stock or vendor imagery**. Anything confirmed as
your own can go straight into Projects or Gallery — optimised WebP versions
already exist in `public/images/gallery/`.

### 9 — Service wording (held, not reinterpreted)

`"Computer Applications & Fiber Optic Solutions"` is reproduced **verbatim**
from your brief and marked pending in the code. Note it uses the US "Fiber"
spelling while the rest of the site uses British English; that inconsistency is
preserved deliberately so the string stays verifiably identical to what you
supplied. Confirm both the wording and the spelling and it will be applied in
one place.

### Also worth confirming

**Street address** — currently published as "Al Murabba, Riyadh, Saudi Arabia".
Add building, street or postal code for more precise structured data.

---

## 4. Deployment

### Prerequisites
- Node.js ≥ 20.9
- A Resend account with a verified sending domain
- The production domain

### Vercel (recommended)

1. Import the repository. Framework preset **Next.js** — build settings are detected.
2. Add these to the **Production** environment:

   ```
   NEXT_PUBLIC_SITE_URL   = https://your-domain.com
   RESEND_API_KEY         = re_xxxxxxxxxxxx
   CONTACT_FROM_EMAIL     = Smart Channels Website <website@your-domain.com>
   CONTACT_TO_EMAIL       = info@smartchannels.co
   ```

   Leave `NEXT_PUBLIC_SITE_URL` **unset** on Preview so previews stay `noindex`.

3. Deploy, then attach the custom domain.
4. **Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.** This is the
   switch that makes the site indexable — verified end to end, and easy to forget.

### Any Node host

```bash
npm ci && npm run build && npm run start
```

Put a reverse proxy in front for TLS. Security headers travel with the code.

---

## 5. Production checklist — must be complete before launch

The site is not launch-approved until every box is ticked.

### Content
- [ ] Industry photography supplied for all 16 panels (or an explicit decision
      to launch with fallback art on the remainder)
- [ ] Image provenance confirmed for the 12 unpublished photographs
- [ ] Projects added, or an explicit decision to launch without the section
- [ ] Gallery images added, or an explicit decision to launch without it
- [ ] Partner logos added with display permission confirmed
- [ ] Client logos added with **written** permission recorded (`usageApproved: true`)
- [ ] Certifications added, or confirmed as not applicable yet
- [ ] Official LinkedIn URL supplied and wired in
- [ ] "Computer Applications & Fiber Optic Solutions" wording confirmed
- [ ] Establishment year **2019** confirmed correct on the live site
- [ ] Address confirmed to the required level of detail

### Configuration
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production domain
- [ ] `RESEND_API_KEY` set and the sending domain verified in Resend
- [ ] `CONTACT_FROM_EMAIL` on a verified domain
- [ ] `CONTACT_TO_EMAIL` confirmed as the right inbox
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` set, or a deliberate decision not to track
- [ ] Cookie-consent position decided if GA4 is enabled (§7.7)

### Verification on the live domain
- [ ] `/robots.txt` shows `Allow: /`, not `Disallow: /`
- [ ] Page source shows `<meta name="robots" content="index, follow">`
- [ ] `/sitemap.xml` lists all four URLs on the real domain
- [ ] A **real** contact form submission arrives in the inbox
- [ ] Reply-to on the received email is the enquirer's address
- [ ] tel, WhatsApp and Maps links tested on an actual phone
- [ ] Google Maps link opens the correct location (§7.6)
- [ ] Both themes and both languages checked on a real device
- [ ] OG card renders correctly when a link is shared
- [ ] **Safari (macOS + iOS) and Firefox spot-checked** (§7.1)

### Post-launch
- [ ] Sitemap submitted to Google Search Console
- [ ] Analytics receiving data, if enabled

---

## 6. Content updates

Full procedures in **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**
§§10–15. The routine tasks:

### Industry photography
```bash
cp photo.jpg source-assets/industries/<industry-id>.jpg
npm run assets:photos
```
Paste the printed `photo: { … }` block into that entry in
`src/data/industries.ts`. See §10a for the id list and image specification.

### Gallery images — the most common task
```bash
cp ~/new-photos/*.jpg source-assets/
npm run assets:photos
```
Paste the generated entries into `src/data/gallery.ts`, write the alt text, set
`status: "published"`, commit. You do not need to understand the rest of the
application to do this.

### Projects
Add an entry to `src/data/projects.ts` — name, image, short description. Set
`status: "published"`.

### Partners
Confirm you may display the mark, put the logo in `public/images/partners/`,
add an entry to `src/data/partners.ts`.

### Clients
Obtain **written permission**, then add an entry with `usageApproved: true`.
Without that flag the logo will not render — a deliberate safeguard.

### Certifications
Add an entry to `src/data/certifications.ts`. Appears on `/company`.

---

## 7. Testing performed

### Automated

| Suite | Coverage | Result |
| --- | --- | --- |
| **axe-core** (WCAG 2.0/2.1/2.2 A+AA + best practice) | 6 combinations of page × theme × viewport, after scrolling the full page | **0 violations** |
| **Functional** | Theme toggle, persistence, reload survival; language switch with path preservation; `lang`/`dir`; tel/WhatsApp/email/Maps links; skip-link focus order; mobile menu open/close/Escape/scroll-lock/restore; form validation, error summary focus, `aria-invalid` | **23/23 passed** |
| **Responsive** | 7 widths (320–1440) × 2 locales × 2 themes | **28/28 — no horizontal panning** |
| **Header layout** | 7 widths × 2 locales — overflow and menu-trigger reachability | **14/14 passed** |
| **API security** | Method, content-type, body size, localised validation (both languages), honeypot, timing, rate limit, missing-key path | All behaved as specified |
| **Core Web Vitals** | CLS, LCP, FCP, real gzipped transfer sizes | CLS **0**; LCP 0.70–1.10 s |
| **No-JavaScript** | Full page render with JS disabled | Full content renders |

### Rendering engine

All automated testing ran on **Chromium** (Playwright), covering Chrome, Edge,
Opera and Android Chrome — the majority of the Saudi market.

---

## 8. Known limitations

Stated plainly rather than glossed over.

1. **Safari and Firefox were not executed.** All automated testing was Chromium.
   The code uses no engine-specific APIs, and the features relied on
   (`IntersectionObserver`, `ResizeObserver`, CSS scroll-snap, logical
   properties, `color-mix`, `backdrop-filter`) are supported in current Safari
   and Firefox — but *supported* is not *verified*. **Before launch, open both
   pages in Safari (macOS and iOS) and Firefox and check the header, the theme
   toggle, the hero canvas and the Arabic layout.** iOS Safari is the highest
   priority given its share of Saudi mobile traffic.

2. **Industry panels are on fallback art.** Photography is the required primary
   imagery and none has been supplied. The architecture is photo-first and the
   fallback is clearly marked as temporary, but the section does not yet meet
   the visual requirement.

3. **No committed automated test suite.** The audits above were run with
   temporarily installed tooling, then removed so it does not ship as a
   dependency. For a two-page brochure site this is defensible; if the site
   grows, commit a Playwright suite and wire it into CI.

4. **Rate limiting is per-instance.** In-memory state means a serverless
   deployment enforces the limit per instance, not globally. Adequate against a
   script hammering the endpoint, not a distributed attack. Upgrade path
   documented (DECISIONS.md §14).

5. **The logo source is low resolution.** 200×75 px. The brand mark cropped for
   favicons is 43×47 px upscaled to 512 px, so large icons are soft. A vector
   would fix this and let the dark-theme plate be removed.

6. **Contact delivery is untested against live Resend.** The code path, error
   handling and the missing-key path were all exercised, but no real email was
   sent because no API key was available.

7. **The Google Maps link was not machine-verifiable.** The build environment
   could not resolve `maps.app.goo.gl`, so the link is used exactly as supplied
   without confirming where it points.

8. **GA4 sets cookies.** If a consent banner is required for your audience,
   either gate the analytics component or switch to a cookieless provider —
   the latter is a one-component change and is the recommendation.

---

## 9. Measured results

| Metric | Result | Notes |
| --- | --- | --- |
| Accessibility violations | **0** | axe-core, WCAG 2.2 AA, 6 combinations |
| Cumulative Layout Shift | **0** | All pages, themes, locales |
| Largest Contentful Paint | 0.70–1.10 s | Local; production with CDN should improve |
| First Contentful Paint | 0.12–0.29 s | |
| JavaScript (gzipped) | ~159 KB | Down from 222 KB after moving Zod server-side |
| CSS (gzipped) | ~13 KB | |
| Total page weight | 242–295 KB | Will rise once industry photography is added |
| Source imagery | 22.8 MB → 1.58 MB | −93% |
| Horizontal overflow | none | 28 combinations |
| Console errors | none | |

> Page weight will increase when industry photography lands. The panels are
> lazy-loaded and served through `next/image` as responsive AVIF/WebP, so the
> effect on initial load should be small — but re-measure after adding them.

---

## 10. Handover

The repository is a complete, portable project: source, configuration, assets,
data, translations, build scripts, documentation and `.env.example`. No
production secrets are committed.

| Document | Purpose |
| --- | --- |
| [README.md](./README.md) | Start here |
| [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) | Architecture, deployment, content management, troubleshooting |
| [DECISIONS.md](./DECISIONS.md) | Why each significant choice was made |
| [TECH_STACK.md](./TECH_STACK.md) | Every dependency and why |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| `.env.example` | Annotated environment variables |

**Immediate next steps**

1. Source industry photography using the `shotBrief` fields (§3, item 1)
2. Answer the image-provenance question (§3, item 2) — it unblocks both
   Projects and Gallery
3. Confirm the service wording and supply the LinkedIn URL
4. Set up Resend and verify the sending domain
5. Deploy, attach the domain, then set `NEXT_PUBLIC_SITE_URL` and redeploy
6. Work through the production checklist in §5
7. Spot-check Safari and Firefox

The site is not launch-approved until §5 is complete.
