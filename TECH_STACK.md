# Technology Inventory

Every dependency, why it is here, and what it would cost to remove.
Dependencies that are not genuinely needed have been removed — see the
bottom section.

---

## Runtime dependencies

| Package | Version | Why it is here |
| --- | --- | --- |
| `next` | 16.3.1 | Framework. App Router, per-locale static generation, image optimisation, route handlers, metadata/sitemap/robots APIs. |
| `react` / `react-dom` | 19.2.8 | Required by Next.js 16. Server Components are what keep the client bundle small — most of this site ships no JavaScript at all. |
| `zod` | 4.4.3 | **Server-side only.** Validates and coerces the contact form payload in the API route. Marked `server-only`, so importing it into a client component is a build error rather than a silent 72 KB regression. |
| `resend` | 6.20.0 | Delivers contact enquiries. Used behind a narrow adapter (`src/lib/mailer.ts`) so switching to SMTP, SES or a CRM webhook touches one file. |
| `lucide-react` | 1.31.0 | UI icons. Tree-shakeable, and imported through an explicit registry (`src/components/ui/Icon.tsx`) so only the ~20 glyphs actually used are bundled. Note: v1 removed all brand icons for trademark reasons, so LinkedIn / X / Instagram marks are drawn inline in `SocialIcons.tsx`. |
| `server-only` | 0.0.1 | Build-time guard. Makes server-only modules (mailer, Zod schema) fail loudly if ever imported into client code. Zero runtime cost. |

---

## Build-time / development dependencies

| Package | Version | Why it is here |
| --- | --- | --- |
| `typescript` | 5.9.3 | Strict mode, plus `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. Pinned to 5.x rather than 7.x — see DECISIONS.md §18. |
| `tailwindcss` | 4.3.3 | Styling. CSS-first configuration via `@theme`, and native logical properties (`ps-`, `me-`, `start-`, `end-`) which is what makes one stylesheet serve both LTR and RTL. |
| `@tailwindcss/postcss` | 4.3.3 | PostCSS plugin for Tailwind v4. |
| `sharp` | 0.35.3 | Build-time image pipeline only — never runs in production. Converts source photography to WebP, derives favicons and the brand mark from the logo, and renders the Open Graph card. Reduced the supplied imagery from 22.8 MB to 1.58 MB. |
| `eslint` + `eslint-config-next` | 9.x / 16.3.1 | Linting, including `eslint-plugin-jsx-a11y` accessibility rules via the Next preset. |
| `@eslint/eslintrc` | 3.3.6 | Flat-config compatibility shim required by `eslint-config-next`. |
| `@types/*` | — | Type definitions for Node and React. |

---

## Deliberately NOT used

These were in the suggested stack or would be conventional choices. Each was
evaluated and rejected.

| Not used | Instead | Reasoning |
| --- | --- | --- |
| **Framer Motion** | CSS transitions + one shared IntersectionObserver | Saved ~35 KB gzipped, and more importantly fixed a defect where all below-the-fold content was invisible without JavaScript. DECISIONS.md §3. |
| **Swiper** | CSS scroll-snap, a purpose-built lightbox, a CSS marquee | Saved ~40 KB gzipped to reimplement what the platform already does, with better RTL behaviour and working find-in-page. DECISIONS.md §4. |
| **next-intl / i18next** | Typed dictionary objects + `[locale]` routing | Two languages and a few hundred strings. A typed `Record<Locale, T>` makes a missing translation a *compile error*, which is stronger than most i18n libraries offer, at zero bundle cost. |
| **next-themes** | ~90-line `ThemeProvider` | Needed to coordinate with the pre-paint bootstrap script and set `data-theme` alongside `dir`. Writing it directly was simpler than configuring around it. |
| **clsx + tailwind-merge** | Local `cn()` helper | No conflicting utilities to resolve in this codebase. DECISIONS.md §20. |
| **A webfont** | Arial (system font) | Mandated by the brand, and it eliminates webfont payload and FOUT/FOIT entirely. |
| **@upstash/ratelimit / Redis** | In-memory sliding window | Disproportionate infrastructure for a form receiving a handful of messages a week. Upgrade path documented. DECISIONS.md §14. |
| **A CMS** | Typed data modules in `src/data/` | Two pages. A CMS would add hosting, auth, a build webhook and a content model for what is currently ~7 files a developer edits directly. Revisit if non-technical staff need to publish without a deploy. |
| **A test runner** | Automated audits during QA | See below — this is a known gap, not an oversight. |

---

## Testing and QA tooling

QA was performed with **Playwright** and **axe-core**, installed temporarily and
removed before delivery so they do not ship in `package.json`.

What was run:

- **axe-core** (WCAG 2.0/2.1/2.2 A + AA + best-practice) across 6 combinations of
  page × theme × viewport — **0 violations**
- **23 functional assertions** — theme toggle and persistence, language switching
  with path preservation, `dir`/`lang` attributes, all contact links, skip-link
  focus order, mobile menu open/close/Escape/scroll-lock, form validation and
  focus management
- **28 responsive combinations** (7 widths × 2 locales × 2 themes) — no horizontal panning
- **14 header layout checks** — no overflow, menu trigger reachable at every width
- **API security tests** — method/content-type rejection, body-size cap,
  localised validation in both languages, honeypot, timing check, rate limiting
- **Core Web Vitals** — CLS, LCP, FCP, and real transfer sizes

**Known gap.** There is no committed automated test suite. For a two-page
brochure site with no application logic this is a defensible trade-off, but if
the site grows — particularly the contact form or the data layer — a Playwright
suite covering the checks above should be added and wired into CI. Flagged in
FINAL_PROJECT_REPORT.md.

---

## Measured results

| Metric | Value |
| --- | --- |
| JavaScript (gzipped, first load) | ~159 KB |
| CSS (gzipped) | ~13 KB |
| Total page weight | 242–295 KB |
| Cumulative Layout Shift | **0** |
| Largest Contentful Paint (local) | 0.7–1.1 s |
| Accessibility violations | **0** |
| Source imagery | 22.8 MB → 1.58 MB (−93%) |
| All 16 industry panels | 100 KB total |

---

## Deployment assumptions

- **Node.js ≥ 20.9** (enforced via `engines`)
- **Vercel** is the assumed target, but nothing is coupled to it. The build
  output is a standard Next.js server; a Node host or container works with no
  code changes. The only provider-specific touch is a fallback to
  `VERCEL_PROJECT_PRODUCTION_URL` when `NEXT_PUBLIC_SITE_URL` is unset.
- **The contact form requires a Node runtime.** A fully static export
  (`output: "export"`) would drop `/api/contact`; that path is documented in
  PROJECT_DOCUMENTATION.md.
- Security headers, including a strict CSP, are defined in `next.config.ts` so
  they travel with the codebase rather than living in provider configuration.
