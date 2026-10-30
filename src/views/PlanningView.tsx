import React, { useState } from 'react';
import { PieChart, Target } from 'lucide-react';
import { BudgetsView } from './BudgetsView';
import { ProjectsView } from './ProjectsView';

export interface PlanningViewProps {
  data?: any;
  calc?: any;
  methods?: any;
  appContext?: any;
  defaultSubTab?: 'budgets' | 'projects';
}

export function PlanningView({
  data = {},
  calc = {},
  methods = {},
  appContext = 'household',
  defaultSubTab = 'budgets'
}: PlanningViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'projects'>(defaultSubTab);

  return (
    <div className="space-y-6">
      {/* Selector segmentado superior */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm flex items-center w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('budgets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeSubTab === 'budgets'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PieChart size={17} />
            <span>Presupuestos del Mes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('projects')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeSubTab === 'projects'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Target size={17} />
            <span>Proyectos y Metas</span>
          </button>
        </div>
      </div>

      {/* Contenido de la vista activa */}
      {activeSubTab === 'budgets' ? (
        <BudgetsView data={data} methods={methods} appContext={appContext} />
      ) : (
        <ProjectsView data={data} calc={calc} methods={methods} />
      )}
    </div>
  );
}
