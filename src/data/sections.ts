import type { Section } from "@/types/section";
import administrativePart61 from "./administrative-part61.json";
import airspaceAtcServices from "./airspace-atc-services.json";
import fuelAlternates from "./fuel-alternates.json";
import departure from "./departure.json";
import enRoute from "./en-route.json";
import holding from "./holding.json";
import approaches from "./approaches.json";
import performanceGradient from "./performance-gradient.json";
import miscellaneousTechnical from "./miscellaneous-technical.json";
import regulatoryCore from "./regulatory-core.json";
import aipEnrAltimetry from "./aip-enr1-7-altimetry.json";
import proceduresApproaches from "./procedures-approaches.json";
import airlineScenariosPanel from "./airline-scenarios-panel.json";
import advancedIfrRegsAirlineOps from "./advanced-ifr-regs-airline-ops.json";
import ifrNumericAbnormal from "./ifr-numeric-abnormal.json";
import regulatoryMap from "./regulatory-map.json";
import casaTraps from "./casa-traps.json";

export const sections: Section[] = [
  administrativePart61 as Section,
  airspaceAtcServices as Section,
  fuelAlternates as Section,
  departure as Section,
  enRoute as Section,
  holding as Section,
  approaches as Section,
  performanceGradient as Section,
  miscellaneousTechnical as Section,
  regulatoryCore as Section,
  aipEnrAltimetry as Section,
  proceduresApproaches as Section,
  airlineScenariosPanel as Section,
  advancedIfrRegsAirlineOps as Section,
  ifrNumericAbnormal as Section,
  regulatoryMap as Section,
  casaTraps as Section,
];
