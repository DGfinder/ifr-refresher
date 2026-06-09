import type { Section, ContentBlock } from "@/content/model/section";
import type { DrillQuestion, QuestionSourceKind } from "@/features/drill/model/types";
import { questionIdFor } from "@/features/drill/model/questionIds";

/**
 * Pick the next unused content-derived id for (section, module, kind,
 * prompt). On the rare collision (two identical prompts in the same scope),
 * `questionIdFor` is called with an incrementing dupIndex until the id is
 * fresh. Deterministic for stable JSON ordering, so the migration helpers
 * map the old `kind-${index}` form to whichever occurrence it referred to.
 */
function mintId(
  seen: Set<string>,
  sectionId: string,
  moduleId: string,
  kind: QuestionSourceKind,
  prompt: string,
): string {
  for (let dup = 0; ; dup++) {
    const id = questionIdFor(sectionId, moduleId, kind, prompt, dup);
    if (!seen.has(id)) {
      seen.add(id);
      return id;
    }
  }
}

/**
 * Parse a "Q: ... A: ..." formatted string into question/answer parts
 */
function parseQAString(qaString: string): { question: string; answer: string } | null {
  // Match "Q: ... A: ..." format ([\s\S] matches any char including newlines)
  const match = qaString.match(/^Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+)$/);
  if (!match) return null;
  return { question: match[1]!.trim(), answer: match[2]!.trim() };
}

/**
 * Split an em-dash formatted string "Front — Back" into its two parts.
 * Returns null if the separator is not found.
 */
function splitEmDash(item: string): { front: string; back: string } | null {
  // Support both " — " (with spaces) and "—" (bare)
  const separatorRegex = / — |—/;
  const idx = item.search(separatorRegex);
  if (idx === -1) return null;
  const match = item.match(separatorRegex)!;
  const sep = match[0];
  const sepIdx = item.indexOf(sep);
  return {
    front: item.slice(0, sepIdx).trim(),
    back: item.slice(sepIdx + sep.length).trim(),
  };
}

/**
 * Extract all question blocks from sections and build DrillQuestion array.
 *
 * Supports: qa, ipc_questions, airline_questions, traps, numbers.
 * Reserved (not yet converted): scenario.
 *
 * Question IDs are content-derived via `questionIdFor` so reordering blocks
 * inside a module does not invalidate the user's FSRS / drill state.
 */
export function buildDrillQuestions(sections: Section[]): DrillQuestion[] {
  const questions: DrillQuestion[] = [];
  const seenIds = new Set<string>();
  for (const section of sections) {
    for (const studyModule of section.modules) {
      for (const block of studyModule.content) {
        processBlock(block, section, studyModule, questions, seenIds);
      }
    }
  }
  return questions;
}

function processBlock(
  block: ContentBlock,
  section: Section,
  module: { id: string; title: string; level: "core" | "advanced" | "airline"; tags: string[] },
  questions: DrillQuestion[],
  seenIds: Set<string>,
): void {
  const baseInfo = {
    sectionId: section.sectionId,
    sectionTitle: section.sectionTitle,
    moduleId: module.id,
    moduleTitle: module.title,
    level: module.level,
  };

  switch (block.type) {
    case "qa": {
      const kind = "legacy_qa" as const;
      questions.push({
        ...baseInfo,
        id: mintId(seenIds, section.sectionId, module.id, kind, block.question),
        prompt: block.question,
        answer: block.answer,
        ...(block.distractors && block.distractors.length === 3 ? { distractors: block.distractors } : {}),
        kind,
        tags: [...(module.tags || []), kind],
      });
      break;
    }

    case "ipc_questions": {
      const kind = "ipc" as const;
      for (const qaString of block.content) {
        const parsed = parseQAString(qaString);
        if (parsed) {
          questions.push({
            ...baseInfo,
            id: mintId(seenIds, section.sectionId, module.id, kind, parsed.question),
            prompt: parsed.question,
            answer: parsed.answer,
            kind,
            tags: [...(module.tags || []), kind],
          });
        }
      }
      break;
    }

    case "airline_questions": {
      const kind = "airline" as const;
      for (const qaString of block.content) {
        const parsed = parseQAString(qaString);
        if (parsed) {
          questions.push({
            ...baseInfo,
            id: mintId(seenIds, section.sectionId, module.id, kind, parsed.question),
            prompt: parsed.question,
            answer: parsed.answer,
            kind,
            tags: [...(module.tags || []), kind],
          });
        }
      }
      break;
    }

    case "traps": {
      const kind = "trap" as const;
      for (const item of block.content) {
        const parsed = splitEmDash(item);
        if (!parsed) continue; // skip items without separator
        const prompt = `What's the trap: ${parsed.front}?`;
        questions.push({
          ...baseInfo,
          id: mintId(seenIds, section.sectionId, module.id, kind, prompt),
          prompt,
          answer: parsed.back,
          kind,
          tags: [...(module.tags || []), kind],
        });
      }
      break;
    }

    case "numbers": {
      const kind = "numeric" as const;
      for (const item of block.content) {
        const parsed = splitEmDash(item);
        if (!parsed) continue; // skip items without separator
        questions.push({
          ...baseInfo,
          id: mintId(seenIds, section.sectionId, module.id, kind, parsed.front),
          prompt: parsed.front,
          answer: parsed.back,
          kind,
          tags: [...(module.tags || []), kind],
        });
      }
      break;
    }

    case "scenario":
      // Reserved for future implementation
      break;

    default:
      // Other block types don't generate drill questions
      break;
  }
}


/**
 * Get the law block content for a specific module.
 * Returns the law items as an array of strings, or empty array if none.
 */
export function getModuleContext(
  sections: Section[],
  sectionId: string,
  moduleId: string
): string[] {
  const section = sections.find((s) => s.sectionId === sectionId);
  if (!section) return [];
  const studyModule = section.modules.find((m) => m.id === moduleId);
  if (!studyModule) return [];
  for (const block of studyModule.content) {
    if (block.type === "law") {
      return block.content;
    }
  }
  return [];
}
