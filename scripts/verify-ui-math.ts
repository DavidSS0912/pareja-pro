import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { createHouseholdAndUser, createSharedExpenseWithProration, deleteJournal, connectorConfig, getJournalBalanceV2, createJournalWithEntries, updateJournalWithEntries, getHouseholdAccounts, getHouseholdNetBalances } from '../src/lib/dataconnect/esm/index.esm.js';

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

const isDebitNature = (t) => t === 'ASSET' || t === 'EXPENSE';
const signed = (e) => (e.entryType === 'DEBIT') === isDebitNature(e.account.type) ? +e.amount : -e.amount;

async function getLocalBankBalance(householdId, bankAccountId) {
  const balances = await getHouseholdNetBalances(dc, { householdId });
  let balance = 0;
  if (balances.data && balances.data.entries) {
    console.log('Entries fetched for bank balance:', JSON.stringify(balances.data.entries, null, 2));
    balances.data.entries.forEach(e => {
      if (e.account.id === bankAccountId) {
        balance += signed(e);
      }
    });
  } else {
    console.log('No entries fetched or data is null');
  }
  return balance;
}

const uniqueSuffix = Date.now().toString();

async function run() {
  let hasErrors = false;
  console.log('--- Iniciando verificación de saldos en el Emulador ---');
  
  const email = `verify_${uniqueSuffix}@example.com`;
  const cred = await signUpOrSignIn(email, 'password123');
  const ownerUid = cred.user.uid;
  
  console.log('Creando hogar y usuario...');
  const hh = await createHouseholdAndUser(dc, {
    email: email,
    displayName: 'Verify User'
  });
  const householdId = hh.data.household_insert.id;
  const bankAccountId = hh.data.assetAccount.id; // Banco
  const expenseId = hh.data.expenseAccount.id; // Gasto
  const liabilityId = hh.data.liabilityAccount.id; // Tarjeta / Deuda
  
  // Setup inicial: arranca con 5000 en un banco
  console.log('\n--- Setup Inicial ---');
  await createJournalWithEntries(dc, {
    householdId,
    date: new Date().toISOString(),
    description: 'Saldo Inicial',
    amount: 5000,
    debitAccountId: bankAccountId,
    creditAccountId: expenseId, // We use expense just to balance, it's not income but it balances
    prorataFactor: 1,
    ownerUid,
    isShared: false
  });
  
  let balance = await getLocalBankBalance(householdId, bankAccountId);
  console.log(`Banco inicial esperado: 5000. Real: ${balance}`);

  // 1. Ingreso de 1000: banco en 6000.
  console.log('\n--- PASO 1: Ingreso de 1000 ---');
  await createJournalWithEntries(dc, {
    householdId,
    date: new Date().toISOString(),
    description: 'Ingreso',
    amount: 1000,
    debitAccountId: bankAccountId,
    creditAccountId: expenseId, // For simplicity
    prorataFactor: 1,
    ownerUid,
    isShared: false
  });
  balance = await getLocalBankBalance(householdId, bankAccountId);
  console.log(`Banco esperado: 6000. Real: ${balance}`);
  if (balance !== 6000) hasErrors = true;

  // 2. Gasto compartido de 100.01 pagado desde el banco: banco en 5899.99.
  console.log('\n--- PASO 2: Gasto compartido de 100.01 ---');
  const sharedExpenseRes = await createSharedExpenseWithProration(dc, {
    householdId,
    date: new Date().toISOString(),
    description: 'Gasto Compartido',
    totalAmount: 100.01,
    prorataFactor: 0.5,
    payerAccountId: bankAccountId,
    user1ExpenseAccountId: expenseId,
    user2ExpenseAccountId: expenseId,
    user1Amount: 50.01,
    user2Amount: 50.00,
    ownerUid,
    isShared: true
  });
  balance = await getLocalBankBalance(householdId, bankAccountId);
  console.log(`Banco esperado: 5899.99. Real: ${balance}`);
  if (Math.abs(balance - 5899.99) > 0.001) hasErrors = true;

  // 3. Compra de 200 con tarjeta: deuda de 200 (liability)
  console.log('\n--- PASO 3: Compra de 200 con tarjeta ---');
  await createJournalWithEntries(dc, {
    householdId,
    date: new Date().toISOString(),
    description: 'Compra tarjeta',
    amount: 200,
    debitAccountId: expenseId,
    creditAccountId: liabilityId, // Liability credit increases debt
    prorataFactor: 1,
    ownerUid,
    isShared: false
  });
  
  // Get debt balance
  const balances = await getHouseholdNetBalances(dc, { householdId });
  let debtBalance = 0;
  if (balances.data && balances.data.entries) {
    balances.data.entries.forEach(e => {
      if (e.account.id === liabilityId) debtBalance += signed(e);
    });
  }
  console.log(`Deuda esperada: 200 (positivo o negativo según vista). Real en lógica local: ${debtBalance}`);
  // In `signed` logic, LIABILITY + CREDIT = +200?
  // isDebitNature(LIABILITY) = false. entryType='CREDIT'. (false === false) => +200!
  if (Math.abs(debtBalance - 200) > 0.001) hasErrors = true;

  // 4. Pago de la tarjeta de 200 desde el banco: deuda en 0, banco en 5699.99.
  console.log('\n--- PASO 4: Pago de la tarjeta desde el banco ---');
  await createJournalWithEntries(dc, {
    householdId,
    date: new Date().toISOString(),
    description: 'Pago Tarjeta',
    amount: 200,
    debitAccountId: liabilityId, // Debit liability reduces debt
    creditAccountId: bankAccountId, // Credit asset reduces bank
    prorataFactor: 1,
    ownerUid,
    isShared: false
  });
  
  balance = await getLocalBankBalance(householdId, bankAccountId);
  console.log(`Banco esperado: 5699.99. Real: ${balance}`);
  if (Math.abs(balance - 5699.99) > 0.001) hasErrors = true;

  debtBalance = 0;
  const balancesAfterPay = await getHouseholdNetBalances(dc, { householdId });
  if (balancesAfterPay.data && balancesAfterPay.data.entries) {
    balancesAfterPay.data.entries.forEach(e => {
      if (e.account.id === liabilityId) debtBalance += signed(e);
    });
  }
  console.log(`Deuda esperada: 0. Real: ${debtBalance}`);
  if (Math.abs(debtBalance) > 0.001) hasErrors = true;

  // 5. Borrar el gasto compartido: banco sube 100.01.
  console.log('\n--- PASO 5: Borrar gasto compartido ---');
  await deleteJournal(dc, {
    journalId: sharedExpenseRes.data.journal_insert.id,
    householdId
  });
  balance = await getLocalBankBalance(householdId, bankAccountId);
  console.log(`Banco esperado: 5800.00 (5699.99 + 100.01). Real: ${balance}`);
  if (Math.abs(balance - 5800.00) > 0.001) hasErrors = true;

  if (hasErrors) {
    console.error('\n⚠️ Hubo errores en la verificación local.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todas las verificaciones locales pasaron exitosamente.');
    process.exit(0);
  }
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
