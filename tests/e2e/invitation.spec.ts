import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Helper para autenticar un usuario en el Auth Emulator mediante el popup de Google.
 * Soporta tanto cuentas nuevas como re-autenticación seleccionando la cuenta exacta existente.
 */
async function loginWithGoogleEmulator(
  page: Page,
  context: BrowserContext,
  email: string,
  displayName: string
) {
  // Esperar a que el botón de inicio de sesión esté visible
  const loginBtn = page.getByRole('button', { name: /ingresar con google/i });
  await expect(loginBtn).toBeVisible({ timeout: 15000 });

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    loginBtn.click()
  ]);

  await popup.waitForLoadState('domcontentloaded');

  const exactAccount = popup.getByText(email, { exact: true });
  const emailInput = popup.locator('#email-input');
  const addAccountBtn = popup.getByRole('button', { name: /add new account/i }).or(popup.getByText(/add new account/i));

  // Esperar a que aparezca o la cuenta exacta, o el botón Add new account, o el formulario directo
  await Promise.race([
    exactAccount.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {}),
    addAccountBtn.first().waitFor({ state: 'visible', timeout: 4000 }).catch(() => {}),
    emailInput.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
  ]);

  if (await exactAccount.isVisible()) {
    await exactAccount.click();
  } else {
    if (await addAccountBtn.first().isVisible()) {
      await addAccountBtn.first().click();
    }
    await emailInput.fill(email);
    await popup.locator('#display-name-input').fill(displayName);
    await popup.getByRole('button', { name: /sign in with google/i }).click();
  }

  // Esperar a que el popup se cierre tras completar la autenticación
  await popup.waitForEvent('close');

  // Esperar que la aplicación cargue la interfaz autenticada en el DOM
  await expect(page.locator('.animate-spin')).toHaveCount(0, { timeout: 20000 });
  await expect(page.locator('nav')).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Resumen' }).first()).toBeVisible({ timeout: 20000 });
}

