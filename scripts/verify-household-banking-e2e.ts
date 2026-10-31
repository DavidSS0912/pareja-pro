import { chromium, BrowserContext, Page } from 'playwright';

interface StepLog {
  step: string;
  passed: boolean;
  detail: string;
}

async function loginEmulator(page: Page, context: BrowserContext, email: string, name: string) {
  const loginBtn = page.getByRole('button', { name: /ingresar con google/i });
  await loginBtn.waitFor({ state: 'visible', timeout: 15000 });

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    loginBtn.click()
  ]);

  await popup.waitForLoadState('domcontentloaded');

  const exactAccount = popup.getByText(email, { exact: true });
  const emailInput = popup.locator('#email-input');
  const addAccountBtn = popup.getByRole('button', { name: /add new account/i }).or(popup.getByText(/add new account/i));

  await Promise.race([
    exactAccount.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {}),
    addAccountBtn.first().waitFor({ state: 'visible', timeout: 4000 }).catch(() => {}),
    emailInput.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {})
  ]);

  if (await exactAccount.isVisible().catch(() => false)) {
    await exactAccount.click();
  } else {
    if (await addAccountBtn.first().isVisible().catch(() => false)) {
      await addAccountBtn.first().click();
    }
    await emailInput.fill(email);
    await popup.locator('#display-name-input').fill(name);
    await popup.getByRole('button', { name: /sign in with google/i }).click();
  }

  await popup.waitForEvent('close');
  await page.waitForSelector('nav, header, main', { timeout: 20000 });
}

async function ensurePersonalContext(page: Page) {
  const joinBtn = page.getByRole('button', { name: /unirme al nuevo hogar/i });
  if (await joinBtn.isVisible().catch(() => false)) {
    await joinBtn.click();
    await page.waitForTimeout(1000);
  }
  const toggleToPersonal = page.locator('button[title="Contexto: Hogar"]:visible');
  if (await toggleToPersonal.isVisible({ timeout: 1500 }).catch(() => false)) {
    await toggleToPersonal.click();
    await page.waitForTimeout(1000);
  }
}

