"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { format } from "@/i18n";
import type { GalleryItem } from "@/types/content";
import { cn } from "@/lib/cn";

interface GalleryGridProps {
  items: readonly GalleryItem[];
  locale: Locale;
  dict: Dictionary;
}

/**
 * Gallery grid with a lightbox.
 *
 * Built directly rather than with a carousel library: a responsive grid plus a
 * dialog is a few dozen lines, and the library equivalent would ship ~40 KB to
 * do the same job while still needing custom work for RTL and focus management.
 *
 * Accessibility:
 * - Each thumbnail is a real `<button>`, so it is reachable and operable by
 *   keyboard without any added handlers.
 * - The lightbox is a `role="dialog" aria-modal="true"` with focus moved into
 *   it on open, trapped while open, and returned to the triggering thumbnail
 *   on close.
 * - Escape closes; arrow keys move between images, mirrored in RTL so "next"
 *   always means the direction the user reads toward.
 * - The image counter is announced politely for screen-reader users.
 */
export function GalleryGrid({ items, locale, dict }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isRtl = locale === "ar";

  const close = useCallback(() => setOpenIndex(null), []);

  const move = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  /* Focus management + key handling while the lightbox is open. */
  useEffect(() => {
    if (openIndex === null) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          close();
          break;
        case "ArrowRight":
          event.preventDefault();
          // In RTL the right arrow moves toward the *previous* item, matching
          // the visual order the reader sees.
          move(isRtl ? -1 : 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          move(isRtl ? 1 : -1);
          break;
        case "Tab": {
          const dialog = dialogRef.current;
          if (!dialog) break;
          const focusable = dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          );
          if (focusable.length === 0) break;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!first || !last) break;
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      // Return focus to the thumbnail that opened the lightbox.
      const trigger = previouslyFocused ?? null;
      trigger?.focus?.();
    };
  }, [openIndex, close, move, isRtl]);

  const active = openIndex !== null ? items[openIndex] : undefined;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              ref={(el) => {
                triggersRef.current[index] = el;
              }}
              onClick={() => setOpenIndex(index)}
              aria-label={`${dict.gallery.openImage} — ${item.image.alt[locale]}`}
              className={cn(
                "group relative block w-full overflow-hidden rounded-md border border-border bg-bg-inset",
                "aspect-square transition-[border-color,box-shadow] duration-300",
                "hover:border-border-brand hover:shadow-[var(--shadow-lift)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              )}
            >
              <Image
                src={item.image.src}
                alt={item.image.alt[locale]}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 20rem, (min-width: 640px) 30vw, 45vw"
                loading="lazy"
                {...(item.image.blurDataURL
                  ? { placeholder: "blur" as const, blurDataURL: item.image.blurDataURL }
                  : {})}
                className="size-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] motion-safe:group-hover:scale-105"
              />
              {item.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-1000/90 to-transparent p-3 text-start text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.caption[locale]}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {/* --- Lightbox --- */}
      {active && openIndex !== null ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={dict.gallery.lightboxLabel}
          className="fixed inset-0 z-100 flex flex-col bg-ink-1000/95 backdrop-blur-sm"
        >
          {/* Clicking the backdrop closes. It is aria-hidden because the close
              button already provides the accessible way out. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            onClick={close}
          />

          <div className="relative z-10 flex items-center justify-between gap-4 p-4 sm:p-5">
            <p aria-live="polite" className="numerals-latin text-sm text-white/70">
              {format(dict.common.imageOf, {
                current: openIndex + 1,
                total: items.length,
              })}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={dict.common.close}
              className="inline-flex size-11 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
            <Image
              key={active.id}
              src={active.image.src}
              alt={active.image.alt[locale]}
              width={active.image.width}
              height={active.image.height}
              sizes="100vw"
              priority
              className="max-h-full w-auto max-w-full rounded-md object-contain"
            />
          </div>

          {items.length > 1 ? (
            <div className="relative z-10 flex items-center justify-center gap-3 p-4 sm:p-5">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={dict.common.previous}
                className="inline-flex size-11 items-center justify-center rounded-md border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isRtl ? (
                  <ChevronRight aria-hidden="true" className="size-5" />
                ) : (
                  <ChevronLeft aria-hidden="true" className="size-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label={dict.common.next}
                className="inline-flex size-11 items-center justify-center rounded-md border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isRtl ? (
                  <ChevronLeft aria-hidden="true" className="size-5" />
                ) : (
                  <ChevronRight aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
          ) : null}

          {active.caption ? (
            <p className="relative z-10 px-4 pb-6 text-center text-sm text-white/70">
              {active.caption[locale]}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
