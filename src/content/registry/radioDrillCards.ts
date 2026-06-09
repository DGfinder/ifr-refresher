import type { RadioDrillCard, RadioPhase } from "@/content/model/radio";
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

export const radioDrillCards: RadioDrillCard[] = [
  clearanceRequest as RadioDrillCard,
  clearanceReadback as RadioDrillCard,
  taxiRequest as RadioDrillCard,
  takeoffReadback as RadioDrillCard,
  centreCheckin as RadioDrillCard,
  positionReport as RadioDrillCard,
  approachClearanceReadback as RadioDrillCard,
  holdReadback as RadioDrillCard,
  goingAround as RadioDrillCard,
  panPanDeclaration as RadioDrillCard,
];

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
