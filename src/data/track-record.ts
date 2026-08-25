import manifest from "../../content/track-record.json";
import type { Localized } from "@/types/content";

/**
 * Track record — loaded from content/track-record.json, never authored here.
 *
 * ---------------------------------------------------------------------------
 * ONE SOURCE, AND IT IS NOT A SOURCE FILE
 * ---------------------------------------------------------------------------
 * Every headline figure on the site comes from that manifest and from nowhere
 * else. No number is repeated in a component, a stylesheet or a translation
 * file — the dictionaries hold labels only, and the attribution line under the
 * figures is composed from the manifest's own publication name.
 *
 * Updating a figure when a new profile is approved is a three-line edit to a
 * JSON file: the value, the year it is true as of, and the publication it came
 * from. Nothing under src/ changes. That is deliberate — these numbers will
 * change annually and for years, and whoever updates them should not have to
 * be able to edit TypeScript safely.
 *
 * ---------------------------------------------------------------------------
 * QUOTED, NEVER DERIVED
 * ---------------------------------------------------------------------------
 * An earlier build counted two of the four from src/data/services.ts and
 * src/data/industries.ts. That looked rigorous and was not: a count of what
 * happens to be published on the site is a different claim from the company's
 * own record, and the two drifted apart the moment either file was edited.
 * There is no code path here that computes a figure.
 *
 * ---------------------------------------------------------------------------
 * RETIRED FIGURES ARE ENFORCED, NOT DOCUMENTED
 * ---------------------------------------------------------------------------
 * 85+, 87, 6 years and 20+ have each appeared in an earlier draft and been
 * superseded. They are listed in the manifest and checked on import: publishing
 * one in the slot it was wrong in fails the build with the reason. A comment
 * saying "do not use these" does not stop anyone; a build failure does.
 *
 * The check is scoped by `retiredIn` rather than blanket-banning the values,
 * which matters for one of them. 20+ was a wrong *sector* count in 2026, but
 * sectors served could genuinely reach 20+ in a later profile — so a figure is
 * only rejected when its `asOf` is not newer than the year the old one was
 * retired. A future edition stating 20+ passes; re-pasting the 2026 mistake
 * does not.
 * ---------------------------------------------------------------------------
 */

export type TrackRecordStatId = "projects" | "years" | "sectors" | "venues";

export interface TrackRecordStat {
  /** Key into the dictionary's trackRecord.stats, and a stable DOM id. */
  readonly id: TrackRecordStatId;
  /** The number the counter animates to. */
  readonly value: number;
  /** Rendered immediately after the value. The "+" is the profile's, not ours. */
  readonly suffix: string;
  /** Calendar year the figure was stated as true. */
  readonly asOf: number;
}

const STAT_IDS = ["projects", "years", "sectors", "venues"] as const;

function fail(where: string, message: string): never {
  throw new Error(
    `content/track-record.json — ${where}: ${message}\n` +
      `See src/data/track-record.ts for the contract, and L-41's neighbours in ` +
      `docs/design-decisions.md for why these figures are governed this closely.`,
  );
}

function readLocalized(value: unknown, field: string): Localized {
  if (typeof value !== "object" || value === null) {
    fail(field, `must be an object with "en" and "ar".`);
  }
  const record = value as Record<string, unknown>;
  const en = record["en"];
  const ar = record["ar"];
  if (typeof en !== "string" || en.length === 0) fail(field, `"en" is missing or empty.`);
  if (typeof ar !== "string" || ar.length === 0) fail(field, `"ar" is missing or empty.`);
  return { en, ar };
}

interface RetiredFigure {
  readonly id: string;
  readonly value: number;
  readonly suffix: string;
  readonly retiredIn: number;
  readonly note: string;
}

