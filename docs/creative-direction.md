# Smart Channels — Creative Direction

**Status:** Specification. Not implemented.
**Phase:** Creative Direction & Motion System definition.
**Companion documents:** [`motion-system.md`](./motion-system.md) · [`design-decisions.md`](./design-decisions.md)

This document defines the visual system precisely enough that a developer can build the site
section by section without inventing rules. Where a rule is not stated here, it has not been
decided — raise it rather than improvising.

---

## 1. Brand expression

### 1.1 The one-sentence direction

Smart Channels builds the systems a country runs on. The site should look like the work: engineered
before it is styled, dark and quiet so the evidence carries the weight, and confident enough not to
decorate.

### 1.2 What each adjective means in practice

Adjectives are only useful if they can be checked against a screen. Each row below is testable.

| Quality | It means | You can verify it by |
|---|---|---|
| **Intelligent** | Structure encodes real information — an index is a real count, a layer number is a real layer | No decorative numbering anywhere. Every `01 / 03` is a true fraction. |
| **Technical** | A mono specification layer runs beside the prose, carrying keys, indices, units, provenance | Every figure on the page can be traced to a source shown near it |
| **Premium** | Space, restraint, and one accent — not gloss, gradients or shadow stacks | Count filled brand-colour elements per viewport: at most one |
| **Future-facing** | The Connected Earth, orbits and data flow — motion that reads as system behaviour | Nothing labelled "innovation" or "next-generation" as an adjective |
| **Credible** | Named venues, real years, explicit scope, provenance on every statistic | No claim on the page that lacks a source in the data layer |
| **Infrastructure-led** | Cabling, racks, fibre, control rooms — the physical layer is shown, not abstracted away | Photography shows real installed work, not glowing abstractions |
| **Enterprise-grade** | Procurement-reader-first: scope, standards, documentation, support after handover | A reader can answer "what exactly do they deliver?" from one screen |
| **Cinematic** | Wide dark fields, a single lit subject, deep atmospheric falloff | Any hero frame would survive as a still |
| **Precise** | One spacing scale, one type scale, no arbitrary values | Any spacing value in the CSS traces to a scale step |
| **Saudi-rooted, globally presented** | Riyadh anchored in the hero; Arabic first-class, not an afterthought | The Arabic build is composed, not mirrored automatically |

### 1.3 What this must never look like

Each of these is a specific failure mode with a specific counter-rule.

| Never | Counter-rule |
|---|---|
| Generic SaaS | No three-column feature grid with a coloured icon circle per card. Icons live at group level only. |
| Excessive gradients | No gradient fill larger than a 72px rule, and no gradient on any letterform. Gradients exist as *light* — glow, halo, edge — never as *surface*. |
| Rounded-card interfaces | Radius ≤ 12px on content surfaces. Sections are separated by ground change and rule, not by floating a card on everything. |
| Visual clutter | Maximum three levels of visual hierarchy visible in any viewport. |
| Neon overuse | Brand colour is capped at ~6–8% of pixels (§3.4). Measured, not estimated. |
| Template layout | Section composition varies by content type — an evidence section must not look like a capability section. |
| Stock tech visuals | No server-room stock, no glowing circuit boards, no handshake photography. Own photography or commissioned only. |
| Effects without purpose | Every motion must be justifiable in one sentence in `motion-system.md`. If it cannot, it is deleted. |

---

## 2. Visual language

The site is one system with six registers. A section picks the register its content needs; it does
not invent a seventh.

### 2.1 Primary vocabulary

The elements that appear throughout and hold the system together.

- **The dark field.** A near-black navy-violet ground. It is the constant; everything else is placed on it.
- **The lit subject.** One area of the frame carries brand light. Nothing else competes with it.
- **The rule.** A 2px magenta-to-purple rule, 22–72px, leading an eyebrow or closing a statement. The single most repeated brand gesture on the site.
- **The mono key.** Uppercase, letterspaced, small, dim. Carries indices, units, provenance, field labels.
- **The hairline.** 1px borders at very low contrast. Structure without weight.
- **The node and the link.** Points connected by lines — the literal subject of the business, used as the site's ornament.

