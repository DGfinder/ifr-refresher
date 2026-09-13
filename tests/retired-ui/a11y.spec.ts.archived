import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/study", "/flashcard", "/quiz", "/insights"]) {
  test(`axe smoke ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast", "heading-order"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
