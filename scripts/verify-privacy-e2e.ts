import { chromium } from 'playwright';

interface TestResult {
  pass: boolean;
  messages: string[];
}

async function runPrivacyVerification() {
  console.log('===============================================================');
  console.log('   VERIFICACIÓN MECÁNICA E2E: PRIVACIDAD DE CUENTAS & CIEGO    ');
  console.log('===============================================================');

  const results: Record<string, TestResult> = {
    'Prueba A (Billetera Hogar vs. Personal)': { pass: false, messages: [] },
    'Prueba B (Selector de Origen en Transferencia)': { pass: false, messages: [] },
    'Prueba C (Modo Destino Ciego en Transferencia)': { pass: false, messages: [] },
    'Prueba D (Persistencia de Transferencia hacia Pareja)': { pass: false, messages: [] },
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Navegar y autenticar
    console.log('\n>>> Conectando a frontend en http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    const loginBtn = page.locator('button:has-text("Ingresar con Google")');
    if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('>>> Detectado botón de login, autenticando con Algae Raccoon (USER_A)...');
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        loginBtn.click(),
      ]);
      await popup.waitForLoadState('domcontentloaded');
      await popup.click('text=Algae Raccoon');
      await page.waitForTimeout(2000);
    }

    // Esperar a que la app cargue la cabecera / barra de navegación
    await page.waitForSelector('nav, header, main', { timeout: 10000 });
    console.log('>>> Sesión activa confirmada en la aplicación.');

    // Asegurarse de que el contexto inicial sea Hogar
    const toggleToHogar = page.locator('button[title="Contexto: Personal"]:visible');
    if (await toggleToHogar.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('>>> Cambiando a contexto Hogar...');
      await toggleToHogar.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------
    // PRUEBA A: Billetera Hogar vs. Personal
    // -------------------------------------------------------------
    console.log('\n--- Ejecutando Prueba A: Billetera Hogar vs. Personal ---');
    const testA = results['Prueba A (Billetera Hogar vs. Personal)'];
    
    // Navegar a Billetera
    await page.click('button:has-text("Billetera"):visible');
    await page.waitForTimeout(1500);

    // Contexto Hogar: verificar que solo existan cuentas compartidas
    const accountsInHogar = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-\\[32px\\]'));
      return cards.map(c => {
        const title = c.querySelector('h4')?.textContent?.trim() || '';
        const badge = c.querySelector('.text-\\[10px\\]')?.textContent?.trim() || '';
        const balance = c.querySelector('.text-3xl, .text-4xl')?.textContent?.trim() || '';
        return { title, badge, balance };
      }).filter(c => c.title !== '');
    });

    const liquidWealthHogar = await page.evaluate(() => {
      const hero = document.querySelector('.bg-gradient-to-br');
      return hero?.querySelector('.text-4xl, .text-5xl')?.textContent?.trim() || '';
    });

    testA.messages.push(`Cuentas visibles en Billetera (Hogar): ${JSON.stringify(accountsInHogar)}`);
    testA.messages.push(`Patrimonio Líquido Consolidado (Hogar): ${liquidWealthHogar}`);

    // Aserción Hogar: solo 'Banco / Efectivo' (Uso Compartido) o cuentas SHARED
    const hasOnlySharedInHogar = accountsInHogar.length > 0 && accountsInHogar.every(a => 
      a.badge.toUpperCase().includes('COMPARTIDO') || a.title.includes('Banco / Efectivo')
    );
    const hasPartnerAccountInHogar = accountsInHogar.some(a => a.title.includes('BBVA') || a.title.includes('Chicken'));

    if (hasOnlySharedInHogar && !hasPartnerAccountInHogar) {
      testA.messages.push('[PASS] En modo Hogar solo se listan cuentas de USO COMPARTIDO. Cuentas privadas excluidas.');
    } else {
      testA.messages.push(`[FAIL] Violación en modo Hogar: compartido=${hasOnlySharedInHogar}, tienePareja=${hasPartnerAccountInHogar}`);
    }

    // Cambiar a Personal
    console.log('>>> Alternando a modo Personal en Billetera...');
    await page.locator('button[title="Contexto: Hogar"]:visible').click();
    await page.waitForTimeout(1500);

    const accountsInPersonal = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-\\[32px\\]'));
      return cards.map(c => {
        const title = c.querySelector('h4')?.textContent?.trim() || '';
        const badge = c.querySelector('.text-\\[10px\\]')?.textContent?.trim() || '';
        const balance = c.querySelector('.text-3xl, .text-4xl')?.textContent?.trim() || '';
        return { title, badge, balance };
      }).filter(c => c.title !== '');
    });

    const liquidWealthPersonal = await page.evaluate(() => {
      const hero = document.querySelector('.bg-gradient-to-br');
      return hero?.querySelector('.text-4xl, .text-5xl')?.textContent?.trim() || '';
    });

    testA.messages.push(`Cuentas visibles en Billetera (Personal): ${JSON.stringify(accountsInPersonal)}`);
    testA.messages.push(`Patrimonio Líquido Consolidado (Personal): ${liquidWealthPersonal}`);

    // Aserción Personal: Solo cuenta propia ('Nomina TVN') y 100% ausencia de cuentas de la pareja ('Nomina BBVA' / 'Chicken Algae')
    const hasPartnerAccountInPersonal = accountsInPersonal.some(a => a.title.includes('BBVA') || a.title.includes('Chicken'));
    const domHasPartnerReference = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Nomina BBVA') || text.includes('Chicken Algae');
    });

    if (!hasPartnerAccountInPersonal && !domHasPartnerReference) {
      testA.messages.push('[PASS] En modo Personal las cuentas de la pareja (Nomina BBVA / Chicken Algae) están 100% ausentes del DOM.');
    } else {
      testA.messages.push(`[FAIL] Cuenta de pareja presente en modo Personal: ${hasPartnerAccountInPersonal}, en DOM: ${domHasPartnerReference}`);
    }

    testA.pass = hasOnlySharedInHogar && !hasPartnerAccountInHogar && !hasPartnerAccountInPersonal && !domHasPartnerReference;

    // Regresar a Inicio (Dashboard) y restablecer contexto a Hogar
    console.log('>>> Regresando a Inicio para pruebas de transferencia...');
    await page.click('button:has-text("Inicio"):visible');
    await page.waitForTimeout(1000);

    const switchBackToHogar = page.locator('button[title="Contexto: Personal"]:visible');
    if (await switchBackToHogar.isVisible({ timeout: 1000 }).catch(() => false)) {
      await switchBackToHogar.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------
    // PRUEBA B: Selector de Origen en Transferencia
    // -------------------------------------------------------------
    console.log('\n--- Ejecutando Prueba B: Selector de Origen en Transferencia ---');
    const testB = results['Prueba B (Selector de Origen en Transferencia)'];

    // Abrir modal de Nuevo Movimiento
    await page.click('button:has-text("Nuevo Movimiento"):visible');
    await page.waitForTimeout(1000);

    // Cambiar a pestaña de Transferir
    await page.click('dialog[open] button:has-text("Transferir")');
    await page.waitForTimeout(1000);

    // Inspeccionar opciones de cuenta de origen (#mov-source-trans)
    const sourceOptions = await page.$$eval('#mov-source-trans option', (opts) =>
      opts.map((o) => ({ value: (o as HTMLOptionElement).value, text: o.textContent?.trim() || '' }))
    );

    testB.messages.push(`Opciones en Selector de Origen (#mov-source-trans):\n${JSON.stringify(sourceOptions, null, 2)}`);

    const partnerInSource = sourceOptions.some(
      (o) => o.text.includes('BBVA') || o.text.includes('Chicken')
    );
    const hasOnlyOwnOrSharedInSource = sourceOptions
      .filter((o) => o.value !== '')
      .every((o) => o.text.includes('[Compartida]') || o.text.includes('[Algae Raccoon]'));

    if (!partnerInSource && hasOnlyOwnOrSharedInSource) {
      testB.messages.push('[PASS] Cuentas de la pareja terminantemente excluidas del selector de origen.');
      testB.messages.push('[PASS] Solo se permiten cuentas propias ([Algae Raccoon]) y compartidas ([Compartida]).');
      testB.pass = true;
    } else {
      testB.messages.push(`[FAIL] Cuenta de pareja permitida o cuenta inválida en origen: partnerInSource=${partnerInSource}`);
      testB.pass = false;
    }

    // -------------------------------------------------------------
    // PRUEBA C: Modo Destino Ciego en Transferencia
    // -------------------------------------------------------------
    console.log('\n--- Ejecutando Prueba C: Modo Destino Ciego en Transferencia ---');
    const testC = results['Prueba C (Modo Destino Ciego en Transferencia)'];

    // Inspeccionar opciones de cuenta de destino (#mov-target-trans)
    const targetOptions = await page.$$eval('#mov-target-trans option', (opts) =>
      opts.map((o) => ({ value: (o as HTMLOptionElement).value, text: o.textContent?.trim() || '' }))
    );

    testC.messages.push(`Opciones en Selector de Destino (#mov-target-trans):\n${JSON.stringify(targetOptions, null, 2)}`);

    const partnerTargetOption = targetOptions.find((o) => o.text.includes('BBVA'));
    if (!partnerTargetOption) {
      testC.messages.push('[FAIL] No se encontró la cuenta de la pareja en las opciones de destino.');
      testC.pass = false;
    } else {
      testC.messages.push(`Opción detectada para pareja: "${partnerTargetOption.text}"`);

      // Aserción de Modo Destino Ciego en texto: NUNCA mostrar "(Disp: $...)" ni saldos
      const hasBalanceOrDisp = partnerTargetOption.text.includes('Disp:') || partnerTargetOption.text.includes('$');
      const isExpectedBlindFormat = partnerTargetOption.text.startsWith('[Chicken Algae] Nomina BBVA');

      if (isExpectedBlindFormat && !hasBalanceOrDisp) {
        testC.messages.push('[PASS] La opción de la pareja cumple con el MODO DESTINO CIEGO ("[Chicken Algae] Nomina BBVA" sin saldo ni "(Disp: $...)").');
      } else {
        testC.messages.push(`[FAIL] La opción expone saldo o formato inválido: text="${partnerTargetOption.text}"`);
      }

      // Seleccionar cuenta propia (USER_A) como origen para activar indicador de transferencia entre miembros
      const ownSource = sourceOptions.find((o) => o.text.includes('Nomina TVN'));
      if (ownSource) {
        await page.selectOption('#mov-source-trans', ownSource.value);
        await page.waitForTimeout(500);
      }

      // Seleccionar la cuenta de la pareja como destino
      await page.selectOption('#mov-target-trans', partnerTargetOption.value);
      await page.waitForTimeout(500);

      // Verificar indicador de operación
      const indicatorText = await page.locator('[data-testid="transfer-operation-indicator"]').textContent().catch(() => '');
      testC.messages.push(`Indicador de operación: "${indicatorText?.trim()}"`);

      const hasCorrectIndicator = indicatorText?.includes('Transferencia a pareja (Algae Raccoon → Chicken Algae)') ?? false;
      if (hasCorrectIndicator) {
        testC.messages.push('[PASS] Indicador visual confirma: Transferencia a pareja (Algae Raccoon → Chicken Algae).');
      } else {
        testC.messages.push(`[FAIL] Indicador no coincide: "${indicatorText}"`);
      }

      // Verificar que el modal no expone saldos de la cuenta de destino de la pareja
      const modalText = await page.locator('dialog[open]').innerText();
      const exposesPartnerBalance = modalText.includes('BBVA:') || (modalText.includes('Nomina BBVA') && modalText.includes('Disponible para transferir: $55,555'));

      if (!exposesPartnerBalance) {
        testC.messages.push('[PASS] El desglose de saldo inferior no expone saldo contable, metas ni disponible de la cuenta de la pareja.');
      } else {
        testC.messages.push('[FAIL] El desglose del modal expone saldo privado de la pareja.');
      }

      testC.pass = isExpectedBlindFormat && !hasBalanceOrDisp && hasCorrectIndicator && !exposesPartnerBalance;
    }

    // -------------------------------------------------------------
    // PRUEBA D: Persistencia de Transferencia hacia Pareja
    // -------------------------------------------------------------
    console.log('\n--- Ejecutando Prueba D: Persistencia de Transferencia hacia Pareja ---');
    const testD = results['Prueba D (Persistencia de Transferencia hacia Pareja)'];

    // Asegurarse de tener origen compartido con fondos suficientes y destino pareja seleccionados
    const sharedSource = sourceOptions.find((o) => o.text.includes('Banco / Efectivo'));
    if (!sharedSource || !partnerTargetOption) {
      testD.messages.push('[FAIL] No se encontraron cuentas necesarias para la transferencia.');
      testD.pass = false;
    } else {
      await page.selectOption('#mov-source-trans', sharedSource.value);
      await page.selectOption('#mov-target-trans', partnerTargetOption.value);
      await page.waitForTimeout(500);

      const uniqueDesc = `Transferencia E2E Destino Ciego ${Date.now()}`;
      await page.fill('#mov-amount', '10.00');
      await page.fill('#mov-note', uniqueDesc);
      await page.waitForTimeout(500);

      console.log(`>>> Enviando transferencia por $10.00 con nota: "${uniqueDesc}"...`);
      await page.click('dialog[open] button[type="submit"]:has-text("Guardar Movimiento")');

      // Esperar que se cierre el modal
      await page.locator('dialog[open]').waitFor({ state: 'hidden', timeout: 8000 });
      console.log('>>> Modal cerrado exitosamente. Navegando a Historial...');
      await page.waitForTimeout(1500);

      // Navegar a Historial
      await page.click('button:has-text("Historial"):visible');
      await page.waitForTimeout(1500);

      // Cambiar a vista Tabla
      await page.click('button:has-text("Tabla"):visible');
      await page.waitForTimeout(1000);

      // Filtrar por Transferencias / Pagos TDC
      await page.click('button:has-text("Transferencias / Pagos TDC"):visible');
      await page.waitForTimeout(1000);

      // Extraer filas de la tabla
      const tableRows = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        return rows.map((r) => {
          const cells = Array.from(r.querySelectorAll('td'));
          return {
            date: cells[1]?.textContent?.trim() || '',
            type: cells[2]?.textContent?.trim() || '',
            category: cells[3]?.textContent?.trim() || '',
            desc: cells[4]?.textContent?.trim() || '',
            amount: cells[5]?.textContent?.trim() || '',
            user: cells[6]?.textContent?.trim() || '',
          };
        });
      });

      testD.messages.push(`Filas registradas en Historial (Transferencias):\n${JSON.stringify(tableRows.slice(0, 5), null, 2)}`);

      // Buscar el registro recién creado
      const transferRecord = tableRows.find((r) => r.desc === uniqueDesc);

      if (transferRecord) {
        testD.messages.push(`[PASS] Registro encontrado en Historial:`);
        testD.messages.push(`  - Tipo: ${transferRecord.type}`);
        testD.messages.push(`  - Trayecto: ${transferRecord.category}`);
        testD.messages.push(`  - Descripción: ${transferRecord.desc}`);
        testD.messages.push(`  - Monto: ${transferRecord.amount}`);
        testD.messages.push(`  - Usuario: ${transferRecord.user}`);

        const hasValidAccounts = transferRecord.category.includes('Banco / Efectivo') && transferRecord.category.includes('Nomina BBVA');
        const hasValidAmount = transferRecord.amount.includes('10');

        // Verificar que no se exponga saldo privado de Nomina BBVA en la tabla
        const tableText = await page.locator('tbody').innerText();
        const hasExposedPrivateBalance = tableText.includes('$55,555');

        if (hasValidAccounts && hasValidAmount && !hasExposedPrivateBalance) {
          testD.messages.push('[PASS] La transferencia persiste correctamente en Historial con el trayecto entre miembros y sin exponer saldo privado destino.');
          testD.pass = true;
        } else {
          testD.messages.push(`[FAIL] Fallo en verificación de campos o saldo expuesto: validAccounts=${hasValidAccounts}, validAmount=${hasValidAmount}, exposedBal=${hasExposedPrivateBalance}`);
          testD.pass = false;
        }
      } else {
        testD.messages.push(`[FAIL] No se encontró el registro "${uniqueDesc}" en la tabla de Historial.`);
        testD.pass = false;
      }
    }

  } catch (err) {
    console.error('Error fatal durante la ejecución de las pruebas E2E:', err);
  } finally {
    await browser.close();
  }

  // REPORTE FINAL CONSOLIDADO
  console.log('\n===============================================================');
  console.log('                 REPORTE FINAL CONSOLIDADO                      ');
  console.log('===============================================================');
  let overallPass = true;
  for (const [name, res] of Object.entries(results)) {
    const status = res.pass ? 'PASS' : 'FAIL';
    if (!res.pass) overallPass = false;
    console.log(`\n[${status}] ${name}`);
    for (const msg of res.messages) {
      console.log(`    ${msg}`);
    }
  }

  console.log('\n===============================================================');
  console.log(`ESTADO FINAL: ${overallPass ? 'ALL TESTS PASSED' : 'TESTS FAILED'}`);
  console.log('===============================================================');

  if (!overallPass) {
    process.exit(1);
  }
}

runPrivacyVerification();
