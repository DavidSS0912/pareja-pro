import { test, expect } from '@playwright/test';

test('navigate through tabs/simulators deterministically', async ({ page }) => {
  await page.goto('/');

  // Inject a mock user into Zustand store repeatedly to win any race condition with Firebase Auth's initial null emission
  await page.evaluate(() => {
    // Override the store state
    const setMockState = () => {
      if ((window as any).useAppStore) {
        (window as any).useAppStore.setState({ 
          user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
          houseId: 'test-house-id',
          authLoading: false
        });
      }
    };
    setMockState();
    // Keep enforcing it for the duration of the setup just in case Firebase overwrites it
    setInterval(setMockState, 50);
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