test.describe('Flujo E2E de Pareja: Invitaciones, Miembros, Gasto Compartido y Abandono', () => {
  test.use({ baseURL: 'http://localhost:5175' });

  test('Flujo completo entre Usuario A y Usuario B con dos contextos aislados', async ({ browser }) => {
    test.setTimeout(90000);

    // Generar sufijo único para evitar colisiones con ejecuciones previas
    const uniqueSuffix = Date.now().toString().slice(-6);
    const emailA = `ana_${uniqueSuffix}@example.com`;
    const emailB = `beto_${uniqueSuffix}@example.com`;
    const nameA = `Ana_${uniqueSuffix}`;
    const nameB = `Beto_${uniqueSuffix}`;

    // ==========================================
    // 1. CONTEXTO A: Usuario A inicia sesión
    // ==========================================
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    pageA.on('console', msg => console.log(`[PAGE A ${msg.type()}]:`, msg.text()));
    pageA.on('pageerror', err => console.log('[PAGE A ERROR]:', err.message));
    pageA.on('requestfailed', req => console.log('[PAGE A REQ FAIL]:', req.url(), req.failure()?.errorText));

    await pageA.goto('/');

    await loginWithGoogleEmulator(pageA, contextA, emailA, nameA);

    // Asegurar que el hogar y los datos del dashboard estén completamente montados en el DOM
    await expect(pageA.locator('.animate-spin')).toHaveCount(0, { timeout: 15000 });
    await expect(pageA.getByText(/\(Tú\)/i)).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByRole('button', { name: /nuevo movimiento/i })).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByText(/balance del periodo/i)).toBeVisible({ timeout: 20000 });

    const inviteBtn = pageA.getByRole('button', { name: /invitar integrante/i }).first();
    await expect(inviteBtn).toBeVisible({ timeout: 15000 });
    await inviteBtn.click();

    // Esperar a que aparezca el modal y se genere el enlace seguro con selector alineado
    await expect(pageA.getByRole('heading', { name: /invitar/i })).toBeVisible({ timeout: 10000 });

    const inviteLinkEl = pageA.locator('div.font-mono');
    await expect(inviteLinkEl).toBeVisible({ timeout: 20000 });
    const inviteUrl = (await inviteLinkEl.innerText()).trim();
    expect(inviteUrl).toContain('/invite/');
    console.log('Enlace de invitación generado:', inviteUrl);

    // Cerrar modal de invitación en Usuario A
    await pageA.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(pageA.getByRole('heading', { name: /invitar/i })).not.toBeVisible();

    // Satisfacer precondición de categoría de gasto en el hogar desde la UI de Usuario A
    await pageA.getByRole('button', { name: 'Ajustes' }).first().click();
    await pageA.getByRole('button', { name: 'Categorías' }).click();
    const catInputA = pageA.getByPlaceholder('Ej. Despensa');
    await expect(catInputA).toBeVisible({ timeout: 10000 });
    await catInputA.fill('Supermercado');
    await pageA.locator('form').filter({ has: catInputA }).getByRole('button').click();
    await expect(pageA.getByText('Supermercado', { exact: true })).toBeVisible({ timeout: 10000 });

    // Usuario A vuelve a Resumen
    await pageA.getByRole('button', { name: 'Resumen' }).first().click();
    await expect(pageA.getByRole('button', { name: /nuevo movimiento/i })).toBeVisible({ timeout: 10000 });

    // ==========================================
    // 2. CONTEXTO B: Usuario B abre el enlace y se une
    // ==========================================
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    pageB.on('console', msg => console.log(`[PAGE B ${msg.type()}]:`, msg.text()));
    pageB.on('pageerror', err => console.log('[PAGE B ERROR]:', err.message));
    pageB.on('requestfailed', req => console.log('[PAGE B REQ FAIL]:', req.url(), req.failure()?.errorText));

    // Usuario B abre directamente la URL de la invitación sin sesión activa
    await pageB.goto(inviteUrl);

    // Iniciar sesión como Usuario B
    await loginWithGoogleEmulator(pageB, contextB, emailB, nameB);

    // Verificar modal "¡Te han invitado a un hogar!"
    await expect(pageB.getByRole('heading', { name: /¡te han invitado a un hogar!/i })).toBeVisible({ timeout: 15000 });
    await expect(pageB.getByText(/detalles de la invitación/i)).toBeVisible();

    // Usuario B acepta unirse al hogar
    const joinBtn = pageB.getByRole('button', { name: /unirme al nuevo hogar/i });
    await expect(joinBtn).toBeVisible();

    // Armar la promesa para esperar la última query de fondo (GetHouseholdAccounts) que ejecuta fetchDashboardData
    const joinDataPromise = pageB.waitForResponse(resp =>
      resp.url().includes('orbita2-connector') &&
      (resp.request().postData() || '').includes('GetHouseholdAccounts') &&
      resp.status() === 200
    );

    await joinBtn.click();

    // Esperar que el modal se cierre tras procesar la aceptación
    await expect(pageB.getByRole('heading', { name: /¡te han invitado a un hogar!/i })).not.toBeVisible({ timeout: 15000 });

    // Esperar a que la última petición de fondo culmine limpiamente para no abortar consultas SQL en ejecución
    await joinDataPromise;

    // La aplicación ejecuta resetAppStore() al unirse al hogar, volviendo a la vista de login en memoria.
    await expect(pageB.getByRole('button', { name: /ingresar con google/i })).toBeVisible({ timeout: 15000 });

    // Navegación limpia a la raíz: al arrancar, onAuthStateChange restaura la sesión persistida de Firebase Auth,
    // sincroniza el nuevo hogar y carga ambos integrantes en el store.
    await pageB.goto('/');

    // Sincronizar el estado de pageB mediante aserciones web-first en el DOM
    await expect(pageB.locator('.animate-spin')).toHaveCount(0, { timeout: 20000 });
    await expect(pageB.locator('nav')).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByRole('button', { name: 'Resumen' }).first()).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByRole('button', { name: /nuevo movimiento/i })).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByText(/balance del periodo/i)).toBeVisible({ timeout: 20000 });

    // Navegar a Ajustes -> Administrar integrantes de mi hogar en Usuario B
    await pageB.getByRole('button', { name: 'Ajustes' }).first().click();
    const adminMembersBtn = pageB.getByRole('button', { name: /administrar integrantes de mi hogar/i });
    await expect(adminMembersBtn).toBeVisible({ timeout: 10000 });
    await adminMembersBtn.click();

    // Verificar que en ProfileView se listan ambos miembros con sus roles correctos
    await expect(pageB.getByText('2 / 2 integrantes')).toBeVisible({ timeout: 15000 });
    await expect(pageB.getByText('Creador (USER A)')).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText('Pareja (USER B)')).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText(emailA)).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText(emailB)).toBeVisible({ timeout: 10000 });

    // Verificar también en Categorías de pageB que la categoría compartida está disponible
    await pageB.getByRole('button', { name: 'Categorías' }).click();
    await expect(pageB.getByText('Supermercado', { exact: true })).toBeVisible({ timeout: 10000 });

    // ==========================================
    // 3. REGISTRO DE GASTO COMPARTIDO POR USUARIO B
    // ==========================================
    // Usuario B regresa al Resumen / Inicio
    await pageB.getByRole('button', { name: 'Resumen' }).first().click();

    // Abrir modal de nuevo movimiento
    const newMovementBtn = pageB.getByRole('button', { name: /nuevo movimiento/i });
    await expect(newMovementBtn).toBeVisible({ timeout: 10000 });
    await newMovementBtn.click();

    await expect(pageB.getByRole('heading', { name: 'Nuevo Movimiento' })).toBeVisible();

    // Llenar monto de 200 y nota
    const amountInput = pageB.locator('#mov-amount');
    await expect(amountInput).toBeEnabled({ timeout: 15000 });
    await amountInput.fill('200');

    // Seleccionar categoría 'Supermercado' y primera cuenta disponible
    await pageB.locator('#mov-cat-exp').selectOption({ label: 'Supermercado' });
    await pageB.locator('#mov-source-exp').selectOption({ index: 1 });
    await pageB.locator('#mov-note').fill(`Supermercado_${uniqueSuffix}`);

    // Asegurar división 50/50
    const moreOptionsBtn = pageB.getByRole('button', { name: /más opciones/i });
    if (await moreOptionsBtn.isVisible()) {
      await moreOptionsBtn.click();
      await pageB.locator('#mov-split-type').selectOption('50/50');
    }

    // Guardar el gasto compartido
    await pageB.getByRole('button', { name: /guardar movimiento/i }).click();
    await expect(pageB.getByRole('heading', { name: 'Nuevo Movimiento' })).not.toBeVisible({ timeout: 15000 });

    // ==========================================
    // 4. VERIFICACIÓN CRUZADA EN CONTEXTO A
    // ==========================================
    // Recargar contexto de Usuario A para sincronizar datos del hogar tras asegurar red inactiva
    await pageA.waitForLoadState('networkidle');
    await pageA.reload();
    await expect(pageA.locator('.animate-spin')).toHaveCount(0, { timeout: 20000 });
    await expect(pageA.locator('nav')).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByRole('button', { name: 'Resumen' }).first()).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByText(/balance del periodo/i)).toBeVisible({ timeout: 20000 });

    // Comprobar que en Ajustes -> Miembros figura Usuario B
    await pageA.getByRole('button', { name: 'Ajustes' }).first().click();
    const adminMembersBtnA = pageA.getByRole('button', { name: /administrar integrantes de mi hogar/i });
    await expect(adminMembersBtnA).toBeVisible({ timeout: 10000 });
    await adminMembersBtnA.click();

    await expect(pageA.getByText('2 / 2 integrantes')).toBeVisible({ timeout: 15000 });
    await expect(pageA.getByText('Creador (USER A)')).toBeVisible({ timeout: 10000 });
    await expect(pageA.getByText('Pareja (USER B)')).toBeVisible({ timeout: 10000 });
    await expect(pageA.getByText(emailB)).toBeVisible({ timeout: 10000 });

    // En Usuario A volvemos a Resumen y verificamos la liquidación generada por el gasto de B ($50 según simplificarDeudas)
    await pageA.getByRole('button', { name: 'Resumen' }).first().click();
    await expect(pageA.getByText(/transfiere a/i)).toBeVisible({ timeout: 15000 });
    await expect(pageA.getByText('$50')).toBeVisible({ timeout: 10000 });
    await expect(pageA.getByText(`Supermercado_${uniqueSuffix}`)).toBeVisible({ timeout: 10000 });

    // ==========================================
    // 5. ABANDONO DE HOGAR POR USUARIO B
    // ==========================================
    // Manejar el diálogo nativo de confirmación window.confirm
    pageB.on('dialog', async (dialog) => {
      console.log('Diálogo de confirmación interceptado:', dialog.message());
      await dialog.accept();
    });

    // En Usuario B ir a Ajustes -> Administrar integrantes
    await pageB.getByRole('button', { name: 'Ajustes' }).first().click();
    await pageB.getByRole('button', { name: /administrar integrantes de mi hogar/i }).click();

    // Botón "Abandonar hogar"
    const leaveBtn = pageB.getByRole('button', { name: /abandonar hogar/i });
    await expect(leaveBtn).toBeVisible({ timeout: 10000 });

    // Armar la promesa para esperar la última query de fondo (GetHouseholdAccounts) que ejecuta fetchDashboardData tras salir
    const leaveDataPromise = pageB.waitForResponse(resp =>
      resp.url().includes('orbita2-connector') &&
      (resp.request().postData() || '').includes('GetHouseholdAccounts') &&
      resp.status() === 200
    );

    await leaveBtn.click();

    // Esperar a que la última petición de fondo culmine limpiamente para procesar el abandono
    await leaveDataPromise;

    // La aplicación resetea el store tras abandonar volviendo a la vista de login en memoria.
    await expect(pageB.getByRole('button', { name: /ingresar con google/i })).toBeVisible({ timeout: 15000 });

    // Navegamos a la raíz para que onAuthStateChange reconstruya el estado en memoria con el nuevo hogar independiente.
    await pageB.goto('/');

    await expect(pageB.locator('.animate-spin')).toHaveCount(0, { timeout: 20000 });
    await expect(pageB.locator('nav')).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByRole('button', { name: 'Resumen' }).first()).toBeVisible({ timeout: 20000 });
    await expect(pageB.getByText(/balance del periodo/i)).toBeVisible({ timeout: 20000 });

    await pageB.getByRole('button', { name: 'Ajustes' }).first().click();
    await pageB.getByRole('button', { name: /administrar integrantes de mi hogar/i }).click();

    await expect(pageB.getByText('1 / 2 integrantes')).toBeVisible({ timeout: 15000 });
    await expect(pageB.getByText('Creador (USER A)')).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText('Pareja (USER B)')).not.toBeVisible();
    await expect(pageB.getByText(emailA)).not.toBeVisible();

    // ==========================================
    // 6. VERIFICACIÓN FINAL EN CONTEXTO A
    // ==========================================
    // En Usuario A recargamos la lista de miembros tras asegurar red inactiva
    await pageA.waitForLoadState('networkidle');
    await pageA.reload();
    await expect(pageA.locator('.animate-spin')).toHaveCount(0, { timeout: 20000 });
    await expect(pageA.locator('nav')).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByRole('button', { name: 'Resumen' }).first()).toBeVisible({ timeout: 20000 });
    await expect(pageA.getByText(/balance del periodo/i)).toBeVisible({ timeout: 20000 });

    await pageA.getByRole('button', { name: 'Ajustes' }).first().click();
    await pageA.getByRole('button', { name: /administrar integrantes de mi hogar/i }).click();

    // Usuario B ya no debe figurar en el hogar de Usuario A
    await expect(pageA.getByText('1 / 2 integrantes')).toBeVisible({ timeout: 15000 });
    await expect(pageA.getByText(emailA)).toBeVisible({ timeout: 10000 });
    await expect(pageA.getByText(emailB)).not.toBeVisible();
    await expect(pageA.getByText('Pareja (USER B)')).not.toBeVisible();

    // Limpieza de contextos
    await contextA.close();
    await contextB.close();
  });
});
