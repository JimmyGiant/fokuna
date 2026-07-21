import { expect, test } from "@playwright/test";

test("demo login reaches Aufgaben shell", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/app\/aufgaben/);
  await expect(page.getByRole("heading", { name: "Alle Aufgaben" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Hauptnavigation" })).toBeVisible();
});

test("task create API is reachable after login", async ({ page, request }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/app\/aufgaben/);

  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

  const response = await request.post("http://localhost:3000/api/v1/tasks", {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    data: {
      title: "Playwright Aufgabe",
      groupKey: "inbox",
    },
  });

  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as { data: { title: string } };
  expect(payload.data.title).toBe("Playwright Aufgabe");
});
