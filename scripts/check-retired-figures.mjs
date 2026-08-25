#!/usr/bin/env node
/**
 * Fails if a retired figure reaches user-facing content.
 *
 * Required by design decision L-31 and creative-direction.md §9.3, which does
 * not merely forbid these figures but specifies the mechanism: "Implementation
 * must include a content lint that fails the build if any of them reach a
 * rendered string."
 *
 * The figures were superseded by the approved 2026 set. They still appear on
 * pages 21, 23 and 30 of the source profile deck, so the likely way one reaches
 * the site is somebody copying in good faith from the deck they were handed —
 * which is exactly the failure a comment cannot prevent and a build can.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE RULES COME FROM
 * ---------------------------------------------------------------------------
 * The numeric rules are derived from the `retired` registry already in
 * content/track-record.json rather than restated here. That registry is the one
 * place the project records what has been superseded, and a second hand-kept
 * list would drift from it the first time a figure was retired.
 *
 * Two of the four registry entries have a shape distinctive enough to match on
 * their own — 85+, 20+ and 87. The fourth, a duration of 6, is not: a bare "6"
 * in a sentence means nothing on its own, and matching it would fire on prices,
 * counts and dates. Durations are caught by the phrase rules instead, in both
 * languages, which is how the retired duration is actually written.
 *
 * ---------------------------------------------------------------------------
 * AVOIDING FALSE POSITIVES — the reason this is not a grep
 * ---------------------------------------------------------------------------
 * A naive scan for "20" or "87" across the source tree would fire on Tailwind
 * classes (`gap-20`), arbitrary values (`h-[87px]`), image dimensions, package
 * versions and ids, and would be switched off within a week. So:
 *
 *   · Only user-facing content is scanned — the dictionaries, the data layer
 *     and content/*.json, which is where every rendered string in this
 *     architecture actually lives. Components read from those.
 *   · Comments are stripped before matching. Documentation legitimately names
 *     the retired figures, and must be able to keep doing so.
 *   · In components, class attributes are stripped before the file is read.
 *     Utility classes are the one place bare numbers are dense and meaningless
 *     — `gap-20`, `w-87`, `h-[87px]` — and scanning them produced a real false
 *     positive the first time this was tested. Everything else in a component,
 *     including JSX text and a hard-coded title or alt, is still read.
 *   · The registry itself is exempt. content/track-record.json records the
 *     retired figures on purpose, and src/data/track-record.ts enforces them.
 *
 * An allowlist is provided for the case this is wrong about — see ALLOWLIST.
 *
 * Usage:  npm run check:retired-figures     (also runs inside `npm run check`)
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, "content", "track-record.json");

/**
 * Literal strings that are permitted despite matching a rule.
 *
 * Empty, and should stay that way. If a genuine future string trips this lint,
 * add it here with a comment saying who approved it — do not weaken a rule.
 */
const ALLOWLIST = [];

/** Files that record the retired figures deliberately. */
const EXEMPT = new Set([
  "content/track-record.json",
  "content/track-record.schema.json",
  "src/data/track-record.ts",
]);

/**
 * Prose forms of retired claims, in both languages.
 *
 * These are not derivable from the registry: a duration retired as the number 6
 * is written as "six years" / "ست سنوات", and an establishment year retired as
 * 2020 is written as "since 2020" / "منذ 2020". The approved values are 7 years
 * and 2019, so none of these has a legitimate use.
 */
const PHRASE_RULES = [
  { pattern: /\bsix\s+years\b/i, label: 'the retired duration "six years" (approved: 7)' },
  { pattern: /ست\s+سنوات/, label: 'the retired duration "ست سنوات" (approved: 7)' },
  { pattern: /\bsince\s+2020\b/i, label: 'the retired establishment year 2020 (approved: 2019)' },
  { pattern: /منذ\s+(عام\s+)?2020/, label: 'the retired establishment year 2020 (approved: 2019)' },
  { pattern: /\b(in|from)\s+2020\b/i, label: 'the retired establishment year 2020 (approved: 2019)' },
  { pattern: /عام\s+2020/, label: 'the retired establishment year 2020 (approved: 2019)' },
];

/** Build numeric rules from the registry, skipping shapes too generic to match. */
function numericRules(retired) {
  const rules = [];
  for (const entry of retired) {
    const { value, suffix, note } = entry;
    if (suffix === "+") {
      rules.push({
        pattern: new RegExp(String.raw`\b${value}\s*\+`),
        label: `the retired figure ${value}+ — ${note}`,
      });
    } else if (value >= 10) {
      rules.push({
        pattern: new RegExp(String.raw`\b${value}\b`),
        label: `the retired figure ${value} — ${note}`,
      });
    }
    // A bare single-digit value is not matched numerically; see the header.
  }
  return rules;
}

/* -------------------------------------------------------------------------- */
/* Extracting only what a visitor can read                                     */
/* -------------------------------------------------------------------------- */

