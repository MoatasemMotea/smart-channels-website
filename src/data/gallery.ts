import manifest from "../../content/gallery.json";
import type {
  Collection,
  ContentStatus,
  GalleryCategory,
  GalleryItem,
  GalleryTechnology,
  Localized,
} from "@/types/content";

/**
 * Gallery — loaded from content/gallery.json, never authored here.
 *
 * ---------------------------------------------------------------------------
 * WHY A MANIFEST AND NOT A .ts FILE
 * ---------------------------------------------------------------------------
 * Photographs are added to this site periodically and indefinitely, by whoever
 * has the photographs — not necessarily by whoever can safely edit TypeScript.
 * Holding the content in a JSON manifest means the routine job is
 *
 *     drop the file → npm run gallery:ingest → fill in the metadata → publish
 *
 * and no file under src/ is touched. The grid, the lightbox, the filters and
 * the ordering all derive from whatever the manifest contains, so a new
 * photograph, a new category of photograph, or a hundred new photographs are
 * the same amount of work: none.
 *
 * ---------------------------------------------------------------------------
 * WHY IT IS VALIDATED AT BUILD TIME
 * ---------------------------------------------------------------------------
 * A hand-edited JSON file will eventually contain a typo, and the failure modes
 * of *not* checking are all bad and all silent: a mistyped category quietly
 * creates a filter nobody clicks; a missing Arabic caption renders an empty
 * string to an Arabic reader; a bad image path renders a broken tile.
 *
 * So the manifest is checked here, on import, and a violation throws with the
 * item id and the field name. Because this module is imported by a server
 * component, that happens during `next build` — a content mistake fails the
 * build with a precise message instead of reaching a visitor. The check is
 * hand-written rather than schema-library-driven so it adds nothing to the
 * client bundle.
 * ---------------------------------------------------------------------------
 */

const CATEGORIES = [
  "infrastructure",
  "networks",
  "security",
  "audio-visual",
  "communications",
  "end-user-computing",
  "specialised-systems",
] as const satisfies readonly GalleryCategory[];

const TECHNOLOGIES = [
  "structured-cabling",
  "fibre-optics",
  "wireless",
  "surveillance",
  "access-control",
  "servers",
  "storage-backup",
  "firewall",
  "unified-communications",
  "display-systems",
  "point-of-sale",
  "printing",
] as const satisfies readonly GalleryTechnology[];

/** Everything the filter UI needs to offer, derived rather than restated. */
export const galleryCategories: readonly GalleryCategory[] = CATEGORIES;
export const galleryTechnologies: readonly GalleryTechnology[] = TECHNOLOGIES;

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}(-\d{2}){0,2}$/;

function fail(where: string, message: string): never {
  throw new Error(
    `content/gallery.json — ${where}: ${message}\n` +
      `See src/types/content.ts (GalleryItem) for the full contract.`,
  );
}

function readLocalized(value: unknown, where: string, field: string): Localized {
  if (typeof value !== "object" || value === null) {
    fail(where, `"${field}" must be an object with "en" and "ar".`);
  }
  const record = value as Record<string, unknown>;
  const en = record["en"];
  const ar = record["ar"];
  if (typeof en !== "string" || en.length === 0) {
    fail(where, `"${field}.en" is missing or empty.`);
  }
  if (typeof ar !== "string" || ar.length === 0) {
    fail(
      where,
      `"${field}.ar" is missing or empty. Both languages are required — a ` +
        `gallery captioned only in English reads as an afterthought to an ` +
        `Arabic-speaking visitor.`,
    );
  }
  return { en, ar };
}

function readOptionalLocalized(
  value: unknown,
  where: string,
  field: string,
): Localized | undefined {
  return value === undefined ? undefined : readLocalized(value, where, field);
}

