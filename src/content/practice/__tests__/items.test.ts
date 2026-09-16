import { describe, expect, it } from "vitest";
import { practiceItems, practiceSections, type PracticeItem } from "@/content/practice";

/**
 * These assert the properties the generator must never violate, against the
 * committed corpus. The generator works on structural shape, and shape alone
 * cannot tell a complete clause from one severed by a line wrap — so the
 * guarantee is enforced here rather than trusted upstream.
 *
 * A wrong answer reaches a pilot studying for a test, so these are stricter
 * than typical content tests: anything doubtful should have been suppressed by
 * the generator's well-formed gate, not shipped.
 */

const generated = practiceItems.filter((item) => item.source !== "transcribed");
const describeItem = (item: PracticeItem) => `${item.topicId}: ${item.prompt}`;

describe("practice corpus", () => {
  it("gives every item a prompt and an answer", () => {
    for (const item of practiceItems) {
      expect(item.prompt.trim(), describeItem(item)).not.toBe("");
      expect(item.answer.trim(), describeItem(item)).not.toBe("");
    }
  });

  it("never lets a prompt give away its own answer", () => {
    for (const item of practiceItems) {
      if (item.answer.length <= 3) continue;
      expect(item.prompt.toLowerCase(), describeItem(item)).not.toContain(
        item.answer.toLowerCase(),
      );
    }
  });

  it("keeps question prompts unique, so content-derived ids do not collide", () => {
    const seen = new Map<string, string>();
    for (const item of practiceItems) {
      const key = `${item.topicId}::${item.prompt}`;
      expect(seen.has(key), `duplicate prompt — ${describeItem(item)}`).toBe(false);
      seen.set(key, item.answer);
    }
  });

  it("does not ship a generated answer severed mid-sentence", () => {
    const dangling = /\b(?:the|a|an|of|for|to|in|on|at|and|or|is|are|be|not|exceed|within|than|with|from|by)$/i;
    for (const item of generated) {
      expect(dangling.test(item.answer.trim()), describeItem(item)).toBe(false);
    }
  });

  it("does not ship a generated answer with an unclosed parenthesis", () => {
    for (const item of generated) {
      const opens = item.answer.match(/\(/g)?.length ?? 0;
      const closes = item.answer.match(/\)/g)?.length ?? 0;
      expect(opens, describeItem(item)).toBe(closes);
    }
  });

  it("does not build a question around the source's author notes", () => {
    // Those describe rules that no longer apply.
    for (const item of generated) {
      expect(/author[’'`]?s note/i.test(item.prompt), describeItem(item)).toBe(false);
    }
  });

  describe("quiz options", () => {
    const scoreable = practiceItems.filter((item) => item.distractors?.length === 3);

    it("has some", () => {
      expect(scoreable.length).toBeGreaterThan(0);
    });

    it("never offers the correct answer as a distractor", () => {
      for (const item of scoreable) {
        const answer = item.answer.trim().toLowerCase();
        for (const distractor of item.distractors!) {
          expect(distractor.trim().toLowerCase(), describeItem(item)).not.toBe(answer);
        }
      }
    });

    it("never repeats a distractor within one question", () => {
      for (const item of scoreable) {
        const unique = new Set(item.distractors!.map((d) => d.trim().toLowerCase()));
        expect(unique.size, describeItem(item)).toBe(3);
      }
    });

    it("leaves radio calls out — a four-option list of scripts tests nothing", () => {
      for (const item of scoreable) {
        expect(item.kind, describeItem(item)).not.toBe("call");
      }
    });

    it("asks per-category questions about Category B only", () => {
      // That is the aeroplane being flown. The other categories stay as
      // flashcards and serve as this question's wrong answers.
      const perCategory = scoreable.filter((item) => /\b(?:category|cat)\s+[A-E]\b/i.test(item.prompt));
      expect(perCategory.length).toBeGreaterThan(0);
      for (const item of perCategory) {
        expect(/\b(?:category|cat)\s+B\b/i.test(item.prompt), describeItem(item)).toBe(true);
      }
    });
  });

  describe("section adapter", () => {
    it("exposes every item as a qa block the drill builder can read", () => {
      const blocks = practiceSections.flatMap((section) =>
        section.modules.flatMap((topicModule) => topicModule.content),
      );
      expect(blocks).toHaveLength(practiceItems.length);
      for (const block of blocks) expect(block.type).toBe("qa");
    });

    it("keeps every module listed by its category", () => {
      for (const section of practiceSections) {
        const listed = new Set(section.categories.flatMap((category) => category.moduleIds));
        for (const topicModule of section.modules) {
          expect(listed.has(topicModule.id), `${section.sectionId}/${topicModule.id}`).toBe(true);
        }
      }
    });

    it("only passes through a structurally valid set of three distractors", () => {
      for (const section of practiceSections) {
        for (const topicModule of section.modules) {
          for (const block of topicModule.content) {
            if (block.type !== "qa" || !block.distractors) continue;
            expect(block.distractors).toHaveLength(3);
          }
        }
      }
    });
  });
});
