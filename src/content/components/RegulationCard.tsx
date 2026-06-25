import { cn } from "@/shared/lib/cn";
import {
  splitCitation,
  splitClauses,
  splitSubject,
} from "./regulationParse";

interface RegulationCardProps {
  items: readonly string[];
}

/**
 * One card per regulation, led by the SUBJECT (what the rule is about),
 * with the citation as a small subordinate line and the body underneath.
 *
 * No section-level "Regulation" header — the card layout (left border,
 * citation, subject heading) is enough signal. Adding a small-caps header
 * above every single card was just noise once content was split into one
 * LAW block per topic.
 */
export function RegulationCard({ items }: RegulationCardProps) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 space-y-3">
      {items.map((item, i) => {
        const { citation, body } = splitCitation(item);
        const { subject, rest } = splitSubject(body);
        const clauses = splitClauses(rest);
        const heading = subject ?? citation;
        const subline = subject ? citation : null;
        return (
          <article
            key={i}
            className={cn(
              "rounded-xl border border-[var(--ifr-border)] bg-[var(--ifr-surface)] p-4 shadow-sm",
              "border-l-4 border-l-[var(--ifr-accent)]/40",
            )}
          >
            {heading && (
              <h3 className="text-base font-semibold leading-snug text-[var(--ifr-text)]">
                {heading}
              </h3>
            )}
            {subline && (
              <p className="eyebrow mt-1">{subline}</p>
            )}
            <div className={cn(heading || subline ? "mt-3" : null)}>
              {clauses.length <= 1 ? (
                <p className="text-sm leading-relaxed text-[var(--ifr-text)]/90">
                  {rest}
                </p>
              ) : (
                <>
                  {clauses[0] && (
                    <p className="text-sm leading-relaxed text-[var(--ifr-text)]/90">
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
            </div>
          </article>
        );
      })}
    </section>
  );
}
