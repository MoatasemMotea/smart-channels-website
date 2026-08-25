import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  /** Small label above the heading. */
  eyebrow?: string;
  heading: string;
  body?: string;
  /** Heading id, so the parent <section> can be aria-labelledby it. */
  id?: string;
  align?: "start" | "center";
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  heading,
  body,
  id,
  align = "start",
  level = 2,
  className,
  children,
}: SectionHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <p
            className={cn(
              "mb-3 flex items-center gap-2.5 text-xs font-bold tracking-[0.16em] uppercase text-accent",
              align === "center" && "justify-center",
            )}
          >
            {/* Decorative rule; hidden from assistive tech. */}
            <span
              aria-hidden="true"
              className="h-px w-6 bg-current opacity-60"
            />
            {eyebrow}
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.05}>
        <Tag
          id={id}
          className="text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
        >
          {heading}
        </Tag>
      </Reveal>

      {body ? (
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">{body}</p>
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