### 2.2 Secondary vocabulary

Used deliberately, not everywhere.

- **The particle field.** Sparse points at very low alpha. Depth, never texture.
- **The orbit.** Flattened ellipses. Reserved for the hero and the technology-ecosystem diagram.
- **The scrim.** A gradient over photography that carries type. Always bottom-weighted.
- **The chip.** A bordered inline label for capability tags and hardware categories.
- **The hatch.** Diagonal repeating lines marking an unsupplied asset. Never appears in production.

### 2.3 The six moments

| Moment | Purpose | Typical composition | Brand colour |
|---|---|---|---|
| **Editorial** | Say something in the company's voice | Large type, wide margin, ≤ 62ch measure, one rule | Rule only |
| **Technical** | Show how a system is put together | Diagram or canvas + mono legend beneath | Nodes and links |
| **Evidence** | Prove a claim | Named entities, years, scope; tabular figures with provenance | Figure value only |
| **Structural** | Let the reader navigate a set | Index, grid, filter, count | Active state only |
| **Cinematic** | Set the emotional register | Full-bleed dark field, one lit subject, deep falloff | Atmospheric glow |
| **Instrumental** | Let the reader act | Form, CTA, contact channel | One filled control |

**Rule:** consecutive sections must not use the same moment twice. If two adjacent sections both
want *Structural*, one of them is wrong about its content.

---

## 3. Colour system

### 3.1 Principle

Colour is defined once as semantic tokens. No component references a literal. This is what makes
the light theme a remap rather than a second design, and it is not negotiable — a literal colour
anywhere in a component is a defect.

### 3.2 Dark theme (primary)

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#070A14` | Page ground |
| `--bg-raised` | `#0A0E1A` | Alternating section ground |
| `--surface` | `#0E1220` | Cards, panels, form fields |
| `--surface-2` | `#131829` | Nested surface, inset areas |
| `--border` | `#1E2436` | Visible hairline |
| `--border-soft` | `#171C2B` | Internal dividers inside a surface |
| `--text-primary` | `#FFFFFF` | Headings, key values |
| `--text-secondary` | `#C3C9DA` | Body copy |
| `--text-muted` | `#8D95AC` | Supporting copy, descriptions |
| `--text-dim` | `#7A839D` | Mono keys, indices, captions |
| `--brand` | `#D9088C` | Core brand magenta. Fills only. |
| `--brand-lit` | `#F04FB0` | Accent on dark: text, strokes, nodes |
| `--brand-deep` | `#B10772` | Reserved; the light-theme accent |
| `--brand-purple` | `#783389` | Secondary accent, gradient terminus |
| `--brand-purple-lit` | `#B673C5` | Orbit strokes on dark |
| `--accent` | → `--brand-lit` | Semantic alias components use |
| `--accent-line` | `rgba(240,79,176,0.30)` | Accent-tinted borders |
| `--accent-soft` | `rgba(217,8,140,0.10)` | Accent-tinted fills |

**Status colours** (specify now, validate at implementation — each must clear 4.5:1 on `--surface`):

| Token | Dark | Light | Use |
|---|---|---|---|
| `--success` | `#4BBD93` | `#0F6B4F` | Form success, cleared state |
| `--warning` | `#D9A441` | `#8A5A08` | Pending content, unconfirmed data |
| `--error` | `#E0644F` | `#B03A26` | Validation failure |

Status colours are **not** brand colours and never substitute for the accent. They appear only in
response to a real condition — never as decoration.

### 3.3 Light theme (remap)

Same token names, different values. No component changes.

| Token | Value | Note |
|---|---|---|
| `--bg-base` | `#FFFFFF` | |
| `--bg-raised` | `#F7F5F9` | |
| `--surface` | `#FFFFFF` | |
| `--surface-2` | `#F4F1F7` | |
| `--border` | `#E3DEE9` | |
| `--border-soft` | `#EEEAF2` | |
| `--text-primary` | `#14111A` | |
| `--text-secondary` | `#4B4455` | |
| `--text-muted` | `#5A5366` | Darkened so it stays distinct from `--text-dim` |
| `--text-dim` | `#6E6779` | `#8B8397` measured 3.62:1 and failed AA at label sizes |
| `--accent` | → `--brand-deep` `#B10772` | `#D9088C` measures 4.44:1 on `--surface-2` and fails AA for text |
| `--accent-line` | `rgba(177,7,114,0.26)` | |
| `--accent-soft` | `rgba(217,8,140,0.07)` | |

