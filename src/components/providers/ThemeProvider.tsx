"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "sc-theme";

interface ThemeContextValue {
  /** What the user chose, including "system". */
  preference: ThemePreference;
  /** What is actually on screen right now. */
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  /** Flip between light and dark, leaving "system" behind. */
  toggle: () => void;
  /** False during the first paint, before the client has read storage. */
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inline script that runs before first paint.
 *
 * Without this the page renders in the default theme and then snaps to the
 * user's choice once React hydrates — a flash of the wrong colour scheme on
 * every single navigation. It is deliberately tiny, dependency-free and
 * wrapped in try/catch, because it runs before anything else on the page and a
 * throw here would be visible to every visitor (Safari private mode, for one,
 * can make localStorage access throw).
 *
 * Exported as a string so the layout can inject it with
 * `dangerouslySetInnerHTML` — the only way to guarantee synchronous execution
 * ahead of paint.
 */
export const themeBootstrapScript = `(function(){var e=document.documentElement;e.classList.add("js");try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="light"||s==="dark")?s:(d?"dark":"light");e.setAttribute("data-theme",t);e.style.colorScheme=t;}catch(err){}})();`;

/** sessionStorage key marking the cinematic opening as already played. */
const OPENING_STORAGE_KEY = "sc-opening-played";

/**
 * Inline script that decides whether the cinematic opening plays.
 *
 * Runs before first paint, alongside the theme bootstrap, and its only job is
 * to set `data-opening="on"` on <html>. Everything visual is CSS from there —
 * see "CINEMATIC OPENING" in globals.css. That division matters: the animation
 * ends by removing the overlay via `animation-fill-mode: forwards`, so it
 * completes even if the React bundle never loads, is blocked, or throws. There
 * is no arrangement in which a visitor is left looking at a curtain that never
 * lifts, which is the one unacceptable failure mode for an opening.
 *
 * It plays only when all four hold:
 *
 *   · JavaScript ran at all — no-JS visitors never see it, because the
 *     attribute is the only thing that makes the overlay visible.
 *   · The visitor has not asked for reduced motion. For them the composed
 *     alternative is simply the hero, immediately (design decision L-36).
 *   · It has not already played this session. An opening is a first
 *     impression; on the fourth visit it is an obstacle.
 *   · The URL is a locale root. The opening is the homepage's first beat, not
 *     a site-wide interstitial, and the overlay only exists on that page —
 *     the path check is what stops a first visit to /company from consuming
 *     the session flag and suppressing the opening for good.
 *
 * The played flag is written immediately rather than when the animation ends,
 * so navigating away mid-animation still counts as having seen it.
 */
export const openingBootstrapScript = `(function(){try{var e=document.documentElement;if(!new RegExp("^/[a-z]{2}/?$").test(location.pathname))return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var k=${JSON.stringify(
  OPENING_STORAGE_KEY,
)};if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1");e.setAttribute("data-opening","on");}catch(err){}})();`;

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable — fall through to system */
  }
  return "system";
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: ResolvedTheme) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  // Keeps form controls, scrollbars and the browser's own UI in step.
  el.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [ready, setReady] = useState(false);

  /**
   * Adopt whatever the bootstrap script already decided, so React's state
   * matches the DOM instead of fighting it.
   *
   * `react-hooks/set-state-in-effect` is disabled here deliberately. The rule
   * is right in general — synchronous setState in an effect usually signals
   * state that should have been derived during render. This is the documented
   * exception: the true value lives in `localStorage` and the OS colour-scheme
   * setting, neither of which exists during server rendering. Reading them in a
   * lazy `useState` initialiser instead would make the server and client render
   * different markup and produce a hydration mismatch.
   *
   * There is no visual cost: the inline bootstrap script has already applied
   * the correct theme to the DOM before first paint, so this effect only
   * catches React's own state up to what the user already sees.
   */
  useEffect(() => {
    const stored = readStoredPreference();
    const next = stored === "system" ? systemTheme() : stored;
    /* eslint-disable react-hooks/set-state-in-effect -- hydration sync; see above */
    setPreferenceState(stored);
    setResolved(next);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    applyTheme(next);
  }, []);

  // Follow the OS while the preference is "system" — including live changes,
  // which is what a user toggling their device theme expects to see.
  useEffect(() => {
    if (preference !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = query.matches ? "dark" : "light";
      setResolved(next);
      applyTheme(next);
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);

    try {
      if (next === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }

    const applied = next === "system" ? systemTheme() : next;
    setResolved(applied);
    applyTheme(applied);
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolved, setPreference, toggle, ready }),
    [preference, resolved, setPreference, toggle, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}
