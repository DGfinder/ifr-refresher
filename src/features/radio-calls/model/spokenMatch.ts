import type { RadioSpokenCall, SpokenCallElement } from "@/content/model/radio";

const DIGIT_WORDS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};

/**
 * CASA-prescribed aviation pronunciations from the Radiotelephony Manual
 * (Multi-Part AC 64.B-02 / AC 91-35 / AC 172-05, Table 8). The matcher
 * collapses these to the everyday digit words so a learner who says "fife"
 * for five or "niner" for nine scores the same as one who says "five" or
 * "nine". Both are correct under the AC; the everyday form is more common
 * in Australian recreational ops and the CASA form is what an IPC
 * examiner expects in formal RT.
 *
 * Notes:
 *  - "tree" and "ait" are intentionally constrained by word boundaries —
 *    the regex check uses \b so this won't rewrite the word "tree" in
 *    context (e.g. "Christmas tree"); only when it appears as a digit
 *    substitute.
 *  - "wun"/"too"/"fower" follow the same rule.
 */
const CASA_AVIATION_DIGITS: Record<string, string> = {
  wun: "one",
  too: "two",
  tree: "three",
  fower: "four",
  "fow-er": "four",
  fife: "five",
  "sev-en": "seven",
  ait: "eight",
  niner: "nine",
  "nin-er": "nine",
  // Decimal pronunciation per CASA Table 8 ("DAY-SEE-MAL").
  daysee: "decimal",
  daiseemal: "decimal",
};

/**
 * Aviation-aware normalisation. Both the learner's transcript and the
 * element `accept` phrases run through this before comparison so phrasing
 * variants (digit vs word, decimal vs point, casing, punctuation, FL220 vs
 * flight level two two zero, CASA pronunciations vs everyday digits) all
 * score the same.
 *
 * Source: CASA Multi-Part AC 64.B-02 / AC 91-35 / AC 172-05 (Dec 2025)
 * §2.5-2.8 — phonetic alphabet, number pronunciation, standard phrases.
 */
export function normalisePhrase(text: string): string {
  let out = text.toLowerCase().normalize("NFKD");

  // Strip punctuation EXCEPT decimal point (handled below). Keep hyphens
  // for now so CASA hyphenated forms ("fow-er", "nin-er") survive — we
  // collapse hyphens at the end.
  out = out.replace(/[,!?;:"'`]/g, " ");

  // CASA aviation pronunciations → everyday digit words. Done BEFORE
  // hyphen collapse so "fow-er" and "nin-er" can be recognised as units.
  for (const [casa, plain] of Object.entries(CASA_AVIATION_DIGITS)) {
    const escaped = casa.replace(/[-]/g, "\\-");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "g"), plain);
  }

  // "decimal" / "point" / "dot" → a single "decimal" token so 121.7 reads
  // consistently whether spoken or written.
  out = out.replace(/\b(?:decimal|point|dot)\b/g, " decimal ");
  out = out.replace(/\./g, " decimal ");

  // "FL220" → "flight level two two zero".
  out = out.replace(/\bfl\s*(\d{2,3})\b/g, (_match, digits: string) => {
    const spoken = digits
      .split("")
      .map((d) => DIGIT_WORDS[d] ?? d)
      .join(" ");
    return `flight level ${spoken}`;
  });

  // Bare multi-digit numbers (like a squawk "4123" or "0408") → digit words
  // so "4123" matches "four one two three".
  out = out.replace(/\b\d{2,}\b/g, (match) =>
    match
      .split("")
      .map((d) => DIGIT_WORDS[d] ?? d)
      .join(" "),
  );

  // Single digits → word too. Done as a separate pass so it doesn't double-
  // process numbers we already expanded.
  out = out.replace(/\b\d\b/g, (d) => DIGIT_WORDS[d] ?? d);

  // Collapse hyphens inside callsigns ("PAN-PAN" → "PAN PAN").
  out = out.replace(/[-–—]/g, " ");

  // Collapse whitespace.
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

export interface SpokenCallEvaluation {
  isCorrect: boolean;
  hits: SpokenCallElement[];
  missedRequired: SpokenCallElement[];
  missedOptional: SpokenCallElement[];
  normalisedTranscript: string;
}

/**
 * Element-by-element match. The call is correct iff every required element
 * found at least one of its accept phrases somewhere in the normalised
 * transcript. Order is not enforced — AIP allows reorder of secondary items
 * and the API often returns words out of cadence.
 */
export function evaluateSpokenCall(
  call: RadioSpokenCall,
  transcript: string,
): SpokenCallEvaluation {
  const haystack = normalisePhrase(transcript);
  const hits: SpokenCallElement[] = [];
  const missedRequired: SpokenCallElement[] = [];
  const missedOptional: SpokenCallElement[] = [];

  for (const element of call.elements) {
    const matched = element.accept.some((phrase) =>
      haystack.includes(normalisePhrase(phrase)),
    );
    if (matched) {
      hits.push(element);
    } else if (element.required) {
      missedRequired.push(element);
    } else {
      missedOptional.push(element);
    }
  }

  return {
    isCorrect: missedRequired.length === 0,
    hits,
    missedRequired,
    missedOptional,
    normalisedTranscript: haystack,
  };
}
