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
 * - Three flattened orbital rings carrying six nodes — Smart Channels' core
 *   services (client brief, 2026-11-07; supersedes the L-05 labels).
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
// W, CX and SIDE vary per output (see `frame()` below); H, CY and R do not.
let W = 1600;
const H = 1200;
let CX = 800;
const CY = 610;
/** +1: services stacked on the right (LTR). −1: mirrored for RTL. */
let SIDE = 1;
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
let projection;

function frame(width, cx, side) {
  W = width;
  CX = cx;
  SIDE = side;
  projection = geoOrthographic()
    .rotate([-46, -18, 0])
    .scale(R)
    .translate([CX, CY])
    .clipAngle(90);
}

const land = feature(land110, land110.objects.land);

// Light from upper-left-front, in view space.
const LIGHT = normalise([-0.45, -0.55, 0.7]);

const r3 = (n) => Math.round(n * 10) / 10;
const a2 = (n) => Math.round(n * 1000) / 1000;

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

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
  // RTL mirrors the whole orbital system, tilt included, so the nodes stay
  // on their rings rather than being flipped off them.
  const c = Math.cos((incl * SIDE * Math.PI) / 180);
  const s = Math.sin((incl * SIDE * Math.PI) / 180);
  const mx = ex * SIDE;
  return { x: CX + mx * c - ey * s, y: CY + mx * s + ey * c, near: Math.sin(t) > 0 };
}

/* The six core services, as confirmed by the client (2026-11-07). Each label
   is set on two lines so the stack stays narrow enough to clear the reading
   column. Phases were solved numerically: two nodes per ring, all on the
   outward side, none occluded at rest, minimum spacing between nodes
   maximised (≈ 93 units). */
const deg = (d) => (d * Math.PI) / 180;
const NODES = [
  { id: "networks", ring: 1, t: deg(-30), en: ["Networks &", "Data Centres"], ar: ["الشبكات", "ومراكز البيانات"] },
  { id: "cyber", ring: 1, t: deg(-2), en: ["Cyber", "Security"], ar: ["الأمن", "السيبراني"] },
  { id: "cctv", ring: 0, t: deg(28), en: ["CCTV", "Surveillance"], ar: ["كاميرات", "المراقبة"] },
  { id: "radio", ring: 0, t: deg(48), en: ["Two-Way", "Radio"], ar: ["أجهزة", "الراديو"] },
  { id: "access", ring: 2, t: deg(24), en: ["Access Control &", "Smart Buildings"], ar: ["أنظمة الدخول", "والمباني الذكية"] },
  { id: "events", ring: 2, t: deg(46), en: ["Event Screens", "& AV Systems"], ar: ["شاشات وتجهيزات", "الفعاليات"] },
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

  // Labels (§8.5): a stacked column on the outward side, each joined to its
  // node by a hairline leader. Riyadh's label sits beside its point.
  if (locale) {
    const font = isAr
      ? `font-family="Arial, 'Noto Sans Arabic', sans-serif" font-size="35" font-weight="700"`
      : `font-family="ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace" font-size="28" font-weight="700" letter-spacing="3"`;
    const LX = CX + SIDE * 610; // column edge, just past the outer ring
    const ROWS = [-240, -144, -48, 48, 144, 240];
    const sorted = [...nodes].sort((a, b) => a.y - b.y);
    const anchor = SIDE > 0 !== isAr ? "start" : "end";

    out.push(`<g fill="none" stroke="${PURPLE_LIT}" stroke-opacity="0.45" stroke-width="1.2">`);
    sorted.forEach((n, i) => {
      const ry = CY + ROWS[i];
      const elbow = LX - SIDE * 64;
      out.push(
        `<path d="M${r3(n.x + SIDE * 12)} ${r3(n.y)}H${r3(elbow)}L${r3(LX - SIDE * 18)} ${r3(ry)}"/>`,
      );
    });
    out.push(`</g>`);

    out.push(`<g ${font} stroke="${INK}" stroke-width="7" stroke-linejoin="round" paint-order="stroke">`);
    sorted.forEach((n, i) => {
      const ry = CY + ROWS[i];
      const [l1, l2] = (isAr ? n.ar : n.en.map((t) => t.toUpperCase())).map(esc);
      const dir = isAr ? ' direction="rtl"' : "";
      out.push(
        `<circle cx="${r3(LX - SIDE * 18)}" cy="${r3(ry)}" r="3" fill="${BRAND_LIT}" stroke="none"/>`,
        `<text x="${r3(LX)}" y="${r3(ry - 6)}" text-anchor="${anchor}" fill="#ffffff"${dir}>${l1}</text>`,
        `<text x="${r3(LX)}" y="${r3(ry + (isAr ? 34 : 29))}" text-anchor="${anchor}" fill="#c9c2d0"${dir}>${l2}</text>`,
      );
    });
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
for (const [name, locale, width, cx, side] of [
  // Mobile horizon: centred, no labels, 1600 × 1200 (Hero.tsx relies on this).
  ["connected-earth.svg", null, 1600, 800, 1],
  // Desktop: the Earth sits toward the type, the service column outward.
  ["connected-earth-en.svg", "en", 1700, 620, 1],
  ["connected-earth-ar.svg", "ar", 1700, 1080, -1],
]) {
  frame(width, cx, side);
  const svg = build(locale);
  await writeFile(path.join(OUT_DIR, name), svg);
  console.log(`  ${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
