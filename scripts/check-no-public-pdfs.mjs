#!/usr/bin/env node
/**
 * Fails if any PDF is present under public/.
 *
 * The Company Profile PDFs are internal source material (L-41). `.gitignore`
 * stops one being committed, but a file can reach a deploy directory without
 * ever going through git — copied in by hand, produced by a script, restored
 * from a backup. This is the check that catches that case, and it runs as part
 * of `npm run check`.
 *
 * Deliberately blunt: any PDF, anywhere under public/, is a failure. A rule
 * with exceptions is a rule someone eventually argues their way around, and
 * this site has no legitimate use for a public PDF.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

async function walk(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found; // no public/ at all is fine
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else if (entry.name.toLowerCase().endsWith(".pdf")) found.push(path.relative(ROOT, full));
  }
  return found;
}

const offenders = await walk(PUBLIC);

if (offenders.length > 0) {
  console.error(
    `\nPDF files found under public/:\n\n` +
      offenders.map((f) => `  ${f}`).join("\n") +
      `\n\nAnything under public/ is served to visitors. The Company Profile PDFs\n` +
      `are internal source material and must not be part of the deployment —\n` +
      `see L-41 in docs/design-decisions.md.\n\n` +
      `Move these outside public/ (source-assets/ is not served) and re-run.\n`,
  );
  process.exit(1);
}

console.log("No PDFs under public/.");
