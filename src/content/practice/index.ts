import type { Section, Module, Category, ContentBlock } from "@/content/model/section";
import generated from "./items.generated.json";

export type PracticeItemKind = "definition" | "list" | "step" | "clause" | "table" | "cloze";

export interface PracticeItem {
  topicId: string;
  topicTitle: string;
  chapter: string;
  kind: PracticeItemKind;
  prompt: string;
  answer: string;
  /** Present only where three same-unit alternatives exist in the source. */
  distractors?: string[];
  page?: number;
  itemCount?: number;
  /**
   * "transcribed" means the item was hand-written from the page image because
   * the source table's meaning lives in glyphs the text layer does not carry.
   * Absent means the extractor derived it from the captured text.
   */
  source?: "transcribed";
}

export const practiceItems = generated.items as PracticeItem[];

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Present the generated items as the Section shape the drill, quiz, progress
 * and insights features already consume. A chapter becomes a section and a
 * topic becomes a module, so those features need no changes and keep their
 * content-derived question ids, FSRS scheduling and history.
 */
function toSections(items: PracticeItem[]): Section[] {
  const byChapter = new Map<string, PracticeItem[]>();
  for (const item of items) {
    const list = byChapter.get(item.chapter);
    if (list) list.push(item);
    else byChapter.set(item.chapter, [item]);
  }

  return [...byChapter].map(([chapter, chapterItems]) => {
    const byTopic = new Map<string, PracticeItem[]>();
    for (const item of chapterItems) {
      const list = byTopic.get(item.topicId);
      if (list) list.push(item);
      else byTopic.set(item.topicId, [item]);
    }

    const modules: Module[] = [...byTopic].map(([topicId, topicItems]) => ({
      id: topicId,
      title: topicItems[0]!.topicTitle,
      categoryId: slug(chapter),
      level: "core",
      // Practice items are recall prompts, not reading; the reader owns reading time.
      estReadingMinutes: 1,
      tags: [...new Set(topicItems.map((i) => i.kind))],
      summary: `${topicItems.length} practice ${topicItems.length === 1 ? "item" : "items"} from the source.`,
      content: topicItems.map(
        (item): ContentBlock => ({
          type: "qa",
          question: item.prompt,
          answer: item.answer,
          // buildQuizQuestions only scores a set of exactly three.
          ...(item.distractors?.length === 3 ? { distractors: item.distractors } : {}),
        }),
      ),
      refs: [],
    }));

    const category: Category = {
      id: slug(chapter),
      title: chapter,
      description: `Source topics in ${chapter}.`,
      moduleIds: modules.map((m) => m.id),
    };

    return {
      version: "1",
      sectionId: slug(chapter),
      sectionTitle: chapter,
      sectionDescription: `Practice drawn from the ${chapter} source topics.`,
      categories: [category],
      modules,
    };
  });
}

export const practiceSections: Section[] = toSections(practiceItems);
