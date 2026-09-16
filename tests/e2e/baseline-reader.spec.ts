import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test("contents exposes 51 source topics and filters to holding", async ({ page }) => {
  await page.goto("/study");
  await expect(page.getByRole("heading", { name: "Contents", exact: true })).toBeVisible();
  await expect(page.locator(".baseline-topic-link")).toHaveCount(51);
  await page.getByLabel("Find a topic").fill("holding");
  await expect(page.locator(".baseline-topic-link")).toHaveCount(2);
  await page.getByRole("link", { name: /^Sector Entries/ }).click();
  await expect(page).toHaveURL(/\/study\/holding-entries$/);
  await expect(page.getByRole("heading", { name: "Sector Entries", exact: true })).toBeVisible();
  await expect(page.getByText("On reaching the holding fix", { exact: false }).first()).toBeVisible();
  await page.getByRole("navigation", { name: "Previous and next topic" }).getByRole("link", { name: /Next.*Holding Limitations/ }).click();
  await expect(page).toHaveURL(/\/study\/holding-limitations$/);
  await page.getByRole("link", { name: "All contents" }).click();
  await expect(page.locator(".baseline-topic-link")).toHaveCount(51);
});

test("empty search can be cleared", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Find a topic").fill("zzzz-no-topic");
  await expect(page.getByText(/No topics match/)).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator(".baseline-topic-link")).toHaveCount(51);
});

test("holding diagram and text are both accessible", async ({ page }) => {
  await page.goto("/study/holding-entries");
  const source = page.getByRole("region", { name: "Source page 39", exact: true });
  const original = source.getByRole("img");
  await expect(original).toBeVisible();
  await expect.poll(() => original.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(original).toHaveAttribute("src", /figure-holding-entries-39/);
  await source.getByRole("button", { name: "Original page", exact: true }).click();
  await expect(original).toBeVisible();
  await expect(original).toHaveAttribute("src", /page-39/);
  await source.getByRole("button", { name: "Reading view", exact: true }).click();
  await expect(original).toHaveAttribute("src", /figure-holding-entries-39/);
});

test("brand comparison keeps source wording and offers narrow previews", async ({ page }) => {
  await page.goto("/design-system");
  const content = await page.locator(".reading-prose").first().textContent();
  for (const name of ["Night reading", "Technical manual"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(page.locator(".reading-prose").first()).toHaveText(content!);
  }
  await page.getByRole("button", { name: "Narrow", exact: true }).click();
  await expect(page.locator(".brand-preview")).toHaveClass(/brand-phone/);
});

// Principles still needs source work the baseline cannot yet carry.
test("retired /principles opens baseline contents", async ({ page }) => {
  await page.goto("/principles");
  await expect(page).toHaveURL(/\/study$/);
  await expect(page.getByRole("heading", { name: "Contents", exact: true })).toBeVisible();
});

test("/radio drills the phraseology chapter", async ({ page }) => {
  await page.goto("/radio");
  await expect(page).toHaveURL(/\/flashcard\?program=phraseology$/);
  await expect(page.getByRole("button", { name: "Radio calls" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("No cards available");
});

// Drill is the FSRS engine behind the flashcard UI, not a mode of its own.
test("/drill lands on the one practice surface", async ({ page }) => {
  await page.goto("/drill");
  await expect(page).toHaveURL(/\/flashcard$/);
});

test("practice offers every generated item", async ({ page }) => {
  await page.goto("/flashcard");
  await expect(page.getByRole("button", { name: "All topics" })).toBeVisible();
  // The dashboard counts New/Weak/Total from the generated practice items.
  await expect(page.getByText(/\bTotal\b/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("No cards available");
});

test("insights counts the practice corpus", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  await expect(page.getByText(/Questions seen/)).toBeVisible();
});

test("unknown source topic returns not found", async ({ page }) => {
  const response = await page.goto("/study/not-a-source-topic");
  expect(response?.status()).toBe(404);
});

for (const path of ["/study", "/study/holding-entries", "/study/admin-equipment", "/design-system"]) {
  test(`accessible source interface: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const width of [320, 390, 768, 1366]) {
  test(`source reader has no page overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/study", "/study/approach-arrivals-cta", "/design-system"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    }
  });
}

test("keyboard can reach contents search", async ({ page }) => {
  await page.goto("/study");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Find a topic")).toBeFocused();
});
