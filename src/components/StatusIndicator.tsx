import type { ModuleStatus } from "@/types/progress";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: ModuleStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusIndicator({
  status,
  size = "sm",
  className,
}: StatusIndicatorProps) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (status === "completed") {
    return (
      <svg
        className={cn(sizeClasses, "text-[var(--ifr-success)]", className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="Completed"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (status === "in-progress") {
    return (
      <svg
        className={cn(sizeClasses, "text-[var(--ifr-warning)]", className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-label="In Progress"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
          clipRule="evenodd"
        />
        <path d="M10 4a6 6 0 016 6h-6V4z" />
      </svg>
    );
  }

  // not-started
  return (
    <svg
      className={cn(sizeClasses, "text-[var(--ifr-text-muted)] opacity-40", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 20 20"
      aria-label="Not Started"
    >
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}