The brand magenta `#D9088C` is still used as a **fill** in light (buttons, the rule), where the
4.5:1 text rule does not apply — white on `#D9088C` measures 4.88:1 and passes. Only brand colour
used *as text* moves to `--brand-deep`.

### 3.4 The 6–8% constraint

Brand colour occupies approximately 6–8% of the pixels in any viewport-sized frame.

**How to verify:** screenshot a viewport, count pixels whose hue falls in the magenta–purple band
(300°–340°) with saturation > 0.25, divide by total. This is a scriptable check and should be run
per section during implementation, not eyeballed.

**Where brand colour is permitted:**

| Location | Weight |
|---|---|
| Eyebrow text and its leading rule | Small, every section |
| The tagline rule | 72 × 3px, once |
| Orbital nodes, links, packets | Small points, hero only |
| CTA fill | **One per viewport.** Never two filled buttons in the same frame. |
| Selected / active navigation state | Small |
| Data highlights — a stat value, a chart endpoint | The number only, never its label |
| Focus rings | 2px, only when focused |
| Micro-interaction feedback | Under 200ms, small area |
| Atmospheric glow behind a subject | Large area but very low alpha; contributes little to the pixel count |

**Justified exception:** the hero may run to ~10% because the orbital system *is* the brand
statement. No other section may exceed 8%. A section wanting an exception must state why in
`design-decisions.md` before it is built.

**Explicitly forbidden:** full-bleed magenta or purple surfaces; brand colour on body copy; brand
gradient across any letterform; more than one filled brand control per viewport.

---

## 4. Typography

### 4.1 Faces

- **Arial** — everything. The brand requires it. All hierarchy comes from size, weight, tracking and colour.
- **Mono** (`ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`) — the specification layer only.

The mono layer is **instrumentation, not a second identity**. Its job is to make the page feel
measured. Rules that keep it in its place:

- Mono never carries a sentence. Keys, values, indices, units, provenance — never prose.
- Mono is never larger than 13px.
- Mono is never `--text-primary`. It sits at `--text-dim`, or `--accent` for eyebrows.
- Mono is always uppercase with ≥ 0.10em tracking, except numerals.
- If a mono string would wrap, it is too long — shorten the content, don't shrink the type.

### 4.2 Scale

Every value below is a scale step. There are no other sizes.

| Role | Size | Weight | Line height | Tracking | Max measure |
|---|---|---|---|---|---|
| `display-1` — hero focal word | 92px | bold | 0.96 | −0.036em | — |
| `display-2` — hero headline | 62px | bold | 1.04 | −0.028em | 16ch |
| `h1` — page title | 48px | bold | 1.08 | −0.024em | 18ch |
| `h2` — section heading | 42px | bold | 1.12 | −0.020em | 20ch |
| `h3` — group heading | 23px | bold | 1.25 | −0.012em | 28ch |
| `h4` — card title | 17px | bold | 1.32 | −0.005em | 34ch |
| `body-lg` — section intro | 17px | normal | 1.60 | 0 | 58ch |
| `body` — default | 16px | normal | 1.62 | 0 | 68ch |
| `body-sm` — card copy | 14.5px | normal | 1.55 | 0 | 46ch |
| `label` — form label, nav | 13–14.5px | bold | 1.40 | 0 | — |
| `stat-value` | 56px | bold | 1.00 | −0.02em | — |
| `stat-label` | 13px | normal | 1.40 | 0.02em | 24ch |
| `eyebrow` (mono) | 10.5–11px | normal | 1.40 | 0.18em, uppercase | 40ch |
| `meta` (mono) | 10–11.5px | normal | 1.50 | 0.13em, uppercase | — |
| `brandline` | 14px | bold | 1.30 | 0.34em, uppercase | — |

