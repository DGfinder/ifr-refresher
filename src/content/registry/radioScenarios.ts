import type { RadioScenario } from "@/content/model/radio";
import ifrClearanceBankstown from "../data/radio/ifr-clearance-ybnk.json";

export const radioScenarios: RadioScenario[] = [
  ifrClearanceBankstown as RadioScenario,
];

export function getRadioScenarioById(id: string): RadioScenario | undefined {
  return radioScenarios.find((s) => s.scenarioId === id);
}