function readRetired(raw: unknown, index: number): RetiredFigure {
  const at = `retired[${index}]`;
  if (typeof raw !== "object" || raw === null) fail(at, "must be an object.");
  const r = raw as Record<string, unknown>;
  const id = r["id"];
  const value = r["value"];
  const suffix = r["suffix"];
  const retiredIn = r["retiredIn"];
  const note = r["note"];
  if (typeof id !== "string") fail(at, `"id" must be a string.`);
  if (typeof value !== "number") fail(at, `"value" must be a number.`);
  if (suffix !== "" && suffix !== "+") fail(at, `"suffix" must be "" or "+".`);
  if (typeof retiredIn !== "number") fail(at, `"retiredIn" must be a year.`);
  if (typeof note !== "string" || note.length === 0) {
    fail(at, `"note" must say why the figure was retired — it is the message a future editor reads.`);
  }
  return { id, value, suffix, retiredIn, note };
}

function readStat(raw: unknown, index: number, retired: readonly RetiredFigure[]): TrackRecordStat {
  const at = `stats[${index}]`;
  if (typeof raw !== "object" || raw === null) fail(at, "must be an object.");
  const r = raw as Record<string, unknown>;

  const id = r["id"];
  if (typeof id !== "string" || !(STAT_IDS as readonly string[]).includes(id)) {
    fail(at, `"id" must be one of: ${STAT_IDS.join(", ")}. Each needs a label in both dictionaries under trackRecord.stats.`);
  }
  const where = `stats[${index}] (${id})`;

  const value = r["value"];
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    fail(where, `"value" must be a non-negative whole number.`);
  }

  const suffix = r["suffix"];
  if (suffix !== "" && suffix !== "+") {
    fail(where, `"suffix" must be "" or "+". The "+" is the profile's own and must be preserved where the profile uses it.`);
  }

  const asOf = r["asOf"];
  if (typeof asOf !== "number" || !Number.isInteger(asOf)) {
    fail(where, `"asOf" must be the year the profile states this figure as true. A figure without the year it was true is a figure that quietly becomes false.`);
  }

  const clash = retired.find(
    (old) => old.id === id && old.value === value && old.suffix === suffix && asOf <= old.retiredIn,
  );
  if (clash) {
    fail(
      where,
      `${value}${suffix} is a RETIRED figure. ${clash.note}\n` +
        `  It was retired in ${clash.retiredIn} and this entry is asOf ${asOf}.\n` +
        `  If a profile newer than ${clash.retiredIn} genuinely states ${value}${suffix}, ` +
        `set asOf to that later year and it will be accepted.`,
    );
  }

  return { id: id as TrackRecordStatId, value, suffix, asOf };
}

function load() {
  const retired = Array.isArray(manifest.retired)
    ? (manifest.retired as unknown[]).map(readRetired)
    : [];

  if (!Array.isArray(manifest.stats) || manifest.stats.length === 0) {
    fail("stats", "must be a non-empty array.");
  }
  const stats = (manifest.stats as unknown[]).map((raw, i) => readStat(raw, i, retired));

  const seen = new Set<string>();
  for (const stat of stats) {
    if (seen.has(stat.id)) fail(`stats (${stat.id})`, "duplicate id.");
    seen.add(stat.id);
  }

  const publication = readLocalized(manifest.publication, "publication");
  const publicationYear = manifest.publicationYear;
  if (typeof publicationYear !== "number" || !Number.isInteger(publicationYear)) {
    fail("publicationYear", "must be the edition year, as a whole number.");
  }

  return { stats, publication, publicationYear, retired };
}

const loaded = load();

export const trackRecordStats: readonly TrackRecordStat[] = loaded.stats;

/** The publication every figure is quoted from, named on the page. */
export const trackRecordPublication: Localized = loaded.publication;

/** Figures that must never reappear. Exported so tooling can assert on them. */
export const retiredFigures = loaded.retired;

/**
 * The latest year any published figure is true as of.
 *
 * Read rather than assumed: if one figure is updated from a newer profile
 * before the others, the attribution should say so instead of continuing to
 * claim the old edition covers all four.
 */
export function trackRecordAsOf(): number {
  return loaded.stats.reduce((latest, stat) => Math.max(latest, stat.asOf), 0);
}
