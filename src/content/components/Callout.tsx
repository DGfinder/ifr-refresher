import { AlertTriangle, Compass, Info, Lightbulb, ListOrdered } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Semantic callout card — replaces the bullet-list-on-grey-card pattern that
 * made every block look identical. Variant chooses an icon + a tinted
 * surface so the eye can tell "regulation" from "warning" from "worked
 * example" at a glance.
 *
 * Title is the block's role (e.g. "Common Traps", "In Practice"), shown
 * small-caps in the variant's accent colour. Items render as a tight list
 * with the right line-height for paragraph-length entries.
 */
interface CalloutProps {
  variant: "trap" | "practice" | "reference" | "scenario";
  title: string;
  items: readonly string[];
}

const VARIANTS = {
  trap: {
    surface: "border-[var(--ifr-warning)]/40 bg-[var(--ifr-warning-soft)]",
    title: "text-[var(--ifr-warning)]",
    icon: AlertTriangle,
    iconColor: "text-[var(--ifr-warning)]",
  },
  practice: {
    surface: "border-[var(--ifr-info)]/40 bg-[var(--ifr-info-soft)]",
    title: "text-[var(--ifr-info)]",
    icon: Lightbulb,
    iconColor: "text-[var(--ifr-info)]",
  },
  reference: {
    surface: "border-[var(--ifr-border)] bg-[var(--ifr-surface-muted)]/50",
    title: "text-[var(--ifr-text-muted)]",
    icon: Info,
    iconColor: "text-[var(--ifr-text-muted)]",
  },
  scenario: {
    surface: "border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5",
    title: "text-[var(--ifr-accent)]",
    icon: Compass,
    iconColor: "text-[var(--ifr-accent)]",
  },
} as const;

export function Callout({ variant, title, items }: CalloutProps) {
  if (items.length === 0) return null;
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <section
      className={cn(
        "mb-4 rounded-xl border p-4 shadow-sm",
        v.surface,
      )}
    >
      <header className="mb-2 flex items-center gap-1.5">
        <Icon size={14} aria-hidden="true" className={v.iconColor} />
        <p className={cn("eyebrow", v.title)}>{title}</p>
      </header>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative pl-4 text-sm leading-relaxed text-[var(--ifr-text)]/90 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-current before:opacity-50"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

interface StoryListProps {
  items: readonly string[];
}

/**
 * Numbered scenario walk-through — each step gets a chip with the step
 * number so the eye can find "step 2" without counting bullets. Replaces
 * the bullet-list-in-grey-card rendering for the scenario block.
 */
export function StoryList({ items }: StoryListProps) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 rounded-xl border border-[var(--ifr-accent)]/30 bg-[var(--ifr-accent)]/5 p-4 shadow-sm">
      <header className="mb-3 flex items-center gap-1.5">
        <ListOrdered
          size={14}
          aria-hidden="true"
          className="text-[var(--ifr-accent)]"
        />
        <p className="eyebrow-accent">Worked Scenario</p>
      </header>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ifr-accent)] text-xs font-semibold text-white"
            >
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-[var(--ifr-text)]/90">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
