# Decision Log

Significant technical and design decisions, why they were made, and what was
rejected. Written so that a developer joining in a year does not have to
re-derive the reasoning — or accidentally undo it.

Decisions that deviate from the original brief are marked **⚠ deviation** and
explain the trade-off explicitly.

---

## 1. Brand colours sampled from the logo, not estimated

**Decision.** The palette derives from pixel values measured in the supplied
logo file: magenta `#D9088C` (hsl 322 93% 44%) and purple `#7B388B`
(hsl 288 43% 38%). Both tonal ramps are generated at those exact hue angles.

**Why.** The logo is the authoritative brand reference. Eyeballing "roughly
pink" would have produced a site that is subtly off-brand in a way nobody can
name but everyone notices next to real collateral.

**Note.** The supplied `Logo.jpg` is actually a **transparent PNG** with a
`.jpg` extension. A first sampling pass read RGB values from transparent pixels
and produced nonsense (42% pure black). The final values were taken only from
pixels with alpha > 220.

---

## 2. Accent colour differs per theme — enforced by a token

**Decision.** `--color-accent` is `magenta-400` in dark and `magenta-700` in
light. Neither is the raw brand `magenta-600`.

**Why.** Measured contrast:

| Colour | On dark bg (`#0E0C11`) | On white | On light `bg-subtle` |
| --- | --- | --- | --- |
| magenta-600 (brand) | **4.04:1 ✗** | 4.81:1 ✓ | **4.44:1 ✗** |
| magenta-400 | 5.98:1 ✓ | — | — |
| magenta-700 | — | 6.68:1 ✓ | 6.17:1 ✓ |

The raw brand magenta fails AA for text on the dark background *and* on the
light theme's subtle surface. Both failures were caught by an automated
axe-core pass, not by eye.

**Why a token rather than per-component classes.** If each component picked its
own magenta, the failing value would creep back in the first time somebody
added a card. Routing it through one semantic token makes the accessible choice
the only reachable one.

**What is preserved.** The vivid brand magenta still carries the identity where
it matters most — the primary button (white on `magenta-600`, 4.81:1) and the
hero's gradient headline.

**Alternative rejected.** Enlarging accent text to qualify for the 3:1
large-text threshold. That would have distorted the typographic hierarchy to
work around a colour problem.

---

## 3. ⚠ Deviation — Framer Motion removed

**Brief.** Listed Framer Motion in the preferred stack.

**Decision.** Removed. Scroll reveals are CSS transitions driven by a single
IntersectionObserver.

**Why.** Two reasons, one of them serious.

The serious one: the Framer Motion implementation used
`initial={{ opacity: 0 }}` + `whileInView`. That means the *served HTML* has
every below-the-fold element at zero opacity, and it only becomes visible once
JavaScript loads and an observer fires. A JS-disabled render of that build
showed a header and an otherwise **completely blank page**. For a corporate
site being evaluated by government and enterprise buyers, a hard dependency on
JavaScript for any content to appear at all is not acceptable.

The rewrite inverts the default: content is visible, and the hidden-then-reveal
behaviour is scoped behind a `.js` class added by the pre-paint bootstrap
script. With JS the animation is identical and flash-free; without it the page
is simply there.

The second reason: it removed ~35 KB gzipped, and `<Reveal>` became a *server*
component shipping no per-instance JavaScript.

**Cost.** Complex orchestration (spring physics, layout animations, gesture
handling) would need the library back. Nothing on this site needs any of that.

---

## 4. ⚠ Deviation — Swiper removed

**Brief.** Listed Swiper, and suggested a swipeable carousel for Industries.

**Decision.** Removed. Three native implementations replace it:

- **Industries** — CSS scroll-snap (`snap-x snap-mandatory` + `overflow-x-auto`)
  that becomes a plain grid from `md` up
- **Gallery lightbox** — purpose-built, ~120 lines
- **Partner/client rails** — CSS `@keyframes` marquee

**Why.** The swipe gesture, momentum scrolling and snapping all come free from
the platform, with working find-in-page and correct RTL behaviour that a JS
carousel has to reimplement. Swiper would have added ~40 KB gzipped to deliver
what the browser already does, and the brief also asked to avoid unnecessary
third-party libraries and minimise client JavaScript. Those two instructions
conflict here; this resolves in favour of the performance one.

**Accessibility note.** The scroll container carries `tabIndex={0}` so keyboard
users can pan it — the cards are not links, so without it the region would be
unreachable (flagged by axe as `scrollable-region-focusable`).

---

## 5. Zod is server-only; the browser gets a hand-written validator

**Decision.** `src/lib/contact-schema.ts` is marked `server-only`. The browser
uses `validateContact()` from `src/lib/contact-rules.ts`, which has no
dependencies.

**Why.** Sharing one Zod schema across both sides is the obvious approach and
was the first implementation. It cost **72.6 KB gzipped** — Zod was the single
largest chunk on the site, about a third of all JavaScript, shipped to every
visitor purely so the contact form could show an error before submitting. The
server re-validates everything regardless, so none of that weight bought any
safety. Removing it cut JS from 222 KB to 159 KB gzipped (−28%).

