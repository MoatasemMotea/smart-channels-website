#!/usr/bin/env node
/**
 * Generates the "Connected Earth" hero artwork (creative-direction.md §8).
 *
 * WHAT IT DRAWS
 * -------------
 * - A dotted Earth: 2,600 points on a Fibonacci lattice, orthographic
 *   projection, front hemisphere only. Land and ocean points are styled per
 *   §8.3, with lambert falloff toward the limb carrying depth.
 * - Riyadh as the ONLY surface point and the only geographic reference (L-03).
 * - Three flattened orbital rings carrying the six capability nodes (L-05).
 *   A node's only coordinates are "which ring" and "where on it" — there is no
 *   latitude or longitude anywhere in the capability model (L-04).
 * - A downlink from every node to the Earth, with a packet on three of them
 *   (≤ 3 in flight, motion-system.md §4.1).
 *
 * OUTPUT
 * ------
 *   public/images/hero/connected-earth-en.svg   labels in English
 *   public/images/hero/connected-earth-ar.svg   labels in Arabic
 *   public/images/hero/connected-earth.svg      no labels (≤ 720px, §8.5)
 *
 * Deterministic: the same inputs always produce byte-identical files.
 *
 * Usage:  npm run assets:hero
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoOrthographic, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "images", "hero");

/* ---- Frame ------------------------------------------------------------- */
const W = 1600;
const H = 1200;
const CX = 800;
const CY = 610;
const R = 410;

/* ---- Palette (globals.css / creative-direction.md §3) ------------------ */
const BRAND = "#d9088c";
const BRAND_LIT = "#f04fb0";
const PURPLE = "#7b388b";
const PURPLE_LIT = "#b673c5";
const INK = "#0e0c11";

/* ---- Globe ------------------------------------------------------------- */
// The live canvas budget is 2,600 (motion-system.md §5.2). A still frame has
// no per-frame cost, so it is drawn denser — enough for the continents to read
// as shapes rather than speckle at hero size.
const POINTS = 9000;
// Arabian peninsula on the centre meridian of the visible disc (§8.3),
// tilted so the northern hemisphere — where the region sits — faces the eye.
const projection = geoOrthographic()
  .rotate([-46, -18, 0])
  .scale(R)
  .translate([CX, CY])
  .clipAngle(90);

const land = feature(land110, land110.objects.land);

// Light from upper-left-front, in view space.
const LIGHT = normalise([-0.45, -0.55, 0.7]);

const r3 = (n) => Math.round(n * 10) / 10;
const a2 = (n) => Math.round(n * 1000) / 1000;

function normalise([x, y, z]) {
  const m = Math.hypot(x, y, z);
  return [x / m, y / m, z / m];
}

function buildGlobe() {
  const land = [];
  const ocean = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < POINTS; i++) {
    const y = 1 - (i / (POINTS - 1)) * 2;
    const theta = golden * i;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
    const p = projection([lon, lat]);
    if (!p) continue; // back face: discarded, not dimmed (§8.2)
    const nx = (p[0] - CX) / R;
    const ny = (p[1] - CY) / R;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const lambert = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    const limb = nz; // 0 at the edge, 1 facing the viewer
    if (geoContainsLand([lon, lat])) {
      land.push({ x: p[0], y: p[1], a: (0.6 + lambert * 0.4) * (0.35 + 0.65 * limb) });
    } else {
      ocean.push({ x: p[0], y: p[1], a: (0.08 + lambert * 0.12) * (0.4 + 0.6 * limb) });
    }
  }
  return { land, ocean };
}

function geoContainsLand(lonLat) {
  return geoContains(land, lonLat);
}

/* ---- Orbital system (§8.4) -------------------------------------------- */
const RINGS = [
  { k: 1.08, incl: -13 },
  { k: 1.18, incl: -7 },
  { k: 1.28, incl: -1 },
];
const FLAT = 0.32;

/** Position on ring `i` at angle `t` (radians). sin(t) > 0 is the near side. */
function onRing(i, t) {
  const { k, incl } = RINGS[i];
  const rx = R * k;
  const ry = rx * FLAT;
  const ex = rx * Math.cos(t);
  const ey = ry * Math.sin(t);
  const c = Math.cos((incl * Math.PI) / 180);
  const s = Math.sin((incl * Math.PI) / 180);
  return { x: CX + ex * c - ey * s, y: CY + ex * s + ey * c, near: Math.sin(t) > 0 };
}

/* Phases chosen so no node is occluded at rest or sits over the disc, the two
   per ring sit on opposite sides of the Earth, and every label clears its
   neighbour by ≥ 45 units vertically. */
const deg = (d) => (d * Math.PI) / 180;
const NODES = [
  { id: "infrastructure", ring: 2, t: deg(208), en: "Infrastructure", ar: "البنية التحتية" },
  { id: "network", ring: 2, t: deg(-10), en: "Network", ar: "الشبكات" },
  { id: "cloud", ring: 1, t: deg(186), en: "Cloud", ar: "الحوسبة السحابية" },
  { id: "communication", ring: 1, t: deg(28), en: "Communication", ar: "الاتصالات" },
  { id: "security", ring: 0, t: deg(168), en: "Security", ar: "الأمن" },
  { id: "smart", ring: 0, t: deg(4), en: "Smart Technology", ar: "التقنيات الذكية" },
];

