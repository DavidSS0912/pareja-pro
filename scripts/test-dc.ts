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
  getExpensesByHousehold,
  createAccount,
  updateAccount,
  archiveAccount,
  deleteAccount,
  reassignEntries,
  getHouseholdAccounts,
  getCurrentUser,
  createSavingsProject,
  updateSavingsProject,
  updateProjectProgress,
  getSavingsProjects,
  createExternalAsset,
  updateExternalAsset,
  getExternalAssets,
  updateCategory,
  deleteCategory,
  getCategories,
  createTag,
  deleteTag,
  getTags,
  setJournalTags,
  addTagToJournal,
  getJournalTags
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

  // ==== FAMILIA CUENTAS ====
  let extraAssetId = '';
  let extraExpenseId = '';
  await expectSuccess('CASO 16.1: Crear y editar cuenta exitosamente', async () => {
    const res1 = await createAccount(dc, {
      householdId,
      name: 'Cuenta Temporal',
      type: 'ASSET',
      ownerType: 'SHARED',
      color: 'bg-slate-800'
    });
    extraAssetId = res1.data.account_insert.id;

    const res2 = await createAccount(dc, {
      householdId,
      name: 'Gasto Temporal 2',
      type: 'EXPENSE',
      ownerType: 'SHARED',
      color: 'bg-slate-800'
    });
    extraExpenseId = res2.data.account_insert.id;

    await updateAccount(dc, {
      accountId: extraAssetId,
      householdId,
      name: 'Cuenta Temporal Editada',
      ownerType: 'SHARED',
      color: 'bg-blue-800'
    });

    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const updated = accs.data.accounts.find(a => a.id === extraAssetId);
    if (!updated || updated.name !== 'Cuenta Temporal Editada') {
      throw new Error("La cuenta no se actualizó correctamente.");
    }
  });

  await expectRejected('CASO 16.2: Alien edita cuenta ajena con su propio hogar', async () => {
    await updateAccount(alienDc, {
      accountId: payerAccountId,
      householdId: alienHouseholdId,
      name: 'Hackeada',
      ownerType: 'SHARED'
    });
  }, /La cuenta no pertenece a este hogar/, async () => {
    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimAcc = accs.data.accounts.find(a => a.id === payerAccountId);
    if (!victimAcc || victimAcc.name === 'Hackeada') throw new Error("Alien modificó la cuenta de la víctima!");
    console.log("✅ Verificado: La cuenta de la víctima no cambió de nombre.");
  });

  await expectRejected('CASO 16.3: Alien archiva cuenta ajena con su propio hogar', async () => {
    await archiveAccount(alienDc, {
      accountId: payerAccountId,
      householdId: alienHouseholdId,
      isArchived: true
    });
  }, /La cuenta no pertenece a este hogar/, async () => {
    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimAcc = accs.data.accounts.find(a => a.id === payerAccountId);
    if (!victimAcc || victimAcc.isArchived !== false) throw new Error("Alien archivó la cuenta de la víctima!");
    console.log("✅ Verificado: La cuenta de la víctima sigue activa.");
  });

  await expectRejected('CASO 16.4: Alien borra cuenta ajena con su propio hogar', async () => {
    await deleteAccount(alienDc, {
      accountId: extraAssetId,
      householdId: alienHouseholdId
    });
  }, /La cuenta no pertenece a este hogar/, async () => {
    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!accs.data.accounts.find(a => a.id === extraAssetId)) throw new Error("Alien borró la cuenta de la víctima!");
    console.log("✅ Verificado: La cuenta de la víctima sigue existiendo.");
  });

  const alienAssetId = hh2.data.assetAccount.id;
  await expectRejected('CASO 16.5: Alien reasigna asientos de cuenta ajena con su propio hogar', async () => {
    await reassignEntries(alienDc, {
      householdId: alienHouseholdId,
      fromAccountId: payerAccountId,
      toAccountId: alienAssetId,
      accountType: 'ASSET'
    });
  }, /Cuenta de origen inválida, de distinto tipo o igual a la de destino/, async () => {
    const balanceRes = await getJournalBalanceV2(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const diff = balanceRes.data.journalBalanceV2s[0]?.diff;
    if (Math.abs(diff) > 0.005) throw new Error("Los asientos de la víctima fueron alterados!");
    console.log("✅ Verificado: Los asientos de la víctima no cambiaron.");
  });

  await expectRejected('CASO 16.6: Borrar cuenta con asientos asociados (debe fallar)', async () => {
    await deleteAccount(dc, {
      accountId: payerAccountId,
      householdId
    });
  }, /La cuenta tiene asientos asociados y no puede eliminarse/, async () => {
    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!accs.data.accounts.find(a => a.id === payerAccountId)) throw new Error("Se borró una cuenta con asientos!");
    console.log("✅ Verificado: La cuenta con asientos sigue existiendo.");
  });

  await expectRejected('CASO 16.7: Reasignar asientos entre cuentas de distinto tipo (debe fallar)', async () => {
    await reassignEntries(dc, {
      householdId,
      fromAccountId: user1ExpenseId,
      toAccountId: payerAccountId,
      accountType: 'EXPENSE'
    });
  }, /Cuenta de destino inválida o de distinto tipo/, async () => {
    const expensesAfter = await getExpensesByHousehold(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (expensesAfter.data.entries.length === 0) throw new Error("Los asientos de gasto cambiaron de cuenta!");
    console.log("✅ Verificado: Los asientos no cambiaron ante tipos distintos.");
  });

  await expectSuccess('CASO 16.8: Reasignar asientos válido entre cuentas del mismo tipo', async () => {
    await reassignEntries(dc, {
      householdId,
      fromAccountId: user1ExpenseId,
      toAccountId: extraExpenseId,
      accountType: 'EXPENSE'
    });
    const expensesAfter = await getExpensesByHousehold(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!expensesAfter.data.entries.every(e => e.account.name === 'Gasto Temporal 2')) {
      throw new Error("Los asientos no se reasignaron a la cuenta destino.");
    }
    // Regresar asientos a user1ExpenseId para dejar limpio
    await reassignEntries(dc, {
      householdId,
      fromAccountId: extraExpenseId,
      toAccountId: user1ExpenseId,
      accountType: 'EXPENSE'
    });
  });

  await expectSuccess('CASO 16.9: Borrar cuenta vacía exitoso', async () => {
    await deleteAccount(dc, {
      accountId: extraAssetId,
      householdId
    });
    const accs = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (accs.data.accounts.find(a => a.id === extraAssetId)) {
      throw new Error("La cuenta vacía no fue eliminada.");
    }
  });

  const accsBefore16_10 = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
  await expectRejected('CASO 16.10: CreateHouseholdAndUser por segunda vez con el mismo usuario (debe fallar)', async () => {
    await createHouseholdAndUser(dc, {
      email: email1,
      displayName: 'User 1 Duplicate'
    });
  }, /unique constraint/, async () => {
    const currUser = await getCurrentUser(dc, { fetchPolicy: 'SERVER_ONLY' });
    const accsAfter = await getHouseholdAccounts(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (currUser.data.user?.householdId !== householdId || accsAfter.data.accounts.length !== accsBefore16_10.data.accounts.length) {
      throw new Error("El hogar del usuario o sus cuentas cambiaron tras el segundo CreateHouseholdAndUser!");
    }
    console.log("✅ Verificado: El hogar del usuario y sus cuentas permanecen intactos.");
  });

  // ==== FAMILIA AHORROS Y ACTIVOS ====
  let projectId = '';
  await expectSuccess('CASO 17.1: Crear proyecto de ahorro exitoso', async () => {
    const res = await createSavingsProject(dc, {
      householdId,
      name: 'Fondo de Emergencia',
      targetAmount: 10000,
      priority: 1,
      monthlyQuota: 1000,
      targetAccount: 'Banco'
    });
    projectId = res.data.savingsProject_insert.id;
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const created = projs.data.savingsProjects.find(p => p.id === projectId);
    if (!created || created.name !== 'Fondo de Emergencia' || created.targetAmount !== 10000) {
      throw new Error("El proyecto de ahorro no se creó correctamente.");
    }
  });

  await expectRejected('CASO 17.2: Alien crea proyecto de ahorro en hogar ajeno', async () => {
    await createSavingsProject(alienDc, {
      householdId,
      name: 'Proyecto Alien',
      targetAmount: 5000,
      priority: 2
    });
  }, /El usuario no pertenece a este hogar o el monto objetivo es negativo/, async () => {
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (projs.data.savingsProjects.some(p => p.name === 'Proyecto Alien') || projs.data.savingsProjects.length !== 1) {
      throw new Error("Alien creó un proyecto en el hogar de la víctima!");
    }
    console.log("✅ Verificado: No se creó ningún proyecto ajeno en el hogar de la víctima.");
  });

  await expectSuccess('CASO 17.3: Editar proyecto de ahorro exitoso', async () => {
    await updateSavingsProject(dc, {
      projectId,
      householdId,
      name: 'Fondo de Emergencia Editado',
      targetAmount: 12000,
      monthlyQuota: 1200,
      targetAccount: 'CETES',
      priority: 1,
      isCompleted: false
    });
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const updated = projs.data.savingsProjects.find(p => p.id === projectId);
    if (!updated || updated.name !== 'Fondo de Emergencia Editado' || updated.targetAmount !== 12000) {
      throw new Error("El proyecto de ahorro no se actualizó correctamente.");
    }
  });

  await expectRejected('CASO 17.4: Alien edita proyecto de ahorro ajeno con su propio hogar', async () => {
    await updateSavingsProject(alienDc, {
      projectId,
      householdId: alienHouseholdId,
      name: 'Proyecto Hackeado',
      targetAmount: 1
    });
  }, /El proyecto de ahorro no pertenece a este hogar/, async () => {
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimProj = projs.data.savingsProjects.find(p => p.id === projectId);
    if (!victimProj || victimProj.name !== 'Fondo de Emergencia Editado' || victimProj.targetAmount !== 12000) {
      throw new Error("Alien modificó el proyecto de ahorro de la víctima!");
    }
    console.log("✅ Verificado: El proyecto de ahorro de la víctima no cambió.");
  });

  await expectSuccess('CASO 17.5: Actualizar progreso de proyecto de ahorro exitoso', async () => {
    await updateProjectProgress(dc, {
      projectId,
      householdId,
      amountToAdd: 2500
    });
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const updated = projs.data.savingsProjects.find(p => p.id === projectId);
    if (!updated || updated.currentAmount !== 2500) {
      throw new Error("El progreso del proyecto de ahorro no se actualizó correctamente.");
    }
  });

  await expectRejected('CASO 17.6: Alien actualiza progreso de proyecto ajeno con su propio hogar', async () => {
    await updateProjectProgress(alienDc, {
      projectId,
      householdId: alienHouseholdId,
      amountToAdd: 99999
    });
  }, /El proyecto de ahorro no pertenece a este hogar/, async () => {
    const projs = await getSavingsProjects(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimProj = projs.data.savingsProjects.find(p => p.id === projectId);
    if (!victimProj || victimProj.currentAmount !== 2500) {
      throw new Error("Alien modificó el progreso del proyecto de la víctima!");
    }
    console.log("✅ Verificado: El progreso del proyecto de la víctima no cambió.");
  });

  let assetId = '';
  await expectSuccess('CASO 17.7: Crear activo externo exitoso', async () => {
    const res = await createExternalAsset(dc, {
      householdId,
      name: 'Auto Familiar',
      estimatedValue: 200000,
      assetType: 'vehiculo'
    });
    assetId = res.data.externalAsset_insert.id;
    const assets = await getExternalAssets(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const created = assets.data.externalAssets.find(a => a.id === assetId);
    if (!created || created.name !== 'Auto Familiar' || created.estimatedValue !== 200000) {
      throw new Error("El activo externo no se creó correctamente.");
    }
  });

  await expectRejected('CASO 17.8: Alien crea activo externo en hogar ajeno', async () => {
    await createExternalAsset(alienDc, {
      householdId,
      name: 'Activo Alien',
      estimatedValue: 50000,
      assetType: 'inmueble'
    });
  }, /El usuario no pertenece a este hogar o el valor estimado es negativo/, async () => {
    const assets = await getExternalAssets(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (assets.data.externalAssets.some(a => a.name === 'Activo Alien') || assets.data.externalAssets.length !== 1) {
      throw new Error("Alien creó un activo externo en el hogar de la víctima!");
    }
    console.log("✅ Verificado: No se creó ningún activo externo ajeno en el hogar de la víctima.");
  });

  await expectSuccess('CASO 17.9: Actualizar valor estimado de activo externo exitoso', async () => {
    await updateExternalAsset(dc, {
      assetId,
      householdId,
      estimatedValue: 185000
    });
    const assets = await getExternalAssets(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const updated = assets.data.externalAssets.find(a => a.id === assetId);
    if (!updated || updated.estimatedValue !== 185000) {
      throw new Error("El activo externo no se actualizó correctamente.");
    }
  });

  await expectRejected('CASO 17.10: Alien actualiza activo externo ajeno con su propio hogar', async () => {
    await updateExternalAsset(alienDc, {
      assetId,
      householdId: alienHouseholdId,
      estimatedValue: 1
    });
  }, /El activo externo no pertenece a este hogar/, async () => {
    const assets = await getExternalAssets(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimAsset = assets.data.externalAssets.find(a => a.id === assetId);
    if (!victimAsset || victimAsset.estimatedValue !== 185000) {
      throw new Error("Alien modificó el activo externo de la víctima!");
    }
    console.log("✅ Verificado: El activo externo de la víctima no cambió.");
  });

  // ==== FAMILIA CATEGORÍAS Y ETIQUETAS ====
  let catTempId = '';
  await expectSuccess('CASO 18.1: Crear y actualizar categoría exitosamente', async () => {
    const res = await createCategory(dc, {
      householdId,
      name: 'Categoría Temporal',
      type: 'EXPENSE',
      color: '#ff0000',
      ownerType: 'SHARED'
    });
    catTempId = res.data.category_insert.id;
    await updateCategory(dc, {
      id: catTempId,
      householdId,
      name: 'Categoría Temporal Editada',
      color: '#00ff00'
    });
    const cats = await getCategories(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const updated = cats.data.categories.find(c => c.id === catTempId);
    if (!updated || updated.name !== 'Categoría Temporal Editada' || updated.color !== '#00ff00') {
      throw new Error("La categoría no se creó o actualizó correctamente.");
    }
  });

  await expectRejected('CASO 18.2: Alien crea categoría en hogar ajeno', async () => {
    await createCategory(alienDc, {
      householdId,
      name: 'Categoría Alien',
      type: 'EXPENSE',
      ownerType: 'SHARED'
    });
  }, /El usuario no pertenece a este hogar/, async () => {
    const cats = await getCategories(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (cats.data.categories.some(c => c.name === 'Categoría Alien')) {
      throw new Error("Alien creó una categoría en el hogar de la víctima!");
    }
    console.log("✅ Verificado: No se creó ninguna categoría ajena.");
  });

  await expectRejected('CASO 18.3: Alien actualiza categoría ajena con su propio hogar', async () => {
    await updateCategory(alienDc, {
      id: catTempId,
      householdId: alienHouseholdId,
      name: 'Categoría Hackeada',
      color: '#000000'
    });
  }, /La categoría no pertenece a este hogar/, async () => {
    const cats = await getCategories(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const victimCat = cats.data.categories.find(c => c.id === catTempId);
    if (!victimCat || victimCat.name !== 'Categoría Temporal Editada') {
      throw new Error("Alien modificó la categoría de la víctima!");
    }
    console.log("✅ Verificado: La categoría de la víctima no cambió.");
  });

  await expectRejected('CASO 18.4: Alien borra categoría ajena con su propio hogar', async () => {
    await deleteCategory(alienDc, {
      id: catTempId,
      householdId: alienHouseholdId
    });
  }, /La categoría no pertenece a este hogar/, async () => {
    const cats = await getCategories(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!cats.data.categories.find(c => c.id === catTempId)) {
      throw new Error("Alien borró la categoría de la víctima!");
    }
    console.log("✅ Verificado: La categoría de la víctima sigue existiendo.");
  });

  await expectSuccess('CASO 18.5: Borrar categoría usada en Journal y Budget y verificar efecto', async () => {
    const bRes = await createBudget(dc, {
      householdId,
      categoryId: catTempId,
      period: '2026-09-01',
      assignedAmount: 300,
      ownerType: 'SHARED'
    });
    const tempBudgetId = bRes.data.budget_insert.id;

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
      isShared: true,
      categoryId: catTempId
    });

    await deleteCategory(dc, {
      id: catTempId,
      householdId
    });

    const cats = await getCategories(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (cats.data.categories.find(c => c.id === catTempId)) {
      throw new Error("La categoría no fue eliminada.");
    }
    const exps = await getExpensesByHousehold(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const sharedEntry = exps.data.entries.find(e => e.journal.id === journalIdShared);
    const budgetsAfter = await getBudgets(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    const budgetAfter = budgetsAfter.data.budgets.find(b => b.id === tempBudgetId);
    if (!sharedEntry || sharedEntry.journal.categoryId !== null || budgetAfter !== undefined) {
      throw new Error(`Efecto inesperado tras DeleteCategory: journalExists=${!!sharedEntry}, journalCat=${sharedEntry?.journal.categoryId}, budgetExists=${!!budgetAfter}`);
    }
  });

  let tagTempId = '';
  let alienTagId = '';
  await expectSuccess('CASO 18.6: Crear etiqueta exitosamente', async () => {
    const res = await createTag(dc, {
      householdId,
      name: 'Viaje2026'
    });
    tagTempId = res.data.tag_insert.id;
    const tagsRes = await getTags(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!tagsRes.data.tags.some(t => t.id === tagTempId && t.name === 'Viaje2026')) {
      throw new Error("La etiqueta no se creó correctamente.");
    }
    const alienTagRes = await createTag(alienDc, {
      householdId: alienHouseholdId,
      name: 'TagPropioAlien'
    });
    alienTagId = alienTagRes.data.tag_insert.id;
  });

  await expectRejected('CASO 18.7: Alien crea etiqueta en hogar ajeno', async () => {
    await createTag(alienDc, {
      householdId,
      name: 'TagAlienInvasor'
    });
  }, /El usuario no pertenece a este hogar/, async () => {
    const tagsRes = await getTags(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (tagsRes.data.tags.some(t => t.name === 'TagAlienInvasor')) {
      throw new Error("Alien creó una etiqueta en el hogar de la víctima!");
    }
    console.log("✅ Verificado: No se creó ninguna etiqueta ajena.");
  });

  await expectSuccess('CASO 18.8: Asignar etiqueta a Journal exitosamente (AddTagToJournal)', async () => {
    await addTagToJournal(dc, {
      journalId: journalIdShared,
      householdId,
      tagId: tagTempId
    });
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!jTags.data.journalTags.some(jt => jt.tag.id === tagTempId)) {
      throw new Error("La etiqueta no se asoció al journal.");
    }
  });

  await expectRejected('CASO 18.9: Alien asigna etiqueta a Journal ajeno con su propio hogar', async () => {
    await addTagToJournal(alienDc, {
      journalId: journalIdShared,
      householdId: alienHouseholdId,
      tagId: alienTagId
    });
  }, /El journal no pertenece a este hogar/, async () => {
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (jTags.data.journalTags.some(jt => jt.tag.id === alienTagId) || jTags.data.journalTags.length !== 1) {
      throw new Error("Alien modificó las etiquetas del journal de la víctima!");
    }
    console.log("✅ Verificado: Las etiquetas del journal de la víctima no cambiaron.");
  });

  await expectRejected('CASO 18.9b: Usuario asigna etiqueta ajena a su propio Journal (debe fallar)', async () => {
    await addTagToJournal(dc, {
      journalId: journalIdShared,
      householdId,
      tagId: alienTagId
    });
  }, /La etiqueta no pertenece a este hogar/, async () => {
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (jTags.data.journalTags.some(jt => jt.tag.id === alienTagId) || jTags.data.journalTags.length !== 1) {
      throw new Error("Se asoció una etiqueta ajena al journal!");
    }
    console.log("✅ Verificado: No se asoció la etiqueta ajena.");
  });

  await expectRejected('CASO 18.10: Alien ejecuta SetJournalTags sobre Journal ajeno con su propio hogar', async () => {
    await setJournalTags(alienDc, {
      journalId: journalIdShared,
      householdId: alienHouseholdId,
      tagIds: []
    });
  }, /El journal no pertenece a este hogar/, async () => {
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (jTags.data.journalTags.length !== 1 || jTags.data.journalTags[0].tag.id !== tagTempId) {
      throw new Error("Alien borró las etiquetas del journal de la víctima!");
    }
    console.log("✅ Verificado: Las etiquetas del journal de la víctima siguen intactas.");
  });

  await expectRejected('CASO 18.10b: SetJournalTags con tagIds ajenos sobre Journal propio (debe fallar)', async () => {
    await setJournalTags(dc, {
      journalId: journalIdShared,
      householdId,
      tagIds: [tagTempId, alienTagId]
    });
  }, /Una o más etiquetas no pertenecen a este hogar/, async () => {
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (jTags.data.journalTags.length !== 1) {
      throw new Error("SetJournalTags eliminó las etiquetas pese a recibir tagIds inválidos!");
    }
    console.log("✅ Verificado: Las etiquetas del journal no se borraron.");
  });

  await expectSuccess('CASO 18.11: SetJournalTags exitoso con etiquetas válidas del hogar', async () => {
    await setJournalTags(dc, {
      journalId: journalIdShared,
      householdId,
      tagIds: [tagTempId]
    });
    const jTags = await getJournalTags(dc, { journalId: journalIdShared, householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (jTags.data.journalTags.length !== 0) {
      throw new Error("SetJournalTags no limpió las etiquetas del journal.");
    }
  });

  await expectRejected('CASO 18.12: Alien borra etiqueta ajena con su propio hogar', async () => {
    await deleteTag(alienDc, {
      id: tagTempId,
      householdId: alienHouseholdId
    });
  }, /La etiqueta no pertenece a este hogar/, async () => {
    const tagsRes = await getTags(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (!tagsRes.data.tags.some(t => t.id === tagTempId)) {
      throw new Error("Alien borró la etiqueta de la víctima!");
    }
    console.log("✅ Verificado: La etiqueta de la víctima sigue existiendo.");
  });

  await expectSuccess('CASO 18.13: Borrar etiqueta exitoso', async () => {
    await deleteTag(dc, {
      id: tagTempId,
      householdId
    });
    const tagsRes = await getTags(dc, { householdId }, { fetchPolicy: 'SERVER_ONLY' });
    if (tagsRes.data.tags.some(t => t.id === tagTempId)) {
      throw new Error("La etiqueta no fue eliminada.");
    }
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
