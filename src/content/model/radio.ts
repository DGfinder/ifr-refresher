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

export interface RadioMCQ {
  /** Stable id, unique within its scenario. Used as part of the persisted
   * answer key — do not rename without a migration. */
  id: string;
  prompt: string;
  options: RadioOption[];
  correctOptionId: RadioOptionId;
  explanation?: string;
}

export interface RadioLeg {
  /** Stable id, unique within its scenario. */
  id: string;
  transmission: RadioTransmission;
  /** Present on pilot legs the learner must answer. ATC legs and scripted
   * pilot follow-ups omit this. */
  question?: RadioMCQ;
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
