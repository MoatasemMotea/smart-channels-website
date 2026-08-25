# Smart Channels — Motion System

**Status:** Specification. Not implemented.
**Phase:** Creative Direction & Motion System definition.
**Companion documents:** [`creative-direction.md`](./creative-direction.md) · [`design-decisions.md`](./design-decisions.md)

Motion on this site is engineering, not decoration. Every animated element must answer a question
the reader would otherwise have to work out for themselves. Anything that cannot is deleted.

---

## 1. Principles

### 1.1 Motion earns its place or it goes

Before any animation is written, it must be expressible in one sentence of the form:

> *This moves so the reader understands `<X>`.*

If the sentence needs "so it feels modern", "so it's not static", or "because we can", the animation
does not ship. This is the single rule that keeps the system from accumulating.

### 1.2 What motion is allowed to communicate

| It communicates | Example on this site |
|---|---|
| **Hierarchy** | Section content enters in reading order, so the eye is told where to start |
| **Depth** | An orbital node passing behind the Earth is occluded — the ring is an orbit, not a flat halo |
| **State** | A hover, a focus ring, a selected filter, a submitting form |
| **Continuity** | The globe's rotation is unbroken, so leaving and returning to the tab feels like the same system still running |
| **System behaviour** | Packets travelling a downlink say *this is a network carrying traffic*, which is the business |
| **Orientation** | The navigation gaining a ground on scroll says *you have left the top* |

### 1.3 What motion must never do

- Move anything the reader is currently reading.
- Delay access to information. Content is present in the DOM and legible before any animation runs.
- Loop without meaning. An infinite animation must encode a continuous real condition, or it stops.
- Depend on JavaScript for content to exist. Motion is progressive enhancement, gated behind a `.js` class.
- Compete with itself. See §5.4 concurrency budget.

### 1.4 The calm zone

Any region containing reading text is a calm zone: nothing inside it moves after entry, and nothing
animates *behind* it. In the hero this is the left 46% of the frame. In every other section it is
the text column.

This is the rule that separates this site from a template. The visual system is permitted to be
alive; the reading experience is not.

---

## 2. Existing constants — evaluated

The mockup's current values, assessed. **The mockup is not being changed in this phase**; these are
the values implementation should adopt.

### 2.1 Globe yaw — 0.010 rad/s, continuous, no easing

**Verdict: KEEP.**

0.010 rad/s is roughly 10½ minutes per revolution — below the threshold at which the eye registers
movement as *animation* rather than as *presence*. A reader who looks away and back sees a changed
composition without ever having watched it change, which is exactly the intended effect.

The absence of easing is correct and should not be "improved". Easing implies a beginning and an
end; a planet has neither. Any ease applied here would immediately read as a loop.

### 2.2 Orbit rings — 0.052 / 0.043 / 0.034 rad/s

**Verdict: ADJUST → 0.030 / 0.024 / 0.018 rad/s.**

The current values are 5.2×, 4.3× and 3.4× the globe's rate. At 0.052 rad/s a node completes an
orbit in about two minutes, which is visible drift *within a single viewing* — the hero stops being
a composition and becomes something that is playing. The globe is the subject; the orbits are
structure, and structure should not out-move its subject by a factor of five.

Slowing to 0.030 / 0.024 / 0.018 keeps the outer-slower differential (which is both physically
right and what stops the six nodes locking into a repeating pattern) while bringing the fastest ring
to roughly three times the globe rather than five.

The ratios must also stay away from small integers. Current: 1.209 and 1.265. Proposed: 1.250 and
1.333 — 5:4 and 4:3, which *are* small integers and will visibly re-synchronise. **Use
0.030 / 0.0237 / 0.0181** instead (ratios 1.266 and 1.309), which does not repeat on any timescale a
visitor will experience.

### 2.3 Node pulse — 2.4s with phase offsets

**Verdict: ADJUST → 3.2s, amplitude reduced ~30%.**

2.4s sits near resting respiratory rate, which is why it reads as breathing — the right instinct.
But with six capability nodes plus Riyadh, the aggregate is busier than one pulse suggests: at any
moment two or three are near peak. Lengthening to 3.2s and reducing the halo amplitude keeps the
"alive" reading while lowering the total quantity of movement in the frame.

Phase offsets are correct and must be kept. Nodes beating in unison would read as a progress
indicator, which is the wrong meaning entirely.

### 2.4 Downlink packet — 3.2–5.6s per traverse

**Verdict: KEEP the range, ADJUST the population.**

The duration range is well judged — long enough to follow one packet with the eye, varied enough
that the six links never pulse together. Keep it.

