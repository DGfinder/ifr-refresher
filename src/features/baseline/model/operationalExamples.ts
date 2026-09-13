import { briefExamples } from "./briefExamples";

const sources = {
  casr: { label: "CASR 1998", url: "https://www.legislation.gov.au/F1998B00220/latest" },
  mos91: { label: "Part 91 MOS", url: "https://www.legislation.gov.au/F2020L01514/latest" },
  mos135: { label: "Part 135 MOS", url: "https://www.legislation.gov.au/F2020L01622/latest" },
  mos121: { label: "Part 121 MOS", url: "https://www.legislation.gov.au/F2020L01561/latest" },
  mel: { label: "CASA: minimum equipment lists", url: "https://www.casa.gov.au/rules/changing-rules/flight-operations-regulations-transition/minimum-equipment-list-mel" },
};
type Reference = { source: keyof typeof sources; sections: string };
type OperationNote = { part: "Part 91" | "Part 135" | "Part 121"; text: string; references: Reference[] };
export type OperationalExample = {
  id: string; parentTopic: string; title: string; principle: string; setting: string;
  assumptions: string[]; facts: [string, string, string?][]; question: string;
  decision: string; reasoning: string[]; operations: OperationNote[];
  variation: { question: string; answer: string }; references: Reference[];
  sourceNote?: string;
  compact?: boolean;
};
export const operationalSources = sources;
export const operationalReviewDate = "13 September 2026";

export const operationalExamples: OperationalExample[] = [
  {
    "id": "amended-taf",
    "parentTopic": "preflight-fuel",
    "compact": true,
    "title": "In-flight example",
    "principle": "You need enough fuel to reach Albany, wait for the weather and land with your 45-minute final reserve still on board.",
    "setting": "You’re flying a piston twin to Albany under Part 91 IFR. From your current position, you have one hour of cruising left before descent, using an estimated 130 litres per hour. Before departure, you planned for a TEMPO period of visibility below alternate minima around your arrival time. You included 60 minutes of holding fuel instead of nominating an alternate for that weather. Your in-flight fuel check now needs to account for that planned hold. In this example, your twin uses 100 litres per hour in the holding configuration.",
    "facts": [
      [
        "Fly the remaining cruise leg",
        "1 hr × 130 L/hr = 130 L"
      ],
      [
        "Descend, fly the approach and land",
        "20 L assumed"
      ],
      [
        "Allow for an hour of holding",
        "60 min × 100 L/hr = 100 L"
      ],
      [
        "Keep 45 minutes of final reserve",
        "45 min × 100 L/hr = 75 L",
        "This fuel must still be on board when you land. Calculate it at holding speed, 1,500 ft above the aerodrome, in ISA conditions and at your estimated arrival weight. We’ve assumed 100 L/hr here; use your aircraft’s fuel data."
      ],
      [
        "Fuel you need on board now",
        "325 L"
      ]
    ],
    "decision": "With 325 litres on board now, you can fly to Albany, hold for an hour and land with 75 litres remaining. That last 75 litres is your final reserve.",
    "variation": {
      "question": "INTER instead?",
      "answer": "If the forecast said INTER instead of TEMPO, you would allow 30 minutes of holding: 50 litres. You would need 275 litres on board now, still leaving 75 litres when you land."
    },
    "assumptions": [
      "Fictional Part 91 IFR example for a piston twin with MTOW at or below 5,700 kg. Cruise consumption is 130 L/hr; the 100 L/hr holding/reserve rate and 20 L arrival allowance are illustrative, not verified aircraft data.",
      "Reserve uses holding speed at 1,500 ft above aerodrome elevation, ISA and the relevant arrival weight. Use aircraft-specific data for both holding and reserve.",
      "This is fuel required from the stated in-flight point, not a departure fuel load. No separate alternate requirement, TAF3 exception or other additional allowance applies in this example. No discretionary margin is included.",
      "TEMPO conditions are otherwise temporary with suitable prevailing weather. Reassess before delays consume the reserve."
    ],
    "question": "",
    "reasoning": [],
    "operations": [],
    "references": [
      {
        "source": "mos91",
        "sections": "Final reserve definition; 8.04(6); 19.02–19.06"
      }
    ]
  },

];

export function operationalExampleFor(topicId: string) {
  return briefExamples.find((example) => example.parentTopic === topicId) ?? operationalExamples.find((example) => example.parentTopic === topicId);
}
