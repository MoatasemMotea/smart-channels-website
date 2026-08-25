#!/usr/bin/env node
/**
 * Generates the abstract brand artwork behind each Industries panel.
 *
 * WHY THIS EXISTS
 * ---------------
 * Sixteen industries each need their own background image, and no industry
 * photography was supplied. The alternatives were generic stock (which looks
 * cheap and misrepresents the work) or empty panels (which looks unfinished).
 * Instead each industry gets a distinct, deterministic geometric composition
 * built from the Smart Channels palette — a real design asset that reads as
 * intentional, ships at launch, and is trivially swapped for a photograph.
 *
 * The output is SVG, not raster: each file is ~2–4 KB rather than the ~150 KB a
 * comparable WebP would cost, scales to any viewport without a srcset, and
 * carries no photographic licensing risk.
 *
 * DETERMINISM
 * -----------
 * Every composition is derived from a hash of the industry id via a seeded PRNG.
 * The same id always produces the same artwork, so regenerating never produces
 * a spurious diff, and each industry is visually distinguishable from its
 * neighbours in the grid.
 *
 * Usage:  npm run assets:industries
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "images", "industries");

const WIDTH = 1600;
const HEIGHT = 1000;

/* Brand palette, sampled from the supplied logo. Kept in sync with
   src/app/globals.css by hand — these are the only two brand hues. */
const MAGENTA = { h: 322, s: 93, l: 44 };
const PURPLE = { h: 288, s: 43, l: 38 };

/**
 * The industries, in the same order as src/data/industries.ts.
 * Each entry picks a motif that suits the sector without depicting it
 * literally — this is brand texture, not iconography.
 */
const INDUSTRIES = [
  { id: "sporting-events", motif: "burst" },
  { id: "stadiums", motif: "concentric" },
  { id: "motorsport", motif: "streaks" },
  { id: "cultural-seasons", motif: "arcs" },
  { id: "government", motif: "grid" },
  { id: "holy-sites", motif: "geometric" },
  { id: "giga-projects", motif: "isometric" },
  { id: "hospitality", motif: "waves" },
  { id: "healthcare", motif: "pulse" },
  { id: "education", motif: "lattice" },
  { id: "banking", motif: "columns" },
  { id: "industrial", motif: "hex" },
  { id: "transport", motif: "rails" },
  { id: "diplomatic", motif: "nodes" },
  { id: "retail", motif: "topo" },
  { id: "media", motif: "beams" },
];

// Every industry uses a different motif. Two panels sharing one would read as a
// duplicate in the 16-cell grid, since the seeded variation within a motif
// changes colour and density but not overall structure.
{
  const seen = new Set();
  for (const { id, motif } of INDUSTRIES) {
    if (seen.has(motif)) {
      throw new Error(`Motif "${motif}" is reused (at "${id}") — each industry needs a distinct one.`);
    }
    seen.add(motif);
  }
}

/* -------------------------------------------------------------------------- */
/* Seeded pseudo-randomness                                                    */
/* -------------------------------------------------------------------------- */

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for visual variation. */
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n, dp = 1) => Number(n.toFixed(dp));

/**
 * Global gain on motif opacity.
 *
 * The individual motifs were authored with conservative alphas, which rendered
 * as barely-visible texture once composited over the deep base gradient. Rather
 * than retuning ~90 literals across sixteen motifs, the multiplier is applied
 * once here — one number to adjust if the panels ever need to be louder or
 * quieter as a set.
 */
const MOTIF_ALPHA_GAIN = 2.4;

function hsl(base, { dh = 0, ds = 0, dl = 0, a = 1 } = {}) {
  const h = (base.h + dh + 360) % 360;
  const s = Math.min(100, Math.max(0, base.s + ds));
  const l = Math.min(100, Math.max(0, base.l + dl));
  const alpha = a >= 1 ? 1 : Math.min(0.92, a * MOTIF_ALPHA_GAIN);
  return alpha >= 1
    ? `hsl(${round(h, 0)} ${round(s, 0)}% ${round(l, 0)}%)`
    : `hsl(${round(h, 0)} ${round(s, 0)}% ${round(l, 0)}% / ${round(alpha, 3)})`;
}

