import { test, expect } from '@playwright/test';

test('navigate through tabs/simulators', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Verify app doesn't crash on load
  await expect(page.locator('body')).toBeVisible();

  // Try navigating if tabs exist, e.g. "Simulador de Gastos"
  const simuladorGastos = page.locator('text="Simulador de Gastos"').first();
  
  if (await simuladorGastos.isVisible()) {
    await simuladorGastos.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  }

  // Check for another common tab like "Dashboard" or "Configuración"
  const config = page.locator('text="Configuración"').first();
  if (await config.isVisible()) {
    await config.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  }
});
