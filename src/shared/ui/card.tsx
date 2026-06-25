"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

/**
 * shadcn-style Card surface keyed to IFR tokens. Compose with
 * CardHeader / CardTitle / CardDescription / CardContent / CardFooter
 * to get a consistent semantic structure across the app.
 *
 * Replaces the recurring `<div className="rounded-xl border bg-[var(--ifr-surface)] p-4">` pattern.
 *
 * Set `interactive` to get the hover / focus-visible / active treatment
 * for cards that are tappable (wrapped in a `<button>` or `<Link>`).
 * Callers were re-implementing the same hover/focus-ring pattern in
 * a dozen places — this consolidates it.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] text-[var(--ifr-text)] shadow-sm",
        interactive && [
          "transition-[colors,transform,shadow] cursor-pointer",
          "hover:border-[var(--ifr-accent)]/50 hover:bg-[var(--ifr-accent)]/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]",
          "active:scale-[0.99]",
        ],
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 p-4 pb-2", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-semibold text-[var(--ifr-text-muted)]", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-[var(--ifr-text-muted)]", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
