"use client";

interface ProgressStripProps {
  completedModules: number;
  totalModules: number;
  weakCount: number;
  onWeakQuestionsClick?: () => void;
}

export function ProgressStrip({
  completedModules,
  totalModules,
  weakCount,
  onWeakQuestionsClick,
}: ProgressStripProps) {
  const progressPercent = totalModules > 0
    ? (completedModules / totalModules) * 100
    : 0;

  return (
    <div className="border-b border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-4 py-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--ifr-text-muted)]">
          Completed: {completedModules}/{totalModules}
        </span>
        {onWeakQuestionsClick ? (
          <button
            type="button"
            onClick={onWeakQuestionsClick}
            className="text-[var(--ifr-warning)] opacity-80 hover:opacity-100 hover:underline underline-offset-2"
          >
            Weak questions: {weakCount}
          </button>
        ) : (
          <span className="text-[var(--ifr-warning)] opacity-80">
            Weak questions: {weakCount}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--ifr-border)]">
        <div
          className="h-full rounded-full bg-[var(--ifr-accent)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
