# Smart Channels — Design Decisions

**Status:** Living record for the design phase.
**Companion documents:** [`creative-direction.md`](./creative-direction.md) · [`motion-system.md`](./motion-system.md)

Scope note: the root `DECISIONS.md` records engineering decisions from the build phase and is not
superseded by this file. This one records **design** decisions only. Where the two touch the same
subject, this file wins for anything visual.

---

## 1. Locked decisions

Confirmed by the client. Not to be reopened without an explicit instruction.

### 1.1 Concept and hero

| # | Decision | Confirmed |
|---|---|---|
| L-01 | **Connected Earth** is the approved hero concept | Visual direction approval |
| L-02 | The capability orbital system is **conceptual and abstract**. It must never become a geographic map. | Hero corrections round |
| L-03 | **Riyadh is the sole surface/location point** in the hero | Hero corrections round |
| L-04 | Capability nodes hold **no latitude or longitude** — only *which ring* and *where on it*. The guarantee is structural, not editorial. | Implementation of L-02 |
| L-05 | The six capability labels are **Infrastructure · Network · Security · Communication · Cloud · Smart Technology** | Hero corrections round |
| L-06 | Concept B's capability labels and Concept C's orbital discipline are carried into Concept A | Visual direction approval |

### 1.2 Typography and brand

| # | Decision | Confirmed |
|---|---|---|
| L-07 | The tagline is **solid**, never gradient-filled. Brand colour appears *around* it — bloom, rule, orbital light. | Branding corrections round |
| L-08 | The tagline renders **lowercase**, matching the logo artwork's own tagline | Current state; see O-4 |
| L-09 | **`future`** is the focal word — larger, in brand magenta, with a soft glow | Branding corrections round |
| L-10 | A **brand line** (`SMART CHANNELS`) sits above the headline. A brand line, not a badge. | Branding corrections round |
| L-11 | **Arial** is the primary typeface throughout | Master brief |
| L-12 | A **mono layer** carries specification/data only — never prose, never above 13px, never `--text-primary` | Creative direction |

### 1.3 Logo and icons

| # | Decision | Confirmed |
|---|---|---|
| L-13 | The logo is a **transparent PNG with no background plate** | Branding corrections round |
| L-14 | The artwork is **never** redrawn, recoloured, restretched or reproportioned | Master brief |
| L-15 | Trimming the file's transparent padding is permitted — it changes no proportion | Implementation of L-13 |
| L-16 | Light theme uses the **full official lockup**; dark theme uses the **official SC mark plus the name in site type**, because the lockup's wordmark measures 1.21:1 on the dark ground and no reversed variant exists | Branding corrections round |
| L-17 | Browser and app icons use the **SC mark only**, never the wordmark | Branding corrections round |
| L-18 | Small icon sizes take a tighter safe area — optical sizing of one artwork, not a second mark | Implementation of L-17 |

### 1.4 Colour and theme

| # | Decision | Confirmed |
|---|---|---|
| L-19 | **Dark theme is primary** | Master brief |
| L-20 | **Light theme is a token-level remap**, not a separate visual language | Master brief |
| L-21 | Brand colour is constrained to approximately **6–8% of the visual field**; hero may reach ~10% | Master brief + creative direction |
| L-22 | Light-theme accent moves to `#B10772` — `#D9088C` measures 4.44:1 on the light subtle surface and fails AA for text | Accessibility audit |
| L-23 | `--text-dim` corrected in both themes; the originals measured 3.51:1 (dark) and 3.62:1 (light) at label sizes | Accessibility audit |

### 1.5 Content and taxonomy

| # | Decision | Confirmed |
|---|---|---|
| L-24 | Establishment year is **2019**. Never 2003, never 2021. | Confirmed twice |
| L-25 | The **2026 profile taxonomy supersedes** the previous website taxonomy | Content intake, C4 |
| L-26 | **Seven solution areas in three groups.** The previous nine-service taxonomy is retired and must not be restored. | Content intake, C4 |
| L-27 | **Cloud & Hosting** and **Smart Buildings & Workplace IT** are confirmed capabilities | 2026 profile p.5 |
| L-28 | *"Computer Applications & Fiber Optic Solutions"* is **retired**. Use **"Fiber optic cabling"** under Infrastructure. | Content intake, C4 |
| L-29 | Published telephone is **+966 11 217 6668** | Content intake, C1 |
| L-30 | Approved statistics: **200+ projects · 7 years · 2019–2026 · 16+ sectors · 100+ venues**. Single source of truth. | Content intake, C2 |
| L-31 | **Retired figures — never publish:** *87 contracted engagements* · *six years* · *since 2020* | Content intake, C2 |
| L-32 | **Partner and client logos are cleared** for public web display | Content intake, C3 |
| L-33 | **Project, event and venue marks remain gated** unless explicitly cleared | Content intake, C3 |
| L-34 | The 16 sectors are validated — the profile's list matches the site's exactly | Content intake |
| L-35 | Street address confirmed: **King Faisal Road, Al Murabba District, Riyadh** | 2026 profile p.31 |

