#!/usr/bin/env node
/**
 * Gallery ingest — the "Upload" step of the gallery workflow.
 *
 *     Upload  →  Categorize  →  Add metadata  →  Publish  →  site updates
 *     ^^^^^^     ------------ you, in content/gallery.json ------------
 *
 * WHAT IT DOES
 * ------------
 * For every image in `source-assets/gallery/` that is not already in the
 * manifest, this script:
 *
 *   1. converts it to WebP at the widths the layout actually requests, under
 *      public/images/gallery/,
 *   2. measures the real pixel dimensions,
 *   3. generates a tiny inline blur placeholder so tiles do not pop in,
 *   4. appends a metadata stub to content/gallery.json with `published: false`.
 *
 * Then you fill in the stub — category, technology, captions and alt text in
 * both languages, and whichever of project / industry / location / date apply
 * — and flip `published` to true. Nothing under src/ is edited at any point,
 * and nothing appears on the site until you publish it.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * --------------------------------
 * It does not invent captions, guess a category from a filename, or infer a
 * project from a folder name. A caption is a factual claim about work Smart
 * Channels delivered; a machine guessing at one is precisely the failure mode
 * this project has been careful to avoid. Stubs are left blank so that an
 * unfilled one is obvious, and the build refuses a half-filled published item.
 *
 * It is also idempotent: an image already present in the manifest is skipped,
 * so re-running after adding one file will not disturb the metadata you have
 * already written for the others.
 *
 * Usage:  npm run gallery:ingest
 *         npm run gallery:ingest -- --check   (report only, write nothing)
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "source-assets", "gallery");
const OUT = path.join(ROOT, "public", "images", "gallery");
const MANIFEST = path.join(ROOT, "content", "gallery.json");

/** Widths the gallery grid and lightbox actually request. */
const WIDTHS = [640, 1024, 1600];
const PRIMARY_WIDTH = 1600;

const checkOnly = process.argv.includes("--check");

/** "Network Closet 01.JPG" → "network-closet-01" */
function slug(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  await mkdir(SRC, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  const known = new Set(manifest.items.map((item) => item.id));

  const files = (await readdir(SRC))
    .filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log(`No images in source-assets/gallery/. Drop photographs there and re-run.`);
    return;
  }

  const added = [];
  let maxSort = manifest.items.reduce((max, item) => Math.max(max, item.sortOrder), 0);

  for (const file of files) {
    const id = slug(file);
    if (known.has(id)) {
      console.log(`  skip   ${id}  (already in the manifest)`);
      continue;
    }

    const input = path.join(SRC, file);
    const image = sharp(input).rotate();
    const meta = await image.metadata();
    if (!meta.width || !meta.height) {
      console.error(`  ERROR  ${file}: could not read dimensions; skipping.`);
      continue;
    }

    // Never upscale: a 900px original stays 900px rather than being stretched
    // to 1600 and shipped as if it had the detail.
    const widths = WIDTHS.filter((w) => w <= meta.width);
    if (widths.length === 0) widths.push(meta.width);
    const primary = Math.min(PRIMARY_WIDTH, meta.width);

    if (!checkOnly) {
      for (const width of widths) {
        await sharp(input)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(path.join(OUT, width === primary ? `${id}.webp` : `${id}-${width}.webp`));
      }
    }

    const blur = await sharp(input)
      .rotate()
      .resize({ width: 16 })
      .webp({ quality: 40 })
      .toBuffer();

    const height = Math.round((meta.height / meta.width) * primary);

    added.push({
      id,
      image: {
        src: `/images/gallery/${id}.webp`,
        width: primary,
        height,
        alt: { en: "", ar: "" },
        blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      },
      category: "",
      technology: [],
      caption: { en: "", ar: "" },
      featured: false,
      sortOrder: ++maxSort,
      published: false,
    });

    console.log(`  add    ${id}  ${primary}×${height}  (${widths.length} widths)`);
  }

  if (added.length === 0) {
    console.log(`\nNothing new. The manifest already describes every image in source-assets/gallery/.`);
    return;
  }

  if (checkOnly) {
    console.log(`\n--check: ${added.length} image(s) would be added. Nothing written.`);
    return;
  }

  manifest.items.push(...added);
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`\n${added.length} stub(s) appended to content/gallery.json.`);
  console.log(`\nNext, for each new entry:`);
  console.log(`  · "category"   one of the values listed in the file's _readme`);
  console.log(`  · "technology" zero or more of the same list`);
  console.log(`  · "caption"    English and Arabic — what the photograph shows`);
  console.log(`  · "image.alt"  English and Arabic — what a screen reader should hear`);
  console.log(`  · optionally   project, industry, location, date`);
  console.log(`  · "published"  set to true when the entry is complete`);
  console.log(`\nThe build validates every published entry and names the field if one is wrong.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
