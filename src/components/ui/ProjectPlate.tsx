import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/types/content";
import { cn } from "@/lib/cn";

/**
 * The image area of a project card.
 *
 * Renders the approved photograph when there is one, and otherwise a plainly
 * synthetic placeholder that says the photography is pending.
 *
 * WHY THE PLACEHOLDER LOOKS THE WAY IT DOES
 *
 * The tempting fill for this space is a generic photograph of a stadium, a
 * server room, a crowd. That is precisely what must not happen: a picture on a
 * project card asserts that the picture *is* the project, and an unrelated
 * stock shot under "F1 Saudi Arabian Grand Prix" is fabricated evidence
 * regardless of what the caption says.
 *
 * So the placeholder is deliberately, obviously not a photograph — a flat
 * brand-tinted field with a diagonal hatch and a stated label. Nobody looking
 * at the page can mistake it for the work, which means the page can carry the
 * project names honestly while the imagery is outstanding.
 *
 * The tint is derived from the project id, so each plate differs from its
 * neighbours and every plate is identical on every build. Random would look
 * livelier and would churn the visual diff on every render.
 *
 * The two branches occupy exactly the same box, so dropping the real image in
 * later changes nothing about the layout.
 */
export function ProjectPlate({
  project,
  locale,
  pendingLabel,
  className,
  sizes,
  priority = false,
}: {
  project: Project;
  locale: Locale;
  pendingLabel: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (project.image) {
    return (
      <Image
        src={project.image.src}
        alt={project.image.alt[locale]}
        width={project.image.width}
        height={project.image.height}
        sizes={sizes}
        priority={priority}
        {...(project.image.blurDataURL
          ? { placeholder: "blur" as const, blurDataURL: project.image.blurDataURL }
          : {})}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  const tint = hueFor(project.id);

  return (
    <div
      // Not aria-hidden: it stands in for content, so a screen-reader user
      // should be told the same thing a sighted one is — that the picture is
      // not here yet — rather than encountering an unexplained gap.
      role="img"
      aria-label={pendingLabel}
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-bg-inset",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(120% 90% at ${tint.x}% ${tint.y}%, ` +
            `color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 68%), ` +
            `radial-gradient(90% 80% at ${100 - tint.x}% ${100 - tint.y}%, ` +
            `color-mix(in oklab, var(--color-accent-2) 20%, transparent), transparent 72%)`,
        }}
      />
      {/* The hatch is what reads as "placeholder" at a glance, in any culture
          and at any size — a flat gradient alone reads as a design choice. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-border) 0 1px, transparent 1px 11px)",
        }}
      />

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <ImageOff aria-hidden="true" className="size-7 text-fg-subtle" />
        <span className="text-meta text-fg-subtle uppercase">{pendingLabel}</span>
      </div>
    </div>
  );
}

/**
 * Stable pseudo-random placement from the project id.
 *
 * FNV-1a, chosen because it is four lines and deterministic across builds and
 * platforms. Nothing here is security-sensitive; it just has to be stable.
 */
function hueFor(id: string): { x: number; y: number } {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return {
    x: 18 + (hash % 64),
    y: 14 + ((hash >>> 8) % 60),
  };
}
