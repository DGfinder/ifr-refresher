import type { Reference } from "@/content/model/section";

interface SourceReviewStatusProps {
  refs: Reference[];
  onViewReferences: () => void;
}

/** References establish provenance; they do not establish aviation sign-off. */
export function SourceReviewStatus({ refs, onViewReferences }: SourceReviewStatusProps) {
  return (
    <div className="mb-5 rounded-lg border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 text-sm">
      <p className="font-medium text-[var(--ifr-text)]">Source verification pending</p>
      <p className="mt-1 text-[var(--ifr-text-muted)]">
        A completed aviation source review is not recorded for this lesson.
        Check the cited edition and applicable aircraft or operator requirements when reviewing an answer.
      </p>
      <button
        type="button"
        onClick={onViewReferences}
        className="mt-2 rounded-sm font-medium text-[var(--ifr-accent)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ifr-focus-ring)]"
      >
        View sources and edition notes{refs.length > 0 ? ` (${refs.length})` : ""}
      </button>
    </div>
  );
}
