export const SEED_DATA = {
  users: [
    { id: 'u1', name: 'David', avatar: 'bg-blue-500' },
    { id: 'u2', name: 'Zoé', avatar: 'bg-purple-500' }
  ],
  incomes: [
    { id: 'i1', userId: 'u1', amount: 35000, type: 'Sueldo', date: '2024-06-01' },
    { id: 'i2', userId: 'u2', amount: 32000, type: 'Sueldo', date: '2024-06-02' },
    { id: 'i3', userId: 'u1', amount: 5000, type: 'Bono', date: '2024-06-15' }
  ],
  cards: [
    { id: 'c1', name: 'BBVA Oro', ownerId: 'u1', shared: false, limit: 50000, cutDay: 5, payDay: 25, balance: 12000, noInterestPay: 8500, interestRate: 45, color: 'bg-gradient-to-br from-blue-700 to-blue-900' },
    { id: 'c2', name: 'Banamex Costco', ownerId: 'u1', shared: true, limit: 80000, cutDay: 15, payDay: 5, balance: 18500, noInterestPay: 18500, interestRate: 62, color: 'bg-gradient-to-br from-red-600 to-red-800' },
    { id: 'c3', name: 'Nu Clásica', ownerId: 'u2', shared: false, limit: 30000, cutDay: 10, payDay: 30, balance: 4000, noInterestPay: 4000, interestRate: 68, color: 'bg-gradient-to-br from-purple-600 to-purple-900' }
  ],
  budgets: [
    { id: 'b1', category: 'Supermercado', type: 'Necesidad', shared: true, base: 8000, rollover: 500, spent: 4200, icon: '🛒' },
    { id: 'b2', category: 'Servicios Básicos', type: 'Necesidad', shared: true, base: 2500, rollover: -300, spent: 1800, icon: '⚡' },
    { id: 'b3', category: 'Renta', type: 'Necesidad', shared: true, base: 12000, rollover: 0, spent: 12000, icon: '🏠' },
    { id: 'b4', category: 'Salidas y Cenas', type: 'Deseo', shared: true, base: 4000, rollover: 1000, spent: 3500, icon: '🍷' },
    { id: 'b5', category: 'Fondo Emergencia', type: 'Ahorro', shared: true, base: 5000, rollover: 45000, spent: 0, icon: '🛡️' }
  ],
  expenses: [
    { id: 'e1', desc: 'Walmart Quincena', amount: 4200, paidBy: 'u1', split: 50, date: '2024-06-05' },
    { id: 'e2', desc: 'Recibo CFE', amount: 1200, paidBy: 'u2', split: 50, date: '2024-06-12' },
    { id: 'e3', desc: 'Internet Telmex', amount: 600, paidBy: 'u2', split: 50, date: '2024-06-15' },
    { id: 'e4', desc: 'Renta Junio', amount: 12000, paidBy: 'u1', split: 50, date: '2024-06-01' },
    { id: 'e5', desc: 'Cena Aniversario', amount: 3500, paidBy: 'u1', split: 100, date: '2024-05-20' }
  ],
  assets: [
    { id: 'a1', name: 'Cetes Directo', owner: 'Ambos', value: 45000, type: 'Inversión Segura' },
    { id: 'a2', name: 'Cuenta Nu', owner: 'Zoé', value: 12000, type: 'Liquidez' },
    { id: 'a3', name: 'Cripto BTC', owner: 'David', value: 8500, type: 'Alto Riesgo' },
    { id: 'a4', name: 'Auto Jetta', owner: 'David', value: 180000, type: 'Bien Depreciable' }
  ],
  snapshots: [
    { month: 'Ene', income: 67000, expense: 58000 },
    { month: 'Feb', income: 67000, expense: 55000 },
    { month: 'Mar', income: 72000, expense: 60000 },
    { month: 'Abr', income: 67000, expense: 68000 },
    { month: 'May', income: 67000, expense: 52000 },
    { month: 'Jun', income: 72000, expense: 45000 }
  ],
  goals: [
    { id: 'g1', name: 'Viaje a Japón', target: 50000, current: 15000, color: 'bg-emerald-500' },
    { id: 'g2', name: 'Enganche Casa', target: 200000, current: 45000, color: 'bg-indigo-500' }
  ]
};
