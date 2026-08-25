"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { NavItem } from "@/data/navigation";
import { scrollSpySections } from "@/data/navigation";
import { localePath } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";
import { LinkButton } from "@/components/ui/Button";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
  nav: readonly NavItem[];
}

/**
 * Site header.
 *
 * NAVIGATION PATTERN — why sticky-translucent rather than transparent-over-hero:
 *
 * A transparent header floating over the hero looks striking on the home page
 * and then has to solve two problems everywhere else: it needs a solid variant
 * for /company, and its contrast depends on whatever pixels happen to be behind
 * it. With a dark hero canvas underneath, a transparent header's legibility
 * would vary with the animation — which is not something that can be guaranteed
 * to meet 4.5:1.
 *
 * So the header starts transparent over the hero (where the backdrop is known
 * and controlled) and gains a blurred, bordered surface as soon as the page
 * scrolls. That keeps the opening impression clean while guaranteeing contrast
 * for the other 95% of the visit, and it behaves identically on both pages.
 */
export function Header({ locale, dict, nav }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [observedSection, setObservedSection] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === localePath(locale, "/");

  /* The scroll-spy only applies to the landing page, so rather than clearing
     the observed section from an effect when navigating away, it is derived
     here. One less piece of state to keep in sync. */
  const activeSection = isHome ? observedSection : null;

  /* Reset the mobile menu when the route changes.
     Adjusting state during render — React's documented alternative to an
     effect for "reset state when something changes". It re-renders immediately
     without committing the stale open menu to the DOM, whereas an effect would
     paint the menu open on the new page for one frame first. */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  /* --- Scrolled state ---------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- Scroll spy --------------------------------------------------------
     IntersectionObserver rather than scroll-position maths: it does the work
     off the main thread and stays correct when sections change height (images
     loading, Arabic text reflowing). Only runs on the landing page. */
  useEffect(() => {
    if (!isHome) return;

    const elements = scrollSpySections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Highest-ratio visible section wins, so a short section sandwiched
        // between two tall ones doesn't flicker the highlight.
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setObservedSection(best);
      },
      {
        threshold: [0.15, 0.35, 0.6],
        rootMargin: "-20% 0px -45% 0px",
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [isHome, pathname]);

  /* --- Mobile menu: escape, focus return, scroll lock, focus trap -------- */
  useEffect(() => {
    if (!menuOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      // Keep focus inside the open panel — otherwise tabbing walks into the
      // page behind an overlay the user cannot see past.
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [menuOpen]);

  const isActive = useCallback(
    (item: NavItem) => {
      if (item.isAnchor) {
        return isHome && activeSection === item.key;
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    },
    [activeSection, isHome, pathname],
  );

  const solid = scrolled || !isHome || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        solid
          ? "border-b border-border bg-surface-overlay backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page">
        <div className="flex h-[var(--spacing-header)] items-center justify-between gap-4">
          <Logo href={localePath(locale, "/")} label={dict.nav.logoAlt} priority />

          {/* --- Desktop navigation --- */}
          <nav
            aria-label={dict.nav.label}
            className="hidden items-center gap-1 lg:flex"
          >
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-bold transition-colors duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                  isActive(item)
                    ? "text-accent"
                    : "text-fg-muted hover:text-fg-strong",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent transition-transform duration-300 ease-[var(--ease-brand)]",
                    isActive(item) ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* --- Controls --- */}
          <div className="flex shrink-0 items-center gap-1">
            <LocaleToggle locale={locale} label={dict.language.switchTo} />
            <ThemeToggle
              labels={{
                switchToLight: dict.theme.switchToLight,
                switchToDark: dict.theme.switchToDark,
              }}
            />
            {/* Visibility is controlled by this wrapper, not by a `hidden`
                class on the button itself. `hidden` and the button's own
                `inline-flex` are both display utilities with equal specificity,
                so which one wins depends on their order in the generated
                stylesheet rather than the order they appear in the class
                attribute — and `inline-flex` won. The result was a 107px button
                rendering at 390px, overflowing the header and pushing the menu
                trigger off-screen entirely. A wrapper has no such conflict. */}
            <span className="ms-1 hidden xl:block">
              <LinkButton href={`${localePath(locale, "/")}#contact`} size="sm">
                {dict.nav.cta}
              </LinkButton>
            </span>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-md lg:hidden",
                "text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg-strong",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              )}
            >
              {menuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile menu ---
          Rendered in the DOM only while open, so its links are not reachable by
          keyboard or screen reader while hidden. */}
      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 top-[var(--spacing-header)] -z-10 bg-bg/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-menu"
            className="border-t border-border bg-surface-overlay backdrop-blur-xl lg:hidden"
          >
            <nav aria-label={dict.nav.label} className="container-page py-5">
              <ul className="flex flex-col gap-1">
                {nav.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-3 text-base font-bold transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                        isActive(item)
                          ? "bg-accent-soft text-accent"
                          : "text-fg hover:bg-bg-subtle",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <LinkButton
                href={`${localePath(locale, "/")}#contact`}
                size="lg"
                className="mt-5 w-full"
              >
                {dict.nav.cta}
              </LinkButton>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
