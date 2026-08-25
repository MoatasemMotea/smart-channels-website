#!/usr/bin/env node
/**
 * Image pipeline.
 *
 * Converts everything in `source-assets/` into optimised, correctly-sized
 * assets under `public/images/`, and prints ready-to-paste data entries for any
 * file it does not already know about.
 *
 * WHY
 * ---
 * The supplied photographs are 400 KB–2.2 MB JPEGs at full camera resolution.
 * Shipping those directly would dominate Largest Contentful Paint and burn
 * mobile data for no visual gain. Every image here is resized to what the
 * layout actually uses and re-encoded as WebP.
 *
 * WHAT IT PRODUCES
 * ----------------
 *   public/images/logo/        brand lockup and derived icons
 *   public/images/solutions/   curated photography for the Solutions section
 *   public/images/gallery/     anything else dropped into source-assets/
 *   public/images/og/          social share card
 *
 * Usage:  npm run assets:photos
 */

import { mkdir, readdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "source-assets");
const OUT = path.join(ROOT, "public", "images");

/* -------------------------------------------------------------------------- */
/* Curated mapping                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Photographs used to illustrate the Solutions section.
 *
 * IMPORTANT — these are used as *illustrative* imagery for a capability, never
 * captioned as a delivered project. That distinction matters because the
 * provenance of the supplied photographs is mixed: some are Smart Channels'
 * own work and some are stock or vendor imagery, and it has not yet been
 * confirmed which is which. Illustrating "Server Management" with a photo of a
 * server rack asserts nothing about who installed it; putting the same photo in
 * a Projects grid would. Until provenance is confirmed, nothing lands in
 * projects/ or gallery/.
 */
const SOLUTION_IMAGES = {
  "Security.jpg": "security",
  "Wifi.jpg": "wifi",
  "PC.jpg": "computers",
  "Servers.jpg": "servers",
  "Management devices.jpg": "management-devices",
  "Surveillance Cameras.jpg": "surveillance",
  "network communications and cabling.jpg": "network-cabling",
  "data and specialized systems.jpg": "specialised-systems",
  "cwe audio and video solution in eevents.jpg": "audio-video",
};

/** Files that are not photography and are handled separately or ignored. */
const SPECIAL = new Set(["Logo.jpg", "gradient (1).png"]);

/** Solutions cards render at ~640 CSS px max; 1200 covers 2× displays. */
const SOLUTION_WIDTH = 1200;
const GALLERY_WIDTH = 1600;
/** Industry panels are full-bleed on mobile and ~320 CSS px in the desktop grid. */
const INDUSTRY_WIDTH = 1600;
const WEBP_QUALITY = 78;

/**
 * Industry ids, in the same order as src/data/industries.ts.
 *
 * A photograph dropped at `source-assets/industries/<id>.jpg` is converted into
 * `public/images/industries/<id>.webp` and becomes that industry's primary
 * background, replacing the generated fallback panel.
 */