### 1.6 Motion

| # | Decision | Confirmed |
|---|---|---|
| L-36 | Reduced motion renders a **complete, composed** experience — never a degraded or blank one | Motion system |
| L-37 | **No animation library.** CSS, IntersectionObserver and `requestAnimationFrame` only. | Motion system; Framer Motion previously removed for breaking no-JS rendering |
| L-38 | Motion is **progressive enhancement**. Content is present and legible before any script runs. | Established in build phase |
| L-39 | Statistics **do not count up** | Motion system §3.5 |
| L-40 | **No per-word or per-character text reveals** | Motion system §3.6 |
| L-41 | The Company Profile PDFs are **internal source material only**. No public viewer, reader, full-screen mode or download anywhere on the site, and the files are not part of the production deployment. | Client instruction. Reversed once and reinstated — see the note below. |

### L-41 — read this before rebuilding a profile viewer

This decision has been reversed and reinstated. A public reader was built at
`/company/profile` with read-online, full-screen and per-language download, and
then removed in full. If a future brief asks for it again, that is a change of
client policy on a private document and needs saying so explicitly — it is not
a gap in the build.

What the site does instead: `/company` presents the verified information
extracted from the profiles as native, translated web content. The extracted
facts remain the source of truth for site copy; the source files do not ship.

Two guards are in place so this cannot regress by accident:

- `.gitignore` refuses PDFs under `public/`, so a file dropped into the public
  directory cannot be committed without a deliberate `git add -f`.
- `npm run check` fails the build if any PDF is present under `public/`,
  which catches a file that reaches a deploy directory without going through
  git at all.

---

## 2. Open decisions

Needed before or during implementation. Each has a recommendation; none has been acted on.

| # | Question | Options | Recommendation | Blocks |
|---|---|---|---|---|
| **O-1** | What are the three solution **groups** called? The profile names seven areas but no groups. | (a) Foundation / Protection / Experience — proposed in `creative-direction.md` §10.1 · (b) Infrastructure / Security / Communications · (c) client-supplied names | **(a)**. It groups by *what the reader is trying to achieve* rather than by vendor category, and it survives the addition of an eighth area later. | Solutions section |
| **O-2** | May projects be **named in text** without their marks? | (a) Yes, names and facts only · (b) No, section stays empty · (c) Subset cleared | Ask whoever holds the contracts. The six venues on profile p.26 are the highest value — named stadiums, real years, explicit scope. **Six substantiated venues outperform thirty logos.** | Projects section |
| **O-3** | Do **detail routes** exist per solution area at launch, or later? | (a) All seven at launch · (b) Homepage index only, routes in phase 2 | **(b)**. Seven detail routes need seven sets of photography that do not yet exist. Ship the index, add routes as evidence arrives. | Route planning |
| **O-4** | Tagline **case** — lowercase (logo artwork) or uppercase (profile cover)? | (a) lowercase · (b) uppercase | **(a)**, current state. Both are official; the lockup is the more binding reference. Raised previously and not yet answered. | Hero copy |
| **O-5** | Are the **status colours** correct for this brand? | Specified in `creative-direction.md` §3.2 but never reviewed | Validate contrast at implementation and confirm the hues read as Smart Channels rather than as generic system colours | Forms |
| **O-6** | Does the **Sky-Walker** building-management platform get named on the site? | (a) Named as a product · (b) Described generically | Named — it is a differentiator, and profile p.18 names it. Confirm it is a Smart Channels product and not a partner's. | Smart buildings area |
| **O-7** | Do the **12 capability chips** from profile p.5 appear as a filter layer, or as content? | (a) Filter over solutions and projects · (b) Static chip row · (c) Omit | **(a)**. They read as an index, not a taxonomy, and a filter is what an index is for. | Solutions section |

---

## 3. Unresolved questions

Not blocking, but unanswered and worth tracking.