/** Opacity that must not be scaled by the gain (base gradients, shading). */
function hslExact(base, { dh = 0, ds = 0, dl = 0, a = 1 } = {}) {
  const h = (base.h + dh + 360) % 360;
  const s = Math.min(100, Math.max(0, base.s + ds));
  const l = Math.min(100, Math.max(0, base.l + dl));
  return a >= 1
    ? `hsl(${round(h, 0)} ${round(s, 0)}% ${round(l, 0)}%)`
    : `hsl(${round(h, 0)} ${round(s, 0)}% ${round(l, 0)}% / ${round(a, 3)})`;
}

/* -------------------------------------------------------------------------- */
/* Motifs                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Each motif returns SVG markup drawn in a 1600×1000 box.
 *
 * All motifs keep their density low and their strokes thin. The panels sit
 * behind a dark overlay with a title on top, so the artwork has to stay quiet:
 * it is texture, not illustration. Anything busier would fight the type and
 * fail the contrast requirement for the industry label.
 */
const motifs = {
  grid(rng) {
    const parts = [];
    const step = 80 + Math.floor(rng() * 40);
    for (let x = step; x < WIDTH; x += step) {
      parts.push(
        `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${hsl(PURPLE, { dl: 26, a: 0.16 })}" stroke-width="1"/>`,
      );
    }
    for (let y = step; y < HEIGHT; y += step) {
      parts.push(
        `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${hsl(PURPLE, { dl: 26, a: 0.12 })}" stroke-width="1"/>`,
      );
    }
    // A few brighter intersections to break the regularity.
    for (let i = 0; i < 7; i += 1) {
      const x = Math.round((rng() * (WIDTH / step - 1) + 1)) * step;
      const y = Math.round((rng() * (HEIGHT / step - 1) + 1)) * step;
      parts.push(
        `<circle cx="${x}" cy="${y}" r="${round(3 + rng() * 4)}" fill="${hsl(MAGENTA, { dl: 12, a: 0.55 })}"/>`,
      );
    }
    return parts.join("");
  },

  concentric(rng) {
    const cx = WIDTH * (0.62 + rng() * 0.16);
    const cy = HEIGHT * (0.42 + rng() * 0.16);
    const parts = [];
    for (let i = 0; i < 11; i += 1) {
      const r = 70 + i * (46 + rng() * 12);
      parts.push(
        `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(r)}" ry="${round(r * 0.62)}" fill="none" stroke="${hsl(
          i % 3 === 0 ? MAGENTA : PURPLE,
          { dl: 18, a: 0.3 - i * 0.02 },
        )}" stroke-width="${round(1.6 - i * 0.08, 2)}"/>`,
      );
    }
    return parts.join("");
  },

  streaks(rng) {
    const parts = [];
    for (let i = 0; i < 16; i += 1) {
      const y = round(rng() * HEIGHT);
      const len = round(220 + rng() * 900);
      const x = round(rng() * (WIDTH - len * 0.4));
      const w = round(1 + rng() * 3, 1);
      parts.push(
        `<rect x="${x}" y="${y}" width="${len}" height="${w}" rx="${round(w / 2, 2)}" fill="${hsl(
          i % 4 === 0 ? MAGENTA : PURPLE,
          { dl: 20, a: 0.14 + rng() * 0.3 },
        )}" transform="skewX(-18)"/>`,
      );
    }
    return parts.join("");
  },

  arcs(rng) {
    const parts = [];
    for (let i = 0; i < 9; i += 1) {
      const r = 180 + i * 90;
      const cx = round(WIDTH * (0.14 + rng() * 0.08));
      const cy = round(HEIGHT * (0.92 + rng() * 0.06));
      parts.push(
        `<path d="M ${round(cx - r)} ${cy} A ${r} ${r} 0 0 1 ${round(cx + r)} ${cy}" fill="none" stroke="${hsl(
          i % 2 ? MAGENTA : PURPLE,
          { dl: 20, a: 0.3 - i * 0.024 },
        )}" stroke-width="${round(2 - i * 0.14, 2)}"/>`,
      );
    }
    return parts.join("");
  },

  geometric(rng) {
    const parts = [];
    // Eight-point star tessellation — a nod to Islamic geometric tradition,
    // abstracted to a light structural motif rather than an ornament.
    const step = 200;
    for (let x = -step; x < WIDTH + step; x += step) {
      for (let y = -step; y < HEIGHT + step; y += step) {
        const size = step * 0.34;
        const cx = x + step / 2;
        const cy = y + step / 2;
        const pts = [];
        for (let k = 0; k < 8; k += 1) {
          const angle = (Math.PI / 4) * k + Math.PI / 8;
          pts.push(`${round(cx + Math.cos(angle) * size)},${round(cy + Math.sin(angle) * size)}`);
        }
        parts.push(
          `<polygon points="${pts.join(" ")}" fill="none" stroke="${hsl(PURPLE, {
            dl: 24,
            a: 0.1 + rng() * 0.12,
          })}" stroke-width="1"/>`,
        );
      }
    }
    return parts.join("");
  },

  isometric(rng) {
    const parts = [];
    for (let i = 0; i < 26; i += 1) {
      const s = round(40 + rng() * 90);
      const x = round(rng() * WIDTH);
      const y = round(rng() * HEIGHT);
      // Isometric cube outline: three rhombi sharing a centre.
      parts.push(
        `<path d="M ${x} ${y} l ${s} ${round(s * 0.58)} l 0 ${s} l ${-s} ${round(-s * 0.58)} Z" fill="none" stroke="${hsl(
          i % 5 === 0 ? MAGENTA : PURPLE,
          { dl: 22, a: 0.12 + rng() * 0.18 },
        )}" stroke-width="1.2"/>`,
      );
    }
    return parts.join("");
  },

  waves(rng) {
    const parts = [];
    for (let i = 0; i < 10; i += 1) {
      const yBase = (HEIGHT / 9) * i;
      const amp = 26 + rng() * 40;
      const seg = 200 + rng() * 90;
      let d = `M -50 ${round(yBase)}`;
      for (let x = -50; x < WIDTH + 100; x += seg) {
        d += ` q ${round(seg / 2)} ${round(-amp)} ${round(seg)} 0`;
      }
      parts.push(
        `<path d="${d}" fill="none" stroke="${hsl(i % 3 === 0 ? MAGENTA : PURPLE, {
          dl: 20,
          a: 0.14 + rng() * 0.2,
        })}" stroke-width="${round(1 + rng() * 1.6, 2)}"/>`,
      );
    }
    return parts.join("");
  },

  pulse(rng) {
    const parts = [];
    const mid = HEIGHT / 2;
    for (let row = 0; row < 3; row += 1) {
      const y = mid + (row - 1) * 220;
      let d = `M 0 ${round(y)}`;
      let x = 0;
      while (x < WIDTH) {
        const flat = 60 + rng() * 100;
        d += ` L ${round(x + flat)} ${round(y)}`;
        x += flat;
        const spike = 26 + rng() * 22;
        const h = 40 + rng() * 90;
        d += ` L ${round(x + spike / 2)} ${round(y - h)} L ${round(x + spike)} ${round(y + h * 0.45)} L ${round(x + spike * 1.5)} ${round(y)}`;
        x += spike * 1.5;
      }
      parts.push(
        `<path d="${d}" fill="none" stroke="${hsl(row === 1 ? MAGENTA : PURPLE, {
          dl: 20,
          a: row === 1 ? 0.42 : 0.2,
        })}" stroke-width="${row === 1 ? 2 : 1.3}" stroke-linejoin="round"/>`,
      );
    }
    return parts.join("");
  },

  lattice(rng) {
    const parts = [];
    const step = 110;
    for (let x = 0; x <= WIDTH; x += step) {
      for (let y = 0; y <= HEIGHT; y += step) {
        if (rng() > 0.55) continue;
        parts.push(
          `<line x1="${x}" y1="${y}" x2="${x + step}" y2="${y + step}" stroke="${hsl(PURPLE, {
            dl: 24,
            a: 0.16,
          })}" stroke-width="1"/>`,
        );
        parts.push(
          `<line x1="${x + step}" y1="${y}" x2="${x}" y2="${y + step}" stroke="${hsl(MAGENTA, {
            dl: 16,
            a: 0.12,
          })}" stroke-width="1"/>`,
        );
      }
    }
    return parts.join("");
  },

  columns(rng) {
    const parts = [];
    let x = 40;
    while (x < WIDTH) {
      const w = 26 + rng() * 74;
      const h = HEIGHT * (0.3 + rng() * 0.62);
      parts.push(
        `<rect x="${round(x)}" y="${round(HEIGHT - h)}" width="${round(w)}" height="${round(h)}" fill="${hsl(
          rng() > 0.76 ? MAGENTA : PURPLE,
          { dl: 20, a: 0.1 + rng() * 0.14 },
        )}"/>`,
      );
      x += w + 26 + rng() * 46;
    }
    return parts.join("");
  },

  hex(rng) {
    const parts = [];
    const r = 58;
    const hStep = r * 1.5;
    const vStep = Math.sqrt(3) * r;
    for (let col = 0, x = 0; x < WIDTH + r; col += 1, x += hStep) {
      for (let y = (col % 2 ? vStep / 2 : 0); y < HEIGHT + r; y += vStep) {
        if (rng() > 0.42) continue;
        const pts = [];
        for (let k = 0; k < 6; k += 1) {
          const a = (Math.PI / 3) * k;
          pts.push(`${round(x + Math.cos(a) * r)},${round(y + Math.sin(a) * r)}`);
        }
        parts.push(
          `<polygon points="${pts.join(" ")}" fill="none" stroke="${hsl(
            rng() > 0.85 ? MAGENTA : PURPLE,
            { dl: 22, a: 0.12 + rng() * 0.16 },
          )}" stroke-width="1"/>`,
        );
      }
    }
    return parts.join("");
  },

  rails(rng) {
    const parts = [];
    for (let i = 0; i < 6; i += 1) {
      const y = round(HEIGHT * (0.12 + i * 0.16));
      const drift = round((rng() - 0.5) * 160);
      parts.push(
        `<path d="M -40 ${y} L ${WIDTH + 40} ${y + drift}" stroke="${hsl(
          i % 3 === 0 ? MAGENTA : PURPLE,
          { dl: 20, a: 0.26 },
        )}" stroke-width="1.6" fill="none"/>`,
      );
      // Sleepers. Spaced widely — at closer intervals this motif alone
      // accounted for more markup than the other fifteen combined.
      for (let x = 0; x < WIDTH; x += 108) {
        const t = x / WIDTH;
        parts.push(
          `<line x1="${x}" y1="${round(y + drift * t - 9)}" x2="${x}" y2="${round(y + drift * t + 9)}" stroke="${hsl(
            PURPLE,
            { dl: 24, a: 0.14 },
          )}" stroke-width="1"/>`,
        );
      }
    }
    return parts.join("");
  },

  /** Connected network of nodes — the most literally on-brand motif. */
  nodes(rng) {
    const parts = [];
    const points = [];
    for (let i = 0; i < 26; i += 1) {
      points.push({ x: round(rng() * WIDTH), y: round(rng() * HEIGHT), r: round(2 + rng() * 5, 1) });
    }
    // Link each node only to near neighbours, so the result reads as a network
    // rather than a mesh of every-to-every noise.
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > 290) continue;
        parts.push(
          `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${hsl(PURPLE, {
            dl: 26,
            a: round(0.3 * (1 - dist / 290), 3),
          })}" stroke-width="1"/>`,
        );
      }
    }
    for (const p of points) {
      parts.push(
        `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${hsl(
          p.r > 4.5 ? MAGENTA : PURPLE,
          { dl: 16, a: 0.6 },
        )}"/>`,
      );
    }
    return parts.join("");
  },

  /** Topographic contour bands. */
  topo(rng) {
    const parts = [];
    for (let ring = 0; ring < 9; ring += 1) {
      const cx = WIDTH * 0.5 + (rng() - 0.5) * 200;
      const cy = HEIGHT * 0.5 + (rng() - 0.5) * 140;
      const baseR = 60 + ring * 62;
      const pts = [];
      const steps = 44;
      for (let k = 0; k <= steps; k += 1) {
        const a = (Math.PI * 2 * k) / steps;
        // Low-frequency wobble keeps the contours organic without noise.
        const wobble = 1 + Math.sin(a * 3 + ring) * 0.11 + Math.sin(a * 5 + ring * 2) * 0.06;
        pts.push(`${round(cx + Math.cos(a) * baseR * wobble)},${round(cy + Math.sin(a) * baseR * wobble * 0.66)}`);
      }
      parts.push(
        `<polygon points="${pts.join(" ")}" fill="none" stroke="${hsl(
          ring % 3 === 0 ? MAGENTA : PURPLE,
          { dl: 22, a: round(0.3 - ring * 0.022, 3) },
        )}" stroke-width="1.2"/>`,
      );
    }
    return parts.join("");
  },

  /** Vertical light beams. */
  beams(rng) {
    const parts = [];
    for (let i = 0; i < 13; i += 1) {
      const x = round(rng() * WIDTH);
      const w = round(14 + rng() * 90);
      const skew = round((rng() - 0.5) * 26, 1);
      parts.push(
        `<polygon points="${x},0 ${round(x + w)},0 ${round(x + w + skew + 40)},${HEIGHT} ${round(x + skew - 40)},${HEIGHT}" fill="${hsl(
          i % 3 === 0 ? MAGENTA : PURPLE,
          { dl: 18, a: round(0.05 + rng() * 0.12, 3) },
        )}"/>`,
      );
    }
    return parts.join("");
  },

  burst(rng) {
    const parts = [];
    const cx = WIDTH * (0.5 + (rng() - 0.5) * 0.3);
    const cy = HEIGHT * (0.5 + (rng() - 0.5) * 0.3);
    for (let i = 0; i < 44; i += 1) {
      const angle = (Math.PI * 2 * i) / 44 + rng() * 0.06;
      const inner = 90 + rng() * 70;
      const outer = inner + 130 + rng() * 400;
      parts.push(
        `<line x1="${round(cx + Math.cos(angle) * inner)}" y1="${round(cy + Math.sin(angle) * inner)}" x2="${round(
          cx + Math.cos(angle) * outer,
        )}" y2="${round(cy + Math.sin(angle) * outer)}" stroke="${hsl(i % 4 === 0 ? MAGENTA : PURPLE, {
          dl: 20,
          a: 0.1 + rng() * 0.26,
        })}" stroke-width="${round(0.8 + rng() * 1.6, 2)}"/>`,
      );
    }
    return parts.join("");
  },
};

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

