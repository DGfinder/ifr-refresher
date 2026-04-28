import type { Section, ContentBlock } from "@/types/section";
import type { DrillQuestion, QuestionSourceKind } from "@/types/drill";

/**
 * Parse a "Q: ... A: ..." formatted string into question/answer parts
 */
function parseQAString(qaString: string): { question: string; answer: string } | null {
  // Match "Q: ... A: ..." format ([\s\S] matches any char including newlines)
  const match = qaString.match(/^Q:\s*([\s\S]+?)\s*A:\s*([\s\S]+)$/);
  if (!match) return null;
  return { question: match[1].trim(), answer: match[2].trim() };
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
 * Extract all question blocks from sections and build DrillQuestion array
 * Supports: qa, ipc_questions, airline_questions, traps, numbers
 * Reserved (not yet converted): scenario
 */
export function buildDrillQuestions(sections: Section[]): DrillQuestion[] {
  const questions: DrillQuestion[] = [];

  for (const section of sections) {
    for (const mod of section.modules) {
      // Track indexes per kind for unique IDs
      const kindIndexes: Record<string, number> = {
        legacy_qa: 0,
        ipc: 0,
        airline: 0,
        trap: 0,
        numeric: 0,
      };

      for (const block of mod.content) {
        processBlock(block, section, mod, kindIndexes, questions);
      }
    }
  }

  return questions;
}

function processBlock(
  block: ContentBlock,
  section: Section,
  mod: { id: string; title: string; level: "core" | "advanced" | "airline"; tags: string[] },
  kindIndexes: Record<string, number>,
  questions: DrillQuestion[]
): void {
  const baseInfo = {
    sectionId: section.sectionId,
    sectionTitle: section.sectionTitle,
    moduleId: mod.id,
    moduleTitle: mod.title,
    level: mod.level,
  };

  switch (block.type) {
    case "qa": {
      const kind: QuestionSourceKind = "legacy_qa";
      const index = kindIndexes[kind]++;
      questions.push({
        ...baseInfo,
        id: `${section.sectionId}:${mod.id}:${kind}-${index}`,
        prompt: block.question,
        answer: block.answer,
        ...(block.distractors && block.distractors.length === 3 ? { distractors: block.distractors } : {}),
        kind,
        tags: [...(mod.tags || []), kind],
      });
      break;
    }

    case "ipc_questions": {
      const kind: QuestionSourceKind = "ipc";
      for (const qaString of block.content) {
        const parsed = parseQAString(qaString);
        if (parsed) {
          const index = kindIndexes[kind]++;
          questions.push({
            ...baseInfo,
            id: `${section.sectionId}:${mod.id}:${kind}-${index}`,
            prompt: parsed.question,
            answer: parsed.answer,
            kind,
            tags: [...(mod.tags || []), kind],
          });
        }
      }
      break;
    }

    case "airline_questions": {
      const kind: QuestionSourceKind = "airline";
      for (const qaString of block.content) {
        const parsed = parseQAString(qaString);
        if (parsed) {
          const index = kindIndexes[kind]++;
          questions.push({
            ...baseInfo,
            id: `${section.sectionId}:${mod.id}:${kind}-${index}`,
            prompt: parsed.question,
            answer: parsed.answer,
            kind,
            tags: [...(mod.tags || []), kind],
          });
        }
      }
      break;
    }

    case "traps": {
      const kind: QuestionSourceKind = "trap";
      for (const item of block.content) {
        const parsed = splitEmDash(item);
        if (!parsed) continue; // skip items without separator
        const index = kindIndexes[kind]++;
        questions.push({
          ...baseInfo,
          id: `${section.sectionId}:${mod.id}:trap-${index}`,
          prompt: `What's the trap: ${parsed.front}?`,
          answer: parsed.back,
          kind,
          tags: [...(mod.tags || []), kind],
        });
      }
      break;
    }

    case "numbers": {
      const kind: QuestionSourceKind = "numeric";
      for (const item of block.content) {
        const parsed = splitEmDash(item);
        if (!parsed) continue; // skip items without separator
        const index = kindIndexes[kind]++;
        questions.push({
          ...baseInfo,
          id: `${section.sectionId}:${mod.id}:numeric-${index}`,
          prompt: parsed.front,
          answer: parsed.back,
          kind,
          tags: [...(mod.tags || []), kind],
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
  const mod = section.modules.find((m) => m.id === moduleId);
  if (!mod) return [];
  for (const block of mod.content) {
    if (block.type === "law") {
      return block.content;
    }
  }
  return [];
}
