import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { 
  createHouseholdAndUser, 
  createSharedExpenseWithProration, 
  deleteJournal, 
  connectorConfig, 
  getJournalBalanceV2, 
  createJournalWithEntries, 
  updateJournalWithEntries, 
  updateSharedExpenseWithProration, 
  createBudget, 
  updateBudget, 
  deleteBudget, 
  createCategory,
  getBudgets,
  getExpensesByHousehold
} from '../src/lib/dataconnect/esm/index.esm.js';

const app = initializeApp({
  projectId: 'demo-pareja-pro',
  apiKey: 'fake-api-key', // Required for auth emulator
});

const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099');

const dc = getDataConnect(app, connectorConfig);
connectDataConnectEmulator(dc, 'localhost', 9399);

async function signUpOrSignIn(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      return await signInWithEmailAndPassword(auth, email, password);
    }
    throw e;
  }
}

let globalHasErrors = false;

async function expectRejected(name, fn, expectedErrorRegex, verifyUnchangedFn = undefined) {
  console.log(`\n--- ${name} ---`);
  try {
    await fn();
    console.error(`❌ Falló! El sistema permitió la operación que debió ser rechazada.`);
    globalHasErrors = true;
  } catch (e) {
    if (expectedErrorRegex.test(e.message)) {
      console.log(`✅ Éxito! Rechazado correctamente. Motivo coincide: ${e.message}`);
      if (verifyUnchangedFn) {
        await verifyUnchangedFn();
      }
    } else {
      console.error(`❌ Falló! Se rechazó pero el motivo es incorrecto. Se esperaba ${expectedErrorRegex}, se recibió: ${e.message}`);
      globalHasErrors = true;
    }
  }
}

async function expectSuccess(name, fn) {
  console.log(`\n--- ${name} ---`);
  try {
    const res = await fn();
    console.log(`✅ Éxito! Operación realizada correctamente.`);
    return res;
  } catch (e) {
    console.error(`❌ Falló! Se esperaba éxito pero ocurrió error: ${e.message}`);
    globalHasErrors = true;
  }
}

const uniqueSuffix = Date.now().toString();

