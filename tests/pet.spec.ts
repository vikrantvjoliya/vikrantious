import { test, expect } from "@playwright/test";

test("signed-in chat retries, cancels and retains conversation when collapsed", async ({
  page,
}) => {
  const user = {
    id: "12345678-1234-4234-8234-123456789012",
    email: "owner@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-01-01T00:00:00Z",
  };
  const token = [
    btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    btoa(
      JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: "authenticated",
      }),
    ),
    "signature",
  ].join(".");
  await page.route("**/auth/v1/**", (route) =>
    route.fulfill({
      json: route.request().url().includes("/token")
        ? {
            access_token: token,
            refresh_token: "refresh",
            token_type: "bearer",
            expires_in: 3600,
            user,
          }
        : user,
    }),
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(user.email);
  await page.getByLabel(/Password/).fill("test-password");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page).toHaveURL("/");
  let mode = "failure";
  await page.route("**/api/pet-chat", async (route) => {
    expect(route.request().headers().authorization).toContain("Bearer ");
    if (mode === "pending") return;
    await route.fulfill({
      status: mode === "failure" ? 503 : 200,
      json:
        mode === "failure"
          ? { error: "Temporarily unavailable." }
          : { reply: "Start with one small task." },
    });
  });
  await page.getByRole("button", { name: "Show companion" }).click();
  await page.getByRole("button", { name: "Chat with companion" }).click();
  await page.getByLabel("Message your companion").fill("Help me focus");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Temporarily unavailable",
  );
  mode = "success";
  await page.getByRole("button", { name: "Retry response" }).click();
  await expect(page.getByRole("log")).toContainText(
    "Start with one small task.",
  );
  await expect(
    page.getByRole("log").getByText("Help me focus", { exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Close companion panel" }).click();
  await page.getByRole("button", { name: "Chat with companion" }).click();
  await expect(page.getByRole("log")).toContainText(
    "Start with one small task.",
  );
  await page.screenshot({ path: "test-results/pet-warrior-chat.png" });
  mode = "pending";
  await page.getByLabel("Message your companion").fill("What next?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("thinking");
  await page.getByRole("button", { name: "Stop response" }).click();
  await expect(page.getByRole("alert")).toContainText("stopped");
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear conversation" }).click();
  await expect(page.getByRole("log")).not.toContainText("Help me focus");
});

test("resize gesture changes the hitbox and reduced motion stops animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Show companion" }).click();
  const pet = page.getByRole("button", { name: "Move companion" });
  await pet.focus();
  await page.keyboard.press("ArrowLeft");
  const oldSize = (await pet.boundingBox())!.width;
  const handle = (await page
    .getByRole("button", { name: "Resize companion" })
    .boundingBox())!;
  await page.mouse.move(handle.x + 10, handle.y + 10);
  await page.mouse.down();
  await page.mouse.move(handle.x + 60, handle.y + 35, { steps: 10 });
  await page.mouse.up();
  expect((await pet.boundingBox())!.width).toBeGreaterThan(oldSize);
  expect(
    await page
      .locator(".pet-body")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Companion settings" }).click();
  await page.getByLabel("Character").selectOption("electric");
  const settingsPanel = page.getByRole("dialog", {
    name: "Companion settings",
  });
  const bounds = (await settingsPanel.boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(720);
  await page.screenshot({ path: "test-results/pet-electric-settings.png" });
});

test("pet can be moved, resized, locked and restored without escaping the viewport", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show companion" }).click();
  const pet = page.getByRole("button", { name: "Move companion" });
  await expect(pet).toBeVisible();
  const before = (await pet.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + 40);
  await page.mouse.down();
  await page.mouse.move(before.x - 150, before.y - 100, { steps: 12 });
  await page.mouse.up();
  expect((await pet.boundingBox())!.x).toBeLessThan(before.x);
  await page.getByRole("button", { name: "Companion settings" }).click();
  await page.getByLabel("Pet name").fill("Mochi");
  await page.getByLabel("Character").selectOption("electric");
  await page.getByRole("slider", { name: /Size/ }).focus();
  await page.keyboard.press("End");
  await page.getByLabel("Lock position").check();
  await page.getByRole("button", { name: "Close companion panel" }).click();
  const locked = (await pet.boundingBox())!;
  await pet.focus();
  await page.keyboard.press("ArrowLeft");
  expect((await pet.boundingBox())!.x).toBe(locked.x);
  await page.reload();
  await expect(page.getByText("Mochi", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  const small = (await pet.boundingBox())!;
  expect(small.x).toBeGreaterThanOrEqual(0);
  expect(small.x + small.width).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "Chat with companion" }).click();
  const panel = (await page
    .getByRole("dialog", { name: "Companion chat" })
    .boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(320);
  await page.screenshot({ path: "test-results/pet-mobile.png" });
});

test("chat shows sign-in requirement without losing a draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show companion" }).click();
  await page.getByRole("button", { name: "Chat with companion" }).click();
  await page.getByLabel("Message your companion").fill("Help me plan today");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert")).toContainText("Sign in");
  await expect(page.getByLabel("Message your companion")).toHaveValue(
    "Help me plan today",
  );
});
