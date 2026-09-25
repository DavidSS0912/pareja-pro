import { test, expect } from '@playwright/test';

test('auth page should display login button', async ({ page }) => {
  await page.goto('/');

  // Require the Google login button to be strictly visible
  const loginBtn = page.getByRole('button', { name: /ingresar con google/i });
  await expect(loginBtn).toBeVisible();

  // Also check that the app title is there
  const title = page.getByRole('heading', { name: 'Órbita2' });
  await expect(title).toBeVisible();
});
