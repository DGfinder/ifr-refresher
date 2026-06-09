import type { RadioScenario } from "@/content/model/radio";
import ifrClearanceBankstown from "../data/radio/ifr-clearance-ybnk.json";
import ifrEnrouteHandoff from "../data/radio/ifr-enroute-handoff.json";

export const radioScenarios: RadioScenario[] = [
  ifrClearanceBankstown as RadioScenario,
  ifrEnrouteHandoff as RadioScenario,
];

export function getRadioScenarioById(id: string): RadioScenario | undefined {
  return radioScenarios.find((s) => s.scenarioId === id);
}
