"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "core" | "advanced" | "airline";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  core: "bg-muted text-muted-foreground",
  advanced: "bg-accent text-accent-foreground",
  airline: "border border-primary text-primary bg-transparent",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
