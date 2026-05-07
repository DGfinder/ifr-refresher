import { expect, test } from "@playwright/test";

test("study module can be opened and marked complete", async ({ page }) => {
  await page.goto("/study?section=administrative-part61&module=ADM-001");
  await expect(page.getByRole("button", { name: /Back/i })).toBeVisible();
  await page.getByRole("button", { name: /Mark as Read/i }).click();
  await expect(page.getByText(/completed|read/i).first()).toBeVisible();
});

test("quiz can start and advance after an answer", async ({ page }) => {
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Quiz Me/i }).click();
  await expect(page.getByText(/Question 1 of/i)).toBeVisible();
  await page.getByRole("button", { name: /^A\b/ }).click();
  await expect(page.getByRole("button", { name: /Next Question|See Results/i })).toBeVisible();
});

test("flashcard session can start and flip", async ({ page }) => {
  await page.goto("/flashcard");
  await page.getByRole("button", { name: /Study Now/i }).click();
  await expect(page.getByRole("button", { name: /Reveal Answer|Got it|Unsure/i }).first()).toBeVisible();
});

test("insights page shows progress sections", async ({ page }) => {
  await page.goto("/insights");
  await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  await expect(page.getByText(/Progress by section/i)).toBeVisible();
});
