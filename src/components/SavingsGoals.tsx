import React from 'react';
import { Card } from './ui/Card';
import { Target } from 'lucide-react';
import { FormatCurrency } from '../utils';

export function SavingsGoals({ goals = [] }) {
  if (goals.length === 0) return null;

  return (
    <Card className="col-span-1 md:col-span-2 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl flex items-center gap-3 text-indigo-600 tracking-tight">
          <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
            <Target size={20} />
          </div>
          Metas de Ahorro Conjuntas
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const porcentaje = Math.min((goal.current / goal.target) * 100, 100) || 0;
          return (
            <div key={goal.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800">{goal.name}</span>
                <span className="text-sm font-black text-indigo-600">{porcentaje.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span>{FormatCurrency(goal.current)}</span>
                <span>Meta: {FormatCurrency(goal.target)}</span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${goal.color || 'bg-indigo-500'}`}
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