async function run() {
  console.log('--- Iniciando pruebas en el Emulador ---');
  
  // Login como usuario 1
  console.log('Iniciando sesión usuario 1...');
  const email1 = `user1_${uniqueSuffix}@example.com`;
  const cred1 = await signUpOrSignIn(email1, 'password123');
  const ownerUid = cred1.user.uid;
  
  console.log('Creando hogar 1...');
  const hh1 = await createHouseholdAndUser(dc, {
    email: email1,
    displayName: 'User 1'
  });
  const householdId = hh1.data.household_insert.id;
  const payerAccountId = hh1.data.assetAccount.id;
  const user1ExpenseId = hh1.data.expenseAccount.id;
  const user2ExpenseId = hh1.data.expenseAccount.id; 

  // Login como usuario 2 (Alien)
  console.log('Iniciando sesión usuario 2 (Alien)...');
  const email2 = `user2_${uniqueSuffix}@example.com`;
  await signUpOrSignIn(email2, 'password123');
  
  console.log('Creando hogar 2 (Alien)...');
  const hh2 = await createHouseholdAndUser(dc, {
    email: email2,
    displayName: 'User 2'
  });
  const alienHouseholdId = hh2.data.household_insert.id;

  // ==== VOLVEMOS AL USUARIO 1 ====
  await signInWithEmailAndPassword(auth, email1, 'password123');
  
  let journalIdShared = '';
  await expectSuccess('CASO 1: Crear gasto compartido exitoso', async () => {
    const res = await createSharedExpenseWithProration(dc, {
      householdId,
      date: new Date().toISOString(),
      description: '100.01 50/50',
      totalAmount: 100.01,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 50.01,
      user2Amount: 50.00,
      ownerUid,
      isShared: true
    });
    journalIdShared = res.data.journal_insert.id;
    const balanceRes = await getJournalBalanceV2(dc, { journalId: journalIdShared, householdId });
    const diff = balanceRes.data.journalBalanceV2s[0]?.diff;
    if (Math.abs(diff) > 0.005) throw new Error(`El balance del journal no cuadra. diff: ${diff}`);
  });

  await expectRejected('CASO 2: Usar householdId ajeno (debe fallar)', async () => {
    await createSharedExpenseWithProration(dc, {
      householdId: alienHouseholdId, // A reference to a household this user doesn't belong to
      date: new Date().toISOString(),
      description: 'Alien HH',
      totalAmount: 100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 50,
      user2Amount: 50,
      ownerUid,
      isShared: true
    });
  }, /El usuario no pertenece a este hogar/);

  await expectRejected('CASO 3: Monto negativo (debe fallar)', async () => {
    await createSharedExpenseWithProration(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Negative Amount',
      totalAmount: -100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: -50,
      user2Amount: -50,
      ownerUid,
      isShared: true
    });
  }, /constraint|Check constraint|negative|violated|Cuenta de pago inválida o el reparto no suma el total/i);

  await expectRejected('CASO 4: Reparto que no suma el total (debe fallar)', async () => {
    await createSharedExpenseWithProration(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Bad Match',
      totalAmount: 100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 40,
      user2Amount: 50,
      ownerUid,
      isShared: true
    });
  }, /constraint|diff|violated|unbalanced|Cuenta de pago inválida o el reparto no suma el total/i);

  // Cambiar a usuario Alien
  await signInWithEmailAndPassword(auth, email2, 'password123');

  await expectRejected('CASO 5: Alien borrando journal de otro hogar', async () => {
    await deleteJournal(dc, {
      journalId: journalIdShared,
      householdId: alienHouseholdId 
    });
  }, /El journal no pertenece a este hogar/, async () => {
    // Verificar que el journal NO fue borrado regresando al Usuario 1
    await signInWithEmailAndPassword(auth, email1, 'password123');
    const balance = await getJournalBalanceV2(dc, { journalId: journalIdShared, householdId });
    if (balance.data.journalBalanceV2s.length === 0) throw new Error("El journal fue borrado de la BD!");
    console.log("✅ Verificado: El journal sigue existiendo.");
  });

  // Volvemos al Usuario 1
  await signInWithEmailAndPassword(auth, email1, 'password123');

  let journalIdIngreso = '';
  await expectSuccess('CASO 6: Crear ingreso exitoso', async () => {
    const res = await createJournalWithEntries(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Positivo',
      amount: 100,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId, // Must be different
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
    journalIdIngreso = res.data.journal_insert.id;
  });

  await expectSuccess('CASO 7: Editar Journal exitoso', async () => {
    await updateJournalWithEntries(dc, {
      journalId: journalIdIngreso,
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Editado',
      amount: 150,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId, 
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
  });

  await expectSuccess('CASO 8: Editar gasto compartido exitoso', async () => {
    await updateSharedExpenseWithProration(dc, {
      journalId: journalIdShared,
      householdId,
      date: new Date().toISOString(),
      description: 'Gasto Compartido Editado',
      totalAmount: 120,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 60,
      user2Amount: 60,
      ownerUid,
      isShared: true
    });
  });

  await expectSuccess('CASO 9: Borrar Journal exitoso', async () => {
    await deleteJournal(dc, { journalId: journalIdIngreso, householdId });
    // Verificación
    const balance = await getJournalBalanceV2(dc, { journalId: journalIdIngreso, householdId });
    if (balance.data.journalBalanceV2s.length > 0) {
      throw new Error("El journal no fue borrado de la base de datos.");
    }
  });

  let categoryId = '';
  let budgetId = '';
  await expectSuccess('CASO 10: Crear presupuesto exitoso', async () => {
    const catRes = await createCategory(dc, {
      householdId,
      name: 'Test Category',
      type: 'EXPENSE',
      ownerType: 'SHARED'
    });
    categoryId = catRes.data.category_insert.id;

    const res = await createBudget(dc, {
      householdId,
      categoryId,
      period: '2026-10-01',
      assignedAmount: 1000,
      ownerType: 'SHARED'
    });
    budgetId = res.data.budget_insert.id;
  });

  await expectRejected('CASO 11: Crear presupuesto con monto negativo (debe fallar)', async () => {
    await createBudget(dc, {
      householdId,
      categoryId,
      period: '2026-11-01',
      assignedAmount: -500,
      ownerType: 'SHARED'
    });
  }, /constraint|Check constraint|negative|violated|Hogar inválido o monto negativo/i);

  await expectRejected('CASO 12: Crear presupuesto duplicado (debe fallar)', async () => {
    await createBudget(dc, {
      householdId,
      categoryId,
      period: '2026-10-01', // same as CASO 10
      assignedAmount: 500,
      ownerType: 'SHARED'
    });
  }, /constraint|duplicate|unique|Ya existe un presupuesto/i, async () => {
    const budgets = await getBudgets(dc, { householdId });
    const count = budgets.data.budgets.filter(b => b.period === '2026-10-01' && b.categoryId === categoryId).length;
    if (count > 1) throw new Error("Se permitió duplicar el presupuesto!");
    console.log("✅ Verificado: No se duplicó el presupuesto.");
  });

  // We create a separate app for the alien to avoid Data Connect cache hits from User 1
  const alienApp = initializeApp({
    projectId: 'demo-pareja-pro',
    apiKey: 'fake-api-key'
  }, "alienApp");
  const alienAuth = getAuth(alienApp);
  connectAuthEmulator(alienAuth, 'http://127.0.0.1:9099');
  const alienDc = getDataConnect(alienApp, connectorConfig);
  connectDataConnectEmulator(alienDc, 'localhost', 9399);

  await signInWithEmailAndPassword(alienAuth, email2, 'password123'); // alien
  await new Promise(resolve => setTimeout(resolve, 1000));
  await expectRejected('CASO 12.5: Alien lee presupuestos de otro hogar (debe fallar)', async () => {
    const res = await getBudgets(alienDc, { householdId });
    if (res.errors && res.errors.length > 0) {
      throw new Error(res.errors.map(e => e.message).join(", "));
    }
    if (res.data && res.data.budgets && res.data.budgets.length > 0) {
      throw new Error("El sistema permitió leer presupuestos ajenos.");
    }
  }, /El recurso no pertenece a este hogar/i);
  
  await expectRejected('CASO 13: Alien crea presupuesto en hogar ajeno', async () => {
    await createBudget(alienDc, {
      householdId: householdId, 
      categoryId,
      period: '2026-12-01',
      assignedAmount: 500,
      ownerType: 'SHARED'
    });
  }, /Hogar inválido o monto negativo/);

  await expectRejected('CASO 14: Alien actualiza presupuesto ajeno', async () => {
    await updateBudget(alienDc, {
      id: budgetId,
      householdId: alienHouseholdId,
      assignedAmount: 1500
    });
  }, /El presupuesto no pertenece a este hogar/, async () => {
    const budgets = await getBudgets(dc, { householdId });
    const b = budgets.data.budgets.find(b => b.id === budgetId);
    if (!b || b.assignedAmount !== 1000) throw new Error("Alien modificó el presupuesto!");
    console.log("✅ Verificado: El presupuesto no fue modificado.");
  });

  await expectRejected('CASO 15: Alien borra presupuesto ajeno', async () => {
    await deleteBudget(alienDc, {
      id: budgetId,
      householdId: alienHouseholdId 
    });
  }, /El presupuesto no pertenece a este hogar/, async () => {
    const budgets = await getBudgets(dc, { householdId });
    if (!budgets.data.budgets.find(b => b.id === budgetId)) throw new Error("Alien borró el presupuesto!");
    console.log("✅ Verificado: El presupuesto sigue existiendo.");
  });

  await expectRejected('CASO 15.1: Alien crea Journal en hogar ajeno', async () => {
    await createJournalWithEntries(alienDc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Alien Ingreso',
      amount: 100,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId,
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
  }, /El usuario no pertenece a este hogar/);

  const expensesBefore15_1b = await getExpensesByHousehold(dc, { householdId });
  const countBefore15_1b = expensesBefore15_1b.data.entries.length;
  await expectRejected('CASO 15.1b: Alien crea Journal en su propio hogar con cuentas de la víctima', async () => {
    await createJournalWithEntries(alienDc, {
      householdId: alienHouseholdId,
      date: new Date().toISOString(),
      description: 'Alien Ingreso Cuentas Ajenas',
      amount: 100,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId,
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
  }, /Cuenta de débito inválida, monto no positivo o cuentas iguales/, async () => {
    const expensesAfter = await getExpensesByHousehold(dc, { householdId });
    if (expensesAfter.data.entries.length !== countBefore15_1b || expensesAfter.data.entries.some(e => e.journal.description === 'Alien Ingreso Cuentas Ajenas')) {
      throw new Error("Se crearon asientos en las cuentas de la víctima!");
    }
    console.log("✅ Verificado: No se creó ningún asiento en las cuentas de la víctima.");
  });

  await expectRejected('CASO 15.2: Alien edita Journal ajeno', async () => {
    await updateJournalWithEntries(alienDc, {
      journalId: journalIdShared,
      householdId,
      date: new Date().toISOString(),
      description: 'Alien Edit',
      amount: 150,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId,
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
  }, /El usuario no pertenece a este hogar/);

  await expectRejected('CASO 15.2b: Alien edita Journal ajeno usando su propio hogar', async () => {
    await updateJournalWithEntries(alienDc, {
      journalId: journalIdShared,
      householdId: alienHouseholdId,
      date: new Date().toISOString(),
      description: 'Alien Edit Propio Hogar',
      amount: 150,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId,
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
  }, /El journal no pertenece a este hogar/, async () => {
    const expensesAfter = await getExpensesByHousehold(dc, { householdId });
    const sharedEntries = expensesAfter.data.entries.filter(e => e.journal.id === journalIdShared);
    if (sharedEntries.length === 0 || sharedEntries[0].journal.description !== 'Gasto Compartido Editado') {
      throw new Error("El journal de la víctima fue modificado!");
    }
    console.log("✅ Verificado: El journal de la víctima no cambió.");
  });

  await expectRejected('CASO 15.3: Alien crea Gasto Compartido en hogar ajeno', async () => {
    await createSharedExpenseWithProration(alienDc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Alien Shared',
      totalAmount: 100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 50,
      user2Amount: 50,
      ownerUid,
      isShared: true
    });
  }, /El usuario no pertenece a este hogar/);

  const expensesBefore15_3b = await getExpensesByHousehold(dc, { householdId });
  const countBefore15_3b = expensesBefore15_3b.data.entries.length;
  await expectRejected('CASO 15.3b: Alien crea Gasto Compartido en su propio hogar con cuentas de la víctima', async () => {
    await createSharedExpenseWithProration(alienDc, {
      householdId: alienHouseholdId,
      date: new Date().toISOString(),
      description: 'Alien Shared Cuentas Ajenas',
      totalAmount: 100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 50,
      user2Amount: 50,
      ownerUid,
      isShared: true
    });
  }, /Cuenta de pago inválida o el reparto no suma el total/, async () => {
    const expensesAfter = await getExpensesByHousehold(dc, { householdId });
    if (expensesAfter.data.entries.length !== countBefore15_3b || expensesAfter.data.entries.some(e => e.journal.description === 'Alien Shared Cuentas Ajenas')) {
      throw new Error("Se crearon gastos compartidos en las cuentas de la víctima!");
    }
    console.log("✅ Verificado: No se creó ningún gasto compartido en las cuentas de la víctima.");
  });

  await expectRejected('CASO 15.4: Alien edita Gasto Compartido ajeno', async () => {
    await updateSharedExpenseWithProration(alienDc, {
      journalId: journalIdShared,
      householdId,
      date: new Date().toISOString(),
      description: 'Alien Shared Edit',
      totalAmount: 120,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 60,
      user2Amount: 60,
      ownerUid,
      isShared: true
    });
  }, /El usuario no pertenece a este hogar/);

  await expectRejected('CASO 15.4b: Alien edita Gasto Compartido ajeno usando su propio hogar', async () => {
    await updateSharedExpenseWithProration(alienDc, {
      journalId: journalIdShared,
      householdId: alienHouseholdId,
      date: new Date().toISOString(),
      description: 'Alien Shared Edit Propio Hogar',
      totalAmount: 120,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 60,
      user2Amount: 60,
      ownerUid,
      isShared: true
    });
  }, /El journal no pertenece a este hogar/, async () => {
    const expensesAfter = await getExpensesByHousehold(dc, { householdId });
    const sharedEntries = expensesAfter.data.entries.filter(e => e.journal.id === journalIdShared);
    if (sharedEntries.length === 0 || sharedEntries[0].journal.description !== 'Gasto Compartido Editado') {
      throw new Error("El gasto compartido de la víctima fue modificado!");
    }
    console.log("✅ Verificado: El gasto compartido de la víctima no cambió.");
  });

  if (globalHasErrors) {
    console.error('\n⚠️ Hubo errores en las pruebas.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todas las pruebas pasaron exitosamente.');
    process.exit(0);
  }
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
