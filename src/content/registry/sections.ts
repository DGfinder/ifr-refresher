import type { Section } from "@/content/model/section";
import administrativePart61 from "../data/administrative-part61.json";
import airspaceAtcServices from "../data/airspace-atc-services.json";
import fuelAlternates from "../data/fuel-alternates.json";
import departure from "../data/departure.json";
import enRoute from "../data/en-route.json";
import holding from "../data/holding.json";
import approaches from "../data/approaches.json";
import performanceGradient from "../data/performance-gradient.json";
import miscellaneousTechnical from "../data/miscellaneous-technical.json";
import airlineScenariosPanel from "../data/airline-scenarios-panel.json";
import advancedIfrRegsAirlineOps from "../data/advanced-ifr-regs-airline-ops.json";
import quickFireNumbers from "../data/quick-fire-numbers.json";
import casaTraps from "../data/casa-traps.json";
import cheatSheet from "../data/cheat-sheet.json";

export const sections: Section[] = [
  cheatSheet as Section,
  administrativePart61 as Section,
  airspaceAtcServices as Section,
  fuelAlternates as Section,
  departure as Section,
  enRoute as Section,
  holding as Section,
  approaches as Section,
  performanceGradient as Section,
  miscellaneousTechnical as Section,
  airlineScenariosPanel as Section,
  advancedIfrRegsAirlineOps as Section,
  quickFireNumbers as Section,
  casaTraps as Section,
];
