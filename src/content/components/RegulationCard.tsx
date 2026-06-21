import { cn } from "@/shared/lib/cn";

interface RegulationCardProps {
  items: readonly string[];
}

/**
 * One card per regulation, led by the SUBJECT (what the rule is about),
 * with the citation as a small subordinate line and the body underneath.
 *
 * Parsing is two-pass:
 *  1. Strip the leading "<Source> — " citation prefix (e.g. "Part 91 MOS
 *     8.07 — …"). What remains is the rule statement.
 *  2. If the rule statement starts with a short "Subject: …" pattern (e.g.
 *     "Weather triggers (…): cloud more than …"), pull the subject out as
 *     the card heading and use the remainder as the body.
 *
 * The body itself is further broken at `(a) (b) (c)` enumerators into a
 * sub-list so multi-clause rules don't land as one wall of text. If a card
 * has no parseable subject, the citation steps up to act as the heading so
 * we never render a heading-less card.
 */
export function RegulationCard({ items }: RegulationCardProps) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 space-y-3">
      <header className="flex items-center gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ifr-text-muted)]">
          Regulation
        </p>
      </header>
      <div className="space-y-3">
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
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ifr-text-muted)]">
                  {subline}
                </p>
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
      </div>
    </section>
  );
}

/**
 * Pull the citation prefix off a regulation item. We look for the en/em-dash
 * separator (` — ` or ` – `) preceded by what reads like a source token
 * (capitalised, references with slashes, paragraph numbers, etc). Returns
 * `{citation: null, body: item}` if no clean citation is found.
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
 * Pull a leading "Subject: rest" out of the body so the card can lead with
 * the topic instead of the citation. The subject must be short (≤80 chars),
 * single-line, and free of sentence-ending punctuation so we don't grab a
 * whole sentence by accident.
 *
 * Parenthetical qualifiers are allowed in the subject (e.g.
 * "Weather triggers (currency-of or 30 min prior to arrival)").
 */
function splitSubject(body: string): {
  subject: string | null;
  rest: string;
} {
  const match = body.match(/^([^:.\n;]{2,80}(?:\([^)]+\))?[^:.\n;]{0,40}):\s+([\s\S]+)$/);
  if (!match) return { subject: null, rest: body };
  const subject = match[1]!.trim();
  // Sanity: a subject shouldn't itself end in a comma — that's usually a
  // clause inside a longer sentence, not a topic label.
  if (subject.endsWith(",")) return { subject: null, rest: body };
  return { subject, rest: match[2]!.trim() };
}

/**
 * Split a regulation body into a lead-in clause and sub-clauses where the
 * source uses the standard `(a) … (b) …` enumerator. The lead-in is
 * preserved verbatim — only proper enumerated clauses are pulled out, so
 * sentences using a colon stay as one paragraph.
 */
function splitClauses(body: string): string[] {
  const enumeratorPattern = /(?:[:;]\s*)?\((?=[a-z]\))/;
  const firstIdx = body.search(enumeratorPattern);
  if (firstIdx === -1) return [body];

  const lead = body.slice(0, firstIdx).replace(/[:;]\s*$/, "").trim();
  const tail = body.slice(firstIdx);
  const parts = tail
    .split(/\s*(?:;|\.)?\s*(?=\([a-z]\)\s)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [lead, ...parts];
}