/** Strip line and block comments without mangling strings that contain "//". */
function stripComments(source) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (quote) {
      if (c === "\\") { out += c + (next ?? ""); i += 2; continue; }
      if (c === quote) quote = null;
      out += c; i += 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i += 1; continue; }
    if (c === "/" && next === "/") { while (i < source.length && source[i] !== "\n") i += 1; continue; }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) i += 1;
      i += 2; continue;
    }
    out += c; i += 1;
  }
  return out;
}

/** Every quoted literal in a comment-stripped TypeScript source. */
function stringLiterals(source) {
  const found = [];
  for (const m of source.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)) {
    found.push(m[1] ?? m[2] ?? "");
  }
  return found;
}

/**
 * Remove class attributes before anything else looks at a component.
 *
 * Utility classes are the one place in a .tsx file where bare numbers are dense
 * and meaningless — `gap-20`, `w-87`, `h-[87px]`. Scanning them produced a real
 * false positive the first time this lint was tested, which is exactly the kind
 * of noise that gets a check switched off. Stripping the attribute outright is
 * better than trying to tell a class string from a sentence: everything else in
 * the file, including a hard-coded title or alt, is still read.
 */
function stripClassAttributes(source) {
  return source
    .replace(/className\s*=\s*"(?:[^"\\]|\\.)*"/g, 'className=""')
    .replace(/className\s*=\s*\{[^}]*\}/g, "className={}")
    .replace(/\bclass\s*=\s*"(?:[^"\\]|\\.)*"/g, 'class=""');
}

/** JSX text nodes only — never attributes, so class names cannot trigger. */
function jsxText(source) {
  const found = [];
  for (const m of source.matchAll(/>([^<>{}]+)</g)) {
    const text = m[1].trim();
    if (text) found.push(text);
  }
  return found;
}

/** Every string value in a JSON document, minus the keys named in `skipKeys`. */
function jsonStrings(node, skipKeys, acc = []) {
  if (typeof node === "string") acc.push(node);
  else if (Array.isArray(node)) node.forEach((v) => jsonStrings(v, skipKeys, acc));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (skipKeys.has(k)) continue;
      jsonStrings(v, skipKeys, acc);
    }
  }
  return acc;
}

async function walk(dir, filter, acc = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, filter, acc);
    else if (filter(e.name)) acc.push(full);
  }
  return acc;
}

/* -------------------------------------------------------------------------- */

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY, "utf8"));
  const rules = [...numericRules(registry.retired ?? []), ...PHRASE_RULES];

  const targets = [
    ...(await walk(path.join(ROOT, "src", "i18n"), (n) => n.endsWith(".ts"))),
    ...(await walk(path.join(ROOT, "src", "data"), (n) => n.endsWith(".ts"))),
    ...(await walk(path.join(ROOT, "src", "components"), (n) => n.endsWith(".tsx"))),
    ...(await walk(path.join(ROOT, "src", "app"), (n) => n.endsWith(".tsx"))),
    ...(await walk(path.join(ROOT, "content"), (n) => n.endsWith(".json"))),
  ];

  const offences = [];

  for (const file of targets) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    if (EXEMPT.has(rel)) continue;

    const raw = await readFile(file, "utf8");
    let strings;
    if (file.endsWith(".json")) {
      strings = jsonStrings(JSON.parse(raw), new Set(["_readme", "retired", "$schema"]));
    } else {
      const stripped = file.endsWith(".tsx")
        ? stripClassAttributes(stripComments(raw))
        : stripComments(raw);
      strings = [...stringLiterals(stripped), ...(file.endsWith(".tsx") ? jsxText(stripped) : [])];
    }

    for (const text of strings) {
      if (ALLOWLIST.includes(text)) continue;
      for (const rule of rules) {
        if (rule.pattern.test(text)) {
          offences.push({ rel, text: text.length > 96 ? `${text.slice(0, 96)}…` : text, label: rule.label });
        }
      }
    }
  }

  if (offences.length > 0) {
    console.error(`\nRetired figures found in user-facing content:\n`);
    for (const o of offences) {
      console.error(`  ${o.rel}`);
      console.error(`    "${o.text}"`);
      console.error(`    contains ${o.label}\n`);
    }
    console.error(
      `These figures were superseded by the approved 2026 set and must never be\n` +
        `published — see L-31 and creative-direction.md §9.3. The approved values are\n` +
        `200+ projects, 7 years, 2019-2026, 16+ sectors, 100+ venues, and they live in\n` +
        `content/track-record.json.\n\n` +
        `If a string above is legitimate and was approved, add it to ALLOWLIST in\n` +
        `scripts/check-retired-figures.mjs with a note saying who approved it.\n`,
    );
    process.exit(1);
  }

  console.log(
    `No retired figures in user-facing content ` +
      `(${targets.length} files, ${rules.length} rules).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
