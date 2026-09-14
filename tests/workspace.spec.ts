import { test, expect, type Page } from "@playwright/test";
const user = {
  id: "12345678-1234-4234-8234-123456789012",
  email: "owner@example.com",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
async function authenticate(page: Page) {
  const token = [
    btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    btoa(
      JSON.stringify({
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: "authenticated",
      }),
    ),
    "testsignature",
  ].join(".");
  await page.route("**/auth/v1/**", (route) => {
    const url = route.request().url();
    return route.fulfill({
      json: url.includes("/token")
        ? {
            access_token: token,
            refresh_token: "test-refresh",
            token_type: "bearer",
            expires_in: 3600,
            user,
          }
        : url.includes("/logout")
          ? {}
          : user,
    });
  });
  await page.goto("/login");
  await page.getByLabel("Email address").fill(user.email);
  await page.getByLabel(/Password/).fill("test-password");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}
test("overview, mobile navigation, and forged legacy identity protection", async ({
  page,
}) => {
  await page.goto("/workspace");
  await expect(page).toHaveURL("/login");
  await page.evaluate(() => {
    localStorage.setItem("user_id", "forged-owner");
    localStorage.setItem("guest_user_id", "forged-owner");
  });
  await page.goto("/text-notes");
  await expect(page).toHaveURL("/login");
  await authenticate(page);
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close navigation" }).last().click();
  await page.screenshot({
    path: "test-results/overview-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workspace");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/overview-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByText("Files", { exact: true })
    .click();
  await expect(page).toHaveURL("/file-notes");
  await page.screenshot({
    path: "test-results/files-mobile.png",
    fullPage: true,
  });
});
test("login failure and unknown route", async ({ page }) => {
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      json: {
        error: "invalid_grant",
        error_description: "Invalid login credentials",
      },
    }),
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill("nobody@example.com");
  await page.getByLabel(/Password/).fill("bad-password");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t sign you in");
  await page.goto("/missing");
  await expect(
    page.getByRole("heading", { name: "A little off the page." }),
  ).toBeVisible();
});
test("notes save, edit, search, failures, and logout", async ({ page }) => {
  let notes: { id: number; content: string; created_at: string }[] = [];
  let fail = false;
  await page.route("**/rest/v1/text_notes*", async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toContain("Bearer ");
    if (fail && request.method() === "POST")
      return route.fulfill({ status: 500, json: { message: "Unavailable" } });
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      expect(body.user_id).toBe(user.id);
      notes.unshift({
        id: 1,
        content: body.content,
        created_at: "2026-09-14T00:00:00Z",
      });
      return route.fulfill({ status: 201, body: "" });
    }
    if (request.method() === "PATCH") {
      notes[0].content = request.postDataJSON().content;
      return route.fulfill({ json: { id: 1 } });
    }
    if (request.method() === "DELETE") {
      notes = [];
      return route.fulfill({ json: { id: 1 } });
    }
    expect(request.url()).toContain(`user_id=eq.${user.id}`);
    return route.fulfill({ json: notes });
  });
  await authenticate(page);
  await page.goto("/text-notes");
  await page
    .getByLabel("What’s on your mind?")
    .fill("A thought worth keeping.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByText("Your note is saved.")).toBeVisible();
  await expect(page.locator(".saved-note")).toContainText(
    "A thought worth keeping.",
  );
  await page.getByRole("button", { name: "Edit note", exact: true }).click();
  await page.getByLabel("What’s on your mind?").fill("A refined thought.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".saved-note")).toContainText("A refined thought.");
  await page.getByLabel("Search your notes").fill("not here");
  await expect(page.getByText("No matching notes")).toBeVisible();
  await page.getByLabel("Search your notes").fill("");
  await page.screenshot({
    path: "test-results/notes-desktop.png",
    fullPage: true,
  });
  fail = true;
  await page
    .getByLabel("What’s on your mind?")
    .fill("Keep this draft on failure");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Couldn’t save");
  await expect(page.getByLabel("What’s on your mind?")).toHaveValue(
    "Keep this draft on failure",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");
});
test("file validation and private owner-scoped uploads", async ({ page }) => {
  let uploaded = false;
  await page.route("**/storage/v1/**", (route) => {
    const request = route.request();
    if (request.url().includes("/list/")) {
      expect(request.postDataJSON().prefix).toBe(`${user.id}/documents`);
      return route.fulfill({
        json: uploaded
          ? [{ id: "file-1", name: "hello.txt", metadata: { size: 5 } }]
          : [],
      });
    }
    expect(request.url()).toContain(`/notes-files/${user.id}/documents/`);
    uploaded = true;
    return route.fulfill({ json: { Key: "file-1" } });
  });
  await authenticate(page);
  await page.goto("/file-notes");
  await page.getByLabel("Choose a document").setInputFiles({
    name: "bad.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("not a PDF"),
  });
  await page.getByRole("button", { name: "Upload document" }).click();
  await expect(page.getByRole("alert")).toContainText("valid PDF");
  expect(uploaded).toBe(false);
  await page.getByLabel("Choose a document").setInputFiles({
    name: "hello.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Hello"),
  });
  await page.getByRole("button", { name: "Upload document" }).click();
  await expect(page.getByText("Your file is uploaded.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "hello.txt" })).toBeVisible();
});
test("drawing saves to authenticated user folder and reports errors", async ({
  page,
}) => {
  let path = "";
  await page.route("**/storage/v1/**", (route) => {
    path = route.request().url();
    return route.fulfill({ status: 403, json: { message: "Denied" } });
  });
  await authenticate(page);
  await page.goto("/drawing-notes");
  const canvas = page.getByLabel("Drawing canvas.", { exact: false });
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 180, box.y + 120, { steps: 10 });
  await page.mouse.up();
  await page.screenshot({
    path: "test-results/drawing-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Save drawing" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Couldn’t save your drawing",
  );
  expect(path).toContain(`/notes-files/${user.id}/drawings/canvas.png`);
});
test("game is public, keyboard playable, and cleans up on navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/suika-game");
  const canvas = page.getByLabel("Fruity Fall game.", { exact: false });
  await canvas.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Next fruit…" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Drop fruit" })).toBeEnabled();
  // Scoring can still change when broken physics produces NaN positions.
  // Check actual painted fruit pixels near the floor before testing a merge.
  await expect
    .poll(
      async () =>
        canvas.evaluate((element) => {
          const c = element as HTMLCanvasElement;
          const pixels = c
            .getContext("2d")!
            .getImageData(0, 400, c.width, 160).data;
          let fruitPixels = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (
              pixels[i] === 230 &&
              pixels[i + 1] === 162 &&
              pixels[i + 2] === 162 &&
              pixels[i + 3] === 255
            )
              fruitPixels++;
          }
          return fruitPixels;
        }),
      { timeout: 5000 },
    )
    .toBeGreaterThan(200);
  await page.getByRole("button", { name: "Drop fruit" }).click();
  await expect(page.getByText("3", { exact: true })).toBeVisible({
    timeout: 5000,
  });
  await expect
    .poll(
      async () =>
        canvas.evaluate((element) => {
          const c = element as HTMLCanvasElement;
          const pixels = c
            .getContext("2d")!
            .getImageData(0, 400, c.width, 160).data;
          let fruitPixels = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            if (
              pixels[i] === 234 &&
              pixels[i + 1] === 196 &&
              pixels[i + 2] === 146 &&
              pixels[i + 3] === 255
            )
              fruitPixels++;
          }
          return fruitPixels;
        }),
      { timeout: 5000 },
    )
    .toBeGreaterThan(400);
  expect(
    await page
      .locator(".skip-link")
      .evaluate((element) => element.getBoundingClientRect().bottom),
  ).toBeLessThanOrEqual(0);
  await page.screenshot({
    path: "test-results/game-landed.png",
    fullPage: false,
  });
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/game-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Résumé", exact: true }).click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /Fruity Fall/ })
    .click();
  await expect(canvas).toBeVisible();
  expect(errors).toEqual([]);
});