| # | Question | Why it matters |
|---|---|---|
| **U-01** | Will a **reversed / light logo lockup** be supplied? | Removes the dark-theme compromise in L-16 entirely and lets both themes show the official artwork whole |
| **U-02** | Will a **vector logo source** (SVG/AI/EPS) be supplied? | Icons are currently raster-derived; no crisp scaling above 512px |
| **U-03** | Is there a **clear-space and minimum-size rule** for the logo? | Spacing around the mark is currently a judgement, not a specification |
| **U-04** | When will **Industries photography** (16 images) be commissioned? | The section is photo-first by instruction; with placeholders it is the weakest part of the page, and no design work substitutes for it |
| **U-05** | What is the **production domain**? | Site stays `noindex` until `NEXT_PUBLIC_SITE_URL` is set |
| **U-06** | Will the **profile deck be corrected** to remove the retired figures? | Pages 21, 23 and 30 will contradict the published site once it is live |
| **U-07** | Who **reviews the Arabic**? | Both languages are meant to be original, not translated. This needs a named native speaker. |
| **U-08** | Is the **LinkedIn URL** available yet? | Currently hidden by instruction |

---

## 4. Assumptions

Stated so they can be corrected rather than discovered.

| # | Assumption | If wrong |
|---|---|---|
| **A-01** | The 2026 profile is the company's current external story and will not be revised again this cycle | Taxonomy and statistics would need re-verification |
| **A-02** | "200+ projects" and "100+ venues" count different things and are not double-counting | The statistics section misrepresents scale, which is the most damaging kind of error on this site |
| **A-03** | Partner logo clearance covers **web** display, not only the PDF | Section 9 would have to be pulled after launch |
| **A-04** | Vendor relationships are current — no lapsed certifications in the 41 | A lapsed partner mark is a factual error with commercial consequences |
| **A-05** | The primary audience is Saudi enterprise and public-sector procurement, reading in either language | The whole editorial register would shift |
| **A-06** | The existing Next.js architecture, data layer, i18n and RTL handling carry forward unchanged | Timeline changes materially |
| **A-07** | Arial is a hard brand requirement, not a placeholder for an unlicensed brand face | Would reopen the entire type system |

---

## 5. Rejected directions

Recorded so they are not re-proposed.

| Direction | Why rejected |
|---|---|
| Concept B — Capability Constellation (as a whole) | Its capability labels were the strong idea and were carried into Concept A. The constellation itself read as decoration without a subject. |
| Concept C — Orbital Systems (as a whole) | Its orbital discipline was carried into Concept A. Alone it lacked the Earth, and so lacked the "connected" half of the proposition. |
| Gradient across the tagline | Costs legibility at every weight of the stroke and reads consumer rather than enterprise. Client direction. |
| Capability nodes on the globe surface | Implied geographic presence the company has not claimed. Client direction; now structurally impossible. |
| White rounded plate behind the logo | Introduced a container shape that is not part of the brand, and read as a sticker on the page. Client direction. |
| Full wordmark as favicon | Illegible below 32px. The mark is a solid silhouette with a high-contrast counter; the wordmark is not. |
| Framer Motion | Its `initial={{opacity: 0}}` pattern made all below-fold content invisible with JavaScript disabled. Removed and replaced with progressive enhancement. |
| Swiper / carousel library | Never used. Scroll-snap covers the requirement with no dependency. |
| Google Maps iframe | ~800KB and sets third-party cookies. Replaced with a link-out card. |
| Abstract SVG panels as primary Industries imagery | Client instruction: the section is photo-first. Panels survive only as a temporary fallback. |
| Counting-up statistics | Delays the fact and undermines the credibility the figures exist to establish. |
| Per-word / per-character text reveals | Text arrives slower than it can be read. |
| Parallax scrolling | Vestibular trigger; communicates nothing here. |

---

## 6. Future validation points

Checks that must happen at specific moments, not "at the end".

| When | Check |
|---|---|
| Token re-map lands | axe-core, both themes, 1440 + 390. Baseline is **0 violations** — that is the bar, not an aspiration. |
| Hero implemented | Reduced motion toggled live; canvas repaint after resize while frozen; keyboard traversal; measured on a real mid-range Android |
| Each section lands | Brand-colour pixel share measured against §3.4, not estimated |
| Solutions built | Every string traced to the 2026 profile; content lint fails the build on any retired figure (L-31) |
| Statistics built | Every figure renders with its *as-of* date and source register |
| Partners / clients built | `usageApproved` verified true per record; no mark renders without it |
| Projects built | Blocked until O-2 is answered |
| Arabic build | RTL verified with logical properties throughout; Arabic reviewed by a native speaker (U-07) |
| Pre-launch | Lighthouse; CLS 0; production checklist; `NEXT_PUBLIC_SITE_URL` set and canonicals/hreflang/sitemap/robots verified |
| Launch gate | **The site is not described as launch-ready until every open content item is resolved and the production checklist is complete.** Client instruction, standing. |

---

*Specification phase. No production code has been written against these decisions.*