function readItem(raw: unknown, index: number): GalleryItem {
  const where = `items[${index}]`;
  if (typeof raw !== "object" || raw === null) fail(where, "must be an object.");
  const r = raw as Record<string, unknown>;

  const id = r["id"];
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    fail(where, `"id" must be a lower-case slug, e.g. "riyadh-network-closet".`);
  }
  const at = `items[${index}] (${id})`;

  /* ---- image ---- */
  const image = r["image"];
  if (typeof image !== "object" || image === null) fail(at, `"image" is required.`);
  const img = image as Record<string, unknown>;
  const src = img["src"];
  const width = img["width"];
  const height = img["height"];
  if (typeof src !== "string" || !src.startsWith("/images/gallery/")) {
    fail(at, `"image.src" must be a path under /images/gallery/. Run \`npm run gallery:ingest\`.`);
  }
  if (typeof width !== "number" || typeof height !== "number" || width < 1 || height < 1) {
    fail(
      at,
      `"image.width" and "image.height" must be the real pixel dimensions. ` +
        `They reserve layout space, so a wrong value is a visible layout shift.`,
    );
  }
  const blurDataURL = img["blurDataURL"];
  if (blurDataURL !== undefined && typeof blurDataURL !== "string") {
    fail(at, `"image.blurDataURL" must be a string if present.`);
  }

  /* ---- taxonomy ---- */
  const category = r["category"];
  if (typeof category !== "string" || !(CATEGORIES as readonly string[]).includes(category)) {
    fail(at, `"category" must be one of: ${CATEGORIES.join(", ")}.`);
  }

  const technologyRaw = r["technology"];
  if (!Array.isArray(technologyRaw)) {
    fail(at, `"technology" must be an array (use [] if none apply).`);
  }
  for (const t of technologyRaw) {
    if (typeof t !== "string" || !(TECHNOLOGIES as readonly string[]).includes(t)) {
      fail(at, `"technology" contains ${JSON.stringify(t)}; allowed: ${TECHNOLOGIES.join(", ")}.`);
    }
  }

  /* ---- optional relations ---- */
  const project = r["project"];
  if (project !== undefined && typeof project !== "string") {
    fail(at, `"project" must be a project id string if present.`);
  }
  const industry = r["industry"];
  if (industry !== undefined && typeof industry !== "string") {
    fail(at, `"industry" must be an industry id string if present.`);
  }
  const date = r["date"];
  if (date !== undefined && (typeof date !== "string" || !DATE_PATTERN.test(date))) {
    fail(at, `"date" must be YYYY, YYYY-MM or YYYY-MM-DD.`);
  }

  /* ---- presentation ---- */
  const featured = r["featured"];
  const sortOrder = r["sortOrder"];
  const published = r["published"];
  if (typeof featured !== "boolean") fail(at, `"featured" must be true or false.`);
  if (typeof sortOrder !== "number") fail(at, `"sortOrder" must be a number.`);
  if (typeof published !== "boolean") fail(at, `"published" must be true or false.`);

  return {
    id,
    image: {
      src,
      width,
      height,
      alt: readLocalized(img["alt"], at, "image.alt"),
      ...(blurDataURL === undefined ? {} : { blurDataURL }),
    },
    ...(project === undefined ? {} : { project }),
    category: category as GalleryCategory,
    ...(industry === undefined ? {} : { industry }),
    technology: technologyRaw as readonly GalleryTechnology[],
    ...(() => {
      const location = readOptionalLocalized(r["location"], at, "location");
      return location === undefined ? {} : { location };
    })(),
    ...(date === undefined ? {} : { date }),
    caption: readLocalized(r["caption"], at, "caption"),
    featured,
    sortOrder,
    published,
  };
}

/**
 * Total ordering.
 *
 * sortOrder first, then most recent, then id. The id tiebreak is what makes the
 * order *total*: without it two items sharing a sortOrder and a date would come
 * out in whatever order the JSON keys happened to be written, which is stable
 * on one machine and not on another.
 */
function compare(a: GalleryItem, b: GalleryItem): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const dateA = a.date ?? "";
  const dateB = b.date ?? "";
  if (dateA !== dateB) return dateB.localeCompare(dateA);
  return a.id.localeCompare(b.id);
}

function load(): Collection<GalleryItem> {
  const status = manifest.status;
  if (status !== "published" && status !== "pending") {
    fail("status", `must be "published" or "pending".`);
  }

  const items = (manifest.items as unknown[]).map(readItem);

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      fail(`items (${item.id})`, `duplicate id. Ids are used as deep-link fragments.`);
    }
    seen.add(item.id);
  }

  return {
    status: status as ContentStatus,
    items: items.filter((item) => item.published).sort(compare),
    ...(manifest.pendingNote ? { pendingNote: manifest.pendingNote } : {}),
  };
}

export const gallery: Collection<GalleryItem> = load();

/** The subset promoted to the homepage preview strip. */
export function featuredGallery(limit = 6): readonly GalleryItem[] {
  return gallery.items.filter((item) => item.featured).slice(0, limit);
}

/** Categories that actually have published photographs, for the filter UI. */
export function activeGalleryCategories(): readonly GalleryCategory[] {
  const present = new Set(gallery.items.map((item) => item.category));
  return CATEGORIES.filter((category) => present.has(category));
}
