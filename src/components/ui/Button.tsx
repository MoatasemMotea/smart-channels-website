import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-bold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 " +
  "ease-[var(--ease-brand)] select-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] " +
  "disabled:pointer-events-none disabled:opacity-55 " +
  // The lift is 1px. Anything more reads as a toy on a corporate site.
  "active:translate-y-px motion-reduce:active:translate-y-0";

const variants: Record<Variant, string> = {
  /* White on magenta-600 measures 4.81:1 — AA for normal text — and the same
     token is used in both themes so the primary action is never the lighter
     magenta-400, which would fail against white. */
  primary:
    "bg-magenta-600 text-white hover:bg-magenta-700 " +
    "shadow-[0_1px_2px_rgb(14_12_17/0.18),0_10px_26px_-14px_var(--color-magenta-600)] " +
    "hover:shadow-[0_2px_6px_rgb(14_12_17/0.22),0_16px_36px_-16px_var(--color-magenta-600)]",
  secondary:
    "bg-surface-raised text-fg-strong border border-border-strong hover:border-border-brand " +
    "hover:bg-bg-subtle",
  outline:
    "border border-border-strong text-fg-strong hover:border-border-brand hover:text-accent " +
    "bg-transparent",
  ghost: "text-fg-muted hover:text-fg-strong hover:bg-bg-subtle",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  href: string;
  /** Set for links leaving the site; adds rel and the a11y announcement. */
  external?: boolean;
  "aria-label"?: string;
} & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "children" | "href"
  >;

/**
 * A link styled as a button.
 *
 * Separate from `Button` on purpose: a thing that navigates must be an `<a>`,
 * and a thing that performs an action must be a `<button>`. Collapsing the two
 * into one polymorphic component is how sites end up with buttons that can't be
 * opened in a new tab and links that don't respond to the space bar.
 */
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external = false,
  ...rest
}: LinkButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    const isHttp = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
