import { describe, expect, it } from "vitest";
import type { ContentBlock } from "@/content/model/section";
import { orderContentBlocksForStudy } from "@/features/study/components/ModuleDetail";

describe("orderContentBlocksForStudy", () => {
  it("preserves study content sequence and only moves active-recall blocks to the end", () => {
    const blocks: ContentBlock[] = [
      { type: "heading", level: 3, text: "IFR clearance request" },
      { type: "law", content: ["Format: station, callsign, request"] },
      { type: "heading", level: 3, text: "Taxi request" },
      { type: "law", content: ["Format: Ground, callsign, ready for taxi"] },
      { type: "ipc_questions", content: ["Q: What must be read back? A: Clearances."] },
      { type: "scenario", content: ["Practise the full call sequence."] },
      { type: "airline_questions", content: ["Q: Why concise? A: Airtime."] },
    ];

    expect(orderContentBlocksForStudy(blocks).map((block) => block.type)).toEqual([
      "heading",
      "law",
      "heading",
      "law",
      "scenario",
      "ipc_questions",
      "airline_questions",
    ]);
  });
});
