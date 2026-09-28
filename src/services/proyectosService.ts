export interface SavingsProjectData {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: number;
  isCompleted: boolean;
}

// Verifica si un proyecto alcanzó su meta
export function proyectoAlcanzadoMeta(project: SavingsProjectData): boolean {
  return project.currentAmount >= project.targetAmount;
}

// Lógica de cascada: dado un flujo de caja excedente, distribuye a proyectos en orden de prioridad
export function distribuirEnCascada(
  projects: SavingsProjectData[],
  excedente: number
): Array<{ projectId: string; aporte: number }> {
  const sorted = [...projects]
    .filter(p => !p.isCompleted)
    .sort((a, b) => a.priority - b.priority);

  const aportes: Array<{ projectId: string; aporte: number }> = [];
  let remaining = excedente;

  for (const project of sorted) {
    if (remaining <= 0) break;
    const needed = project.targetAmount - project.currentAmount;
    const aporte = Math.min(remaining, needed);
    aportes.push({ projectId: project.id, aporte: parseFloat(aporte.toFixed(2)) });
    remaining -= aporte;
  }

  return aportes;
}
