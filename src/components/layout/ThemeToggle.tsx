"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  labels: {
    switchToLight: string;
    switchToDark: string;
  };
  className?: string;
}

/**
 * Minimal sun/moon theme switch.
 *
 * A single button rather than a three-way light/dark/system control: the
 * initial theme already follows the OS (see ThemeProvider), so "system" is the
 * default state rather than something the user has to find and select. One tap
 * to override it covers what almost everyone actually wants, and keeps the
 * header uncluttered — which the brief asked for explicitly.
 *
 * Accessibility notes:
 * - `aria-label` states the *action*, not the current state, so a screen reader
 *   announces "switch to light theme" rather than the ambiguous "dark".
 * - Both icons are always in the DOM and cross-fade, so the button's width
 *   never changes and the header cannot shift when the theme flips.
 * - Before hydration the button is inert and shows nothing, avoiding a
 *   mismatch between server and client markup.
 */
export function ThemeToggle({ labels, className }: ThemeToggleProps) {
  const { resolved, toggle, ready } = useTheme();

  const isDark = resolved === "dark";
  const label = isDark ? labels.switchToLight : labels.switchToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      // Until the client knows the real theme, keep it out of the tab order
      // rather than exposing a control that might do the opposite of its label.
      {...(ready ? {} : { tabIndex: -1, "aria-hidden": true })}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-md",
        "text-fg-muted transition-colors duration-200 hover:bg-bg-subtle hover:text-fg-strong",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        !ready && "opacity-0",
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "absolute size-[18px] transition-all duration-300 ease-[var(--ease-brand)]",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0",
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "absolute size-[18px] transition-all duration-300 ease-[var(--ease-brand)]",
          isDark ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
