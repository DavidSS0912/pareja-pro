import { StateCreator } from 'zustand';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import { cardService } from '../../services/cardService';
import { assetService } from '../../services/assetService';
import { incomeService } from '../../services/incomeService';
import { goalService } from '../../services/goalService';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { contributionService } from '../../services/contributionService';

import { ExpenseSlice } from './expenseSlice';
import { BudgetSlice } from './budgetSlice';
import { CardSlice } from './cardSlice';
import { AssetSlice } from './assetSlice';
import { IncomeSlice } from './incomeSlice';
import { GoalSlice } from './goalSlice';
import { UserListSlice } from './userListSlice';
import { ProjectSlice } from './projectSlice';

export interface ListenerSlice {
  initListeners: (houseId: string) => () => void;
}

type CombinedSlices = ExpenseSlice & BudgetSlice & CardSlice & AssetSlice & IncomeSlice & GoalSlice & UserListSlice & ProjectSlice;

export const createListenerSlice: StateCreator<ListenerSlice & CombinedSlices, [], [], ListenerSlice> = (set, get) => ({
  initListeners: (houseId: string) => {
    const unsubExpenses = expenseService.subscribe(houseId, get().setExpenses);
    const unsubBudgets = budgetService.subscribe(houseId, get().setBudgets);
    const unsubCards = cardService.subscribe(houseId, get().setCards);
    const unsubAssets = assetService.subscribe(houseId, get().setAssets);
    const unsubIncomes = incomeService.subscribe(houseId, get().setIncomes);
    const unsubGoals = goalService.subscribe(houseId, get().setGoals);
    const unsubUsers = userService.subscribe(houseId, get().setUsers);
    const unsubProjects = projectService.subscribe(houseId, get().setProjects);
    const unsubContributions = contributionService.subscribe(houseId, get().setContributions);

    return () => {
      unsubExpenses();
      unsubBudgets();
      unsubCards();
      unsubAssets();
      unsubIncomes();
      unsubGoals();
      unsubUsers();
      unsubProjects();
      unsubContributions();
    };
  }
});
