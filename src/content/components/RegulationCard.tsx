import { ScrollText } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface RegulationCardProps {
  items: readonly string[];
}

/**
 * One card per regulation. Each item is parsed for a leading citation
 * ("<Source> — <body>") so the citation can render as a small-caps header
 * and the regulation body underneath with proper paragraph rhythm.
 *
 * Body text is further broken at semantic separators (`; (a)`, `; (b)` …)
 * into a sub-list so multi-clause regulations are scannable instead of
 * landing as a single long paragraph.
 */
export function RegulationCard({ items }: RegulationCardProps) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 space-y-3">
      <header className="flex items-center gap-1.5">
        <ScrollText
          size={14}
          aria-hidden="true"
          className="text-[var(--ifr-text-muted)]"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ifr-text-muted)]">
          Regulation
        </p>
      </header>
      <div className="space-y-2">
        {items.map((item, i) => {
          const { citation, body } = splitCitation(item);
          const clauses = splitClauses(body);
          return (
            <article
              key={i}
              className={cn(
                "rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 shadow-sm",
                "border-l-4 border-l-[var(--ifr-accent)]/40",
              )}
            >
              {citation && (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ifr-accent)]">
                  {citation}
                </p>
              )}
              {clauses.length <= 1 ? (
                <p className="text-sm leading-relaxed text-[var(--ifr-text)]">
                  {body}
                </p>
              ) : (
                <>
                  {clauses[0] && (
                    <p className="text-sm leading-relaxed text-[var(--ifr-text)]">
                      {clauses[0]}
                    </p>
                  )}
                  <ul className="mt-2 space-y-1.5">
                    {clauses.slice(1).map((clause, j) => (
                      <li
                        key={j}
                        className="pl-4 text-sm leading-relaxed text-[var(--ifr-text)]/90"
                      >
                        {clause}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Pull the citation prefix off a regulation item. We look for the en/em-dash
 * separator (` — ` or ` – `) preceded by what reads like a source token
 * (capitalised, references with slashes, paragraph numbers, etc). Returns
 * `{citation: null, body: item}` if no clean citation is found, so we never
 * lose content.
 */
function splitCitation(item: string): {
  citation: string | null;
  body: string;
} {
  const match = item.match(/^([A-Z][^—–]{2,140})\s+[—–]\s+([\s\S]+)$/);
  if (!match) return { citation: null, body: item };
  return { citation: match[1]!.trim(), body: match[2]!.trim() };
}

/**
 * Split a regulation body into a lead-in clause and sub-clauses where the
 * source uses the standard `; (a) … (b) …` enumerator. The lead-in is
 * preserved verbatim — only proper enumerated clauses are pulled out, so
 * sentences using a colon stay as one paragraph.
 */
function splitClauses(body: string): string[] {
  // Find the first enumerator like " (a) " (preceded by colon or semicolon
  // typically). If none, return the body as a single chunk.
  const enumeratorPattern = /(?:[:;]\s*)?\((?=[a-z]\))/;
  const firstIdx = body.search(enumeratorPattern);
  if (firstIdx === -1) return [body];

  const lead = body.slice(0, firstIdx).replace(/[:;]\s*$/, "").trim();
  const tail = body.slice(firstIdx);
  // Now split the tail on enumerators while keeping the enumerator with
  // each clause.
  const parts = tail
    .split(/\s*(?:;|\.)?\s*(?=\([a-z]\)\s)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [lead, ...parts];
}
