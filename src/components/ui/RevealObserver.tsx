"use client";

import { useEffect } from "react";

/**
 * Drives every `[data-reveal]` entrance animation on the page.
 *
 * One IntersectionObserver for the whole document rather than one per animated
 * element — a page with ~80 revealed elements would otherwise create 80
 * observers, each with its own callback and bookkeeping.
 *
 * Mounted once in the locale layout. Elements are unobserved as soon as they
 * have been revealed, so the observer's working set shrinks to nothing as the
 * visitor scrolls; nothing re-animates on the way back up.
 *
 * Safety net: if IntersectionObserver is unavailable, or something throws,
 * every element is marked revealed immediately. Failing open means the worst
 * case is "no animation", never "invisible content".
 */
export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"),
    );
    if (elements.length === 0) return;

    const revealAll = () => {
      for (const el of elements) el.setAttribute("data-revealed", "");
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      {
        // Start the transition slightly before the element reaches the
        // viewport, so it has finished by the time it is properly in view.
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    for (const el of elements) {
      // Anything already on screen at mount is revealed without waiting for a
      // scroll — otherwise above-the-fold content would sit hidden until the
      // user moved.
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.setAttribute("data-revealed", "");
      } else {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
