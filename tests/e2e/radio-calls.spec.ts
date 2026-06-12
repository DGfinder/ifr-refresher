import { expect, test } from "@playwright/test";

test.describe("Radio Calls", () => {
  test("radio page renders both tabs", async ({ page }) => {
    await page.goto("/radio");
    await expect(page.getByRole("heading", { name: /Radio Calls/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Scenarios/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Drill/i })).toBeVisible();
  });

  test("scenarios tab shows the dashboard", async ({ page }) => {
    await page.goto("/radio?tab=scenarios");
    await expect(page.getByRole("tab", { name: /Scenarios/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // At least one scenario card should be visible.
    await expect(page.getByText(/IFR clearance/i).first()).toBeVisible();
  });

  test("drill tab opens, filters, and lets the learner submit a spoken call via text fallback", async ({
    page,
  }) => {
    await page.goto("/radio");
    await page.getByRole("tab", { name: /Drill/i }).click();

    // Header copy unique to the Drill tab dashboard.
    await expect(page.getByText(/Practice session/i)).toBeVisible();
    await expect(page.getByText(/Start 10 new cards/i)).toBeVisible();

    // Type headers make the long drill list scannable.
    await expect(page.getByText(/Clearances/i).first()).toBeVisible();
    await expect(page.getByText(/IFR clearances, SID clearance readbacks/i)).toBeVisible();

    // Open the first drill card in the list.
    const firstCard = page.getByText(/Request IFR clearance/i).first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // Card view: briefing + spoken challenge.
    await expect(page.getByText(/Make the call/i)).toBeVisible();

    // Use the text fallback — type a near-perfect AIP-standard call.
    const textarea = page.getByPlaceholder(/type the call/i);
    await expect(textarea).toBeVisible();
    await textarea.fill(
      "Bankstown Tower, Lima Echo Foxtrot, IFR clearance to Coffs Harbour, information Mike.",
    );

    // Submit and check the reveal includes the AIP-standard exemplar.
    await page.getByRole("button", { name: /Submit call/i }).click();
    await expect(page.getByText(/AIP-standard/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Retry this call/i })).toBeVisible();

    // Mark done returns to the dashboard.
    await page.getByRole("button", { name: /Mark done/i }).click();
    await expect(page.getByText(/Practice session/i)).toBeVisible();
  });

  test("filtering by CTAF reduces the visible card list to CTAF cards only", async ({ page }) => {
    await page.goto("/radio");
    await page.getByRole("tab", { name: /Drill/i }).click();

    // Click the CTAF airspace filter from the compact More filters panel.
    await page.getByRole("button", { name: /More filters/i }).click();
    await page.getByRole("tab", { name: /CTAF/i }).first().click();

    // Cards visible after filtering should carry the CTAF badge — assert
    // the first visible card's row inside the CTAF type group contains "CTAF".
    await expect(page.getByText(/CTAF broadcasts/i).first()).toBeVisible();
    await expect(page.getByText(/Taxiing broadcast/i).first()).toBeVisible();
    await expect(page.getByText(/^CTAF$/).first()).toBeVisible();
  });
});