**Numerals:** every context where digits align in a column or update in place uses
`font-variant-numeric: tabular-nums`. Statistics, years, phone numbers, indices, table figures.

**Balance:** `text-wrap: balance` on every heading. `text-wrap: pretty` on body copy.

**Arabic:** Arabic sets at the same scale but line height increases by 0.12 across the board —
Arabic ascenders and descenders need the room, and the Latin values look cramped. Latin numerals
are retained in Arabic contexts (`.numerals-latin`) so figures stay comparable across languages.

### 4.3 Responsive typography

Scale steps `display-1` through `h2` interpolate; everything below `h3` is fixed.

| Role | ≥1200px | 720–1199px | <720px |
|---|---|---|---|
| `display-1` | 92 | 68 | 50 |
| `display-2` | 62 | 48 | 34 |
| `h1` | 48 | 40 | 30 |
| `h2` | 42 | 34 | 29 |
| `h3` | 23 | 21 | 19 |
| everything else | fixed | fixed | fixed |

Use `clamp()` with these as the anchors. Do not add breakpoint-specific overrides for body copy —
if body copy needs resizing, the container is wrong.

---

## 5. Layout

### 5.1 Container

| Property | Desktop | Tablet | Mobile |
|---|---|---|---|
| Page max-width | 1320px | — | — |
| Gutter | 60px | 40px | 20px |
| Grid | 12 column | 8 column | 4 column |
| Column gap | 20px | 18px | 14px |

Content never exceeds 1320px. Full-bleed elements (hero canvas, section grounds, image bands) span
the viewport; their *content* still sits in the container.

### 5.2 Spacing scale

One scale. Any value not on it is a defect.

```
4  8  12  16  20  24  32  40  48  64  80  96  128  160
```

| Use | Desktop | Mobile |
|---|---|---|
| Section vertical padding | 128 | 72 |
| Section head → body | 64 | 40 |
| Heading → intro paragraph | 16 | 14 |
| Between cards in a grid | 20 | 14 |
| Card internal padding | 24–26 | 20 |
| Between capability groups | 64 | 40 |
| Between related paragraphs | 16 | 16 |
| Rule → following content | 24 | 20 |

### 5.3 Vertical rhythm

Sections alternate `--bg-base` and `--bg-raised`. The ground change *is* the section break — no
horizontal rules between sections, no top borders on section containers. A rule inside a section
separates content within it; it never separates one section from the next.

### 5.4 Alignment

- Everything aligns left in LTR, right in RTL. Use logical properties (`margin-inline-start`, `padding-inline`, `inset-inline`) throughout — no `left`/`right` in layout CSS.
- Centred text is permitted in exactly one place: the statistic value above its label.
- Optical alignment beats mathematical alignment for the eyebrow rule and mono keys — nudge to the cap height, not the box.

### 5.5 Breakpoint behaviour

| | Desktop ≥1200 | Tablet 720–1199 | Mobile <720 |
|---|---|---|---|
| Solution cards | 3 across | 2 across | 1 across |
| Sector tiles | 4 across | 3 across | 2 across |
| Statistics | 4 across | 2 × 2 | 2 × 2 |
| Partner / client rail | Masked marquee | Masked marquee | 3-across static grid |
| Project cards | 3 across | 2 across | 1 across |
| Contact | 2 columns | 1 column | 1 column |
| Navigation | Full bar | Full bar | Mark + name + menu |

---

## 6. Shape and surface

### 6.1 Radius

| Element | Radius |
|---|---|
| Page-level frames, image bands | 0 — full bleed, no radius |
| Cards, panels, form fields | 8–12px |
| Chips, badges, small controls | 6–8px |
| Mono tags, indices | 2–3px |
| Avatars, nodes, dots | 50% |

Nothing exceeds 12px. A 16px+ radius reads consumer, and the direction is enterprise.

### 6.2 Borders and dividers

