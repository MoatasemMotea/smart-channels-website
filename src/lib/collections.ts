import type { Collection } from "@/types/content";
import { showPendingSections } from "./site";

/**
 * How a content-driven section should render.
 *
 *   "content"     — real content exists; render it.
 *   "placeholder" — nothing to show, but the team is reviewing the build, so
 *                   render a clearly-labelled pending panel.
 *   "hidden"      — nothing to show in production; omit the section entirely.
 *
 * The reasoning behind "hidden": an enterprise or government buyer evaluating
 * a supplier reads an empty "Our Clients — coming soon" panel as evidence there
 * are none. A section that isn't there yet costs nothing; a visibly empty one
 * costs credibility. So placeholders are a build-time affordance for the team,
 * never something a visitor sees.
 */
export type SectionRenderMode = "content" | "placeholder" | "hidden";

export function sectionMode<T>(collection: Collection<T>): SectionRenderMode {
  if (collection.items.length > 0 && collection.status === "published") {
    return "content";
  }
  return showPendingSections() ? "placeholder" : "hidden";
}

/**
 * Same decision, but for a section whose renderable items are a filtered subset
 * of the collection (clients, where display permission gates each entry).
 */
export function sectionModeFor<T>(
  collection: Collection<T>,
  renderable: readonly unknown[],
): SectionRenderMode {
  if (renderable.length > 0 && collection.status === "published") {
    return "content";
  }
  return showPendingSections() ? "placeholder" : "hidden";
}

/** Whether any of the "our work" sections will produce visible output. */
export function anyVisible(...modes: readonly SectionRenderMode[]): boolean {
  return modes.some((mode) => mode !== "hidden");
}
