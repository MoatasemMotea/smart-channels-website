"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 0 = purple, 1 = magenta. Mostly purple, with magenta as the accent. */
  accent: number;
}

/**
 * Animated node network behind the hero.
 *
 * DESIGN INTENT
 * -------------
 * A connected-node field reads immediately as "networks and infrastructure",
 * which is what the company does, and it is drawn from the brand's own palette
 * rather than the usual blue-cyan tech cliché. It is deliberately sparse and
 * slow: this sits behind an H1, so it has to stay subordinate to the type.
 *
 * PERFORMANCE
 * -----------
 * Background canvas animation is the classic way to wreck Core Web Vitals on
 * mobile, so every one of these is enforced rather than assumed:
 *
 * - Node count scales with viewport area and is hard-capped (72 desktop /
 *   30 small screens). Link-drawing is O(n²), so the cap is what keeps the
 *   frame budget bounded.
 * - The render loop stops entirely when the hero scrolls out of view
 *   (IntersectionObserver) and when the tab is hidden (visibilitychange).
 *   An off-screen canvas costs nothing.
 * - Frames are throttled to ~30fps. At this motion speed 60fps is
 *   indistinguishable and costs twice the battery.
 * - devicePixelRatio is capped at 2. On a 3× phone an uncapped backing store
 *   is 2.25× the pixels for no perceptible gain.
 * - `prefers-reduced-motion` renders exactly one static frame and never starts
 *   the loop — the composition is still there, it simply doesn't move.
 * - Colours are read from CSS custom properties, so the canvas follows the
 *   theme switch without a second implementation.
 *
 * The canvas is `aria-hidden` and purely decorative; the hero's meaning is
 * carried entirely by its text.
 */
export function NetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastFrame = 0;
    let inView = true;
    let disposed = false;

    /** Palette pulled from the active theme's custom properties. */
    let nodeColor = "#d9088c";
    let nodeAltColor = "#7b388b";
    let linkRgb = "217, 8, 140";
    let linkAlpha = 0.5;
    let nodeAlpha = 0.75;

    const readTheme = () => {
      const styles = getComputedStyle(document.documentElement);
      nodeColor = styles.getPropertyValue("--canvas-node").trim() || nodeColor;
      nodeAltColor =
        styles.getPropertyValue("--canvas-node-alt").trim() || nodeAltColor;
      linkRgb = styles.getPropertyValue("--canvas-link").trim() || linkRgb;
      const alpha = Number.parseFloat(
        styles.getPropertyValue("--canvas-link-alpha"),
      );
      if (!Number.isNaN(alpha)) linkAlpha = alpha;
      const nAlpha = Number.parseFloat(
        styles.getPropertyValue("--canvas-node-alpha"),
      );
      if (!Number.isNaN(nAlpha)) nodeAlpha = nAlpha;
    };

    /** Maximum distance at which two nodes are linked, in CSS px. */
    let linkDistance = 150;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const small = width < 640;
      linkDistance = small ? 118 : 150;

      // ~1 node per 17,000 css px², capped at both ends.
      const target = Math.round((width * height) / 17000);
      const count = Math.max(14, Math.min(small ? 30 : 72, target));

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // 12–26 px/second. Slow enough to read as drift, not motion.
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 2.1,
        accent: Math.random() < 0.26 ? 1 : 0,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Links first, so nodes sit on top of them.
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        if (!a) continue;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          if (!b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > linkDistance * linkDistance) continue;

          // sqrt only for pairs that are actually close enough to draw.
          const dist = Math.sqrt(distSq);
          const strength = 1 - dist / linkDistance;
          ctx.strokeStyle = `rgba(${linkRgb}, ${(strength * linkAlpha).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        ctx.fillStyle = node.accent === 1 ? nodeColor : nodeAltColor;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = (time: number) => {
      if (disposed) return;

      // ~30fps. Halves the work with no visible difference at this speed.
      if (time - lastFrame < 33) {
        rafId = requestAnimationFrame(step);
        return;
      }
      lastFrame = time;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off the edges rather than wrapping — wrapping makes links
        // snap across the full width, which reads as a glitch.
        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(height, node.y));
        }
      }

      draw();
      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (disposed || rafId !== 0) return;
      if (reduceMotion.matches) return;
      lastFrame = 0;
      rafId = requestAnimationFrame(step);
    };

    const stop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const init = () => {
      readTheme();
      build();
      draw(); // paint one frame immediately, animated or not
      if (!reduceMotion.matches && inView) start();
    };

    init();

    /* --- Resize ---------------------------------------------------------- */
    let resizeTimer: number | undefined;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const wasRunning = rafId !== 0;
        stop();
        build();
        draw();
        if (wasRunning) start();
      }, 150);
    });
    resizeObserver.observe(canvas);

    /* --- Pause when off-screen ------------------------------------------- */
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    /* --- Pause in a background tab --------------------------------------- */
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* --- Follow the theme switch ----------------------------------------- */
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (rafId === 0) draw(); // repaint the static frame too
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /* --- Follow a live reduced-motion change ------------------------------ */
    const onMotionPreference = () => {
      if (reduceMotion.matches) {
        stop();
        draw();
      } else if (inView) {
        start();
      }
    };
    reduceMotion.addEventListener("change", onMotionPreference);

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionPreference);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      className={className}
    />
  );
}
