/**
 * Shared helpers for parsing a LAW block content item into its citation,
 * subject, body and enumerated sub-clauses. Used by RegulationCard for
 * rendering and by SectionToc for chip labels.
 *
 * Input shape (authored convention):
 *   "<Source> — <Subject>: <body with optional (a) (b) (c) enumerators>"
 *
 * Each step is tolerant — if the input doesn't match, we return null for
 * that piece and pass the rest through so no content is silently dropped.
 */

export interface RegulationParse {
  /** The leading "<Source>" citation token, or null if absent. */
  citation: string | null;
  /** The subject heading parsed out of "<Subject>: rest", or null if absent. */
  subject: string | null;
  /** The body text after citation + subject have been stripped. */
  rest: string;
}

export function parseRegulation(item: string): RegulationParse {
  const { citation, body } = splitCitation(item);
  const { subject, rest } = splitSubject(body);
  return { citation, subject, rest };
}

/**
 * Pull the citation prefix off a regulation item. We look for the en/em-dash
 * separator (` — ` or ` – `) preceded by what reads like a source token
 * (capitalised, references with slashes, paragraph numbers, etc).
 */
export function splitCitation(item: string): {
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
 * whole sentence by accident. Parenthetical qualifiers are allowed.
 */
export function splitSubject(body: string): {
  subject: string | null;
  rest: string;
} {
  const match = body.match(/^([^:.\n;]{2,80}(?:\([^)]+\))?[^:.\n;]{0,40}):\s+([\s\S]+)$/);
  if (!match) return { subject: null, rest: body };
  const subject = match[1]!.trim();
  if (subject.endsWith(",")) return { subject: null, rest: body };
  return { subject, rest: match[2]!.trim() };
}

/**
 * Split a regulation body into a lead-in clause and enumerated sub-clauses
 * (`(a) … (b) …`). Returns the body verbatim as a single-element array if
 * there are no enumerators.
 */
export function splitClauses(body: string): string[] {
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
