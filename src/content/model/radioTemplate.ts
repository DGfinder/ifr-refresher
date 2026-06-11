import type {
  AirspaceClass,
  RadioPhase,
  RadioTransmission,
} from "@/content/model/radio";
import type { Reference } from "@/content/model/section";

/**
 * A radio call template — a parameterised drill card that the generator
 * realises against the locations and callsigns registries. One template
 * × N airports × M callsigns yields N × M concrete drill cards, so we
 * cover hundreds of variants from a handful of authored templates.
 *
 * Slot tokens take the form `{slotName}` and are substituted by
 * `realiseRadioTemplate` using the location and callsign values.
 *
 * Standard slots available:
 *  - {icao}, {city}, {airportName}
 *  - {tower}, {ground}, {delivery}, {approach}, {departure}, {centre}
 *  - {ctaf} (e.g. "Mudgee traffic")
 *  - {runway} (the primary runway, e.g. "two nine right")
 *  - {callsign}, {callsignShort}, {aircraftType}
 *  - {destination}, {destinationCity}, {pob} (provided per-template via fixedSlots)
 *  - {atisCode} (random ICAO letter per realisation, A–Z)
 */
export interface RadioCallTemplate {
  /** Stable id used to derive the generated drill card ids. */
  templateId: string;
  phase: RadioPhase;
  /** Which airspace classes this template applies to. CTAF templates omit
   * controlled-airspace classes; controlled templates omit CTAF. */
  applicableClasses: readonly AirspaceClass[];
  title: string;
  prompt: string;
  /** Optional ATC transmission that sets up the call (slot-templated). */
  lastTransmissionTemplate?: {
    speaker: RadioTransmission["speaker"];
    station?: RadioTransmission["station"];
    textTemplate: string;
  };
  /** AIP-standard exemplar. Slot tokens are substituted at realisation. */
  expectedTextTemplate: string;
  /** Required + optional elements with templated accept lists. */
  elements: readonly RadioCallElementTemplate[];
  /** Briefing summary (slot-templated). */
  summaryTemplate: string;
  /** Slots that aren't drawn from location/callsign — e.g. {destination}. */
  fixedSlots?: Readonly<Record<string, string>>;
  explanation?: string;
  refs: readonly Reference[];
  tags?: readonly string[];
}

export interface RadioCallElementTemplate {
  label: string;
  /** Each accept phrase is a slot-templated string. */
  acceptTemplates: readonly string[];
  required: boolean;
  hint?: string;
}
