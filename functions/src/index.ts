import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const rolloverBudgets = functions.pubsub
  .topic('monthly-rollover')
  .onPublish(async (message) => {
    const db = admin.firestore(); // placeholder - se migrará a Data Connect admin SDK
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    console.log(`Ejecutando rollover para periodo: ${lastMonth.toISOString().slice(0, 7)}`);
    
    // TODO: implementar con Data Connect Admin SDK en Fase posterior
    // Por ahora, registra el evento de cierre de periodo
    await db.collection('rollover_logs').add({
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
      period: lastMonth.toISOString().slice(0, 7),
      status: 'scheduled'
    });
    
    console.log('Rollover scheduled successfully');
  });
