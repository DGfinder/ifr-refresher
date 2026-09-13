import { expect, test } from "@playwright/test";

async function totalCards(page: import("@playwright/test").Page) {
  const value = await page.getByText("Total", { exact: true }).locator("..").locator("div").first().textContent();
  return Number(value?.trim());
}

test.describe("learning pathways", () => {
  test("home category cards open the selected cheat-sheet category", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Licensing & Recency/ }).click();

    await expect(page).toHaveURL(/\/study\?section=cheat-sheet&category=licensing/);
    await expect(page.getByRole("heading", { name: "Licensing & Recency" })).toBeVisible();
  });

  test("home pathway opens the selected and bounded flashcard bank", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^Instrument Rating/ }).click();

    await expect(page).toHaveURL(/\/flashcard\?program=instrument_rating/);
    await expect(page.getByRole("button", { name: "Instrument Rating", exact: true })).toHaveAttribute("aria-pressed", "true");
    const instrumentTotal = await totalCards(page);
    expect(instrumentTotal).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Comprehensive Review" }).click();
    const comprehensiveTotal = await totalCards(page);
    expect(comprehensiveTotal).toBeGreaterThan(instrumentTotal);
  });

  test("invalid pathway query falls back to Quick Study", async ({ page }) => {
    await page.goto("/flashcard?program=does-not-exist");

    await expect(page.getByRole("button", { name: "Quick Study" })).toBeVisible();
    await expect(page.getByText("A short, cheat-sheet scoped review of core IFR law and procedures.")).toBeVisible();
  });

  test("the legacy god_mode URL remains compatible with its new label", async ({ page }) => {
    await page.goto("/flashcard?program=god_mode");

    await expect(page.getByRole("button", { name: "Comprehensive Review" })).toBeVisible();
    await expect(page.getByText("A broad review across all available sections, levels and question types.")).toBeVisible();
  });

  test("changing the URL pathway clears a session from the previous program", async ({ page }) => {
    await page.goto("/flashcard?program=instrument_rating");
    await page.getByRole("button", { name: /Study Now/ }).click();
    await expect(page.getByRole("button", { name: /Reveal Answer/ })).toBeVisible();
    await page.evaluate(() => window.history.pushState(null, "", "/flashcard?program=airline_transition"));
    await expect(page.getByRole("button", { name: "Airline Transition", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /Study Now/ })).toBeVisible();
  });
});
