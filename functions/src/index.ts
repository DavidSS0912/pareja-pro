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

// Sincroniza el tipo de cambio USD/MXN desde la API de Banxico
// Serie: SF43718 (Tipo de Cambio FIX Oficial)
// Nota: en firebase.json se debería configurar este pubsub
export const syncBanxicoRate = functions.pubsub
  .topic('daily-exchange-rate')
  .onPublish(async () => {
    try {
      const token = process.env.BANXICO_TOKEN || 'DEMO_TOKEN';
      const serieId = 'SF43718';
      const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${serieId}/datos/oportuno`;
      
      const response = await fetch(url, {
        headers: { 'Bmx-Token': token }
      });
      
      if (!response.ok) {
        console.warn(`Banxico API responded with ${response.status}. Using fallback.`);
        // Fallback: registrar que se intentó pero sin datos reales
        await admin.firestore().collection('exchange_rate_logs').add({
          attempted: admin.firestore.FieldValue.serverTimestamp(),
          status: 'api_unavailable',
          currency: 'USD'
        });
        return;
      }
      
      const data = await response.json();
      const serie = data?.bmx?.series?.[0]?.datos?.[0];
      
      if (serie) {
        const rate = parseFloat(serie.dato);
        const dateStr = serie.fecha; // formato DD/MM/YYYY
        
        await admin.firestore().collection('exchange_rates').add({
          currency: 'USD',
          rate: rate,
          date: dateStr,
          source: 'BANXICO',
          syncedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Synced USD/MXN rate: ${rate} for ${dateStr}`);
      }
    } catch (error) {
      console.error('Error syncing Banxico rate:', error);
    }
  });
