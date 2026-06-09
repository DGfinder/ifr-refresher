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

export type RadioChallenge = RadioMCQ | RadioReadback;

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