- **Border** — 1px `--border`, defines a surface's edge.
- **Divider** — 1px `--border-soft`, separates content *within* a surface.
- **Accent border** — 1px `--accent-line`, marks a selected or brand-significant surface. Never the default.
- **Left rule** — 2px `--accent`, marks a pull-quote or an annotation aside.

Borders do the work shadows would do elsewhere. Shadow is reserved for genuinely floating elements
(the assistant pill, a dropdown, a modal) and never used to lift a static card.

### 6.3 The technical frame

The signature surface treatment. A panel with:

- a 1px `--border` hairline,
- a 2px brand gradient across its top edge at 55% opacity,
- a mono index in its top-left corner,
- content aligned to the container grid, not centred.

This is what a capability card is. It is deliberately **icon-free at card level** — the group above
carries the single icon, the cards carry type. Nine icons in a row is precisely what makes a
capability grid look generic.

### 6.4 Overlays and transparency

- Scrims over photography: linear gradient, bottom-weighted, `rgba(4,6,12,0.90)` → `rgba(4,6,12,0.12)`.
- Glass / blur: **not used.** It is a consumer-OS idiom and does not survive the dark ground.
- Veils over canvas: a horizontal gradient from `--bg-base` to transparent, protecting the reading column from the visual behind it.

---

## 7. Photography and imagery

### 7.1 Registers

| Register | Subject | Where | Treatment |
|---|---|---|---|
| **Documentary** | Real installed work — racks, cabling, control rooms, commissioning | Solutions, Projects | Minimal grade. Slight lift in shadows so detail survives the dark ground. |
| **Environmental** | The sector, not the client — a stadium bowl, a terminal, a campus | Sectors | Scrimmed heavily; type sits on it |
| **Editorial** | People working, at a distance and in context | About, Company | Wide, unposed, never a stock handshake |
| **Technical** | Diagrams, topologies, plans | Ecosystem, Solutions detail | Drawn, not photographed. Canvas or SVG. |
| **Evidence** | A named venue, dated | Projects, Track record | Uncropped where possible; the caption carries the facts |
| **Cinematic** | The hero field | Hero only | Generated, not photographic |
| **Abstract** | — | **Not used.** | Abstract imagery has no communication purpose. Deleted on sight. |

### 7.2 Specification

| Property | Rule |
|---|---|
| Aspect ratios | `16:10` cards · `16:11` sector tiles · `4:5` portrait mosaic · `21:9` full-bleed band |
| Focal point | Declared per image in the data layer, not assumed centre |
| Cropping | Never crop through a face, a device label, or a rack front |
| Overlay | Scrim only where type sits on the image; never a flat wash for mood |
| Contrast | Images are graded *down* toward the ground, never punched up. Target: the image's mean luminance sits below 45% so the page stays dark. |
| Format | AVIF with WebP fallback, blur placeholder from a build-time pipeline |
| Caption | Mono, `--text-dim`, above or below the frame — never inside it |
| Alt text | Describes the installed work, in both languages. Not "image of". |

### 7.3 Standing rules

- **Own or commissioned photography only** for anything representing work Smart Channels has done.
- Stock is permitted **only** for sector illustration in Industries, and only where the tile is clearly a sector, not a project.
- No image ships without a stated communication purpose recorded in the data layer.

---

## 8. Connected Earth hero system

The core brand experience. Every rule below is locked by prior approval unless marked otherwise.

### 8.1 Composition

| Property | Desktop | Mobile |
|---|---|---|
| Globe centre | `x = 75%`, `y = 47.5%` of hero | `x = 50%`, `y = H − 0.42R` |
| Globe radius | `min(H × 0.33, W × 0.24)` | `W × 0.72` |
| Type column | Left, ≤ 46% of frame | Full width, above the globe |
| Hero height | `min-height: 880px` | Content height + a 330px horizon band |
| Reading protection | Veil gradient, `--bg-base` → transparent by 52% | Vertical veil, opaque to 34% |

The mobile composition is **not** the desktop scaled down. The globe drops to the foot of the hero
as a horizon, oversized and cropped by the frame, with the type above it. A shrunken globe beside
the headline loses every piece of surface detail that makes it worth drawing.

