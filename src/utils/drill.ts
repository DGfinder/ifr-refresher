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
 * Extract all question blocks from sections and build DrillQuestion array
 * Supports: qa, ipc_questions, airline_questions
 * Reserved (not yet converted): traps, scenario, numbers
 */
export function buildDrillQuestions(sections: Section[]): DrillQuestion[] {
  const questions: DrillQuestion[] = [];

  for (const section of sections) {
    for (const module of section.modules) {
      // Track indexes per kind for unique IDs
      const kindIndexes: Record<string, number> = {
        legacy_qa: 0,
        ipc: 0,
        airline: 0,
      };

      for (const block of module.content) {
        processBlock(block, section, module, kindIndexes, questions);
      }
    }
  }

  return questions;
}

function processBlock(
  block: ContentBlock,
  section: Section,
  module: { id: string; title: string; level: "core" | "advanced" | "airline"; tags: string[] },
  kindIndexes: Record<string, number>,
  questions: DrillQuestion[]
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
      const kind: QuestionSourceKind = "legacy_qa";
      const index = kindIndexes[kind]++;
      questions.push({
        ...baseInfo,
        id: `${section.sectionId}:${module.id}:${kind}-${index}`,
        prompt: block.question,
        answer: block.answer,
        ...(block.distractors && block.distractors.length === 3 ? { distractors: block.distractors } : {}),
        kind,
        tags: [...(module.tags || []), kind],
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
            id: `${section.sectionId}:${module.id}:${kind}-${index}`,
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
      const kind: QuestionSourceKind = "airline";
      for (const qaString of block.content) {
        const parsed = parseQAString(qaString);
        if (parsed) {
          const index = kindIndexes[kind]++;
          questions.push({
            ...baseInfo,
            id: `${section.sectionId}:${module.id}:${kind}-${index}`,
            prompt: parsed.question,
            answer: parsed.answer,
            kind,
            tags: [...(module.tags || []), kind],
          });
        }
      }
      break;
    }

    // Reserved for future implementation
    case "traps":
    case "scenario":
    case "numbers":
      // Hooks in place but not generating questions yet
      break;

    default:
      // Other block types don't generate drill questions
      break;
  }
}
