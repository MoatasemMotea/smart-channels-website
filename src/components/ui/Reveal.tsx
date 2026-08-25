import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Travel distance in px. Kept small — this is emphasis, not spectacle. */
  distance?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Scroll-triggered entrance animation.
 *
 * PROGRESSIVE ENHANCEMENT — the important property of this component.
 *
 * The obvious implementation (a motion library with `initial={{opacity: 0}}`
 * and `whileInView`) has a serious failure mode: the served HTML has every
 * below-the-fold element at zero opacity, and it only becomes visible once
 * JavaScript loads *and* an IntersectionObserver fires. If the bundle fails to
 * load, is blocked, or the observer never runs, the visitor sees a header and
 * nothing else. That was measurably true of the first version of this file — a
 * JS-disabled render showed an empty page.
 *
 * So the default state here is *visible*. The hidden-then-reveal behaviour is
 * scoped behind a `.js` class that the pre-paint bootstrap script adds to
 * <html>. With JS the animation plays with no flash, because the class lands
 * before first paint; without JS the content is simply there.
 *
 * This is also a server component: it renders plain markup with a data
 * attribute and ships no per-instance JavaScript. A single observer in the
 * layout (`<RevealObserver>`) watches every `[data-reveal]` element on the
 * page, rather than mounting one observer per animated element.
 *
 * `prefers-reduced-motion` is handled in CSS: reduced-motion users get the
 * content at full opacity with no transition at all.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 16,
  className,
  as: Tag = "div",
}: RevealProps) {
  // React types `style` as CSSProperties, which has no index signature for
  // custom properties. The cast is confined to this one object literal.
  const style = {
    ...(delay > 0 ? { "--reveal-delay": `${delay}s` } : {}),
    ...(distance !== 16 ? { "--reveal-distance": `${distance}px` } : {}),
  } as CSSProperties;

  return (
    <Tag
      data-reveal=""
      className={className}
      {...(Object.keys(style).length > 0 ? { style } : {})}
    >
      {children}
    </Tag>
  );
}
