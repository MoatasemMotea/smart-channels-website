/**
 * Motion helpers usable from server components.
 *
 * `stagger` lives here rather than alongside `<Reveal>` because that module is
 * marked `"use client"` — anything exported from it becomes a client reference,
 * and calling one during server rendering is a build error. This is a pure
 * function of an index, so it belongs in a plain module both environments can
 * import.
 */

/**
 * Delay for the nth item in a staggered group, in seconds.
 *
 * Capped at `max` steps so a long grid never leaves its last card waiting on a
 * delay the user will have scrolled past.
 */
export function stagger(index: number, step = 0.06, max = 6): number {
  return Math.min(index, max) * step;
}