**How drift is prevented.** Every limit, pattern and allowed value lives once in
`contact-rules.ts` and is imported by both the client validator and the Zod
schema. Only the mechanism differs, never the rule. `server-only` makes
re-importing Zod into a client component a *build error* rather than a silent
72 KB regression.

---

## 6. Industry panels are photo-first, with generated art as a fallback

**Decision.** Each industry renders a **photograph** when one is available, and
falls back to a brand-generated SVG panel only while photography is missing.
The client has confirmed photography is the required primary imagery.

**Why the fallback exists at all.** Sixteen industries each need a background
and none were supplied. The alternatives while waiting were generic stock
(cheap-looking, misrepresents the work, licensing risk) or empty panels (looks
broken). The generated art is a credible stopgap — unmistakably Smart Channels,
~6 KB each — but it is explicitly **not** the intended final design.

**How the gap stays visible.** `industryPhotoReadiness()` reports how many
industries still lack photography; the development build renders a labelled
notice listing them by id; and the production checklist in
FINAL_PROJECT_REPORT.md treats it as an open item. Photography is a blocker for
sign-off, not a nice-to-have.

**Supplying a photo** is a two-step job: drop it at
`source-assets/industries/<id>.jpg`, run `npm run assets:photos`, paste the
printed block. Every entry also carries a `shotBrief` — a commissioning
specification for exactly that panel — stored beside the data so the two cannot
drift apart.

**Determinism.** Compositions derive from a hash of the industry id via a seeded
PRNG, so regenerating never produces a spurious diff.

**A guard is enforced in the script.** Each industry must use a *different*
motif — the generator throws if one is reused. An earlier version shared three
motifs across six industries and, because the seeded variation changes colour
and density but not structure, the grid visibly contained duplicate panels.

---

## 7. Empty sections are omitted in production, not shown as "coming soon"

**Decision.** Projects, Gallery, Partners, Clients and Certifications render
only when they have content. While empty they are omitted entirely in
production, and shown as labelled placeholders in development.

**Why.** An enterprise or government buyer evaluating a supplier reads an empty
"Our Clients — coming soon" panel as evidence there are none. A section that
isn't there yet costs nothing; a visibly empty one costs credibility.

**Why placeholders in development.** So the team can see the full page
architecture while working, without that state ever reaching a visitor.
Overridable per-environment with `NEXT_PUBLIC_SHOW_PENDING_SECTIONS`.

---

## 8. The logo sits on a light plate in dark theme

**Decision.** In dark theme the supplied lockup is placed on a white plate. In
light theme it sits directly on the background.

**Why.** The logo's "Smart Channels" wordmark is near-black (`#282A28`). Against
the dark background (`#0E0C11`) that is roughly **1.3:1** — effectively
invisible. The brand rules forbid redrawing, recolouring or restructuring the
logo, so recolouring the wordmark to white was not available.

A light plate is the standard, brand-safe way to carry a dark-wordmark logo onto
a dark surface: the artwork itself is untouched — same file, same proportions,
same colours, in both themes.

**Better fix available.** A light-on-dark logo variant, or the original vector,
would let the plate be dropped entirely. Requested from the client and recorded
in FINAL_PROJECT_REPORT.md.

---

## 9. Header is sticky-translucent, not transparent-over-hero

**Decision.** Transparent over the hero, gaining a blurred bordered surface as
soon as the page scrolls.

**Why.** A permanently transparent header's legibility depends on whatever
pixels happen to be behind it. With an animated canvas underneath, its contrast
would vary frame to frame — not something that can be guaranteed to meet 4.5:1.
Over the hero the backdrop is known and controlled; everywhere else the surface
guarantees contrast. It also behaves identically on both pages, avoiding a
separate variant for `/company`.

---

## 10. Visibility is toggled with wrapper elements, not `hidden` on the component

**Decision.** Where a Button or similar needs to be hidden responsively, it is
wrapped in a `<span className="hidden xl:block">` rather than given a `hidden`
class directly.

**Why.** This caused a real, shipped-quality bug. `hidden` and the button's own
base `inline-flex` are both display utilities with equal specificity, so the
winner is decided by their order in the *generated stylesheet*, not by the order
in the class attribute. In the compiled CSS, `.inline-flex` (offset 12337) comes
after `.hidden` (offset 12293) — so `inline-flex` won and the class did nothing.

The visible symptom: a 107px "Talk to our experts" button rendering at 390px,
overflowing the header by 40px and pushing the mobile menu trigger completely
**off-screen** (measured at x=405 in a 390px viewport). The menu was unreachable
by tap on a phone.

A wrapper has no competing display utility, so it cannot be defeated this way.

---

## 11. Google Maps is a link, not an embed, by default

**Decision.** The contact section shows a branded location card linking out to
the client's exact Google Maps URL. An iframe renders only if
`NEXT_PUBLIC_MAP_EMBED_URL` is set.