### 8.2 Camera and depth

- Orthographic projection. No perspective — perspective on a globe reads as a 3D toy.
- Front hemisphere only; back-face points are discarded, not dimmed.
- Depth is carried by three cues, in order of strength: **occlusion** (orbital nodes passing behind the Earth disappear), **luminance falloff** (land dots dim toward the limb), **scale** (nothing — the projection is orthographic, so scale must not be used as a depth cue).

### 8.3 The globe

- 2,600 points on a Fibonacci lattice — even spacing without pole crowding.
- Land: 2.2px, `rgba(214,222,244, 0.60 + λ·0.40)` where λ is the lambert term.
- Ocean: 1.1px, `rgba(104,118,156, 0.07 + λ·0.12)`. Held far below land so continents read as shapes rather than uniform speckle.
- Terminator rim: 1px `--brand` at 0.26 alpha.
- Orientation: spin offset `+0.72 rad`, placing the Arabian peninsula on the centre meridian of the visible disc.

### 8.4 The orbital system

**This system is conceptual. It is not a map, and it must never become one.**

- Three rings at `R × 1.08`, `1.18`, `1.28`; flattening `0.32`; inclinations `−13°`, `−7°`, `−1°`.
- Drawn with `ctx.ellipse()`. Never `scale()` + `arc()` — scaling the context before stroking shears the ring into a near-circle and thins the stroke anisotropically.
- Six capability nodes ride the rings: **Infrastructure · Network · Security · Communication · Cloud · Smart Technology**.
- A node's only coordinates are *which ring* and *where on it*. There is no latitude or longitude anywhere in the capability model. This is what makes the guarantee structural rather than editorial.
- Each node draws a downlink to the Earth's rim and sends packets along it.
- Nodes on the far side of an orbit dim to 0.45; nodes actually behind the Earth are occluded entirely and drop their label.

**Riyadh is the only surface point and the only geographic reference on the canvas.** It sits at its
real coordinates, renders as a filled key node with a ring, and its label is the only one that must
never be dropped by the placement pass.

### 8.5 Label placement

- Labels are placed in a second pass with a claimed-rectangle collision test.
- Priority: Riyadh first, then nodes furthest from the globe centre (they have the least room).
- Preferred side is outward, away from the Earth; inward is the fallback; then ±17px, ±34px vertical.
- **Hard boundary:** no capability label may cross into the reading column (52% of frame width). A dropped label is better than a label over body copy.
- Labels are suppressed entirely below 720px.
- Phases are solved numerically, not chosen by eye — maximise minimum inter-node gap and vertical spread, subject to none occluded at rest and ≥ 4 visible across the orbit.

### 8.6 Copy relationship

Reading order, top to bottom, is fixed:

1. **Brand** — `SMART CHANNELS`, 14px, 0.34em tracking, with a leading brand rule. A brand line, not a badge.
2. **Message** — *we take you to the* / **future**, the focal word at 92px in `--accent` with a soft glow.
3. **Ecosystem** — the globe and orbits, supporting the message from the right half.
4. **Action** — one filled CTA, one outlined.

The type column is a calm zone: nothing in it moves after entry, and nothing animates behind it.

---

## 9. Content presentation

### 9.1 The rhythm

Every page follows: **Statement → Capability → Evidence → Scale → Projects → Proof → CTA.**

A section that cannot say which of these it is does not belong on the page.

### 9.2 Copy rules

- **Prefer a fact to an adjective.** "Six stadiums, 2022–2025, fibre through to control room" outranks "proven expertise" in every case.
- **Method, not superlative.** The company can describe how it works without ranking itself.
- **No claim without provenance.** Every figure renders with its *as-of* date and source register attached, exactly as the profile's own page 22 does.
- **Short.** Section intros ≤ 2 sentences. Card descriptions ≤ 2 sentences. If more is needed, the content belongs on a detail route.
- **Both languages are original.** Arabic is written, not machine-translated, and reviewed by a native speaker before launch.

### 9.3 Approved statistics — single source of truth