The problem is quantity. One packet per node means six in flight continuously, which reads as a
stream rather than as discrete events. **Cap concurrent packets at three**, assigned round-robin
across the six links. Fewer, followable events communicate *traffic on a network* better than a
constant flow, and it removes half the per-frame work.

### 2.5 Label entry — fade + 8px rise, 120ms stagger, then static

**Verdict: KEEP, unchanged.**

This is the model the whole system should follow: motion at entry, nothing afterwards. 8px is enough
to read as arrival without being a slide. 120ms stagger across six labels totals 720ms — under the
one-second threshold where staggering starts to feel like waiting.

One clarification for implementation: a label re-entering because its node emerged from occlusion
**fades only, without the rise**. The rise means *this is new*; a returning label is not new.

### 2.6 Navigation ground — 180ms fade on scroll

**Verdict: KEEP.**

180ms is at the short end of perceptible, which suits a state change the reader did not ask for.
Add a scroll threshold with hysteresis — appear at 40px, disappear at 24px — so a nav that sits near
the trigger point does not flicker.

### 2.7 Reduced motion — all content renders, nothing animates

**Verdict: KEEP the principle, ADJUST the implementation.**

The principle is right and non-negotiable. The implementation needs one correction: *nothing
animates* must not be allowed to mean *the canvas is a blank frame*.

Two concrete requirements:

1. **A deliberate still.** Reduced motion renders a *composed* frame — globe at its designed
   orientation, all six capability nodes at their solved phases, Riyadh visible, labels placed. Not
   whatever frame the loop happened to stop on.
2. **Repaint on resize.** Resizing a canvas clears it. With the loop frozen, nothing repaints it and
   the section goes blank. The resize handler must re-request a frame. *(This was a real defect
   found during mockup review; it would otherwise have shipped silently to exactly the users least
   able to tolerate it.)*

---

## 3. Motion architecture

Six categories. Every animation on the site belongs to exactly one.

### 3.1 Ambient

Slow, continuous, environmental. The site's pulse.

| Property | Value |
|---|---|
| Duration | Continuous — no start, no end |
| Easing | None. Linear only. |
| Trigger | Element in viewport; paused when out of view or tab hidden |
| Intensity | Below conscious perception. Nothing moves more than ~2px/s on screen. |
| Allowed | Globe yaw · orbit travel · node pulse · particle drift |
| Forbidden | Anywhere near reading text; any section other than hero and ecosystem |
| Mobile | Globe yaw and node pulse only. Orbits static, particles removed. |

### 3.2 Structural

Establishes hierarchy and layout on arrival.

