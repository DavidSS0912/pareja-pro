import React from 'react';
import { Card } from './ui/Card';
import { Target } from 'lucide-react';
import { FormatCurrency } from '../utils';

export function SavingsGoals({ goals = [] }) {
  if (goals.length === 0) return null;

  return (
    <Card className="col-span-1 md:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg flex items-center gap-3 text-slate-900 tracking-tight">
          <div className="bg-[#E8F8F0] text-[#10B981] rounded-2xl p-2.5">
            <Target size={20} />
          </div>
          Metas de Ahorro Conjuntas
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const porcentaje = Math.min((goal.current / goal.target) * 100, 100) || 0;
          return (
            <div key={goal.id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#EEF0F4]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">{goal.name}</span>
                <span className="text-sm font-bold text-[#10B981] tabular-nums">{porcentaje.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500 mb-3 tabular-nums">
                <span>{FormatCurrency(goal.current)}</span>
                <span>Meta: {FormatCurrency(goal.target)}</span>
              </div>
              
              <div className="w-full bg-[#EEF2FF] rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${goal.color || 'bg-[#10B981]'}`}
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