| Figure | Value |
|---|---|
| Projects delivered | **200+** |
| Years of continuous delivery | **7** |
| Period | **2019 – 2026** |
| Sectors served | **16+** |
| National venues & events | **100+** |

These five values are the **only** statistics the site may publish.

**Retired — must never appear publicly:** *87 contracted engagements* · *six years* · *since 2020*.
These legacy strings appear on pages 21, 23 and 30 of the 2026 profile and contradict the approved
set. Implementation must include a content lint that fails the build if any of them reach a
rendered string.

---

## 10. Information architecture

Proposed. Not implemented.

### 10.1 Taxonomy — seven solution areas in three groups

The 2026 profile names seven areas but does not name the groups. The grouping below is a proposal;
see `design-decisions.md` **O-1**.

| Group | Solution areas |
|---|---|
| **Foundation** — what everything else runs on | Infrastructure & data centre · Networking & connectivity |
| **Protection** — what keeps it safe | Security solutions · Biometrics & access control · Video surveillance & AI |
| **Experience** — what people actually use | Audio & visual · Unified communications & smart buildings |

`Fiber optic cabling` sits under **Infrastructure & data centre**. The retired *Computer
Applications & Fiber Optic Solutions* wording does not appear anywhere.

### 10.2 Homepage sections

| # | Section | Purpose | Answers | Visual role | Leads to |
|---|---|---|---|---|---|
| 1 | Navigation | Identify and route | "Whose site is this?" | Structural | — |
| 2 | Hero | State the position | "What do they do, and are they serious?" | Cinematic | Sets up capability |
| 3 | Statement | Say it plainly, once | "In one sentence?" | Editorial | Earns the detail below |
| 4 | Solutions | Show the seven areas in three groups | "Do they do what I need?" | Structural + Technical | Raises "have they done it?" |
| 5 | Technology ecosystem | Show the layers connect | "Will the seams fail?" | Technical | Supports the integration claim |
| 6 | Track record | Substantiate scale | "How much have they done?" | Evidence | Demands named proof |
| 7 | Projects | Name the work | "Where, exactly?" | Evidence | Strongest section on the site |
| 8 | Sectors | Show range | "Do they know my environment?" | Structural | Widens from specific to general |
| 9 | Partners | Show the stack | "Do they work with what I own?" | Evidence | Corroborates capability |
| 10 | Clients | Show who trusts them | "Who else?" | Evidence | Closes the proof arc |
| 11 | Why Smart Channels | State method | "Why them over another integrator?" | Editorial | Converts proof into preference |
| 12 | Contact | Let them act | "How do I start?" | Instrumental | — |
| 13 | Footer | Orient and close | "What else is here?" | Structural | — |

**Gated:** project, event and venue marks are not cleared for web display. Section 7 renders names
and facts only, and only if naming is itself cleared — see `design-decisions.md` **O-2**.

### 10.3 Routes

| Route | Contents |
|---|---|
| `/` | The 13 sections above |
| `/solutions/[area]` | One route per solution area — seven total |
| `/company` | About, mission, message pillars, track record in full |
| `/projects` | Full engagement list, filterable by sector and solution area — gated |
| `/contact` | Full contact page |

Solution-area dividers from the profile do **not** become pages. A divider exists to pace a
presentation; on a site it is a page with nothing on it.

---

## 11. Light theme strategy

### 11.1 Principle

Light is the **same design with different token values**. Not a second visual language. If a light
screenshot and a dark screenshot don't read as the same product, the remap is wrong.

### 11.2 What changes

| Layer | Behaviour |
|---|---|
| Grounds | Invert: near-black → white, raised ground → `#F7F5F9` |
| Surfaces | `--surface` becomes white; separation comes from `--border`, not from elevation |
| Borders | Lighten but stay visible — light theme leans harder on borders, since it has no glow |
| Text | Invert the ramp; `--text-muted` darkens so it stays distinct from `--text-dim` |
| Brand as text | Moves to `--brand-deep` `#B10772` for AA |
| Brand as fill | Stays `#D9088C` — white on it measures 4.88:1 |
| Glow and halo | Reduced to ~40% of dark-theme alpha. A strong bloom on white muddies type rather than lifting it. |
| Canvas | Land dots invert to dark-on-pale; the key node fills solid instead of white, which would vanish |
| Logo | The full official lockup replaces the mark-plus-type treatment (see §12.3) |
| Photography | Same images, scrims lightened; no separate light-theme asset set |

