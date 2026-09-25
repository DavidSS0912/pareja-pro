import React, { useState, useMemo } from 'react';
import { Target, Plus, ArrowUp, ArrowDown, History, Info, Calendar } from 'lucide-react';

export const ProjectsView = ({ data, methods }: any) => {
  const { projects = [], contributions = [], incomes = [], users = [] } = data;
  const [showForm, setShowForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);

  // Form states for new project
  const [newProject, setNewProject] = useState({
    name: '', targetAmount: 0, monthlyQuota: 0, targetAccount: '', priority: projects.length + 1
  });

  // Form state for new contribution
  const [newContribution, setNewContribution] = useState({ amount: 0, notes: '', date: new Date().toISOString().split('T')[0] });

  // Calculate incomes per user for the current month/period to get proportional quota
  const incomePerUser = useMemo(() => {
    const totals: Record<string, number> = {};
    users.forEach((u: any) => totals[u.id] = 0);
    incomes.forEach((inc: any) => {
      if (totals[inc.userId] !== undefined) {
        totals[inc.userId] += Number(inc.amount);
      }
    });
    return totals;
  }, [incomes, users]);

  const totalHouseholdIncome = Object.values(incomePerUser).reduce((acc, curr) => acc + curr, 0);

  // Sorting and active project
  const sortedProjects = [...projects].sort((a, b) => a.priority - b.priority);
  const activeProject = sortedProjects.find(p => p.status === 'active');
  const pendingProjects = sortedProjects.filter(p => p.status === 'pending' || (p.status === 'active' && p.id !== activeProject?.id));
  const completedProjects = sortedProjects.filter(p => p.status === 'completed');

  const getEstimatedDate = (project: any) => {
    if (!project.monthlyQuota || project.monthlyQuota <= 0) return 'N/A';
    const remaining = Math.max(0, project.targetAmount - project.savedAmount);
    const months = Math.ceil(remaining / project.monthlyQuota);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || newProject.targetAmount <= 0) return;
    
    await methods.addProject({
      ...newProject,
      savedAmount: 0,
      status: projects.length === 0 ? 'active' : 'pending',
      startDate: new Date().toISOString()
    });
    setShowForm(false);
    setNewProject({ name: '', targetAmount: 0, monthlyQuota: 0, targetAccount: '', priority: projects.length + 1 });
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || newContribution.amount <= 0) return;
    if (!data.user) return;

    await methods.addContribution({
      projectId: activeProject.id,
      userId: data.user.uid,
      amount: Number(newContribution.amount),
      date: newContribution.date,
      notes: newContribution.notes
    });

    await methods.updateProject(activeProject.id, {
      savedAmount: activeProject.savedAmount + Number(newContribution.amount)
    });

    setShowContributionForm(false);
    setNewContribution({ amount: 0, notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const changePriority = async (project: any, direction: 'up' | 'down') => {
    const currentIndex = sortedProjects.findIndex(p => p.id === project.id);
    if (direction === 'up' && currentIndex > 0) {
      const other = sortedProjects[currentIndex - 1];
      await methods.updateProject(project.id, { priority: other.priority });
      await methods.updateProject(other.id, { priority: project.priority });
    } else if (direction === 'down' && currentIndex < sortedProjects.length - 1) {
      const other = sortedProjects[currentIndex + 1];
      await methods.updateProject(project.id, { priority: other.priority });
      await methods.updateProject(other.id, { priority: project.priority });
    }
  };

  const completeProject = async (project: any) => {
    await methods.updateProject(project.id, { status: 'completed' });
  };

  const activateProject = async (project: any) => {
    if (activeProject) {
      await methods.updateProject(activeProject.id, { status: 'pending' });
    }
    await methods.updateProject(project.id, { status: 'active' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-[#E5E5E5]">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-title flex items-center gap-2">
            <Target className="text-indigo-600" /> Metas y Proyectos
          </h2>
          <p className="text-slate-500 text-sm mt-1">Conquista un objetivo a la vez (Efecto Cascada)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} /> Nuevo
        </button>
      </div>

      {activeProject ? (
        <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
            <div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">PROYECTO ACTIVO</span>
              <h3 className="text-3xl font-bold text-slate-900">{activeProject.name}</h3>
              <p className="text-slate-500 mt-1 flex items-center gap-1"><Calendar size={14} /> Meta estimada: <span className="font-semibold text-slate-700">{getEstimatedDate(activeProject)}</span></p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Progreso</p>
              <p className="text-2xl font-bold text-slate-900">
                ${activeProject.savedAmount.toLocaleString()} <span className="text-slate-400 text-lg font-medium">/ ${activeProject.targetAmount.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-1 font-bold">
              <span className="text-indigo-600">{Math.round((activeProject.savedAmount / activeProject.targetAmount) * 100)}%</span>
              <span className="text-slate-500">Restan ${(activeProject.targetAmount - activeProject.savedAmount).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
              <div 
                className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(100, (activeProject.savedAmount / activeProject.targetAmount) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-[#E5E5E5] rounded-xl p-4 mb-6">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Info size={16} className="text-slate-400" /> Aportación Sugerida del Mes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.map((u: any) => {
                const userIncome = incomePerUser[u.id] || 0;
                const percentage = totalHouseholdIncome > 0 ? userIncome / totalHouseholdIncome : (1 / users.length);
                const suggestedAmount = activeProject.monthlyQuota * percentage;
                return (
                  <div key={u.id} className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${u.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold text-xs`}>
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{(percentage * 100).toFixed(0)}% del ingreso</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">${suggestedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">Calculado en base a ingresos registrados este mes. Meta mensual: <span className="font-bold text-slate-700">${Number(activeProject.monthlyQuota).toLocaleString()}</span></p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowContributionForm(true)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
              <Plus size={18} /> Registrar Aportación
            </button>
            <button onClick={() => completeProject(activeProject)} className="px-4 py-3 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg transition-colors border border-[#E5E5E5] hover:border-emerald-200">
              Marcar Terminado
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Target className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sin proyecto activo</h3>
          <p className="text-slate-500 mb-6">Crea tu primer proyecto financiero o activa uno de la lista.</p>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold mx-auto">Crear Proyecto</button>
        </div>
      )}

      {/* Lists Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Projects */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h3 className="font-bold text-slate-900 mb-4 font-title flex items-center gap-2"><Target size={18} className="text-slate-400"/> Próximos (Cascada)</h3>
          {pendingProjects.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No hay proyectos en cola.</p>
          ) : (
            <div className="space-y-3">
              {pendingProjects.map((p, index) => (
                <div key={p.id} className="flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg hover:border-indigo-200 transition-colors bg-slate-50 group">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-1">${p.savedAmount.toLocaleString()} / ${p.targetAmount.toLocaleString()} • Cuota: ${Number(p.monthlyQuota).toLocaleString()}/mes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => changePriority(p, 'up')} disabled={index === 0 && !activeProject} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                      <button onClick={() => changePriority(p, 'down')} disabled={index === pendingProjects.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                    </div>
                    <button onClick={() => activateProject(p)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors">
                      Activar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contributions History */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h3 className="font-bold text-slate-900 mb-4 font-title flex items-center gap-2"><History size={18} className="text-slate-400"/> Trazabilidad (Activo)</h3>
          {(!activeProject || contributions.filter((c:any) => c.projectId === activeProject.id).length === 0) ? (
            <p className="text-sm text-slate-500 text-center py-4">Sin aportaciones recientes.</p>
          ) : (
            <div className="space-y-3">
              {contributions.filter((c:any) => c.projectId === activeProject.id).sort((a:any,b:any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((c:any) => {
                const user = users.find((u:any) => u.id === c.userId);
                return (
                  <div key={c.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${user?.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold text-xs`}>
                        {user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.notes || 'Aportación'}</p>
                        <p className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+ ${c.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {completedProjects.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-slate-400 mb-4 font-title text-sm uppercase tracking-wider">Proyectos Completados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {completedProjects.map(p => (
              <div key={p.id} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 opacity-70">
                <p className="font-bold text-emerald-900 text-sm">{p.name}</p>
                <p className="text-xs text-emerald-700 mt-1">${p.targetAmount.toLocaleString()} logrados</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold font-title mb-4">Nuevo Proyecto</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Proyecto</label>
                <input type="text" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Vacaciones Europa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Monto Meta ($)</label>
                  <input type="number" required min="1" value={newProject.targetAmount || ''} onChange={e => setNewProject({...newProject, targetAmount: Number(e.target.value)})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="100000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cuota Mensual ($)</label>
                  <input type="number" required min="1" value={newProject.monthlyQuota || ''} onChange={e => setNewProject({...newProject, monthlyQuota: Number(e.target.value)})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Cuenta Destino</label>
                <input type="text" value={newProject.targetAccount} onChange={e => setNewProject({...newProject, targetAccount: e.target.value})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej. Cuenta Nu (Fondo Ahorro)" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContributionForm && activeProject && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold font-title mb-4">Registrar Aportación</h3>
            <p className="text-sm text-slate-500 mb-4">Aportando al proyecto <strong>{activeProject.name}</strong></p>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monto ($)</label>
                <input type="number" required min="1" max={activeProject.targetAmount - activeProject.savedAmount} value={newContribution.amount || ''} onChange={e => setNewContribution({...newContribution, amount: Number(e.target.value)})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 text-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
                <input type="date" required value={newContribution.date} onChange={e => setNewContribution({...newContribution, date: e.target.value})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Notas (Opcional)</label>
                <input type="text" value={newContribution.notes} onChange={e => setNewContribution({...newContribution, notes: e.target.value})} className="w-full border border-[#E5E5E5] rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Bono de fin de año" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowContributionForm(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors">Aportar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
