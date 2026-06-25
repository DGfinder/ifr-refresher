import { Hash } from "lucide-react";

interface NumbersGridProps {
  items: readonly string[];
}

/**
 * Two-column key-numbers grid. Each item parses as `<value> — <description>`;
 * the value renders large and brand-coloured on the left, the description on
 * the right with proper paragraph spacing. Replaces the bullet-list-of-
 * em-dashed strings rendering so a learner can scan the numbers in seconds.
 *
 * Items without a clean `value — description` split degrade to a single
 * full-width row so we never silently drop content.
 */
export function NumbersGrid({ items }: NumbersGridProps) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)]/80 p-4 shadow-sm">
      <header className="mb-3 flex items-center gap-1.5">
        <Hash
          size={14}
          aria-hidden="true"
          className="text-[var(--ifr-text-muted)]"
        />
        <p className="eyebrow">Key Numbers</p>
      </header>
      <dl className="divide-y divide-[var(--ifr-border)]/60">
        {items.map((item, i) => {
          const { value, description } = splitNumber(item);
          if (!description) {
            return (
              <div key={i} className="py-2 text-sm leading-relaxed text-[var(--ifr-text)]">
                {item}
              </div>
            );
          }
          return (
            <div
              key={i}
              className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3 py-2 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4"
            >
              <dt className="text-sm font-bold text-[var(--ifr-accent)]">
                {value}
              </dt>
              <dd className="text-sm leading-relaxed text-[var(--ifr-text)]/90">
                {description}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function splitNumber(item: string): { value: string; description: string | null } {
  const match = item.match(/^([^—–]{1,80})\s+[—–]\s+([\s\S]+)$/);
  if (!match) return { value: item, description: null };
  return { value: match[1]!.trim(), description: match[2]!.trim() };
}