### 11.3 Contrast requirements

Both themes must pass WCAG 2.2 AA at 1440px and 390px, verified with axe-core before any section is
signed off. The mockup currently passes with **0 violations** in all four combinations; that is the
bar, not an aspiration.

---

## 12. Component primitives

Specifications only. Not implemented.

| Primitive | Definition |
|---|---|
| **Container** | max-width 1320, gutter per §5.1, logical padding |
| **Section** | Vertical padding per §5.2; alternates ground; owns one *moment* from §2.3 |
| **Eyebrow** | Mono, 10.5px, 0.18em, uppercase, `--accent`, with a 22px leading rule |
| **Heading** | `h2`/`h3` per §4.2, `text-wrap: balance`, max-measure enforced |
| **Body** | `body`/`body-sm`, `--text-muted`, ≤ 68ch |
| **CTA** | Filled (`--brand`, white text, 50px) or outlined (`--border`, `--text-primary`). **One filled per viewport.** |
| **Stat** | Value `stat-value` tabular in `--accent`; label `stat-label` in `--text-muted`; provenance in mono `--text-dim` beneath. Provenance is required, not optional. |
| **Card** | The technical frame (§6.3): hairline, 2px gradient top edge, mono index, no card-level icon |
| **Divider** | 1px `--border-soft`; inside a surface only |
| **Logo lockup** | Dark: SC mark + name in Arial. Light: full official lockup. Never on a plate. Never altered. |
| **Badge** | Bordered chip, 6px radius, `body-sm`, for capability tags and hardware categories |
| **Technical label** | Mono, `--text-dim`, 2px radius, optional 1px border. Indices, keys, provenance. |
| **Image frame** | Aspect-ratio box, declared focal point, optional scrim, caption outside the frame |
| **Section transition** | Ground change only. No decorative divider between sections. |

---

## 13. Responsive philosophy

Mobile is a **different composition of the same system**, not a narrowed desktop.

| Element | Desktop | Mobile — deliberate difference |
|---|---|---|
| Hero | Type left, globe right | Type full width, globe as a horizon at the foot |
| Orbital labels | Six placed with collision testing | **Suppressed.** At 390px they would cover the globe they label; the section headings carry that information. |
| Navigation | Full bar with six links | Mark + name + menu trigger; CTA moves into the sheet |
| Solution cards | 3 across | 1 across, full width |
| Sector tiles | 4 across | 2 across |
| Statistics | 4 across in a row | 2 × 2 |
| Partner / client rails | Masked marquee | Static 3-across grid — a marquee on a touch device is a scroll conflict |
| Ecosystem diagram | Ellipse, six nodes, labels | Same six nodes, shorter band, labels beneath rather than beside |
| CTAs | Side by side | Stacked, full width, 50px |
| Footer | 3 columns | Single column, ordered by usefulness |

**The rule for anything that cannot survive mobile:** define a deliberate fallback that states the
same thing another way. Never force the desktop composition into a narrow viewport, and never
simply hide the content.

---

## 14. Validation

This specification is complete when each question below can be answered by pointing at a section.

| Question | Answered in |
|---|---|
| What does Smart Channels look like? | §1.1, §1.2, §2 |
| What should it never look like? | §1.3 |
| How is brand colour used? | §3.4 |
| How does typography work? | §4 |
| How does the hero behave? | §8, and `motion-system.md` §4 |
| How does motion behave? | `motion-system.md` |
| How does mobile differ? | §13, §8.1 |
| How does light theme work? | §11 |
| How is accessibility handled? | §11.3, `motion-system.md` §6 |
| How do decisions stay consistent across sections? | §2.3 moments, §5.2 scale, §12 primitives |
| How do verified facts become storytelling? | §9 |

---

*Specification only. No production code has been written against this document.*