async function main() {
  console.log('======================================================================');
  console.log('  TEST E2E: ONBOARDING HOGAR + SISTEMA BANCARIO BILATERAL OPT-IN     ');
  console.log('======================================================================');

  const steps: StepLog[] = [];
  const recordStep = (step: string, passed: boolean, detail: string) => {
    steps.push({ step, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${step}: ${detail}`);
  };

  const browser = await chromium.launch({ headless: true });
  const suffix = Date.now().toString().slice(-5);
  const emailA = `usr_a_${suffix}@test.com`;
  const nameA = `UsuarioA_${suffix}`;
  const emailB = `usr_b_${suffix}@test.com`;
  const nameB = `UsuarioB_${suffix}`;

  const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageA = await contextA.newPage();
  pageA.on('console', msg => console.log('[PAGE A LOG]', msg.text()));

  const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageB = await contextB.newPage();
  pageB.on('console', msg => console.log('[PAGE B LOG]', msg.text()));

  try {
    // -------------------------------------------------------------------------
    // 1. Usuario A inicia sesión y crea cuenta personal con saldo inicial
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 1: Usuario A inicia sesión y crea cuenta personal ---');
    await pageA.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await loginEmulator(pageA, contextA, emailA, nameA);
    recordStep('Login Usuario A', true, `Autenticado con ${emailA}`);

    // Ir a Billetera y cambiar a Modo Personal
    await pageA.getByRole('button', { name: /billetera/i }).first().click();
    await pageA.waitForTimeout(1000);
    await ensurePersonalContext(pageA);

    // Crear cuenta personal A
    const newAccBtnA = pageA.getByRole('button', { name: /nueva cuenta|añadir cuenta/i }).first();
    await newAccBtnA.waitFor({ state: 'visible', timeout: 5000 });
    await newAccBtnA.click();
    await pageA.waitForSelector('#account-name', { timeout: 5000 });

    await pageA.locator('#account-name').fill(`Nómina Personal A ${suffix}`);
    await pageA.locator('#account-type').selectOption('ASSET');
    await pageA.locator('#account-initialBalance').fill('10000');
    await pageA.getByRole('button', { name: /guardar cuenta/i }).click();
    await pageA.waitForTimeout(2000);

    const accACard = pageA.getByRole('heading', { name: `Nómina Personal A ${suffix}` });
    await accACard.waitFor({ state: 'visible', timeout: 8000 });
    recordStep('Cuenta Personal A', true, `Cuenta creada con saldo inicial $10,000`);

    // -------------------------------------------------------------------------
    // 2. Usuario A invita a Usuario B y Usuario B se une al hogar
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 2: Usuario A invita a Usuario B ---');
    await pageA.getByRole('button', { name: /inicio|resumen/i }).first().click();
    await pageA.waitForTimeout(1000);

    const inviteBtn = pageA.getByRole('button', { name: /invitar/i }).first();
    await inviteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await inviteBtn.click();

    const inviteLinkEl = pageA.locator('div.font-mono');
    await inviteLinkEl.waitFor({ state: 'visible', timeout: 15000 });
    const inviteUrl = (await inviteLinkEl.innerText()).trim();
    recordStep('Invitación Generada', Boolean(inviteUrl.includes('/invite/')), inviteUrl);

    // Cerrar modal
    await pageA.getByRole('button', { name: 'Cerrar', exact: true }).click();

    // Contexto B: Usuario B abre el enlace y se une
    console.log('\n--- PASO 3: Usuario B abre invitación y se une ---');
    await pageB.goto(inviteUrl, { waitUntil: 'networkidle' });
    await loginEmulator(pageB, contextB, emailB, nameB);

    const joinBtn = pageB.getByRole('button', { name: /unirme al nuevo hogar/i });
    await joinBtn.waitFor({ state: 'visible', timeout: 25000 });
    await joinBtn.click();
    await pageB.waitForSelector('text=¡Te han invitado a un hogar!', { state: 'detached', timeout: 15000 }).catch(() => {});
    await pageB.waitForSelector('nav, header, main', { timeout: 20000 });
    await pageB.waitForTimeout(1500);
    recordStep('Usuario B Unido', true, 'Usuario B aceptó invitación y tiene sesión activa en el hogar');

    // Usuario B va a Billetera en Modo Personal y crea su cuenta personal
    await pageB.getByRole('button', { name: /billetera/i }).first().click();
    await pageB.waitForTimeout(1000);
    await ensurePersonalContext(pageB);

    const newAccBtnB = pageB.getByRole('button', { name: /nueva cuenta|añadir cuenta/i }).first();
    await newAccBtnB.waitFor({ state: 'visible', timeout: 15000 });
    await newAccBtnB.click();
    await pageB.waitForSelector('#account-name', { timeout: 5000 });

    await pageB.locator('#account-name').fill(`Ahorros Personal B ${suffix}`);
    await pageB.locator('#account-type').selectOption('ASSET');
    await pageB.locator('#account-initialBalance').fill('5000');
    // Asegurar que el toggle allowPartnerTransfers esté desmarcado inicialmente
    const toggleOptIn = pageB.locator('#account-allowPartnerTransfers');
    if (await toggleOptIn.isChecked()) {
      await toggleOptIn.uncheck();
    }
    await pageB.getByRole('button', { name: /guardar cuenta/i }).click();
    await pageB.waitForTimeout(2000);

    const accBCard = pageB.getByRole('heading', { name: `Ahorros Personal B ${suffix}` });
    await accBCard.waitFor({ state: 'visible', timeout: 8000 });
    recordStep('Cuenta Personal B', true, 'Cuenta creada con saldo $5,000 y opt-in inicialmente apagado');

    // -------------------------------------------------------------------------
    // 3. Verificación de Aislamiento Inicial: Cuentas invisibles para transferencias
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 4: Verificación de Aislamiento (B sin opt-in) ---');
    // Usuario A abre modal de transferencias
    await pageA.bringToFront();
    await pageA.reload({ waitUntil: 'networkidle' });
    await pageA.waitForTimeout(1500);

    const newMovBtnA = pageA.getByRole('button', { name: /nuevo movimiento/i }).first();
    await newMovBtnA.click();
    await pageA.waitForSelector('dialog button:has-text("Transferir")', { timeout: 5000 });
    await pageA.locator('dialog button:has-text("Transferir")').click();
    await pageA.waitForTimeout(1000);

    // Revisar opciones en A cuenta (Destino)
    const targetSelectA = pageA.locator('select[data-testid="mov-target-acc"]');
    const targetOptionsA = await targetSelectA.locator('option').allInnerTexts();
    const hasAccountB_WithoutOptIn = targetOptionsA.some(t => t.includes(`Ahorros Personal B ${suffix}`));
    recordStep(
      'Aislamiento de Cuentas',
      !hasAccountB_WithoutOptIn,
      `Usuario A NO ve la cuenta personal de B en destino (Opciones disponibles: ${targetOptionsA.join('; ')})`
    );

    // Cerrar modal en Usuario A
    await pageA.locator('button:has-text("Cancelar"):visible').click();

    // -------------------------------------------------------------------------
    // 4. Usuario B activa el toggle allowPartnerTransfers en su cuenta personal
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 5: Usuario B activa Opt-In de Transferencias ---');
    await pageB.bringToFront();
    const isBilleteraVisibleB = await pageB.locator('h2:has-text("Billetera Unificada")').isVisible().catch(() => false);
    if (!isBilleteraVisibleB) {
      await pageB.getByRole('button', { name: /billetera/i }).first().click();
      await pageB.waitForTimeout(1000);
    }
    await ensurePersonalContext(pageB);

    // Click editar en la cuenta de B
    const editBtnB = pageB.locator('button[title="Editar cuenta"]').first();
    await editBtnB.click();
    await pageB.waitForSelector('#account-allowPartnerTransfers', { timeout: 5000 });

    const optInCheckboxB = pageB.locator('#account-allowPartnerTransfers');
    await optInCheckboxB.check();
    await pageB.getByRole('button', { name: /guardar cuenta/i }).click();
    await pageB.waitForTimeout(2000);

    // Verificar badge "Transferencias Pareja: Activo"
    const badgeActiveB = pageB.locator('text=Transferencias Pareja: Activo');
    const isBadgeVisible = await badgeActiveB.isVisible({ timeout: 5000 }).catch(() => false);
    recordStep('Opt-In Activado por B', isBadgeVisible, 'Badge "Transferencias Pareja: Activo" visible en la tarjeta');

    // -------------------------------------------------------------------------
    // 5. Usuario A transfiere $1,500 hacia la cuenta de Usuario B (Modo Destino Ciego)
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 6: Usuario A transfiere fondos a Usuario B (Destino Ciego) ---');
    await pageA.bringToFront();
    await pageA.reload({ waitUntil: 'networkidle' });
    await pageA.waitForTimeout(1500);

    await pageA.getByRole('button', { name: /nuevo movimiento/i }).first().click();
    await pageA.waitForSelector('dialog button:has-text("Transferir")', { timeout: 5000 });
    await pageA.locator('dialog button:has-text("Transferir")').click();
    await pageA.waitForTimeout(1000);

    const targetSelectA2 = pageA.locator('select[data-testid="mov-target-acc"]');
    const targetOptionsA2 = await targetSelectA2.locator('option').allInnerTexts();
    const hasAccountB_WithOptIn = targetOptionsA2.some(t => t.includes(`Ahorros Personal B ${suffix}`));
    recordStep(
      'Visibilidad Destino Ciego',
      hasAccountB_WithOptIn,
      `Usuario A AHORA ve la cuenta de B tras el opt-in (Opciones: ${targetOptionsA2.join('; ')})`
    );

    // Seleccionar origen (Nómina Personal A) y destino (Ahorros Personal B)
    const sourceSelect = pageA.locator('select[data-testid="mov-source-acc"]');
    const srcOpt = sourceSelect.locator('option').filter({ hasText: `Nómina Personal A ${suffix}` });
    const srcVal = await srcOpt.getAttribute('value');
    if (srcVal) await sourceSelect.selectOption(srcVal);

    const tgtOpt = targetSelectA2.locator('option').filter({ hasText: `Ahorros Personal B ${suffix}` });
    const tgtVal = await tgtOpt.getAttribute('value');
    if (tgtVal) await targetSelectA2.selectOption(tgtVal);

    // Verificar que aparece el indicador de Destino Ciego
    const blindBadge = pageA.locator('text=Modo Destino Ciego');
    const isBlindBadgeVisible = await blindBadge.isVisible({ timeout: 5000 }).catch(() => false);
    recordStep('Badge Destino Ciego', isBlindBadgeVisible, 'Indicador de seguridad y privacidad visible');

    // Llenar monto $1,500 y nota
    await pageA.locator('#mov-amount').fill('1500');
    await pageA.locator('#mov-note').fill(`Traspaso para cena y despensa ${suffix}`);
    await pageA.getByRole('button', { name: /guardar movimiento/i }).click();
    await pageA.waitForTimeout(3000);
    recordStep('Transferencia Ejecutada', true, 'Transferencia de $1,500 registrada con éxito por Usuario A');

    // -------------------------------------------------------------------------
    // 6. Verificación Bilateral de Balances e Historial
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 7: Verificación Bilateral de Balances e Historial ---');
    // En Usuario A (Personal): Saldo debe ser $8,500 ($10,000 - $1,500)
    await pageA.getByRole('button', { name: /billetera/i }).first().click();
    await pageA.waitForTimeout(1500);
    await ensurePersonalContext(pageA);
    const balanceTextA = await pageA.locator('.tabular-nums').first().innerText();
    const isBalanceADecreased = balanceTextA.includes('8,500');
    recordStep('Balance Usuario A', isBalanceADecreased, `Balance personal de A: ${balanceTextA} (Esperado: $8,500)`);

    // En Usuario A (Historial): Registro de salida (-$1,500)
    await pageA.getByRole('button', { name: /historial/i }).first().click();
    await pageA.waitForTimeout(1500);
    await pageA.locator('button:has-text("Tabla")').click().catch(() => {});
    const historyA = pageA.getByText(`Traspaso para cena y despensa ${suffix}`).first();
    const isHistoryAVisible = await historyA.isVisible({ timeout: 5000 }).catch(() => false);
    recordStep('Historial Usuario A', isHistoryAVisible, 'Registro de transferencia presente en historial de A');

    // En Usuario B (Personal): Saldo debe ser $6,500 ($5,000 + $1,500)
    await pageB.bringToFront();
    await pageB.reload({ waitUntil: 'networkidle' });
    await pageB.waitForTimeout(1500);
    await pageB.getByRole('button', { name: /billetera/i }).first().click();
    await pageB.waitForTimeout(1500);
    await ensurePersonalContext(pageB);
    const balanceTextB = await pageB.locator('.tabular-nums').first().innerText();
    const isBalanceBIncreased = balanceTextB.includes('6,500');
    recordStep('Balance Usuario B', isBalanceBIncreased, `Balance personal de B: ${balanceTextB} (Esperado: $6,500)`);

    // En Usuario B (Historial): Registro de entrada (+ $1,500 / Transferencia Recibida)
    await pageB.getByRole('button', { name: /historial/i }).first().click();
    await pageB.waitForTimeout(1500);
    await pageB.locator('button:has-text("Tabla")').click().catch(() => {});
    const historyB = pageB.getByText(`Traspaso para cena y despensa ${suffix}`).first();
    const isHistoryBVisible = await historyB.isVisible({ timeout: 5000 }).catch(() => false);
    recordStep('Historial Usuario B', isHistoryBVisible, 'Registro de transferencia recibida presente en historial de B');

    // -------------------------------------------------------------------------
    // 7. Usuario B desmarca el toggle: desaparece del selector de A, historial intacto
    // -------------------------------------------------------------------------
    console.log('\n--- PASO 8: Usuario B revoca Opt-In; Historial Permanece Intacto ---');
    await pageB.bringToFront();
    const isBilleteraVisibleB2 = await pageB.locator('h2:has-text("Billetera Unificada")').isVisible().catch(() => false);
    if (!isBilleteraVisibleB2) {
      await pageB.getByRole('button', { name: /billetera/i }).first().click();
      await pageB.waitForTimeout(1000);
    }
    await ensurePersonalContext(pageB);

    const editBtnB2 = pageB.locator('button[title="Editar cuenta"]').first();
    await editBtnB2.click();
    await pageB.waitForSelector('#account-allowPartnerTransfers', { timeout: 5000 });
    await pageB.locator('#account-allowPartnerTransfers').uncheck();
    await pageB.getByRole('button', { name: /guardar cuenta/i }).click();
    await pageB.waitForTimeout(2000);

    const badgePrivateB = pageB.locator('text=Transferencias Pareja: Privado');
    const isBadgePrivate = await badgePrivateB.isVisible({ timeout: 5000 }).catch(() => false);
    recordStep('Revocación de Opt-In en B', isBadgePrivate, 'Badge cambió a "Transferencias Pareja: Privado"');

    // Usuario A abre transferencias: cuenta de B ha desaparecido nuevamente
    await pageA.bringToFront();
    await pageA.reload({ waitUntil: 'networkidle' });
    await pageA.waitForTimeout(1500);
    await pageA.getByRole('button', { name: /nuevo movimiento/i }).first().click();
    await pageA.waitForSelector('dialog button:has-text("Transferir")', { timeout: 5000 });
    await pageA.locator('dialog button:has-text("Transferir")').click();
    await pageA.waitForTimeout(1000);

    const targetSelectA3 = pageA.locator('select[data-testid="mov-target-acc"]');
    const targetOptionsA3 = await targetSelectA3.locator('option').allInnerTexts();
    const hasAccountB_AfterRevoke = targetOptionsA3.some(t => t.includes(`Ahorros Personal B ${suffix}`));
    recordStep(
      'Cuenta Excluida tras Revocación',
      !hasAccountB_AfterRevoke,
      `La cuenta personal de B ya NO aparece para A (Opciones: ${targetOptionsA3.join('; ')})`
    );
    await pageA.locator('button:has-text("Cancelar"):visible').click();

    // Historial sigue intacto en Usuario A
    await pageA.getByRole('button', { name: /historial/i }).first().click();
    await pageA.waitForTimeout(1500);
    await pageA.locator('button:has-text("Tabla")').click().catch(() => {});
    const historyA_StillVisible = await pageA.getByText(`Traspaso para cena y despensa ${suffix}`).first().isVisible({ timeout: 5000 });
    recordStep('Persistencia Historial tras Revocación', historyA_StillVisible, 'La transferencia pasada sigue existiendo intacta en la base de datos');

  } catch (error: any) {
    console.error('ERROR DURANTE EL TEST E2E:', error);
    recordStep('Excepción en Test E2E', false, error.message);
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log('                          RESUMEN FINAL E2E                           ');
  console.log('======================================================================');
  const allPassed = steps.length > 0 && steps.every(s => s.passed);
  steps.forEach(s => {
    console.log(`[${s.passed ? 'OK' : 'FAIL'}] ${s.step}: ${s.detail}`);
  });
  console.log(`\nRESULTADO GENERAL: ${allPassed ? 'TODAS LAS PRUEBAS PASARON EXITOSAMENTE' : 'HUBO FALLOS'}`);
  process.exit(allPassed ? 0 : 1);
}

main();
