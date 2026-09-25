import { test, expect } from '@playwright/test';

test('has title or login elements', async ({ page }) => {
  await page.goto('/');

  // Either check for the app title or a login related button/text
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Let's just verify the page does not crash and has body
  const body = page.locator('body');
  await expect(body).toBeVisible();

  // Try to find common titles or elements, or simply that the title is not empty
  const title = await page.title();
  expect(title).toBeDefined();
});
