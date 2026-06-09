import type { RadioScenario } from "@/content/model/radio";
import ifrClearanceBankstown from "../data/radio/ifr-clearance-ybnk.json";
import ifrEnrouteHandoff from "../data/radio/ifr-enroute-handoff.json";
import ifrMissedApproachCanberra from "../data/radio/ifr-missed-approach-yscb.json";

export const radioScenarios: RadioScenario[] = [
  ifrClearanceBankstown as RadioScenario,
  ifrEnrouteHandoff as RadioScenario,
  ifrMissedApproachCanberra as RadioScenario,
];

export function getRadioScenarioById(id: string): RadioScenario | undefined {
  return radioScenarios.find((s) => s.scenarioId === id);
}
