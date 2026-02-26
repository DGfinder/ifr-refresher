import type { Section } from "@/types/section";
import regulatoryCore from "./regulatory-core.json";
import aipEnrAltimetry from "./aip-enr1-7-altimetry.json";
import proceduresApproaches from "./procedures-approaches.json";
import airlineScenariosPanel from "./airline-scenarios-panel.json";
import advancedIfrRegsAirlineOps from "./advanced-ifr-regs-airline-ops.json";
import ifrNumericAbnormal from "./ifr-numeric-abnormal.json";
import regulatoryMap from "./regulatory-map.json";
import casaTraps from "./casa-traps.json";

export const sections: Section[] = [
  regulatoryCore as Section,
  aipEnrAltimetry as Section,
  proceduresApproaches as Section,
  airlineScenariosPanel as Section,
  advancedIfrRegsAirlineOps as Section,
  ifrNumericAbnormal as Section,
  regulatoryMap as Section,
  casaTraps as Section,
];
