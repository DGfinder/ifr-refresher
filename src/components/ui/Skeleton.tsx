import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--ifr-surface-muted)]",
        className
      )}
    />
  );
}

/** Three stat cards (last score / best / streak) */
export function QuizStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center"
        >
          <Skeleton className="mx-auto mb-2 h-8 w-14" />
          <Skeleton className="mx-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Full quiz dashboard skeleton */
export function QuizDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <QuizStatsSkeleton />
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}

/** Section list skeleton for the study page */
export function SectionListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-8 ml-4" />
        </div>
      ))}
    </div>
  );
}

/** Quiz question card skeleton */
export function QuizCardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* progress bar */}
      <Skeleton className="mb-6 h-2 w-full rounded-full" />
      <div className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] shadow-lg">
        <div className="p-6 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <div className="border-t border-[var(--ifr-border)] p-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Flashcard stats skeleton (new / weak / seen) */
export function FlashcardStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-center"
        >
          <Skeleton className="mx-auto mb-2 h-8 w-10" />
          <Skeleton className="mx-auto h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
