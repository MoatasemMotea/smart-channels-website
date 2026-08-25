import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  href: string;
  label: string;
  className?: string;
  priority?: boolean;
}

/**
 * The Smart Channels brand lockup.
 *
 * THE DARK-THEME PROBLEM
 * ----------------------
 * The supplied logo is a transparent PNG whose "Smart Channels" wordmark is
 * near-black (#282A28). Measured against the dark theme background (#0E0C11)
 * that is roughly 1.3:1 — effectively invisible, and nowhere near the 4.5:1 the
 * rest of the site meets.
 *
 * The brand rules forbid redrawing, recolouring or restructuring the logo, so
 * recolouring the wordmark to white was not an option. Instead the lockup is
 * placed on a light plate in the dark theme — the standard, brand-safe way to
 * carry a dark-wordmark logo onto a dark surface. The artwork itself is
 * untouched: same file, same proportions, same colours, in both themes.
 *
 * The plate is only applied in dark mode; in light mode the logo sits directly
 * on the background as designed.
 *
 * A light-on-dark logo variant (or the original vector) would let the plate be
 * removed entirely — flagged for the client in FINAL_PROJECT_REPORT.md.
 */
export function Logo({ href, label, className, priority = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group inline-flex shrink-0 items-center rounded-md",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-[6px] transition-colors duration-200",
          // Light theme: no plate, no padding — the logo sits on the page.
          // Dark theme: a soft white plate so the wordmark stays legible.
          "[html[data-theme='dark']_&]:bg-white/92 [html[data-theme='dark']_&]:px-2.5 [html[data-theme='dark']_&]:py-1.5",
          "[html[data-theme='dark']_&]:shadow-[0_0_0_1px_rgb(255_255_255/0.10)]",
          "[html[data-theme='dark']_&]:group-hover:bg-white",
        )}
      >
        <Image
          src="/images/logo/smart-channels.webp"
          alt=""
          width={400}
          height={150}
          priority={priority}
          // 400×150 source rendered at ~124 CSS px keeps it crisp at 2× and 3×.
          // Steps down on the narrowest phones (320px) so the header still fits
          // the logo, both switches and the menu trigger without overflowing —
          // the dark theme's plate padding costs another 20px on top of this.
          className="h-auto w-[96px] xs:w-[112px] sm:w-[124px]"
          sizes="124px"
        />
      </span>
    </Link>
  );
}
