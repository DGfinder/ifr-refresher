import type { Reference } from "./section";

export type Speaker = "pilot" | "atc";

export type AtcStation =
  | "ground"
  | "tower"
  | "delivery"
  | "approach"
  | "departure"
  | "centre"
  | "info"
  | "unicom";

export type RadioOptionId = "A" | "B" | "C" | "D";

export interface RadioTransmission {
  speaker: Speaker;
  /** Which controller is talking or being addressed. Optional for pilot
   * follow-up calls where the station is unambiguous from context. */
  station?: AtcStation;
  text: string;
}

export interface RadioOption {
  id: RadioOptionId;
  text: string;
}

/**
 * Multiple-choice question: "pick the right call as a single sentence".
 */
export interface RadioMCQ {
  kind: "mcq";
  /** Stable id, unique within its scenario. */
  id: string;
  prompt: string;
  options: RadioOption[];
  correctOptionId: RadioOptionId;
  explanation?: string;
}

/**
 * Readback chip-pick: the learner toggles each chip on/off and must end up
 * with exactly the required set selected. Tests "do you know WHICH elements
 * must be read back" rather than full-sentence phrasing.
 */
export interface ReadbackChip {
  /** Free-form id, unique within the readback. Persists in user history
   * once we wire it into storage. */
  id: string;
  text: string;
}

export interface RadioReadback {
  kind: "readback";
  /** Stable id, unique within its scenario. */
  id: string;
  prompt: string;
  chips: ReadbackChip[];
  /** Chip ids that MUST be selected. A correct answer is exactly this set
   * (no missing, no extras). */
  requiredIds: string[];
  explanation?: string;
}

/**
 * Spoken radio call: the learner actually says the call (via Web Speech) or
 * types it. The transcript is matched element-by-element against the
 * AIP-standard phrasing.
 *
 * Each element accepts a list of legal phrasings (e.g. "climb to seven
 * thousand" / "climbing seven thousand" / "seven thousand") so the matcher
 * is forgiving on phrasing variation but strict on which elements were
 * present. Required elements fail the call when missing; recommended
 * elements are flagged on the reveal but don't fail.
 */
export interface SpokenCallElement {
  /** Label shown on the reveal card, e.g. "Addressed station". */
  label: string;
  /** Any one of these phrasings (after normalisation) counts as a hit. */
  accept: string[];
  /** Required for a correct call. Recommended elements still show on the
   * reveal but don't fail the call when missing. */
  required: boolean;
  /** Hint shown on the reveal when this element is missed. */
  hint?: string;
}

export interface RadioSpokenCall {
  kind: "spoken";
  /** Stable id, unique within its scenario. */
  id: string;
  prompt: string;
  /** Exemplar AIP-standard call, shown verbatim on the reveal. */
  expectedText: string;
  elements: SpokenCallElement[];
  explanation?: string;
}

export type RadioChallenge = RadioMCQ | RadioReadback | RadioSpokenCall;

export interface RadioLeg {
  /** Stable id, unique within its scenario. */
  id: string;
  transmission: RadioTransmission;
  /** Present on pilot legs the learner must answer. ATC legs and scripted
   * pilot follow-ups omit this. Tagged via `kind` so MCQ and chip-pick
   * readback are mutually exclusive per leg. */
  question?: RadioChallenge;
}

export interface RadioBriefing {
  callsign: string;
  aircraftType?: string;
  departure?: string;
  destination?: string;
  flightRules: "IFR" | "VFR";
  summary: string;
}

export interface RadioScenario {
  version: string;
  /** Stable id (persisted history references this). */
  scenarioId: string;
  title: string;
  briefing: RadioBriefing;
  legs: RadioLeg[];
  refs: Reference[];
  tags?: string[];
}

/**
 * Flight phase for the Drill tab. The dashboard filters by phase so a
 * learner can target the calls that are weakest for them.
 */
export type RadioPhase =
  | "pre-departure"
  | "departure"
  | "enroute"
  | "arrival"
  | "final"
  | "non-normal";

/**
 * Australian airspace class. Drill cards are tagged so the dashboard can
 * filter by class — Class C/D/E phraseology is structured ATC interaction;
 * CTAF (Class G non-towered) is broadcasts to other pilots.
 */
export type AirspaceClass = "C" | "D" | "E" | "CTAF";

/**
 * Drill card — a single standalone radio call, suitable for repeated
 * practice without the lead-up of a multi-leg scenario. Drill cards
 * carry their own briefing (situation, last ATC transmission heard) so
 * the learner has enough context to produce the call cold.
 */
export interface RadioDrillCard {
  version: string;
  /** Stable id, unique across all drill cards. Persists in history. */
  drillId: string;
  phase: RadioPhase;
  /** Optional — generated cards always set this; hand-authored cards may
   * omit it when the airspace is implicit in the briefing text. */
  airspaceClass?: AirspaceClass;
  title: string;
  briefing: RadioBriefing & {
    /** What ATC just said, if any. Drill cards that respond to an ATC
     * instruction include the transmission verbatim; cards that initiate
     * a transmission (e.g. "request taxi") omit this. */
    lastTransmission?: RadioTransmission;
  };
  challenge: RadioChallenge;
  refs: Reference[];
  tags?: string[];
}
