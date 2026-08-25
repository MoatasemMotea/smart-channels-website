"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up when it scrolls into view.
 *
 * PROGRESSIVE ENHANCEMENT, and specifically the no-flash kind.
 *
 * The final value is what the server renders, so a visitor without JavaScript
 * reads the real number rather than a zero that never moves. On mount the
 * component only takes over if the element is *below the fold* — the one case
 * where resetting the text to 0 cannot be seen. If the element is already on
 * screen when the component mounts (a deep link, a very short viewport, a
 * restored scroll position) the animation is skipped entirely and the real
 * value simply stays. There is no arrangement in which the reader watches a
 * number blink back to zero.
 *
 * Reduced motion skips the animation for the same reason it skips every other
 * one on the site: the information is already there, and the movement is the
 * decoration.
 *
 * The count itself is eased rather than linear. A linear count reads like a
 * loading indicator; easing out makes it read like a value settling, which is
 * the difference between "still working" and "here is the figure".
 */
export function Counter({
  value,
  suffix = "",
  durationMs = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Already visible → leave the rendered value alone. See the note above.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    const format = (n: number) => n.toLocaleString("en-US");
    el.textContent = format(0);

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Restore the true value if the effect is torn down mid-count, so the
      // DOM is never left holding a partial number.
      el.textContent = format(value);
    };
  }, [value, durationMs]);

  return (
    <>
      {/* aria-hidden on the animating node, with the real value announced once
          alongside it. Otherwise a screen reader following live changes would
          read every intermediate number, and the figure would arrive as
          "one, four, nine, one seventy-three, two hundred". */}
      <span ref={ref} aria-hidden="true" className={className}>
        {value.toLocaleString("en-US")}
      </span>
      <span className="sr-only">
        {value.toLocaleString("en-US")}
        {suffix}
      </span>
      {suffix ? (
        <span aria-hidden="true" className={className}>
          {suffix}
        </span>
      ) : null}
    </>
  );
}
