import type { Section } from "@/types/section";
import type { DrillQuestion } from "@/types/drill";

/**
 * Extract all QA blocks from sections and build DrillQuestion array
 */
export function buildDrillQuestions(sections: Section[]): DrillQuestion[] {
  const questions: DrillQuestion[] = [];

  for (const section of sections) {
    for (const module of section.modules) {
      let qaIndex = 0;

      for (const block of module.content) {
        if (block.type === "qa") {
          questions.push({
            id: `${section.sectionId}:${module.id}:qa-${qaIndex}`,
            sectionId: section.sectionId,
            sectionTitle: section.sectionTitle,
            moduleId: module.id,
            moduleTitle: module.title,
            question: block.question,
            answer: block.answer,
            level: module.level,
            tags: module.tags,
          });
          qaIndex++;
        }
      }
    }
  }

  return questions;
}
