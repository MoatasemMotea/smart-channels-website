# Smart Channels — Corporate Website

Bilingual (English / Arabic) corporate website for **Smart Channels** (القنوات الذكية),
a Saudi technology and systems integration company.

> **we take you to the future**

---

## Quick start

```bash
npm install          # install dependencies
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

The site redirects `/` to `/en`. Arabic lives at `/ar`.

---

## What this is

A two-page corporate site, statically rendered per language:

| Route | Purpose |
| --- | --- |
| `/en`, `/ar` | Landing page — hero, about, solutions, industries, why us, work, contact |
| `/en/company`, `/ar/company` | Company profile — vision, mission, values, capabilities, approach |
| `/api/contact` | Contact form endpoint (POST only) |

Everything else — services, industries, projects, gallery, partners, clients,
certifications — is **data-driven**. Adding content means editing one file in
`src/data/`; no component, layout or styling file has to be touched.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run check` | typecheck + lint + build — run this before pushing |
| `npm run assets` | Regenerate all image assets |
| `npm run assets:photos` | Optimise photos in `source-assets/` → `public/images/` |
| `npm run assets:industries` | Regenerate the 16 industry background panels |

---

## Adding content

Full procedures are in **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**.
The short version:

**An industry photograph** (the largest open item)
1. Save it as `source-assets/industries/<industry-id>.jpg`
2. `npm run assets:photos` — converts it and prints a ready-made `photo:` block
3. Paste that into the matching entry in `src/data/industries.ts`

**A gallery image**
1. Drop the original into `source-assets/`
2. `npm run assets:photos` — converts it and prints a ready-made data entry
3. Paste that entry into `src/data/gallery.ts`, write the alt text, set `status: "published"`

**A project** — add an entry to `src/data/projects.ts` (name, image, short description)

**A partner or client** — add an entry to `src/data/partners.ts` / `src/data/clients.ts`.
Clients additionally require `usageApproved: true`, which records that permission
to display the logo has been obtained. Without it the logo will not render.

Sections whose collection is empty **do not appear in production**. They render
as clearly-labelled placeholders in development so the page architecture stays
visible while you work.

---

## Status

**Not yet approved for launch.** The build is complete and deployable, but
outstanding content and a production checklist stand between it and sign-off —
see [FINAL_PROJECT_REPORT.md](./FINAL_PROJECT_REPORT.md) §3 and §5.

The largest open item is **industry photography**: all 16 panels currently show
brand-generated fallback art. Photography is the intended primary imagery, and
each entry in `src/data/industries.ts` carries a `shotBrief` describing the
photograph it needs.

Set `NEXT_PUBLIC_SITE_URL` to the real domain when launching. Until you do, the
site serves `noindex, nofollow` and a `robots.txt` that disallows everything — a
deliberate guard against a preview deployment being indexed and competing with
the real site.

---

## Documentation

| File | Contents |
| --- | --- |
| [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) | Architecture, deployment, content management, troubleshooting |
| [DECISIONS.md](./DECISIONS.md) | Why the significant technical and design choices were made |
| [TECH_STACK.md](./TECH_STACK.md) | Every dependency and why it is there |
| [FINAL_PROJECT_REPORT.md](./FINAL_PROJECT_REPORT.md) | What is done, what is pending, launch steps, known limitations |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Zod (server-side) · Resend · Lucide icons · Sharp (build-time images)

No webfonts (Arial is mandated by the brand and is a system font), no CSS-in-JS,
no animation library, no carousel library. See
[DECISIONS.md](./DECISIONS.md) for why.

---

## Verified

- **Accessibility** — axe-core, WCAG 2.2 AA: 0 violations across both themes,
  both languages, mobile and desktop
- **Performance** — CLS 0; ~159 KB JS gzipped; total page weight 242–295 KB
- **Responsive** — no horizontal overflow at any of 28 breakpoint × locale × theme combinations
- **No-JS** — full content renders with JavaScript disabled

---

© Smart Channels. Riyadh, Saudi Arabia.
