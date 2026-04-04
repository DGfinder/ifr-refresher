import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--ifr-border)] bg-[var(--ifr-surface)] px-6 py-10 text-center",
        className
      )}
    >
      {icon && (
        <span className="mb-3 text-4xl leading-none" aria-hidden>
          {icon}
        </span>
      )}
      <h3 className="text-base font-semibold text-[var(--ifr-text)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[var(--ifr-text-muted)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** No quiz history yet */
export function QuizHistoryEmptyState() {
  return (
    <EmptyState
      icon="🛫"
      title="No sessions yet"
      description="Complete your first quiz to see your history and track your progress."
    />
  );
}

/** No weak flashcards */
export function NoWeakCardsEmptyState() {
  return (
    <EmptyState
      icon="🏆"
      title="No weak cards — you're solid!"
      description="Keep reviewing to stay sharp. Switch to All Cards to drill everything."
    />
  );
}

/** Fresh start on flashcards */
export function FlashcardFreshStartState({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      icon="🎯"
      title="Ready to start studying?"
      description="You haven't seen these cards yet. Let's get you airborne."
      action={
        <button
          onClick={onStart}
          className="rounded-xl bg-[var(--ifr-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--ifr-accent)]/90 active:scale-[0.97] dark:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          Start Studying
        </button>
      }
    />
  );
}

/** Study page — no modules match search */
export function NoResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title={`No modules matching "${query}"`}
      description="Try a different search term or browse by category."
    />
  );
}