function buildSvg({ id, motif }) {
  const rng = makeRng(hashString(id));
  const draw = motifs[motif];
  if (!draw) throw new Error(`Unknown motif "${motif}" for industry "${id}"`);

  // Rotate the base hue per industry so neighbouring panels in the grid are
  // distinguishable, while staying inside the brand's magenta→purple range.
  // ±20° keeps every panel unmistakably Smart Channels.
  const hueShift = round((rng() - 0.5) * 40, 0);
  const gradientAngle = round(rng() * 360, 0);
  // Vary depth as well as hue: hue alone left the set looking uniform.
  const depth = round((rng() - 0.5) * 10, 0);

  const deepA = hslExact(PURPLE, { dh: hueShift, dl: -13 + depth, ds: 8 });
  const deepB = hslExact(MAGENTA, { dh: hueShift, dl: -21 + depth, ds: -16 });
  const glow = hslExact(MAGENTA, { dh: hueShift, dl: 8, a: 0.4 });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="presentation" aria-hidden="true">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${gradientAngle} 0.5 0.5)">
      <stop offset="0%" stop-color="${deepA}"/>
      <stop offset="100%" stop-color="${deepB}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${round(rng() * 100, 0)}%" cy="${round(rng() * 100, 0)}%" r="70%">
      <stop offset="0%" stop-color="${glow}"/>
      <stop offset="100%" stop-color="hsl(0 0% 0% / 0)"/>
    </radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(280 30% 4% / 0)"/>
      <stop offset="55%" stop-color="hsl(280 30% 4% / 0.08)"/>
      <stop offset="100%" stop-color="hsl(280 30% 4% / 0.38)"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <g>${draw(rng)}</g>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <!-- Bottom shade guarantees contrast for the industry title, which is
       bottom-aligned in the card, independent of what the motif drew there. -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)"/>
</svg>
`;
}

/* -------------------------------------------------------------------------- */

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let total = 0;
  for (const industry of INDUSTRIES) {
    const svg = buildSvg(industry);
    const file = path.join(OUT_DIR, `${industry.id}.svg`);
    await writeFile(file, svg, "utf8");
    total += Buffer.byteLength(svg);
    process.stdout.write(
      `  ${industry.id.padEnd(20)} ${industry.motif.padEnd(11)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB\n`,
    );
  }

  process.stdout.write(
    `\n${INDUSTRIES.length} industry panels written to public/images/industries (${(total / 1024).toFixed(1)} KB total)\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
