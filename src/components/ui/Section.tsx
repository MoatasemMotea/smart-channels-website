import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Which storytelling environment this section belongs to.
 *
 * `bright` is the reading environment; `deep` is the cinematic one. The tokens
 * behind them live in globals.css under "STORYTELLING ENVIRONMENTS" — the short
 * version is that `deep` renders dark in both themes (it is a change of scene,
 * not a colour preference), while `bright` lifts rather than inverts when the
 * page theme is dark.
 *
 * Left undefined, a section simply follows the page theme, which is what every
 * pre-Phase-2 section does. That is deliberate: adopting the environment system
 * is opt-in per section, so it can be rolled through the page one section at a
 * time and verified, rather than switched on everywhere at once.
 */
type Env = "bright" | "deep";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Background treatment *within* the current environment. */
  tone?: "default" | "subtle" | "inset";
  /** Vertical rhythm. "tight" for supporting bands, "loose" for major sections. */
  spacing?: "tight" | "default" | "loose";
  /** Storytelling environment. See {@link Env}. */
  env?: Env;
  /**
   * Softens the leading edge into the section above, so a change of environment
   * reads as a dissolve rather than a hard cut. Only meaningful when `env` is
   * set and the preceding section is in the other environment.
   */
  seam?: boolean;
  as?: ElementType;
  /** Associates the section with its heading for assistive technology. */
  labelledBy?: string;
}

const toneClass = {
  default: "bg-bg",
  subtle: "bg-bg-subtle",
  inset: "bg-bg-inset",
} as const;

const spacingClass = {
  tight: "py-14 sm:py-16",
  default: "py-20 sm:py-24 lg:py-28",
  loose: "py-24 sm:py-32 lg:py-36",
} as const;

export function Section({
  id,
  children,
  className,
  tone = "default",
  spacing = "default",
  env,
  seam = false,
  as: Tag = "section",
  labelledBy,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      {...(env ? { "data-env": env } : {})}
      /* data-tone lets the seam gradient resolve to this section's own
         background without the CSS having to know which utility was used. */
      {...(seam ? { "data-seam": "", "data-tone": tone } : {})}
      className={cn(
        "relative",
        toneClass[tone],
        spacingClass[spacing],
        // isolate: keeps the seam and any atmospheric pseudo-elements from
        // stacking against z-indexes elsewhere on the page.
        env && "isolate",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Ambient light inside a `deep` section.
 *
 * Purely decorative and absolutely positioned, so it never affects layout and
 * never enters the accessibility tree. Placement is given in percentages of the
 * section box so it scales with the section rather than needing a breakpoint.
 */
export function SectionAtmosphere({
  className,
  x = "50%",
  y = "0%",
  size = "min(70rem, 120%)",
  intensity = 1,
}: {
  className?: string;
  x?: string;
  y?: string;
  size?: string;
  /** 0–1 multiplier on the glow tokens. */
  intensity?: number;
}) {
  const style = {
    "--atmos-x": x,
    "--atmos-y": y,
    "--atmos-size": size,
    "--atmos-intensity": String(intensity),
  } as CSSProperties;

  return (
    <div aria-hidden="true" className={cn("section-atmosphere-clip", className)}>
      <div className="section-atmosphere" style={style} />
    </div>
  );
}

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  return (
    <div
      className={cn(
        "container-page",
        size === "narrow" && "max-w-3xl",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
