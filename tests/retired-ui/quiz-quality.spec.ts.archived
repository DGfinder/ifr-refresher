import { expect, test } from "@playwright/test";

test("an empty Airline Transition assessment keeps the selected flashcard program", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: "Airline Transition" }).click();

  await expect(page.getByText("No scored questions with authored answer options are available for this program.")).toBeVisible();
  const flashcards = page.getByRole("link", { name: "Study Flashcards" });
  await expect(flashcards).toHaveAttribute("href", "/flashcard?program=airline_transition");
  await flashcards.click();
  await expect(page).toHaveURL(/\/flashcard\?program=airline_transition$/);
  await expect(page.getByText(/Advanced IFR operations, airline scenarios/)).toBeVisible();
});

test("an answered quiz question links to its matching lesson and announces the new tab", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Quiz Me/i }).click();
  await page.getByRole("button", { name: /^A\b/ }).click();

  await expect(page.getByRole("status", { name: "Answer review announcement" })).toHaveText(/Answer recorded.*opens in a new tab/i);
  const lesson = page.getByRole("link", { name: "Review lesson and sources" });
  await expect(lesson).toHaveAttribute("href", /\/study\?section=cheat-sheet&module=/);
  await expect(lesson).toHaveAttribute("target", "_blank");

  const popupPromise = page.waitForEvent("popup");
  await lesson.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/study\?section=cheat-sheet&module=/);
  await expect(popup.getByRole("tab", { name: "Reference", exact: true })).toBeVisible();
});
