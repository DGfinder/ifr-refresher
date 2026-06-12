import { expect, test } from "@playwright/test";

test.describe("Radio calls study guide", () => {
  test("organises the radio guide by call type and opens matching modules", async ({ page }) => {
    await page.goto("/study?section=radio-calls");

    await expect(page.getByRole("heading", { name: /^Radio Calls$/i, level: 1 })).toBeVisible();
    await expect(page.locator("header").getByText(/Call-type radiotelephony reference/i)).toBeVisible();

    await expect(page.getByRole("button", { name: /Clearance, ground & runway/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Check-ins, instructions & reports/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Abnormal & emergency/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /Clearance, ground & runway/i }).first().click();
    await expect(page.getByRole("button", { name: /Clearance, ground & departure runway/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Landing, missed approach & runway vacating/i })).toBeVisible();

    await page.getByRole("button", { name: /Clearance, ground & departure runway/i }).click();
    await expect(page.getByRole("heading", { name: /Clearance, ground & departure runway/i })).toBeVisible();
    await expect(page.getByText(/Sydney Delivery, Lima Mike Sierra/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Practice pre-departure calls/i })).toBeVisible();
  });
});