const INDUSTRY_IDS = [
  "sporting-events",
  "stadiums",
  "motorsport",
  "cultural-seasons",
  "government",
  "holy-sites",
  "giga-projects",
  "hospitality",
  "healthcare",
  "education",
  "banking",
  "industrial",
  "transport",
  "diplomatic",
  "retail",
  "media",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function slugify(name) {
  return path
    .basename(name, path.extname(name))
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function ensureDirs() {
  for (const dir of [
    "logo",
    "hero",
    "solutions",
    "industries",
    "projects",
    "gallery",
    "partners",
    "clients",
    "certifications",
    "og",
  ]) {
    await mkdir(path.join(OUT, dir), { recursive: true });
  }
}

/**
 * A 12 px-wide WebP encoded as a data URI, used as Next/Image's `blurDataURL`.
 * Costs ~200 bytes and removes the blank-rectangle flash while a photo decodes.
 */
async function makeBlurDataUrl(input) {
  const buf = await sharp(input)
    .resize(12, null, { fit: "inside" })
    .webp({ quality: 30, alphaQuality: 30 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function convertPhoto(srcFile, destFile, width) {
  const before = (await stat(srcFile)).size;
  const pipeline = sharp(srcFile)
    .rotate() // honour EXIF orientation before resizing
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 5 });

  const { width: w, height: h, size } = await pipeline.toFile(destFile);
  return { before, after: size, width: w, height: h };
}

/* -------------------------------------------------------------------------- */
/* Logo + derived icons                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The supplied brand file is a transparent PNG (despite its .jpg extension) at
 * 200×75. It is never redrawn, recoloured or restructured here — it is only
 * re-encoded, and the brand mark is cropped out of it for use as a favicon,
 * which is a different UI context for the same artwork.
 */
async function buildLogo(report) {
  const src = path.join(SRC, "Logo.jpg");

  const meta = await sharp(src).metadata();
  report.push(
    `  logo source: ${meta.width}×${meta.height} ${meta.format}${meta.hasAlpha ? " (alpha)" : ""}`,
  );

  // 2× the largest rendered size (≈150 CSS px wide), so the header stays crisp
  // on high-DPI screens. Upscaled with lanczos3 — this adds no detail, it only
  // avoids the browser's own scaling artefacts.
  const out = path.join(OUT, "logo", "smart-channels.webp");
  const { size } = await sharp(src)
    .resize({ width: 400, kernel: "lanczos3" })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(out);
  report.push(`  logo/smart-channels.webp        400×150   ${kb(size)}`);

  // PNG alongside WebP: some social and email clients still refuse WebP.
  const outPng = path.join(OUT, "logo", "smart-channels.png");
  const { size: pngSize } = await sharp(src)
    .resize({ width: 400, kernel: "lanczos3" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(outPng);
  report.push(`  logo/smart-channels.png         400×150   ${kb(pngSize)}`);

  // --- Brand mark, cropped from the lockup, for favicons and app icons -----
  // The mark's bounding box is found by locating opaque magenta pixels rather
  // than being hard-coded, so it stays correct if the source file is replaced.
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  // The tagline inside the lockup is magenta too, and sits below the mark. It
  // must be excluded before the bounds are computed, not after — clamping only
  // maxY afterwards still lets tagline pixels widen minX/maxX, which is exactly
  // how an earlier version ended up cropping half the wordmark into the icon.
  const markRegionBottom = Math.round(info.height * 0.62);

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < markRegionBottom; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      if (data[i + 3] < 200) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isBrand = r > 120 && g < 110 && b > 60 && r - g > 60;
      if (!isBrand) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error(
      "Could not locate the brand mark in the logo. If the logo file was replaced, check the colour test above.",
    );
  }

  const markW = maxX - minX + 1;
  const markH = maxY - minY + 1;
  report.push(
    `  brand mark detected at ${minX},${minY} ${markW}×${markH} (searched top ${markRegionBottom}px)`,
  );

  /* Extract exactly the mark's bounding box, then letterbox it onto a square
     transparent canvas. Extracting a square region from the source directly
     would overrun the 75px-tall lockup and clamp back to the full image. */
  const markCrop = await sharp(src)
    .extract({ left: minX, top: minY, width: markW, height: markH })
    .png()
    .toBuffer();

  const square = Math.round(Math.max(markW, markH) * 1.16); // ~8% padding per side
  const markBuf = await sharp({
    create: {
      width: square,
      height: square,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: markCrop,
        left: Math.round((square - markW) / 2),
        top: Math.round((square - markH) / 2),
      },
    ])
    .png()
    .toBuffer();

  const markOut = path.join(OUT, "logo", "mark.webp");
  await sharp(markBuf)
    .resize({ width: 256, kernel: "lanczos3" })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(markOut);
  report.push(`  logo/mark.webp                  256×256`);

  // Favicons. Transparent PNGs so they sit correctly on light and dark
  // browser chrome alike.
  for (const size of [32, 192, 512]) {
    const file = path.join(OUT, "logo", `icon-${size}.png`);
    await sharp(markBuf)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: "lanczos3",
      })
      .png({ compressionLevel: 9 })
      .toFile(file);
    report.push(`  logo/icon-${size}.png`.padEnd(34) + `${size}×${size}`);
  }

  // Apple touch icon needs an opaque background — iOS composites it onto the
  // home screen without one and a transparent mark renders as black.
  await sharp(markBuf)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: "lanczos3",
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "logo", "apple-touch-icon.png"));
  report.push(`  logo/apple-touch-icon.png       180×180   (opaque, iOS)`);

  return markBuf;
}

/* -------------------------------------------------------------------------- */
/* Open Graph card                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Social share card, composed from the brand palette and the real logo.
 *
 * Generated rather than hand-designed so it stays in sync with the brand, and
 * generated at build-prep time rather than per-request so no runtime image
 * rendering is needed in production.
 */