**Why.** A Maps embed pulls roughly 800 KB across dozens of requests and sets
third-party cookies — a heavy Core Web Vitals and privacy cost for something
most visitors will open in their own maps app anyway.

**Also.** The supplied short link could not be resolved to coordinates from the
build environment, and inventing coordinates would put a real business pin in
the wrong place. The link the client supplied is used verbatim.

---

## 12. Arial only — no webfont

**Decision.** `Arial, "Helvetica Neue", Helvetica, "Liberation Sans", …` with a
separate Arabic-first stack for `html[lang="ar"]`.

**Why.** Arial is mandated by the brand. It is also a system font, which means
zero webfont payload, no FOUT/FOIT, and no font-loading contribution to LCP —
a genuine performance win rather than a constraint worked around.

**Arabic adjustment.** Arabic sets at `1.03em` with `line-height: 1.75`. Arial's
Arabic glyphs have a smaller apparent x-height than its Latin ones, so matching
the Latin size literally renders Arabic visually smaller.

---

## 13. Locale prefix on every URL, `proxy.ts` for redirects

**Decision.** Every page is under an explicit locale prefix (`/en/...`,
`/ar/...`). `/` redirects to a prefixed URL. The root layout lives at
`src/app/[locale]/layout.tsx`.

**Why.** `<html lang>` and `dir` must be correct in the server-rendered HTML —
a screen reader needs the language before it speaks, and RTL needs `dir` before
first paint or the page visibly reflows. That requires the locale to be a route
parameter of the layout that renders `<html>`. One canonical URL per language
per page is also what hreflang requires.

**Language detection is limited on purpose.** Only the bare entry point `/`
negotiates from `Accept-Language`. Redirecting a deep link based on a header
would break shared URLs.

**`proxy.ts`, not `middleware.ts`** — Next.js 16 deprecated the middleware file
convention.

---

## 14. In-memory rate limiting, with the limitation stated

**Decision.** A sliding-window limiter holding state in process memory.
5 submissions per IP per 10 minutes.

**Why.** On Vercel this is per-instance, not global — an attacker spreading
requests across cold starts can exceed the nominal rate. That is an accepted
trade-off, not an oversight: it stops the realistic threat (a script hammering
one endpoint) with zero infrastructure, and it is not the only defence — the
honeypot, timing check and validation all sit in front of the mail send. For a
corporate contact form receiving a handful of messages a week, a Redis-backed
limiter would be operational overhead out of proportion to the risk.

**Upgrade path.** `@upstash/ratelimit` has the same call shape; only
`src/lib/rate-limit.ts` changes.

---

## 15. A missing mail key fails loudly, never silently

**Decision.** If `RESEND_API_KEY` is absent, the endpoint returns 503 with an
honest error and logs a loud server-side message.

**Why.** The alternative — accepting the submission and showing a success
screen — is the worst possible outcome for a contact form. The visitor believes
they have made contact and waits for a reply that will never come, and the
business never learns it lost the enquiry.

---

## 16. Anti-spam rejections are indistinguishable from success

**Decision.** Honeypot and timing failures return `200 {ok:true}` without
sending anything.

**Why.** A bot that learns which check caught it adapts. Returning the same
response as a genuine submission gives an automated filler no signal to tune
against.

---

## 17. Photographs illustrate services; they never caption a project

**Decision.** The supplied photographs appear only in the Solutions section as
illustrative imagery. Projects and Gallery ship empty.

**Why.** The provenance of the supplied photographs is mixed — some are Smart
Channels' own work, some are stock or vendor imagery — and it has not yet been
confirmed which is which. Illustrating "Server Management" with a photo of a
server rack asserts nothing about who installed it. Putting the same photo in a
Projects grid under a project name is a factual claim about work delivered.

---

## 18. TypeScript 5.9, not 7.x

**Decision.** Pinned to TypeScript 5.9.3 although 7.0.2 was available.

**Why.** TypeScript 7 is the native compiler port and very new. The Next.js
build pipeline and `eslint-config-next` are far better exercised against 5.x.
For a project being handed over, a boring toolchain is worth more than a fast
one. Revisit once 7.x is the ecosystem default.

---

## 19. `noindex` until a domain is configured

**Decision.** Without `NEXT_PUBLIC_SITE_URL`, every page serves
`noindex, nofollow` and `robots.txt` disallows everything.

**Why.** A preview deployment indexed on a temporary URL splits authority with
the real site and can outrank it at launch — damaging and awkward to unwind.
Defaulting to closed means the site cannot be accidentally indexed before
someone deliberately configures the domain.

---

## 20. `cn()` instead of `clsx` + `tailwind-merge`

**Decision.** A ~20-line local helper.

**Why.** This codebase composes classes through variant maps rather than
overriding utilities from outside, so there are no conflicting utilities for
`tailwind-merge` to resolve. Two dependencies and ~8 KB for behaviour the
project does not rely on would not pay for themselves.

**Caveat.** Because there is no merge behaviour, passing a conflicting utility
via `className` may not win — see decision 10. Use a wrapper element instead.
