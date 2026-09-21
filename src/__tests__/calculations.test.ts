import { describe, it, expect } from 'vitest';

describe('Financial Calculations', () => {
  it('calculates settlement correctly', () => {
    const expenses = [
      { amount: 100, split: 50, paidBy: 'u1' },
      { amount: 50, split: 50, paidBy: 'u2' }
    ];

    let u1OwesU2 = 0;
    let u2OwesU1 = 0;
    expenses.forEach(exp => {
      if (exp.split === 50) {
        if (exp.paidBy === 'u1') u2OwesU1 += exp.amount / 2;
        if (exp.paidBy === 'u2') u1OwesU2 += exp.amount / 2;
      }
    });
    
    const netSettlement = u2OwesU1 - u1OwesU2;
    expect(netSettlement).toBe(25); // (100/2) - (50/2) = 50 - 25 = 25
  });

  it('calculates total budget correctly', () => {
    const budgets = [
      { base: 500, type: 'Necesidad' },
      { base: 200, type: 'Deseo' }
    ];

    const totalBudget = budgets.reduce((acc, curr) => acc + curr.base, 0);
    expect(totalBudget).toBe(700);
  });
});