async function buildOgImage(report, markBuf) {
  const W = 1200;
  const H = 630;

  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#17141a"/>
      <stop offset="55%" stop-color="#2a1330"/>
      <stop offset="100%" stop-color="#4b0c39"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="26%" r="60%">
      <stop offset="0%" stop-color="#d9088c" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#d9088c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${Array.from({ length: 14 }, (_, i) => {
    const x = 80 + i * 82;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>`;
  }).join("")}
  ${Array.from({ length: 8 }, (_, i) => {
    const y = 78 + i * 82;
    return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>`;
  }).join("")}
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#d9088c"/>
</svg>`);

  // Text is rendered as SVG using the same Arial stack the site uses.
  const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .kicker { font-family: Arial, Helvetica, sans-serif; font-size: 22px; letter-spacing: 3px; fill: #f04fb0; font-weight: bold; }
    .head   { font-family: Arial, Helvetica, sans-serif; font-size: 62px; fill: #ffffff; font-weight: bold; }
    .tag    { font-family: Arial, Helvetica, sans-serif; font-size: 30px; fill: #d3c9d9; }
  </style>
  <text class="kicker" x="80" y="380">TECHNOLOGY &amp; SYSTEMS INTEGRATION</text>
  <text class="head"   x="80" y="452">Smart Channels</text>
  <text class="tag"    x="80" y="506">we take you to the future</text>
</svg>`);

  /* The brand mark alone, not the full lockup. The lockup's wordmark is dark
     grey and becomes unreadable on this dark panel — and the company name is
     already set in white type below, so the lockup would only repeat it. */
  const mark = await sharp(markBuf)
    .resize({ width: 132, kernel: "lanczos3" })
    .png()
    .toBuffer();

  const out = path.join(OUT, "og", "share-card.png");
  const { size } = await sharp(background)
    .composite([
      { input: mark, left: 80, top: 92 },
      { input: text, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);

  report.push(`  og/share-card.png              1200×630  ${kb(size)}`);
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main() {
  await ensureDirs();

  let entries;
  try {
    entries = await readdir(SRC);
  } catch {
    console.error(
      `source-assets/ not found. Put original images there and re-run.\nExpected: ${SRC}`,
    );
    process.exit(1);
  }

  const report = [];
  const generated = [];
  let totalBefore = 0;
  let totalAfter = 0;

  console.log("\nBrand assets");
  const markBuf = await buildLogo(report);
  await buildOgImage(report, markBuf);
  console.log(report.join("\n"));

  console.log("\nSolution photography");
  for (const [file, slug] of Object.entries(SOLUTION_IMAGES)) {
    const srcFile = path.join(SRC, file);
    try {
      await stat(srcFile);
    } catch {
      console.log(`  ${file} — not found, skipped`);
      continue;
    }
    const destFile = path.join(OUT, "solutions", `${slug}.webp`);
    const r = await convertPhoto(srcFile, destFile, SOLUTION_WIDTH);
    totalBefore += r.before;
    totalAfter += r.after;
    console.log(
      `  ${slug.padEnd(22)} ${String(r.width).padStart(4)}×${String(r.height).padEnd(4)} ` +
        `${kb(r.before).padStart(8)} → ${kb(r.after).padStart(7)}  ` +
        `(-${Math.round((1 - r.after / r.before) * 100)}%)`,
    );
  }

  /* --- Industry photography ---------------------------------------------
     Photographs are the intended primary imagery for the Industries section;
     the generated SVG panels are only a fallback. Anything found here replaces
     the fallback for that industry. */
  const industryEntries = [];
  const industrySrcDir = path.join(SRC, "industries");
  let industryFiles = [];
  try {
    industryFiles = await readdir(industrySrcDir);
  } catch {
    /* directory absent — no industry photography supplied yet */
  }

  const industryPhotos = industryFiles.filter((f) =>
    /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f),
  );

  if (industryPhotos.length > 0) {
    console.log("\nIndustry photography");
    for (const file of industryPhotos) {
      const id = path.basename(file, path.extname(file));
      if (!INDUSTRY_IDS.includes(id)) {
        console.log(
          `  ${file} — skipped: "${id}" is not a known industry id.\n` +
            `      Expected one of: ${INDUSTRY_IDS.join(", ")}`,
        );
        continue;
      }
      const srcFile = path.join(industrySrcDir, file);
      const destFile = path.join(OUT, "industries", `${id}.webp`);
      const r = await convertPhoto(srcFile, destFile, INDUSTRY_WIDTH);
      totalBefore += r.before;
      totalAfter += r.after;
      const blur = await makeBlurDataUrl(srcFile);
      industryEntries.push({ id, width: r.width, height: r.height, blur });

      const ratio = r.width / r.height;
      const ratioWarning =
        Math.abs(ratio - 1.6) > 0.25
          ? `  ⚠ aspect ${ratio.toFixed(2)}:1 — panels crop to 16:11, check framing`
          : "";
      console.log(
        `  ${id.padEnd(20)} ${String(r.width).padStart(4)}×${String(r.height).padEnd(4)} ` +
          `${kb(r.before).padStart(8)} → ${kb(r.after).padStart(7)}${ratioWarning}`,
      );
    }

    const missing = INDUSTRY_IDS.filter(
      (id) => !industryEntries.some((e) => e.id === id),
    );
    console.log(
      `\n  ${industryEntries.length}/${INDUSTRY_IDS.length} industries have photography.` +
        (missing.length > 0 ? `\n  Still on fallback art: ${missing.join(", ")}` : ""),
    );
  }

  /* Anything not curated and not special becomes a gallery candidate. The
     script prints a paste-ready entry for each, so adding images later is a
     copy-paste job rather than a hand-authored data structure. */
  const leftovers = entries.filter(
    (f) =>
      !SPECIAL.has(f) &&
      !(f in SOLUTION_IMAGES) &&
      /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f),
  );

  if (leftovers.length > 0) {
    console.log("\nGallery candidates");
    for (const file of leftovers) {
      const slug = slugify(file);
      const srcFile = path.join(SRC, file);
      const destFile = path.join(OUT, "gallery", `${slug}.webp`);
      const r = await convertPhoto(srcFile, destFile, GALLERY_WIDTH);
      totalBefore += r.before;
      totalAfter += r.after;
      const blur = await makeBlurDataUrl(srcFile);
      generated.push({ slug, width: r.width, height: r.height, blur, source: file });
      console.log(
        `  ${slug.padEnd(34)} ${String(r.width).padStart(4)}×${String(r.height).padEnd(4)} ` +
          `${kb(r.before).padStart(8)} → ${kb(r.after).padStart(7)}`,
      );
    }
  }

  if (totalBefore > 0) {
    console.log(
      `\nTotal: ${kb(totalBefore)} → ${kb(totalAfter)} ` +
        `(-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`,
    );
  }

  /* Paste-ready industry photo blocks. */
  if (industryEntries.length > 0) {
    const snippet = industryEntries
      .map(
        (g) => `// ${g.id} — paste into that entry in src/data/industries.ts
    photo: {
      src: "/images/industries/${g.id}.webp",
      width: ${g.width},
      height: ${g.height},
      blurDataURL: ${JSON.stringify(g.blur)},
    },`,
      )
      .join("\n\n");

    const outFile = path.join(ROOT, "scripts", "generated-industry-photos.txt");
    await writeFile(
      outFile,
      `// Generated by npm run assets:photos on ${new Date().toISOString()}\n` +
        `// Paste each block into the matching industry in src/data/industries.ts,\n` +
        `// alongside its existing \`art:\` line. Once \`photo\` is present it is used\n` +
        `// in preference to the generated fallback panel automatically.\n\n${snippet}\n`,
      "utf8",
    );
    console.log(
      `\nPaste-ready industry photo blocks written to scripts/generated-industry-photos.txt`,
    );
  }

  /* Paste-ready data entries. */
  if (generated.length > 0) {
    const snippet = generated
      .map(
        (g) => `  {
    id: ${JSON.stringify(g.slug)},
    image: {
      src: "/images/gallery/${g.slug}.webp",
      width: ${g.width},
      height: ${g.height},
      blurDataURL: ${JSON.stringify(g.blur)},
      alt: {
        en: "TODO — describe this image in English",
        ar: "TODO — صف هذه الصورة بالعربية",
      },
    },
  },`,
      )
      .join("\n");

    const outFile = path.join(ROOT, "scripts", "generated-gallery-entries.txt");
    await writeFile(
      outFile,
      `// Generated by npm run assets:photos on ${new Date().toISOString()}\n` +
        `// Paste the entries you want into the \`items\` array in src/data/gallery.ts,\n` +
        `// replace the TODO alt text, and set that file's \`status\` to "published".\n` +
        `// Images whose provenance is not confirmed as Smart Channels' own work\n` +
        `// should NOT be added to the gallery.\n\n${snippet}\n`,
      "utf8",
    );

    console.log(
      `\n${generated.length} gallery candidate(s) converted.\n` +
        `Paste-ready entries written to scripts/generated-gallery-entries.txt\n` +
        `Nothing is published until you add entries to src/data/gallery.ts.`,
    );
  }

  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
