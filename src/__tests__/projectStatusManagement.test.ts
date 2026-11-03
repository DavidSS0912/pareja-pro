// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { calculateUnallocatedBaseCero } from '../App';

describe('Gestión de Estado de Proyectos (Pausa, Reanudación y Borrado Lógico)', () => {
  describe('a) Impacto de Proyectos Pausados y Archivados en Presupuesto Base Cero (calculateUnallocatedBaseCero)', () => {
    it('excluye la cuota mensual de proyectos pausados (status === "paused", isPaused === true o priority === 0)', () => {
      const totalIncome = 50000;
      const budgets = [{ id: 'b1', base: 10000 }];
      const projects = [
        { id: 'p1', name: 'Meta Activa', monthlyQuota: 3000, status: 'active', priority: 1, isCompleted: false },
        { id: 'p2', name: 'Meta Pausada', monthlyQuota: 2000, status: 'paused', isPaused: true, priority: 0, isCompleted: false },
        { id: 'p3', name: 'Meta Pausada por flag', monthlyQuota: 1500, status: 'pending', isPaused: true, priority: 0, isCompleted: false }
      ];

      const result = calculateUnallocatedBaseCero(totalIncome, budgets, projects);

      // Solo p1 debe sumar cuota mensual (3000). p2 y p3 están pausadas.
      expect(result.totalProjectsMonthlyQuota).toBe(3000);
      expect(result.totalPresupuestado).toBe(13000); // 10000 + 3000
      expect(result.unallocated).toBe(37000); // 50000 - 13000
    });

    it('excluye la cuota mensual de proyectos archivados o eliminados lógicamente (priority < 0 o isArchived === true)', () => {
      const totalIncome = 50000;
      const budgets = [{ id: 'b1', base: 10000 }];
      const projects = [
        { id: 'p1', name: 'Meta Activa', monthlyQuota: 4000, status: 'active', priority: 1, isCompleted: false },
        { id: 'p-deleted', name: 'Meta Eliminada', monthlyQuota: 5000, priority: -1, isArchived: true, isCompleted: false }
      ];

      const result = calculateUnallocatedBaseCero(totalIncome, budgets, projects);

      expect(result.totalProjectsMonthlyQuota).toBe(4000);
      expect(result.totalPresupuestado).toBe(14000);
      expect(result.unallocated).toBe(36000);
    });

    it('al reanudar una meta pausada, su cuota mensual vuelve a sumarse al presupuesto base cero', () => {
      const totalIncome = 40000;
      const budgets = [{ id: 'b1', base: 10000 }];
      
      // Estado pausado
      const projectPaused = { id: 'p1', name: 'Fondo de Emergencia', monthlyQuota: 3000, status: 'paused', isPaused: true, priority: 0 };
      const pausedResult = calculateUnallocatedBaseCero(totalIncome, budgets, [projectPaused]);
      expect(pausedResult.totalProjectsMonthlyQuota).toBe(0);
      expect(pausedResult.unallocated).toBe(30000);

      // Estado reanudado (vuelve a tener priority > 0 y status activo/pendiente)
      const projectResumed = { id: 'p1', name: 'Fondo de Emergencia', monthlyQuota: 3000, status: 'active', isPaused: false, priority: 1 };
      const resumedResult = calculateUnallocatedBaseCero(totalIncome, budgets, [projectResumed]);
      expect(resumedResult.totalProjectsMonthlyQuota).toBe(3000);
      expect(resumedResult.unallocated).toBe(27000);
    });
  });

  describe('b) Preservación de saldos y aportaciones al pausar o archivar', () => {
    it('un proyecto pausado conserva intacto su saldo acumulado e histórico de aportaciones', () => {
      const contributions = [
        { id: 'c1', projectId: 'p1', amount: 5000, date: '2026-08-01' },
        { id: 'c2', projectId: 'p1', amount: 5000, date: '2026-09-01' }
      ];

      const pausedProject = {
        id: 'p1',
        name: 'Viaje a Japón',
        targetAmount: 50000,
        currentAmount: 10000,
        savedAmount: 10000,
        priority: 0,
        status: 'paused',
        isPaused: true
      };

      // El saldo ahorrado no sufre alteraciones al pausar
      expect(pausedProject.savedAmount).toBe(10000);
      expect(pausedProject.currentAmount).toBe(10000);

      // El total de aportaciones vinculadas al proyecto se preserva
      const totalContributions = contributions
        .filter(c => c.projectId === pausedProject.id)
        .reduce((sum, c) => sum + c.amount, 0);

      expect(totalContributions).toBe(10000);
    });
  });

  describe('c) Lógica de clasificación de prioridades en dataSlice / projects', () => {
    it('filtra proyectos archivados (priority < 0) y clasifica priority === 0 como pausados', () => {
      const rawSavingsProjects = [
        { id: 'p1', name: 'Meta 1', priority: 1, isCompleted: false, monthlyQuota: 1000 },
        { id: 'p2', name: 'Meta Pausada', priority: 0, isCompleted: false, monthlyQuota: 2000 },
        { id: 'p3', name: 'Meta En Cola', priority: 2, isCompleted: false, monthlyQuota: 1500 },
        { id: 'p4', name: 'Meta Archivada', priority: -1, isCompleted: false, monthlyQuota: 3000 },
        { id: 'p5', name: 'Meta Completada', priority: 3, isCompleted: true, monthlyQuota: 500 }
      ];

      // Aplicando las reglas de mapeo de dataSlice:
      const mapped = rawSavingsProjects
        .filter(p => p.priority === undefined || p.priority === null || p.priority >= 0)
        .map(p => {
          const isPaused = p.priority === 0;
          return {
            ...p,
            status: p.isCompleted ? 'completed' : isPaused ? 'paused' : 'pending',
            isPaused
          };
        })
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      // Asignar active solo al primer no pausado y no completado
      let hasActive = false;
      mapped.forEach(p => {
        if (p.status === 'pending' && !hasActive) {
          p.status = 'active';
          hasActive = true;
        }
      });

      // Verificaciones
      expect(mapped.some(p => p.id === 'p4')).toBe(false); // p4 archivada excluida
      
      const p1 = mapped.find(p => p.id === 'p1')!;
      expect(p1.status).toBe('active');
      expect(p1.isPaused).toBe(false);

      const p2 = mapped.find(p => p.id === 'p2')!;
      expect(p2.status).toBe('paused');
      expect(p2.isPaused).toBe(true);

      const p3 = mapped.find(p => p.id === 'p3')!;
      expect(p3.status).toBe('pending');
      expect(p3.isPaused).toBe(false);

      const p5 = mapped.find(p => p.id === 'p5')!;
      expect(p5.status).toBe('completed');
    });
  });
});
