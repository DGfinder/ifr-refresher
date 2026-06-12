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

  // Web Speech often welds waypoint + time into one token when the learner
  // says "MARLE at four five" (e.g. "Mile45"). Expand the known compact
  // form before digit expansion so element matching can still see the
  // waypoint and position time separately.
  out = out.replace(/\b(?:marle|marley|marly|marlee|mile)\s*(\d{2})\b/g, "marle at $1");

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

function tokenisePhrase(text: string): string[] {
  return normalisePhrase(text).split(" ").filter(Boolean);
}

function isWithinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }

  if (i < a.length || j < b.length) edits += 1;
  return edits <= 1;
}

function tokensMatch(actual: string, expected: string): boolean {
  if (actual === expected) return true;
  // Web Speech near-misses on NATO/callsign words are usually a single
  // consonant off ("Bike" for "Mike"). Keep this conservative: no fuzzy
  // matching for short tokens or digit words.
  if (actual.length < 4 || expected.length < 4) return false;
  if (Object.values(DIGIT_WORDS).includes(actual) || Object.values(DIGIT_WORDS).includes(expected)) {
    return false;
  }
  return isWithinOneEdit(actual, expected);
}

function includesNormalisedPhrase(haystack: string, phrase: string): boolean {
  const expected = normalisePhrase(phrase);
  if (!expected) return false;
  if (haystack.includes(expected)) return true;

  const haystackTokens = haystack.split(" ").filter(Boolean);
  const phraseTokens = tokenisePhrase(phrase);
  if (phraseTokens.length === 0 || haystackTokens.length === 0) return false;

  const hasTrailingZero = phraseTokens[phraseTokens.length - 1] === "zero";
  const windowLengths = hasTrailingZero
    ? [phraseTokens.length, phraseTokens.length - 1]
    : [phraseTokens.length];

  return windowLengths.some((windowLength) => {
    if (windowLength <= 0 || windowLength > haystackTokens.length) return false;
    for (let start = 0; start <= haystackTokens.length - windowLength; start += 1) {
      const window = haystackTokens.slice(start, start + windowLength);
      const comparable = phraseTokens.slice(0, windowLength);
      if (comparable.every((token, index) => tokensMatch(window[index] ?? "", token))) {
        return true;
      }
    }
    return false;
  });
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
      includesNormalisedPhrase(haystack, phrase),
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
