import { test, expect } from '@playwright/test';

test('navigate through tabs/simulators deterministically', async ({ page }) => {
  // Set localStorage before page loads to bypass Firebase auth listener
  await page.addInitScript(() => {
    window.localStorage.setItem('PLAYWRIGHT_TEST', 'true');
  });

  await page.goto('/');

  // Inject a mock user into Zustand store to bypass login
  await page.evaluate(() => {
    (window as any).useAppStore.setState({ 
      user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
      houseId: 'test-house-id',
      authLoading: false
    });
  });

  // Wait for the UI to update to the authenticated state
  const sidebar = page.locator('nav');
  await expect(sidebar).toBeVisible();

  // 1. Navigate to "Simulador"
  const simuladorTab = page.getByRole('button', { name: /simulador/i });
  await expect(simuladorTab).toBeVisible();
  await simuladorTab.click();

  // Expect the "Simulador de Deuda" header to be visible
  const simuladorHeader = page.getByRole('heading', { name: 'Simulador de Deuda', exact: true });
  await expect(simuladorHeader).toBeVisible();

  // 2. Navigate to "Patrimonio"
  const patrimonioTab = page.getByRole('button', { name: /patrimonio/i });
  await expect(patrimonioTab).toBeVisible();
  await patrimonioTab.click();

  // Expect the "Patrimonio Neto" header to be visible
  const patrimonioHeader = page.getByRole('heading', { name: 'Patrimonio Neto', exact: true });
  await expect(patrimonioHeader).toBeVisible();
});