| Property | Value |
|---|---|
| Duration | 400–560ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` — decelerating, arrives and settles |
| Trigger | IntersectionObserver, 12% visible, **fires once** |
| Intensity | Opacity 0→1, `translateY` 12→0. No scale, no rotation, no blur. |
| Allowed | Section headings, cards entering a grid, statistics, table rows |
| Stagger | 60ms between siblings, **capped at 6 items** — beyond that everything after the sixth enters together |
| Mobile | Same, `translateY` reduced to 8px |

### 3.3 Interaction

Feedback for something the reader did.

| Property | Value |
|---|---|
| Duration | 120–200ms |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Trigger | Hover, focus, press, selection |
| Intensity | Colour, border, opacity, ≤ 2px transform. **Never** size change that reflows. |
| Allowed | Buttons, links, cards, filters, form fields, nav items, theme toggle |
| Forbidden | Lift-and-shadow on hover; scale > 1.02; anything reflowing neighbours |
| Mobile | Active state only, ≤ 120ms. No hover states — they strand on touch. |

Specific interaction states:

| Element | Rest → Hover | Focus |
|---|---|---|
| Filled CTA | Brightness +6%, shadow tightens | 2px `--accent` ring, 2px offset |
| Outlined CTA | Border → `--accent-line`, text → `--text-primary` | Same ring |
| Sector tile | Scrim warms toward magenta; 2px rule scales in from left, 240ms | Ring on the tile |
| Card | Border → `--accent-line`. Nothing else. | Ring |
| Nav link | Colour → `--text-primary` | Ring |

### 3.4 Navigation

Movement between routes or sections.

| Property | Value |
|---|---|
| Duration | 240–320ms out, 320–400ms in |
| Easing | Out `cubic-bezier(0.4, 0, 1, 1)`; in `cubic-bezier(0.22, 1, 0.36, 1)` |
| Trigger | Route change, anchor jump, menu open/close |
| Intensity | Opacity and ≤ 16px translate. No page-level slides, no crossfade of full screens. |
| Allowed | Mobile menu sheet · in-page anchor scroll · route content fade |
| Forbidden | Full-page wipes; scroll hijacking; smooth-scroll longer than 600ms |
| Mobile | Menu sheet slides from the top edge, 280ms, with a backdrop fade |

Anchor scrolling uses native `scroll-behavior: smooth` with `scroll-margin-top` on targets. No
JavaScript scroll animation — it fights the user's own input and breaks on trackpads.

### 3.5 Data / technical

The category that carries the business. Signals, packets, nodes, indicators.

| Property | Value |
|---|---|
| Duration | 3.2–5.6s per packet traverse; 3.2s node pulse |
| Easing | Linear for travel; `sine` for pulse |
| Trigger | In viewport; suspended otherwise |
| Intensity | Small bright points on a dark field. Total lit area under ~1% of frame. |
| Allowed | Hero downlinks · ecosystem perimeter packet · form submission indicator |
| Concurrency | **≤ 3 packets in flight** in the hero; **1** in the ecosystem |
| Mobile | Packets removed. Links and nodes render static. |

Counters and statistics **do not count up.** A number that animates from zero is a decorative device
that delays the fact and, on a page whose credibility rests on its figures, actively undermines it.
Statistics enter with the structural fade like any other content.

### 3.6 Editorial

Text reveals and storytelling moments. The most restricted category.

| Property | Value |
|---|---|
| Duration | 400–520ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Trigger | IntersectionObserver, once |
| Intensity | Opacity + 8–12px rise. **Whole blocks only.** |
| Allowed | Section eyebrow + heading + intro, as one group; pull-quotes |
| Forbidden | **Per-word, per-character and per-line reveals.** They make text arrive slower than it can be read, which is the opposite of the purpose. |
| Mobile | Same, 8px |

The hero headline is a deliberate exception: it is present at first paint with **no** entry
animation. The most important sentence on the site does not make anyone wait for it.

---

## 4. The Connected Earth motion system

Consolidated specification for the hero.

### 4.1 Zones

| Zone | What moves | Timing | Reduced motion |
|---|---|---|---|
| **1 — Orbits** | Three rings carrying six capability nodes | 0.030 / 0.0237 / 0.0181 rad/s, outer slowest | Static at solved phases |
| **2 — Capability nodes** | Ride their ring; dim on the far side; occluded behind the Earth | Governed by ring rate | Static, occlusion still applied |
| **3 — Downlinks** | ≤ 3 packets in flight, node → Earth rim | 3.2–5.6s, phase-staggered | Links drawn, packets omitted |
| **4 — Globe** | Continuous yaw, no easing, never reverses | 0.010 rad/s | Static at spin offset +0.72 rad |
| **Node pulse** | Halo on each node and on Riyadh | 3.2s, phase-offset | Held at rest amplitude |
| **Labels** | Entry only: fade + 8px rise | 120ms stagger, then static | Present immediately, no transform |
| **Calm zone** | Nothing. Brand line, headline, body, CTAs, facts. | — | — |
| **Navigation** | No motion; ground fades in on scroll | 180ms, 40/24px hysteresis | Ground appears immediately |

### 4.2 Lifecycle

| Event | Behaviour |
|---|---|
| First paint | Text renders immediately. Canvas initialises after, never blocking. |
| Canvas ready | Labels enter with the 120ms stagger. The globe is already at its designed orientation — it does not spin up. |
| Scrolled out of view | `requestAnimationFrame` loop suspended entirely. Not throttled — stopped. |
| Scrolled back | Resume from the elapsed-time clock, not from where it paused. The system kept running while unwatched. |
| Tab hidden | Loop suspended via `visibilitychange`. |
| Resize | Re-measure, re-render **and re-request a frame** — even when frozen. |
| Unmount | Cancel the frame, remove listeners, drop the observer. |

---

## 5. Performance

### 5.1 Animatable properties

**Permitted:** `transform` (translate, scale, rotate), `opacity`, `filter` on small elements, canvas
pixel work.

**Forbidden in any animation:** `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`,
`padding`, `font-size`, `box-shadow` spread. Each forces layout or paint on every frame.

`will-change` is applied only for the duration of an animation and removed on completion. Left in
place it permanently promotes a layer and costs memory for no benefit.

### 5.2 Canvas

| Rule | Value |
|---|---|
| Device pixel ratio | Capped at 2 |
| Point budget | 2,600 desktop · 1,400 ≤720px |
| Per-frame allocation | Zero. Geometry is built once and mutated in place. |
| Off-screen | Loop suspended, not throttled |
| Static layers | Rings and halo drawn once to a separate canvas; only the Earth layer redraws per frame |
| Frame budget | ≤ 4ms scripting on a mid-range laptop; measure, don't assume |

### 5.3 Loading

- Hero text is server-rendered and visible before any script executes.
- Images are lazy-loaded below the fold with `width`/`height` present so nothing shifts.
- Blur placeholders are generated at build time.
- No layout shift from motion: CLS target **0**.
- The canvas module is dynamically imported and does not enter the main bundle.

### 5.4 Concurrency budget

At most **two** animation categories run simultaneously in one viewport. Ambient plus one other.

The hero is the only place where Ambient and Data run together, and that is deliberate — they are
the same visual system. Anywhere else, the second category waits.

### 5.5 Dependencies

**No animation library.** Not GSAP, not Framer Motion, not Lottie.

Everything specified here is achievable with CSS transitions, CSS keyframes, one shared
IntersectionObserver, and `requestAnimationFrame` for the two canvases. This is not asceticism:
Framer Motion was already removed from this project once, when its `initial={{opacity: 0}}` pattern
made all below-fold content invisible with JavaScript disabled. The progressive-enhancement approach
that replaced it is both lighter and more robust.

If a future requirement genuinely needs a library, it gets its own decision entry with a measured
justification — not a quiet `npm install`.

---

## 6. Accessibility

### 6.1 `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

