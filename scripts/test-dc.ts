import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { createHouseholdAndUser, createSharedExpenseWithProration, deleteJournal, OwnerType, connectorConfig, getJournalBalanceV2, createJournalWithEntries, updateJournalWithEntries, updateSharedExpenseWithProration, createBudget, updateBudget, deleteBudget, createCategory } from '../src/lib/dataconnect/esm/index.esm.js';

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

const uniqueSuffix = Date.now().toString();

async function run() {
  let hasErrors = false;
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
  const user2ExpenseId = hh1.data.expenseAccount.id; // Reuse para simplificar

  // Login como usuario 2 (Alien)
  console.log('Iniciando sesión usuario 2...');
  const email2 = `user2_${uniqueSuffix}@example.com`;
  const cred2 = await signUpOrSignIn(email2, 'password123');
  const alienOwnerUid = cred2.user.uid;
  
  console.log('Creando hogar 2 (Alien)...');
  const hh2 = await createHouseholdAndUser(dc, {
    email: email2,
    displayName: 'User 2'
  });
  const alienHouseholdId = hh2.data.household_insert.id;

  // ==== VOLVEMOS AL USUARIO 1 ====
  await signInWithEmailAndPassword(auth, email1, 'password123');
  
  console.log('\n--- CASO 1: Gasto de 100.01 dividido 50/50 ---');
  try {
    const res1 = await createSharedExpenseWithProration(dc, {
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
    console.log('✅ Éxito! Gasto creado con id:', res1.data.journal_insert.id);
    const balanceRes = await getJournalBalanceV2(dc, { journalId: res1.data.journal_insert.id });
    const diff = balanceRes.data.journalBalanceV2s[0]?.diff;
    if (Math.abs(diff) > 0.005) {
      console.error(`❌ Falló! El balance del journal no cuadra. diff: ${diff}`);
      hasErrors = true;
    } else {
      console.log(`✅ Balance cuadrado. diff: ${diff}`);
    }
  } catch (e) {
    console.error('❌ Falló:', e.message);
    hasErrors = true;
  }

  console.log('\n--- CASO 2: householdId ajeno que debe fallar ---');
  try {
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
    console.error('❌ Falló! El sistema permitió usar un householdId ajeno.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 3: Monto negativo que debe fallar ---');
  try {
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
    console.error('❌ Falló! El sistema permitió montos negativos.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 4: Reparto que no suma el total que debe fallar ---');
  try {
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
    console.error('❌ Falló! El sistema permitió un reparto incorrecto.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 5: Borrar un Journal de otro hogar ---');
  try {
    // Primero crea uno en su propio household
    const res = await createSharedExpenseWithProration(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'To Delete',
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
    
    // Cambiar a usuario Alien
    await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123');

    // Intentar borrarlo usando el propio alienHouseholdId
    await deleteJournal(dc, {
      journalId: res.data.journal_insert.id,
      householdId: alienHouseholdId 
    });
    console.error('❌ Falló! El sistema permitió al alienígena borrar el journal.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  // Volvemos al Usuario 1
  await signInWithEmailAndPassword(auth, email1, 'password123');

  console.log('\n--- CASO 6: CreateJournalWithEntries con monto negativo (debe fallar) ---');
  try {
    await createJournalWithEntries(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Negativo',
      amount: -100,
      debitAccountId: payerAccountId,
      creditAccountId: payerAccountId, // For simplicity
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
    console.error('❌ Falló! El sistema permitió CreateJournalWithEntries con monto negativo.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 7: UpdateJournalWithEntries con monto negativo (debe fallar) ---');
  try {
    const resCreate = await createJournalWithEntries(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Positivo',
      amount: 100,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId, // Different accounts
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
    
    await updateJournalWithEntries(dc, {
      journalId: resCreate.data.journal_insert.id,
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Actualizado a Negativo',
      amount: -50,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId,
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
    console.error('❌ Falló! El sistema permitió UpdateJournalWithEntries con monto negativo.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 8: UpdateJournalWithEntries en otro hogar (debe fallar) ---');
  try {
    const resCreate = await createJournalWithEntries(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Ingreso Positivo Propio',
      amount: 100,
      debitAccountId: payerAccountId,
      creditAccountId: user1ExpenseId, // Different accounts
      prorataFactor: 0.5,
      ownerUid,
      isShared: false
    });
    
    // Cambiar a usuario Alien
    await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123');
    
    await updateJournalWithEntries(dc, {
      journalId: resCreate.data.journal_insert.id,
      householdId: alienHouseholdId,
      date: new Date().toISOString(),
      description: 'Alien intentando editar',
      amount: 50,
      debitAccountId: payerAccountId, // this account is not in alien's HH
      creditAccountId: user1ExpenseId, // neither is this
      prorataFactor: 0.5,
      ownerUid: alienOwnerUid,
      isShared: false
    });
    console.error('❌ Falló! El sistema permitió UpdateJournalWithEntries en otro hogar.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  // Volvemos al Usuario 1
  await signInWithEmailAndPassword(auth, email1, 'password123');

  console.log('\n--- CASO 9: UpdateSharedExpenseWithProration con mal cuadre (debe fallar) ---');
  try {
    const resCreate = await createSharedExpenseWithProration(dc, {
      householdId,
      date: new Date().toISOString(),
      description: 'Gasto Compartido Update',
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
    
    await updateSharedExpenseWithProration(dc, {
      journalId: resCreate.data.journal_insert.id,
      householdId,
      date: new Date().toISOString(),
      description: 'Gasto Compartido Mal Update',
      totalAmount: 100,
      prorataFactor: 0.5,
      payerAccountId,
      user1ExpenseAccountId: user1ExpenseId,
      user2ExpenseAccountId: user2ExpenseId,
      user1Amount: 60, // bad match
      user2Amount: 50,
      ownerUid,
      isShared: true
    });
    console.error('❌ Falló! El sistema permitió UpdateSharedExpenseWithProration con reparto erróneo.');
    hasErrors = true;
  } catch(e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  console.log('\n--- CASO 10: Crear presupuesto exitoso ---');
  let categoryId = '';
  let budgetId = '';
  try {
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
    console.log('✅ Éxito! Presupuesto creado con id:', budgetId);
  } catch (e) {
    console.error('❌ Falló:', e.message);
    hasErrors = true;
  }

  console.log('\n--- CASO 11: Crear presupuesto para otro hogar (debe fallar) ---');
  try {
    await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123'); // alien
    await createBudget(dc, {
      householdId: householdId, // attempt to use alien's token on HH1
      categoryId,
      period: '2026-11-01',
      assignedAmount: 500,
      ownerType: 'SHARED'
    });
    console.error('❌ Falló! El sistema permitió crear presupuesto en hogar ajeno.');
    hasErrors = true;
  } catch (e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  await signInWithEmailAndPassword(auth, email1, 'password123');

  console.log('\n--- CASO 12: Actualizar presupuesto exitoso ---');
  try {
    await updateBudget(dc, {
      id: budgetId,
      householdId,
      assignedAmount: 1200
    });
    console.log('✅ Éxito! Presupuesto actualizado');
  } catch (e) {
    console.error('❌ Falló:', e.message);
    hasErrors = true;
  }

  console.log('\n--- CASO 13: Actualizar presupuesto por alien (debe fallar) ---');
  try {
    await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123'); // alien
    await updateBudget(dc, {
      id: budgetId,
      householdId: alienHouseholdId, // using their own HH, but target budget is in HH1
      assignedAmount: 1500
    });
    console.error('❌ Falló! Alien pudo actualizar un presupuesto ajeno.');
    hasErrors = true;
  } catch (e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }
  
  await signInWithEmailAndPassword(auth, email1, 'password123');

  console.log('\n--- CASO 14: Borrar presupuesto por alien (debe fallar) ---');
  try {
    await signInWithEmailAndPassword(auth, 'user2@example.com', 'password123'); // alien
    await deleteBudget(dc, {
      id: budgetId,
      householdId: alienHouseholdId // alien tries to delete with their HH id
    });
    console.error('❌ Falló! Alien pudo borrar un presupuesto ajeno.');
    hasErrors = true;
  } catch (e) {
    console.log('✅ Éxito! Rechazado correctamente. Motivo:', e.message);
  }

  await signInWithEmailAndPassword(auth, email1, 'password123');

  console.log('\n--- CASO 15: Borrar presupuesto exitoso ---');
  try {
    await deleteBudget(dc, {
      id: budgetId,
      householdId
    });
    console.log('✅ Éxito! Presupuesto borrado');
  } catch (e) {
    console.error('❌ Falló:', e.message);
    hasErrors = true;
  }

  if (hasErrors) {
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
