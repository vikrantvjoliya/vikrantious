import { test, expect } from '@playwright/test';

test('résumé is the public home and offers the original PDF and readable preview', async ({ page, request }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Hi, I’m Vikrant/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Software Developer', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download résumé', exact: true })).toHaveAttribute('href', '/vikrant-joliya-resume.pdf');
  const pdf = await request.get('/vikrant-joliya-resume.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0,5).toString()).toBe('%PDF-');
  await page.screenshot({ path: 'test-results/resume-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Read full résumé' }).click();
  const image = page.locator('#resume-preview img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Hide résumé' }).click();
  await page.evaluate(() => window.scrollTo(0,0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Résumé', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/resume-mobile.png', fullPage: true });
});

test('theme follows the device, persists overrides, and can return to automatic', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/resume-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Choose theme' }).click();
  await page.getByRole('menuitemradio', { name: 'Light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Choose theme' }).click();
  await page.getByRole('menuitemradio', { name: 'Use device theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/workspace');
  await page.screenshot({ path: 'test-results/workspace-dark.png', fullPage: true });
  await page.goto('/login');
  await page.screenshot({ path: 'test-results/login-dark.png', fullPage: true });
});

test('game fits a narrow desktop window and logo and cursor assets load', async ({ page, request }) => {
  for (const path of ['/vk-logo.svg','/cursor.svg','/cursor-link.svg']) {
    expect((await request.get(path)).ok()).toBe(true);
  }
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto('/suika-game');
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const help = await page.locator('.game-help').boundingBox();
  expect(help!.width).toBeGreaterThan(250);
  await page.screenshot({ path: 'test-results/game-narrow.png', fullPage: true });
});
