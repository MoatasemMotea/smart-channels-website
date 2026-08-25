# Changelog

Notable changes to the Smart Channels corporate website.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-08-16

First complete build, replacing the previous single-page static site.

**Not yet approved for launch** — see FINAL_PROJECT_REPORT.md for the
outstanding content items and the production checklist.

### Added

**Foundation**
- Next.js 16 App Router project, TypeScript strict mode with
  `noUncheckedIndexedAccess`, `noUnusedLocals` and `noUnusedParameters`
- Tailwind CSS v4 design system with a two-layer token architecture
  (fixed brand ramps → semantic tokens → Tailwind utilities)
- Brand palette sampled from the supplied logo: magenta `#D9088C`,
  purple `#7B388B`, plus a violet-tinted neutral ramp

**Bilingual system**
- English (default) and Arabic with real RTL, not a mechanical mirror
- Locale-prefixed routing (`/en`, `/ar`) with `<html lang dir>` set
  server-side; `src/proxy.ts` handles redirects
- Type-safe dictionaries — a missing Arabic key is a compile error
- Logical CSS properties throughout, so one stylesheet serves both directions
- Arabic typography adjusted for Arial's smaller Arabic x-height

**Theming**
- Dark charcoal (default) and a related light theme, sharing one token layer
- Sun/moon toggle with light / dark / system, persisted to `localStorage`
- Pre-paint bootstrap script — no flash of the wrong theme

**Pages and sections**
- Landing page: Hero, About, Solutions, Industries, Why us, Projects,
  Gallery, Partners, Clients, Contact
- Company profile page: intro, vision, mission, values, capabilities,
  delivery approach, certifications area, CTA
- Localised 404

**Content architecture**
- Data-driven modules for services, industries, projects, gallery, partners,
  clients and certifications
- Collections awaiting content are typed, documented and rendered as labelled
  placeholders in development — and omitted entirely in production
- `usageApproved` gate on client logos, so a logo cannot reach production
  before display permission is recorded

**Visuals**
- Hero network canvas: viewport-scaled node cap, 30fps throttle, DPR capped
  at 2, paused off-screen and in background tabs, static under reduced-motion
- Industry panels are photo-first: a photograph is used whenever supplied, with
  a generated brand-art panel (one distinct motif each, ~6 KB) as a temporary
  fallback. `industryPhotoReadiness()` and a development-only notice track the gap
- Build-time image pipeline: 22.8 MB of source photography → 1.58 MB WebP
- Favicons, app icons and the Open Graph card derived from the logo

**Contact**
- Six-field form with accessible labels, per-field errors, a focus-receiving
  error summary, loading and success states
- Server-side validation, honeypot, timing check, per-IP rate limiting,
  body-size cap, content-type enforcement
- Resend delivery behind a swappable adapter; a missing API key fails loudly
  rather than silently discarding an enquiry

**SEO and analytics**
- Fully configurable metadata — no hard-coded domain anywhere
- Canonical URLs, hreflang (`en`, `ar-SA`, `x-default`), sitemap with
  alternates, robots.txt
- JSON-LD: Organization, ProfessionalService, WebSite, BreadcrumbList
- `noindex` by default until `NEXT_PUBLIC_SITE_URL` is configured
- Privacy-conscious GA4 scaffolding that renders nothing without a real ID

**Security**
- CSP and a full security-header set defined in `next.config.ts`
- `server-only` guards on the mailer and the Zod schema

### Changed from the previous site

- Set the establishment year to **2019**, as confirmed by the client (the
  previous site stated 2003)
- Rewrote service names that read as machine translation, without altering
  business meaning. One exception: "Computer Applications & Fiber Optic
  Solutions" is reproduced verbatim from the brief and is **awaiting the
  client's confirmation of the official wording** — it must not be
  reinterpreted until then
- Removed the dead social links (Instagram, LinkedIn, TikTok, Snapchat all
  pointed at `#`); social icons now render only when a real URL is configured
- Removed unsupported claims ("leading company")
- Replaced the CDN-loaded Spline 3D robot, AOS and Boxicons with a
  self-contained, performance-budgeted implementation
- Address updated to Al Murabba, Riyadh (previously Malaz)

### Fixed during development

- **All below-the-fold content was invisible without JavaScript.** The initial
  scroll-reveal used `opacity: 0` as its served state. Inverted to progressive
  enhancement: content is visible by default, animation is scoped behind a
  `js` class. (DECISIONS.md §3)
- **The mobile menu trigger was pushed off-screen at 390px.** A `hidden` class
  on the header CTA lost to the button's own `inline-flex` — equal specificity,
  decided by stylesheet order. Visibility now uses a wrapper element.
  (DECISIONS.md §10)
- **Light-theme contrast failures** on muted text and accent text, found by
  axe-core. Muted tones moved one step darker; the light accent moved to
  `magenta-700`. (DECISIONS.md §2)
- **The horizontal industries scroller was unreachable by keyboard.**
- **Three industry panels were visual duplicates** — motifs were shared across
  six industries. Each industry now has a unique motif, enforced by the generator.
- **The favicon crop included part of the wordmark**, because the tagline-exclusion
  cutoff was applied after the bounding box was computed instead of during it.
- **API validation leaked untranslated Zod internals** when a field was absent
  rather than empty.

### Performance

- Client JavaScript reduced from 222 KB to **159 KB gzipped** by moving Zod
  server-side, and by removing Framer Motion and Swiper (neither was needed)
- CLS **0** across all pages, themes and locales
- Total page weight 242–295 KB

### Verified

- axe-core WCAG 2.2 AA: **0 violations** over 6 page × theme × viewport combinations
- 23 functional assertions covering theme, language, links, menu and form
- 28 responsive combinations with no horizontal overflow
- Contact API security behaviour, including localised errors in both languages

---

## Pending — awaiting client content

Not defects; these are documented gaps with the architecture already in place:

- **Industry photography** — all 16 panels are still on fallback art
- Project entries
- Gallery photographs (pending confirmation of image provenance)
- Official wording for "Computer Applications & Fiber Optic Solutions"
- Technology partner logos
- Client logos and written permission to display them
- Certifications
- Official LinkedIn URL
- A vector or light-on-dark logo variant

See [FINAL_PROJECT_REPORT.md](./FINAL_PROJECT_REPORT.md).
