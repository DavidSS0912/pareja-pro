import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = '/tmp/audit-mobile';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '390x844_iPhone13', width: 390, height: 844 },
  { name: '375x812_iPhoneMini', width: 375, height: 812 }
];

// Mock data generator for full, realistic state
const mockData = {
  user: { uid: 'user-1', email: 'david@example.com', displayName: 'David S', photoURL: '' },
  houseId: 'house-123',
  memberSlot: 'USER_A',
  authLoading: false,
  users: [
    { uid: 'user-1', email: 'david@example.com', displayName: 'David S', slot: 'USER_A', photoURL: '' },
    { uid: 'user-2', email: 'zoe@example.com', displayName: 'Zoe M', slot: 'USER_B', photoURL: '' }
  ],
  accounts: [
    { id: 'acc-1', name: 'BBVA Nómina Débito', type: 'CHECKING', balance: 18450, currency: 'MXN', ownerType: 'USER_A', ownerUid: 'user-1' },
    { id: 'acc-2', name: 'Santander Platinum', type: 'CREDIT_CARD', balance: 7850, creditLimit: 45000, cutoffDay: 12, paymentDueDay: 2, currency: 'MXN', ownerType: 'USER_A', ownerUid: 'user-1' },
    { id: 'acc-3', name: 'Fondo Común Efectivo', type: 'CASH', balance: 4200, currency: 'MXN', ownerType: 'SHARED' },
    { id: 'acc-4', name: 'Nu Tarjeta Débito', type: 'SAVINGS', balance: 12500, currency: 'MXN', ownerType: 'USER_B', ownerUid: 'user-2' }
  ],
  expenses: [
    { id: 'exp-1', description: 'Supermercado Fresko Despensa Quincenal', amount: 3450.50, category: 'Despensa', categoryId: 'cat-1', date: '2026-11-05', paidBy: 'user-1', splitType: '50-50', accountId: 'acc-1', type: 'EXPENSE', ownerType: 'SHARED' },
    { id: 'exp-2', description: 'Cena Restaurante Italiano', amount: 1250.00, category: 'Salidas', categoryId: 'cat-2', date: '2026-11-06', paidBy: 'user-2', splitType: '50-50', accountId: 'acc-4', type: 'EXPENSE', ownerType: 'SHARED' },
    { id: 'exp-3', description: 'Servicio de Luz CFE', amount: 890.00, category: 'Servicios', categoryId: 'cat-3', date: '2026-11-07', paidBy: 'user-1', splitType: '50-50', accountId: 'acc-1', type: 'EXPENSE', ownerType: 'SHARED' },
    { id: 'exp-4', description: 'Gasolina Shell', amount: 1100.00, category: 'Transporte', categoryId: 'cat-4', date: '2026-11-08', paidBy: 'user-1', splitType: '100-user', accountId: 'acc-1', type: 'EXPENSE', ownerType: 'PERSONAL', userId: 'user-1' }
  ],
  incomes: [
    { id: 'inc-1', description: 'Nómina Quincena 1', amount: 32000, category: 'Nómina', date: '2026-11-01', receivedBy: 'user-1', accountId: 'acc-1', ownerUid: 'user-1', ownerType: 'SHARED' },
    { id: 'inc-2', description: 'Honorarios Diseño', amount: 28000, category: 'Honorarios', date: '2026-11-01', receivedBy: 'user-2', accountId: 'acc-4', ownerUid: 'user-2', ownerType: 'SHARED' }
  ],
  budgets: [
    { id: 'bud-1', category: 'Despensa', categoryId: 'cat-1', assignedAmount: 8000, type: 'Necesidad', period: '2026-11', ownerType: 'SHARED', icon: '🛒', splitType: '50-50' },
    { id: 'bud-2', category: 'Servicios Hogar', categoryId: 'cat-2', assignedAmount: 4500, type: 'Necesidad', period: '2026-11', ownerType: 'SHARED', icon: '💡', splitType: '50-50' },
    { id: 'bud-3', category: 'Salidas y Entretenimiento', categoryId: 'cat-3', assignedAmount: 5000, type: 'Deseo', period: '2026-11', ownerType: 'SHARED', icon: '🍽️', splitType: '50-50' },
    { id: 'bud-4', category: 'Fondo Imprevistos', categoryId: 'cat-4', assignedAmount: 3000, type: 'Ahorro', period: '2026-11', ownerType: 'SHARED', icon: '🛡️', splitType: '50-50' }
  ],
  projects: [
    { id: 'proj-1', name: 'Viaje a Tokio Primavera 2027', targetAmount: 75000, currentAmount: 32500, monthlyContribution: 6000, targetDate: '2027-04-15', priority: 1, isPaused: false, status: 'ACTIVE', contributions: [] },
    { id: 'proj-2', name: 'Fondo de Emergencia 6 Meses', targetAmount: 120000, currentAmount: 54000, monthlyContribution: 5000, targetDate: '2027-10-30', priority: 2, isPaused: false, status: 'ACTIVE', contributions: [] }
  ],
  assets: [
    { id: 'asset-1', name: 'Automóvil Mazda 3 2022', value: 280000, type: 'VEHICLE', isLiquid: false, ownerType: 'SHARED' }
  ]
};

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const auditResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n==============================================`);
    console.log(`INICIANDO AUDITORÍA EN VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`==============================================\n`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    // Catch console errors and page errors
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(`[Console Error] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      consoleLogs.push(`[Uncaught PageError] ${err.message}`);
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Inject state into window.useAppStore
    await page.evaluate((data) => {
      if (window.useAppStore) {
        window.useAppStore.setState({
          ...data,
          fetchDashboardData: async () => {},
          refreshSettings: async () => {}
        });
        window.useAppStore.subscribe((state) => {
          if (!state.user) {
            window.useAppStore.setState({
              user: data.user,
              houseId: data.houseId,
              authLoading: false
            });
          }
        });
      }
    }, mockData);

    // Wait for bottom nav to appear
    await page.waitForSelector('nav', { state: 'visible', timeout: 10000 });
    // Remove development emulator banners that intercept pointer events
    await page.addStyleTag({
      content: '.firebase-emulator-warning, div:has(> p.firebase-emulator-warning) { display: none !important; pointer-events: none !important; }'
    });
    await page.waitForTimeout(500);

    // Define views to audit
    const views = [
      { id: 'dashboard', name: 'Inicio (DashboardView)', navLabel: 'Inicio' },
      { id: 'wallet', name: 'Billetera (AccountsView)', navLabel: 'Billetera' },
      { id: 'planning_budgets', name: 'Planeación: Presupuestos (PlanningView)', navLabel: 'Planeación', subTab: 'Presupuestos' },
      { id: 'planning_projects', name: 'Planeación: Proyectos (PlanningView)', navLabel: 'Planeación', subTab: 'Proyectos y Metas' },
      { id: 'settlement', name: 'Hogar / Liquidación (SettlementView)', navLabel: 'Hogar' },
      { id: 'historical', name: 'Historial (HistoricalView)', navLabel: 'Historial' },
      { id: 'settings', name: 'Ajustes (SettingsView)', navLabel: 'Ajustes' }
    ];

    for (const view of views) {
      console.log(`--- Auditando: ${view.name} ---`);

      // Click on nav tab
      const navButton = page.locator(`nav button:has-text("${view.navLabel}")`).first();
      await navButton.scrollIntoViewIfNeeded();
      await navButton.click({ force: true });
      await page.waitForTimeout(400);

      // If there's a subtab, click it
      if (view.subTab) {
        const subTabBtn = page.locator(`button:has-text("${view.subTab}")`).first();
        if (await subTabBtn.count() > 0 && await subTabBtn.isVisible()) {
          await subTabBtn.click({ force: true });
          await page.waitForTimeout(300);
        }
      }

      // Check A: Horizontal overflow
      const overflowInfo = await page.evaluate(() => {
        const docWidth = window.innerWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const hasOverflow = scrollWidth > docWidth || bodyScrollWidth > docWidth;

        let offendingElements = [];
        if (hasOverflow) {
          const all = Array.from(document.querySelectorAll('body *'));
          for (const el of all) {
            // Check elements whose bounding rect sticks out past window width
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 0.5) {
              // Ignore if element is inside an overflow container that handles it properly
              let isContained = false;
              let parent = el.parentElement;
              while (parent && parent !== document.body) {
                const parentStyle = window.getComputedStyle(parent);
                if (['hidden', 'auto', 'scroll'].includes(parentStyle.overflowX) && parent.getBoundingClientRect().right <= docWidth + 0.5) {
                  isContained = true;
                  break;
                }
                parent = parent.parentElement;
              }

              if (!isContained) {
                const selector = el.tagName.toLowerCase() +
                  (el.id ? '#' + el.id : '') +
                  (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');

                offendingElements.push({
                  selector,
                  tagName: el.tagName,
                  className: el.className,
                  rect: {
                    left: Math.round(rect.left),
                    right: Math.round(rect.right),
                    width: Math.round(rect.width)
                  },
                  excessPx: Math.round(rect.right - docWidth)
                });
              }
            }
          }
        }

        return {
          hasOverflow,
          docWidth,
          scrollWidth,
          bodyScrollWidth,
          offendingElements: offendingElements.slice(0, 10) // Top 10
        };
      });

      // Check B: Solapamiento inferior con bottom nav
      // Scroll to the bottom first
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);

      const overlapInfo = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        if (!nav) return { hasNav: false };
        const navRect = nav.getBoundingClientRect();

        const main = document.querySelector('main');
        if (!main) return { hasNav: true, hasMain: false };

        // Find all visible interactive or card elements in main
        const candidates = Array.from(main.querySelectorAll('button, a, input, select, p, h1, h2, h3, .rounded-3xl, .rounded-2xl, tr, [role="button"]'))
          .filter(el => {
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.width > 0 && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';
          });

        let lowestElement = null;
        let maxBottom = -Infinity;

        for (const el of candidates) {
          const r = el.getBoundingClientRect();
          if (r.bottom > maxBottom) {
            maxBottom = r.bottom;
            lowestElement = el;
          }
        }

        const isCovered = maxBottom > navRect.top;
        const overlapPx = isCovered ? Math.round(maxBottom - navRect.top) : 0;

        let lowestSelector = 'none';
        if (lowestElement) {
          lowestSelector = lowestElement.tagName.toLowerCase() +
            (lowestElement.id ? '#' + lowestElement.id : '') +
            (lowestElement.className && typeof lowestElement.className === 'string' ? '.' + lowestElement.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
        }

        return {
          hasNav: true,
          hasMain: true,
          navTop: Math.round(navRect.top),
          navHeight: Math.round(navRect.height),
          maxContentBottom: Math.round(maxBottom),
          isCovered,
          overlapPx,
          lowestSelector
        };
      });

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${vp.name}_${view.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const result = {
        viewport: vp.name,
        viewId: view.id,
        viewName: view.name,
        overflow: overflowInfo,
        bottomNavOverlap: overlapInfo,
        screenshot: screenshotPath
      };
      auditResults.push(result);

      console.log(`  - Scroll Horizontal: ${overflowInfo.hasOverflow ? `⚠️ DETECTADO (scrollWidth: ${overflowInfo.scrollWidth}px vs innerWidth: ${overflowInfo.docWidth}px)` : '✅ Ninguno'}`);
      if (overflowInfo.hasOverflow) {
        console.log(`    Elementos detectados:`, JSON.stringify(overflowInfo.offendingElements, null, 2));
      }
      console.log(`  - Solapamiento Nav Inferior: ${overlapInfo.isCovered ? `⚠️ SOLAPADO por ${overlapInfo.overlapPx}px (Nav top: ${overlapInfo.navTop}px, Contenido bottom: ${overlapInfo.maxContentBottom}px)` : `✅ Libre (${overlapInfo.navTop - overlapInfo.maxContentBottom}px de margen)`}`);
      console.log(`  - Screenshot: ${screenshotPath}\n`);
    }

    // Modal Audits
    console.log(`--- Auditando Modales en ${vp.name} ---`);

    // Modal 1: Nuevo Movimiento
    console.log(`  > Modal 'Nuevo Movimiento'`);
    // Ensure on dashboard first
    await page.locator(`nav button:has-text("Inicio")`).first().click({ force: true });
    await page.waitForTimeout(300);

    const nuevoMovBtn = page.locator('button:has-text("Nuevo Movimiento")').first();
    let modalMovementResult = null;
    if (await nuevoMovBtn.count() > 0 && await nuevoMovBtn.isVisible()) {
      await nuevoMovBtn.click({ force: true });
      await page.waitForTimeout(400);

      modalMovementResult = await page.evaluate(() => {
        const dialog = document.querySelector('dialog[open]');
        if (!dialog) return { found: false };
        const dialogRect = dialog.getBoundingClientRect();
        const modalContainer = dialog.querySelector('.bg-white') || dialog;
        const rect = modalContainer.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        const overflowsHoriz = rect.right > winW || rect.left < 0 || rect.width > winW;
        const overflowsVert = rect.bottom > winH || rect.height > winH;

        // Check if submit button is visible/reachable
        const submitBtn = dialog.querySelector('button[type="submit"]') || Array.from(dialog.querySelectorAll('button')).find(b => /guardar|crear|agregar/i.test(b.textContent || ''));
        const submitVisible = submitBtn ? submitBtn.getBoundingClientRect().top < winH : false;

        return {
          found: true,
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          winW,
          winH,
          overflowsHoriz,
          overflowsVert,
          submitFound: !!submitBtn,
          submitVisible
        };
      });

      const modalShotPath = path.join(SCREENSHOT_DIR, `${vp.name}_modal_nuevo_movimiento.png`);
      await page.screenshot({ path: modalShotPath });
      modalMovementResult.screenshot = modalShotPath;

      console.log(`    - Modal Movimiento: ${modalMovementResult.overflowsHoriz ? '⚠️ DESBORDE HORIZONTAL' : '✅ Ancho correcto'} | ${modalMovementResult.overflowsVert ? '⚠️ DESBORDE VERTICAL' : '✅ Altura contenida'}`);
      console.log(`    - Screenshot: ${modalShotPath}`);

      // Close modal
      const closeBtn = page.locator('dialog[open] button[aria-label="Cerrar"], dialog[open] button:has-text("Cancelar")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(300);
    }

    // Modal 2: Nueva Cuenta
    console.log(`  > Modal '+ Nueva Cuenta'`);
    // Navigate to Billetera
    await page.locator(`nav button:has-text("Billetera")`).first().click({ force: true });
    await page.waitForTimeout(400);

    const nuevaCuentaBtn = page.locator('button:has-text("Nueva Cuenta")').first();
    let modalAccountResult = null;
    if (await nuevaCuentaBtn.count() > 0 && await nuevaCuentaBtn.isVisible()) {
      await nuevaCuentaBtn.click({ force: true });
      await page.waitForTimeout(400);

      modalAccountResult = await page.evaluate(() => {
        const dialog = document.querySelector('dialog[open]');
        if (!dialog) return { found: false };
        const dialogRect = dialog.getBoundingClientRect();
        const modalContainer = dialog.querySelector('.bg-white') || dialog;
        const rect = modalContainer.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        const overflowsHoriz = rect.right > winW || rect.left < 0 || rect.width > winW;
        const overflowsVert = rect.bottom > winH || rect.height > winH;

        const submitBtn = dialog.querySelector('button[type="submit"]') || Array.from(dialog.querySelectorAll('button')).find(b => /guardar|crear|agregar/i.test(b.textContent || ''));
        const submitVisible = submitBtn ? submitBtn.getBoundingClientRect().top < winH : false;

        return {
          found: true,
          rect: {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          winW,
          winH,
          overflowsHoriz,
          overflowsVert,
          submitFound: !!submitBtn,
          submitVisible
        };
      });

      const modalAccountShotPath = path.join(SCREENSHOT_DIR, `${vp.name}_modal_nueva_cuenta.png`);
      await page.screenshot({ path: modalAccountShotPath });
      modalAccountResult.screenshot = modalAccountShotPath;

      console.log(`    - Modal Cuenta: ${modalAccountResult.overflowsHoriz ? '⚠️ DESBORDE HORIZONTAL' : '✅ Ancho correcto'} | ${modalAccountResult.overflowsVert ? '⚠️ DESBORDE VERTICAL' : '✅ Altura contenida'}`);
      console.log(`    - Screenshot: ${modalAccountShotPath}`);

      // Close modal
      const closeBtn = page.locator('dialog[open] button[aria-label="Cerrar"], dialog[open] button:has-text("Cancelar")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(300);
    }

    auditResults.push({
      viewport: vp.name,
      modals: {
        movement: modalMovementResult,
        account: modalAccountResult
      }
    });

    await context.close();
  }

  await browser.close();

  // Save audit results json
  const jsonPath = path.join(SCREENSHOT_DIR, 'audit-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(auditResults, null, 2));
  console.log(`\n==============================================`);
  console.log(`AUDITORÍA COMPLETADA. Resumen guardado en: ${jsonPath}`);
  console.log(`==============================================\n`);
}

runAudit().catch(err => {
  console.error("Error en la auditoría Playwright:", err);
  process.exit(1);
});