const RIYADH = { lonLat: [46.68, 24.71], en: "Riyadh", ar: "الرياض" };

/* ---- SVG assembly ------------------------------------------------------ */

function ringPath(i, from, to, steps = 120) {
  let d = "";
  for (let s = 0; s <= steps; s++) {
    const t = from + ((to - from) * s) / steps;
    const p = onRing(i, t);
    d += `${s === 0 ? "M" : "L"}${r3(p.x)} ${r3(p.y)}`;
  }
  return d;
}

function dotLayer(points, colour, diameter) {
  const STEPS = 24;
  const buckets = new Map();
  for (const p of points) {
    const k = Math.max(1, Math.round(p.a * STEPS));
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(`M${Math.round(p.x)} ${Math.round(p.y)}h0`);
  }
  let g = `<g fill="none" stroke="${colour}" stroke-width="${diameter}" stroke-linecap="round">`;
  for (const k of [...buckets.keys()].sort((a, b) => a - b)) {
    g += `<path stroke-opacity="${a2(k / STEPS)}" d="${buckets.get(k).join("")}"/>`;
  }
  return g + `</g>`;
}

function build(locale) {
  const { land: landPts, ocean } = buildGlobe();
  const out = [];
  const isAr = locale === "ar";

  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-hidden="true">`,
    `<defs>`,
    `<radialGradient id="halo" cx="50%" cy="50%" r="50%">`,
    `<stop offset="0.62" stop-color="${BRAND}" stop-opacity="0"/>`,
    `<stop offset="0.74" stop-color="${BRAND}" stop-opacity="0.07"/>`,
    `<stop offset="0.86" stop-color="${PURPLE}" stop-opacity="0.035"/>`,
    `<stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<radialGradient id="disc" cx="38%" cy="32%" r="75%">`,
    `<stop offset="0" stop-color="#1d1626"/>`,
    `<stop offset="0.7" stop-color="#110d16"/>`,
    `<stop offset="1" stop-color="${INK}"/>`,
    `</radialGradient>`,
    `<radialGradient id="riyadh" cx="50%" cy="50%" r="50%">`,
    `<stop offset="0" stop-color="${BRAND_LIT}" stop-opacity="0.55"/>`,
    `<stop offset="1" stop-color="${BRAND_LIT}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<linearGradient id="link" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0" stop-color="${BRAND_LIT}" stop-opacity="0.55"/>`,
    `<stop offset="1" stop-color="${PURPLE_LIT}" stop-opacity="0.12"/>`,
    `</linearGradient>`,
    `</defs>`,
  );

  // Atmospheric halo — light, not surface.
  out.push(`<circle cx="${CX}" cy="${CY}" r="${r3(R * 1.62)}" fill="url(#halo)"/>`);

  // Far halves of the rings: drawn first so the Earth occludes them.
  RINGS.forEach((_, i) => {
    out.push(
      `<path d="${ringPath(i, Math.PI, 2 * Math.PI)}" fill="none" stroke="${PURPLE_LIT}" stroke-opacity="${0.22 + i * 0.03}" stroke-width="1.4"/>`,
    );
  });

  // Far-side nodes (dimmed to 0.45) and their links, behind the Earth.
  const nodes = NODES.map((n) => ({ ...n, ...onRing(n.ring, n.t) }));
  const linkFor = (n) => {
    const dx = n.x - CX;
    const dy = n.y - CY;
    const d = Math.hypot(dx, dy);
    const reach = d > R ? R : d * 0.82;
    return { x: CX + (dx / d) * reach, y: CY + (dy / d) * reach };
  };
  const drawNode = (n, alpha) => {
    const l = linkFor(n);
    out.push(
      `<line x1="${r3(n.x)}" y1="${r3(n.y)}" x2="${r3(l.x)}" y2="${r3(l.y)}" stroke="${BRAND_LIT}" stroke-opacity="${a2(0.34 * alpha)}" stroke-width="1.2" stroke-dasharray="2 6" stroke-linecap="round"/>`,
      `<circle cx="${r3(n.x)}" cy="${r3(n.y)}" r="16" fill="${BRAND_LIT}" fill-opacity="${a2(0.12 * alpha)}"/>`,
      `<circle cx="${r3(n.x)}" cy="${r3(n.y)}" r="9" fill="none" stroke="${BRAND_LIT}" stroke-opacity="${a2(0.6 * alpha)}" stroke-width="1.4"/>`,
      `<circle cx="${r3(n.x)}" cy="${r3(n.y)}" r="4.2" fill="${BRAND_LIT}" fill-opacity="${a2(alpha)}"/>`,
    );
  };
  nodes.filter((n) => !n.near).forEach((n) => drawNode(n, 0.45));

  // The Earth disc, occluding everything behind it.
  out.push(`<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#disc)"/>`);

  // Ocean then land points. Each dot is a zero-length round-capped stroke,
  // batched into one path per alpha step — a few KB instead of thousands of
  // <circle> elements, with no visible difference at hero size.
  out.push(dotLayer(ocean, "rgb(104,118,156)", 1.9));
  out.push(dotLayer(landPts, "rgb(214,222,244)", 3.6));

  // Terminator rim.
  out.push(`<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${BRAND}" stroke-opacity="0.26" stroke-width="1"/>`);
  out.push(
    `<path d="M${CX - R * 0.94} ${CY - R * 0.34} A${R} ${R} 0 0 1 ${CX + R * 0.2} ${CY - R * 0.98}" fill="none" stroke="${BRAND_LIT}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>`,
  );

  // Riyadh — the sole surface point.
  const [rx, ry] = projection(RIYADH.lonLat);
  out.push(
    `<circle cx="${r3(rx)}" cy="${r3(ry)}" r="38" fill="url(#riyadh)"/>`,
    `<circle cx="${r3(rx)}" cy="${r3(ry)}" r="15" fill="none" stroke="${BRAND_LIT}" stroke-opacity="0.75" stroke-width="1.6"/>`,
    `<circle cx="${r3(rx)}" cy="${r3(ry)}" r="6" fill="${BRAND_LIT}"/>`,
    `<circle cx="${r3(rx)}" cy="${r3(ry)}" r="2.2" fill="#ffffff"/>`,
  );

  // Near halves of the rings, in front of the Earth.
  RINGS.forEach((_, i) => {
    out.push(
      `<path d="${ringPath(i, 0, Math.PI)}" fill="none" stroke="${PURPLE_LIT}" stroke-opacity="${0.38 + i * 0.04}" stroke-width="1.6"/>`,
    );
  });

  // Near-side nodes at full strength.
  nodes.filter((n) => n.near).forEach((n) => drawNode(n, 1));

  // Packets — three in flight, on near-side downlinks only.
  nodes
    .filter((n) => n.near)
    .slice(0, 3)
    .forEach((n, i) => {
      const l = linkFor(n);
      const f = [0.35, 0.55, 0.7][i];
      const px = n.x + (l.x - n.x) * f;
      const py = n.y + (l.y - n.y) * f;
      out.push(
        `<circle cx="${r3(px)}" cy="${r3(py)}" r="7" fill="${BRAND_LIT}" fill-opacity="0.18"/>`,
        `<circle cx="${r3(px)}" cy="${r3(py)}" r="2.6" fill="#ffffff" fill-opacity="0.95"/>`,
      );
    });

  // Labels (§8.5): outward from the Earth, Riyadh never dropped.
  if (locale) {
    const font = isAr
      ? `font-family="Arial, 'Noto Sans Arabic', sans-serif" font-size="31" font-weight="700"`
      : `font-family="ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace" font-size="26" font-weight="700" letter-spacing="4"`;
    // A dark halo behind the glyphs keeps labels legible over land points.
    out.push(`<g ${font} stroke="${INK}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">`);
    for (const n of nodes) {
      const label = isAr ? n.ar : n.en.toUpperCase();
      const op = n.near ? 0.92 : 0.6;
      const dir = isAr ? ' direction="rtl"' : "";
      if (Math.abs(n.x - CX) < R) {
        // In front of the Earth: set beneath the node so it never sits on
        // the Riyadh side of the disc.
        out.push(
          `<text x="${r3(n.x)}" y="${r3(n.y + 50)}" text-anchor="middle" fill="#ffffff" fill-opacity="${op}"${dir}>${label}</text>`,
        );
        continue;
      }
      const right = n.x > CX;
      const x = n.x + (right ? 26 : -26);
      // In an RTL run "start" is the right-hand edge, so the anchors swap.
      const anchor = right !== isAr ? "start" : "end";
      out.push(
        `<text x="${r3(x)}" y="${r3(n.y + 8)}" text-anchor="${anchor}" fill="#ece9ef" fill-opacity="${op}"${dir}>${label}</text>`,
      );
    }
    const rLabel = isAr ? RIYADH.ar : RIYADH.en.toUpperCase();
    out.push(
      `<text x="${r3(rx + 28)}" y="${r3(ry - 22)}" fill="#ffffff" text-anchor="start"${isAr ? ' direction="ltr"' : ""}>${rLabel}</text>`,
      `</g>`,
    );
  }

  out.push(`</svg>`);
  return out.join("") + "\n";
}

await mkdir(OUT_DIR, { recursive: true });
for (const [name, locale] of [
  ["connected-earth.svg", null],
  ["connected-earth-en.svg", "en"],
  ["connected-earth-ar.svg", "ar"],
]) {
  const svg = build(locale);
  await writeFile(path.join(OUT_DIR, name), svg);
  console.log(`  ${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
