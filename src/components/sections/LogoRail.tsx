import Image from "next/image";
import { cn } from "@/lib/cn";

interface RailItem {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
  readonly width: number;
  readonly height: number;
  readonly url?: string;
}

/**
 * Marquee rail for partner and client logos.
 *
 * Behaviour:
 * - Pure CSS animation (see `.marquee-track` in globals.css). No JS, no rAF
 *   loop, and it runs on the compositor.
 * - The list is duplicated once and the track translates exactly -50%, which is
 *   what makes the loop seamless. The duplicate is `aria-hidden` so screen
 *   readers hear each logo once.
 * - Pauses on hover and on focus-within, so a keyboard user can tab to a logo
 *   without it sliding away.
 * - Under `prefers-reduced-motion` the animation is removed entirely and the
 *   rail becomes an ordinary horizontal scroller — the content stays reachable.
 * - RTL reverses the travel direction so logos move with the reading direction.
 *
 * Below a threshold count the rail is rendered as a static centred row instead:
 * marqueeing four logos looks thin and draws attention to how few there are.
 */
export function LogoRail({
  items,
  label,
  className,
}: {
  items: readonly RailItem[];
  label: string;
  className?: string;
}) {
  const shouldMarquee = items.length >= 6;

  if (!shouldMarquee) {
    return (
      <ul
        aria-label={label}
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-10 gap-y-8",
          className,
        )}
      >
        {items.map((item) => (
          <li key={item.id}>
            <LogoMark item={item} />
          </li>
        ))}
      </ul>
    );
  }

  // Slower for longer lists, so perceived speed stays constant.
  const duration = `${Math.max(28, items.length * 4.5)}s`;

  return (
    <div
      className={cn(
        "marquee-viewport relative overflow-hidden",
        // Fade the edges so logos enter and leave instead of being clipped.
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="marquee-track flex w-max items-center gap-14"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        <ul aria-label={label} className="flex items-center gap-14">
          {items.map((item) => (
            <li key={item.id}>
              <LogoMark item={item} />
            </li>
          ))}
        </ul>
        {/* Seamless-loop duplicate — hidden from assistive technology. */}
        <ul aria-hidden="true" className="flex items-center gap-14">
          {items.map((item) => (
            <li key={`${item.id}-duplicate`}>
              <LogoMark item={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LogoMark({ item }: { item: RailItem }) {
  const image = (
    <Image
      src={item.logo}
      alt={item.name}
      width={item.width}
      height={item.height}
      loading="lazy"
      // Normalised height with intrinsic ratio preserved, so logos of wildly
      // different dimensions sit together without per-logo tuning.
      className="h-8 w-auto object-contain opacity-70 transition-opacity duration-300 hover:opacity-100 sm:h-9"
    />
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
      >
        {image}
      </a>
    );
  }

  return image;
}
