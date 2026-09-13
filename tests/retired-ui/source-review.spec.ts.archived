import { expect, test } from "@playwright/test";

test("a lesson exposes verification status and its sources before marking it read", async ({ page }) => {
  await page.goto("/study?section=administrative-part61&module=ADM-001");
  await expect(page.getByText("Source verification pending", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /View sources and edition notes/ }).click();
  await expect(page.getByRole("tab", { name: "Reference", exact: true })).toHaveAttribute("aria-selected", "true");
  const references = page.getByRole("button", { name: /^References \(/ });
  await expect(references).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("tabpanel")).toContainText("CASR");
  await references.click();
  await expect(references).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("tab", { name: "Read", exact: true }).click();
  await page.getByRole("button", { name: "Mark as Read", exact: true }).click();
  await expect(page.getByRole("button", { name: "Read", exact: true })).toBeDisabled();
});
