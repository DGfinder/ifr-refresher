import { expect, test } from "@playwright/test";

test("completed study progress persists after reload", async ({ page }) => {
  await page.goto("/study?section=administrative-part61&module=ADM-001");
  await page.getByRole("button", { name: /Mark as Read/i }).click();
  await expect(page.getByRole("button", { name: /Module Complete/i })).toBeVisible();

  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: /Module Complete/i })).toBeVisible();
});

test("blocked browser storage leaves study content readable and shows degraded banner", async ({ page }) => {
  await page.addInitScript(() => {
    const blockedIndexedDb = {
      open() {
        throw new DOMException("IndexedDB blocked by test", "InvalidStateError");
      },
      deleteDatabase() {
        throw new DOMException("IndexedDB blocked by test", "InvalidStateError");
      },
      cmp: indexedDB.cmp.bind(indexedDB),
    };

    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: blockedIndexedDb,
    });
  });

  await page.goto("/study?section=administrative-part61&module=ADM-001");

  await expect(page.getByRole("heading", { name: /Part 61 Definitions/i })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/Progress may not save/i);
});
