import { expect, test } from "@playwright/test";

const heights = { sm: 28, md: 32, lg: 40, xl: 48 } as const;

test("shared controls follow the Figma height ladder", async ({ page }) => {
  for (const [slug, selector] of [
    ["button", ".fk-button"],
    ["form", ".fk-input"],
    ["dropdown", ".fk-dropdown__trigger"],
    ["search-field", ".fk-search-field"],
    ["tab-select", ".fk-tab-select"],
    ["toggle-group", ".fk-toggle-group"],
  ] as const) {
    await page.goto(`/pattern-library/${slug}`);

    for (const [size, height] of Object.entries(heights)) {
      const control = page.locator(`${selector}[data-size="${size}"]`).first();
      await expect(control).toBeVisible();
      await expect(control).toHaveCSS("height", `${height}px`);
    }
  }
});

test("large buttons use the 24 px icon asset", async ({ page }) => {
  await page.goto("/pattern-library/button");

  await expect(page.locator('.fk-button[data-size="lg"] svg').first()).toHaveAttribute(
    "height",
    "24",
  );
  await expect(page.locator('.fk-button[data-size="xl"] svg').first()).toHaveAttribute(
    "width",
    "24",
  );
});

test("form and dropdown colors use their exact semantic tokens", async ({ page }) => {
  await page.goto("/pattern-library/form");
  const tinted = page.locator('.fk-input[data-tone="tinted"]').first();
  await expect(tinted).toHaveCSS("background-color", "rgb(250, 250, 250)");
  await expect(tinted).toHaveCSS("border-color", "rgb(237, 237, 237)");

  await tinted.locator("input").focus();
  await expect(tinted).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.goto("/pattern-library/dropdown");
  const trigger = page.locator(".fk-dropdown__trigger").first();
  await expect(trigger).toHaveCSS("border-color", "rgb(237, 237, 237)");
  await expect(trigger).toHaveCSS("color", "rgb(78, 79, 82)");
  await expect(
    page.locator(".fk-dropdown__trigger").filter({ hasText: "Sortierung:" }),
  ).toContainText("Sortierung:Beliebtheit");
});

test("date ranges stay open and form a continuous Soft bar", async ({ page }) => {
  await page.goto("/pattern-library/date-picker");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".fk-date-picker__trigger").first()).toHaveCSS(
    "border-color",
    "rgb(237, 237, 237)",
  );
  await page.locator(".fk-date-picker__trigger").nth(1).click();

  await page.getByRole("button", { name: /10\. Juli 2026/ }).click();
  await page.getByRole("button", { name: /14\. Juli 2026/ }).click();

  await expect(page.getByRole("grid", { name: "Kalender" })).toBeVisible();
  const start = page.getByRole("button", { name: /10\. Juli 2026/ });
  const middle = page.getByRole("button", { name: /12\. Juli 2026/ });
  const end = page.getByRole("button", { name: /14\. Juli 2026/ });
  await expect(start).toHaveCSS("border-radius", "4px 0px 0px 4px");
  await expect(middle).toHaveCSS("background-color", "rgb(245, 245, 245)");
  await expect(middle).toHaveCSS("border-radius", "0px");
  await expect(end).toHaveCSS("border-radius", "0px 4px 4px 0px");
});

test("selection controls keep exact geometry and centered indeterminate mark", async ({ page }) => {
  await page.goto("/pattern-library/checkbox");

  for (const [size, dimension] of Object.entries({ sm: 12, md: 16, lg: 24 })) {
    const control = page.locator(`.fk-checkbox[data-size="${size}"]`).first();
    await expect(control).toHaveCSS("height", `${dimension}px`);
    await expect(control).toHaveCSS("width", `${dimension}px`);
  }

  const centers = await page
    .locator('.fk-checkbox[data-state="indeterminate"]')
    .evaluate((node) => {
      const control = node.getBoundingClientRect();
      const line = node
        .querySelector(".fk-checkbox__indeterminate > span")!
        .getBoundingClientRect();
      return {
        control: control.top + control.height / 2,
        line: line.top + line.height / 2,
      };
    });
  expect(Math.abs(centers.control - centers.line)).toBeLessThan(0.5);
});

test("slider dimensions and search clear action match their contracts", async ({ page }) => {
  await page.goto("/pattern-library/slider");
  await expect(page.locator(".fk-slider").nth(0)).toHaveCSS("width", "400px");
  await expect(page.locator(".fk-slider").nth(0)).toHaveCSS("height", "20px");
  await expect(page.locator(".fk-slider").nth(1)).toHaveCSS("width", "720px");
  await expect(page.locator(".fk-slider").nth(1)).toHaveCSS("height", "38px");

  await page.goto("/pattern-library/search-field");
  await page.waitForLoadState("networkidle");
  const filled = page.locator('.fk-search-field:has(input[value="Ziele suchen"])').first();
  await expect(filled.locator(".fk-search-field__clear")).toHaveCount(1);
  await expect(filled.locator("button")).toHaveCount(1);
});
