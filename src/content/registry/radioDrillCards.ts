import type { RadioDrillCard, RadioPhase } from "@/content/model/radio";
import { radioLocations } from "@/content/registry/radioLocations";
import { radioCallsigns } from "@/content/registry/radioCallsigns";
import { radioCallTemplates } from "@/content/registry/radioCallTemplates";
import { generateRadioDrillCards } from "@/features/radio-calls";
import clearanceRequest from "../data/radio-drill/01-ifr-clearance-request.json";
import clearanceReadback from "../data/radio-drill/02-clearance-readback.json";
import taxiRequest from "../data/radio-drill/03-taxi-request.json";
import takeoffReadback from "../data/radio-drill/04-takeoff-readback.json";
import centreCheckin from "../data/radio-drill/05-centre-checkin.json";
import positionReport from "../data/radio-drill/06-position-report.json";
import approachClearanceReadback from "../data/radio-drill/07-approach-clearance-readback.json";
import holdReadback from "../data/radio-drill/08-hold-readback.json";
import goingAround from "../data/radio-drill/09-going-around.json";
import panPanDeclaration from "../data/radio-drill/10-pan-pan-declaration.json";
import lineupRequest from "../data/radio-drill/11-lineup-request.json";
import climbReadback from "../data/radio-drill/12-climb-readback.json";
import descentReadback from "../data/radio-drill/13-descent-readback.json";
import vectoringAcknowledgement from "../data/radio-drill/14-vectoring-acknowledgement.json";
import establishedIls from "../data/radio-drill/15-established-ils.json";
import landingReadback from "../data/radio-drill/16-landing-readback.json";
import missedApproachReadback from "../data/radio-drill/17-missed-approach-readback.json";
import vacateRunway from "../data/radio-drill/18-vacate-runway.json";
import maydayDeclaration from "../data/radio-drill/19-mayday-declaration.json";
import frequencyChangeAck from "../data/radio-drill/20-frequency-change-ack.json";
import sidReadback from "../data/radio-drill/21-sid-readback.json";
import approachCheckin from "../data/radio-drill/22-approach-checkin.json";
import directRouting from "../data/radio-drill/23-direct-routing.json";
import todRequest from "../data/radio-drill/24-tod-request.json";
import compulsoryReport from "../data/radio-drill/25-compulsory-report.json";
import atisRequest from "../data/radio-drill/26-atis-request.json";
import cancelIfr from "../data/radio-drill/27-cancel-ifr.json";
import distressCancellation from "../data/radio-drill/28-distress-cancellation.json";
import speedReadback from "../data/radio-drill/29-speed-readback.json";
import lostComms from "../data/radio-drill/30-lost-comms.json";

/**
 * The 30 hand-authored cards cover nuanced, context-rich scenarios that
 * don't fit a template (e.g. PAN-PAN with situational reasoning). The
 * generator expands the template library against locations × callsigns to
 * produce hundreds more drill cards across all Australian airspace classes.
 * The full library is the concatenation.
 */
const generated = generateRadioDrillCards({
  templates: radioCallTemplates,
  locations: radioLocations,
  callsigns: radioCallsigns,
  callsignsPerCombination: 3,
});

const authored: RadioDrillCard[] = [
  // Pre-departure
  atisRequest as RadioDrillCard,
  clearanceRequest as RadioDrillCard,
  clearanceReadback as RadioDrillCard,
  sidReadback as RadioDrillCard,
  taxiRequest as RadioDrillCard,
  lineupRequest as RadioDrillCard,
  takeoffReadback as RadioDrillCard,
  // En-route
  centreCheckin as RadioDrillCard,
  climbReadback as RadioDrillCard,
  frequencyChangeAck as RadioDrillCard,
  speedReadback as RadioDrillCard,
  positionReport as RadioDrillCard,
  compulsoryReport as RadioDrillCard,
  directRouting as RadioDrillCard,
  todRequest as RadioDrillCard,
  cancelIfr as RadioDrillCard,
  // Arrival
  approachCheckin as RadioDrillCard,
  descentReadback as RadioDrillCard,
  approachClearanceReadback as RadioDrillCard,
  holdReadback as RadioDrillCard,
  vectoringAcknowledgement as RadioDrillCard,
  establishedIls as RadioDrillCard,
  // Final / landing
  landingReadback as RadioDrillCard,
  goingAround as RadioDrillCard,
  missedApproachReadback as RadioDrillCard,
  vacateRunway as RadioDrillCard,
  // Non-normal
  panPanDeclaration as RadioDrillCard,
  maydayDeclaration as RadioDrillCard,
  distressCancellation as RadioDrillCard,
  lostComms as RadioDrillCard,
];

export const radioDrillCards: RadioDrillCard[] = [...authored, ...generated];

export const RADIO_PHASES: { id: RadioPhase; label: string }[] = [
  { id: "pre-departure", label: "Pre-departure" },
  { id: "departure", label: "Departure" },
  { id: "enroute", label: "En-route" },
  { id: "arrival", label: "Arrival" },
  { id: "final", label: "Final / Landing" },
  { id: "non-normal", label: "Non-normal" },
];

export function getRadioDrillCardById(id: string): RadioDrillCard | undefined {
  return radioDrillCards.find((card) => card.drillId === id);
}
