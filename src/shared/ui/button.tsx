"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

/**
 * shadcn-style Button keyed to IFR brand tokens. Variants:
 *  - default  — primary CTA, uses --ifr-cta-bg / --ifr-cta-fg.
 *  - secondary — outlined neutral; secondary actions in a pair.
 *  - ghost    — invisible-until-hover; tertiary navigation actions.
 *  - destructive — for destructive primary actions (delete, cancel).
 *  - outline  — bordered, surface-bg; close to Card edges.
 *  - link     — text-only inline link styling.
 *
 * Sizes default / sm / lg / icon. Use `asChild` to render the styles on
 * a different element (e.g. a Next `<Link>`) via Radix Slot.
 */
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
    "transition-colors transition-shadow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ifr-bg)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ifr-cta-bg)] text-[var(--ifr-cta-fg)] hover:bg-[var(--ifr-cta-bg-hover)]",
        secondary:
          "border border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text)] hover:bg-[var(--ifr-surface-muted)]",
        ghost:
          "text-[var(--ifr-text-muted)] hover:bg-[var(--ifr-surface-muted)] hover:text-[var(--ifr-text)]",
        outline:
          "border border-[var(--ifr-accent)]/40 bg-[var(--ifr-accent)]/5 text-[var(--ifr-accent)] hover:bg-[var(--ifr-accent)]/10",
        destructive:
          "bg-[var(--ifr-danger)] text-white hover:bg-[var(--ifr-danger)]/90",
        link: "text-[var(--ifr-accent)] underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
