import type { Collection, Project } from "@/types/content";

/**
 * Featured projects.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS RECORDED HERE, AND WHAT IS NOT
 * ---------------------------------------------------------------------------
 * Each record carries a `source` naming where it came from, because a project
 * record is a factual claim about work delivered and one that cannot say where
 * it came from should not exist.
 *
 * What is deliberately absent:
 *
 *   · descriptions — none have been supplied. `description` is optional and the
 *     card renders without one rather than with a plausible-sounding sentence.
 *     Writing that copy would be inventing project facts.
 *
 *   · photographs — none have been approved. `image` is optional and the card
 *     renders a visibly synthetic placeholder that says the photography is
 *     pending. Not stock imagery, and not an unrelated photograph standing in
 *     for the work: a captioned image on a project card asserts that the
 *     picture *is* the project.
 *
 *   · dates, values, headcounts, scope — not supplied, so not invented.
 *
 * ---------------------------------------------------------------------------
 * TO PUBLISH A PROJECT PHOTOGRAPH
 * ---------------------------------------------------------------------------
 *   1. Put the approved image at public/images/projects/<id>.webp
 *      (`npm run assets:photos` converts a JPG/PNG from source-assets/).
 *   2. Add the `image` block to the record — src, width, height, alt in both
 *      languages.
 * The card switches from placeholder to photograph on its own. No component
 * changes, and the layout is identical either way, so nothing shifts.
 */

const BRIEF = "Named by the client as a case study in the Phase 2 homepage brief, §12.";
const VENUES =
  "Confirmed by the client in the Ministry of Sport asset decision, which " +
  "directed that both venues keep the Ministry of Sport identity.";

export const projects: Collection<Project> = {
  status: "published",
  items: [
    {
      id: "f1-saudi-arabian-grand-prix",
      name: {
        en: "F1 Saudi Arabian Grand Prix",
        ar: "سباق جائزة السعودية الكبرى للفورمولا 1",
      },
      source: BRIEF,
      industryId: "motorsport",
    },
    {
      id: "fifa-club-world-cup",
      name: {
        en: "FIFA Club World Cup",
        ar: "كأس العالم للأندية",
      },
      source: BRIEF,
      industryId: "sporting-events",
    },
    {
      id: "grand-mosque-makkah",
      name: {
        en: "The Grand Mosque, Makkah",
        ar: "المسجد الحرام، مكة المكرمة",
      },
      source: BRIEF,
      industryId: "holy-sites",
    },
    {
      id: "king-fahd-stadium-taif",
      name: {
        en: "King Fahd Stadium, Taif",
        ar: "استاد الملك فهد، الطائف",
      },
      source: VENUES,
      industryId: "stadiums",
    },
    {
      id: "prince-sultan-sports-city-abha",
      name: {
        en: "Prince Sultan Sports City, Abha",
        ar: "مدينة الأمير سلطان الرياضية، أبها",
      },
      source: VENUES,
      industryId: "stadiums",
    },
  ],
};

/** Projects that have an approved photograph. */
export function projectsWithPhotography(): readonly Project[] {
  return projects.items.filter((project) => project.image !== undefined);
}

/** How much of the set is still waiting on imagery — surfaced in dev tooling. */
export function pendingProjectPhotography(): readonly Project[] {
  return projects.items.filter((project) => project.image === undefined);
}
