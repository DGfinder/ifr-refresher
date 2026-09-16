import type { ProgramId, StudyProgram } from "@/features/programs/model/types";

/**
 * Programs cut the source chapters into the groups you actually revise as a
 * block. Section ids are the chapter slugs minted by `content/practice`, so
 * these stay in step with the baseline contents rather than the retired
 * curriculum's section names.
 */
export const STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: "cheat_sheet",
    name: "All topics",
    description: "Every practice item drawn from the source, across all chapters.",
    recommendedUse: "Use for a general refresher, or when you want the spaced-repetition schedule to choose for you.",
    filter: {
      kinds: ["legacy_qa"],
      levels: ["core"],
    },
  },
  {
    id: "instrument_rating",
    name: "Law & admin",
    description: "Part 61 definitions, the MOS, IPC validity, privileges, recency, equipment and general operational knowledge.",
    recommendedUse: "Use for the regulatory half of an oral — the questions with a CASR number behind them.",
    filter: {
      sectionIds: ["administrational", "general-operational-knowledge"],
      kinds: ["legacy_qa"],
      levels: ["core"],
    },
  },
  {
    id: "ipc_oral",
    name: "Procedures & approaches",
    description: "Preflight and fuel, departure, en route, holding and the full approaches chapter.",
    recommendedUse: "Use for the flying half of an oral — the sequences and numbers you brief.",
    filter: {
      sectionIds: ["preflight", "departure", "en-route", "holding", "approaches"],
      kinds: ["legacy_qa"],
      levels: ["core"],
    },
  },
  {
    id: "phraseology",
    name: "Radio calls",
    description: "Class G, D and C phraseology — the situation is the prompt, the call script is the answer.",
    recommendedUse: "Use to rehearse calls out loud. Say it, then reveal the script and compare.",
    filter: {
      sectionIds: ["phraseology"],
      kinds: ["legacy_qa"],
      levels: ["core"],
    },
  },
];

export function getProgramById(id: ProgramId): StudyProgram | undefined {
  return STUDY_PROGRAMS.find((p) => p.id === id);
}