CSS alone is not sufficient. JavaScript must also check
`matchMedia('(prefers-reduced-motion: reduce)')`, render the composed still described in §2.7, and
**listen for changes** — a reader can toggle the OS setting while the page is open.

**Reduced motion is a complete experience, not a degraded one.** Every fact, every label, every node
is present. Nothing is hidden, nothing is truncated, and no information exists only in an animation.

### 6.2 Keyboard

- Every interactive element is reachable in DOM order.
- Focus is visible everywhere: 2px `--accent` ring, 2px offset, minimum 3:1 against its background.
- `:focus-visible`, not `:focus` — no ring on mouse click.
- Focus is never trapped except in the mobile menu, which returns focus to the trigger on close.
- The horizontally scrollable sector rail is keyboard-reachable (`tabindex="0"`, arrow-key scroll). *This was a real defect in an earlier build; it must not recur.*
- A skip-to-content link is the first focusable element.

### 6.3 Contrast

- Text: 4.5:1 minimum; large text (≥24px, or ≥19px bold): 3:1.
- Non-text: 3:1 for focus rings, control borders, and any graphical object conveying meaning.
- Canvas labels sit on a solid plate rather than directly on the field, so contrast is deterministic rather than dependent on what is behind them.
- Verified with axe-core in both themes at 1440px and 390px before any section is signed off.

### 6.4 Motion safety

- No flashing above 3Hz anywhere. The fastest thing on the site is a 3.2s pulse.
- No parallax on scroll — a common vestibular trigger, and it communicates nothing here.
- No auto-playing video.
- No infinite animation that encodes nothing. Every loop on this site represents a continuous real condition (a rotating planet, a network carrying traffic) or it does not loop.
- Canvas is `aria-hidden` with the equivalent information available as text — the capability labels also exist as the Solutions section headings.

---

## 7. Responsive motion

| Element | Desktop | Mobile |
|---|---|---|
| Globe yaw | 0.010 rad/s | 0.010 rad/s — kept; it is the identity |
| Orbits | Three rings travelling | **Static.** The horizon composition crops most of them anyway. |
| Capability nodes | Six, moving, labelled | Six, static, unlabelled |
| Downlink packets | ≤ 3 in flight | **Removed** |
| Particles | Sparse drift | **Removed** |
| Section entry | 400–560ms, 60ms stagger | 320–400ms, 40ms stagger |
| Editorial reveal | 12px rise | 8px rise |
| Hover states | Full set | **None** — active states only |
| Menu | — | Sheet, 280ms from the top edge |
| Point budget | 2,600 | 1,400 |

The reasoning is battery and thermal, not capability. A phone can render this; it should not have to
for six hours of someone's day.

---

## 8. Validation

Before any section using motion is signed off:

- [ ] Every animation has its one-sentence justification (§1.1) recorded
- [ ] Reduced-motion renders a composed, complete frame — verified by toggling the OS setting live
- [ ] Canvas repaints correctly after resize while frozen
- [ ] No `width`/`height`/`top`/`left` animated anywhere
- [ ] No more than two categories active in one viewport
- [ ] CLS measured at 0
- [ ] axe-core: 0 violations, both themes, 1440px and 390px
- [ ] Keyboard: full traversal, visible focus, no traps, scrollable regions reachable
- [ ] Loop suspends off-screen and on tab hide; listeners removed on unmount
- [ ] Measured on a real mid-range Android device, not an emulator

---

*Specification only. No animation code has been written against this document.*
