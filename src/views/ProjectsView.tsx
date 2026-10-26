import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  ArrowUp,
  ArrowDown,
  History,
  Info,
  Calendar,
  Edit2,
  CheckCircle2,
  Circle,
  Flag,
  ChevronLeft,
  Wallet,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight,
  ArrowDownUp,
  CheckCircle,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormatCurrency } from '../utils';
import { distribuirEnCascada, SavingsProjectData } from '../services/proyectosService';
import { ProjectForm, ProjectFormData } from '../components/forms/ProjectForm';
import { ProjectContributionModal } from '../components/forms/ProjectContributionModal';
import { ProjectContributionPlan } from '../utils/projectCalculations';

export interface ProjectsViewProps {
  data?: any;
  calc?: any;
  methods?: any;
}

export function ProjectsView({ data = {}, methods = {} }: ProjectsViewProps) {
  const {
    projects = [],
    contributions = [],
    incomes = [],
    users = [],
    accounts = []
  } = data;

  // Nivel de navegación: null = Nivel 1 (Dashboard), string = Nivel 2 (Detalle del Proyecto)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Estados de modales
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionProject, setContributionProject] = useState<any | null>(null);

  const [showCascadeModal, setShowCascadeModal] = useState(false);
  const [excedente, setExcedente] = useState<number>(0);

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', amountThreshold: '', dateThreshold: '' });

  // Cálculo de ingresos mensuales por integrante del hogar
  const incomePerUser = useMemo(() => {
    const totals: Record<string, number> = {};
    (users || []).forEach((u: any) => {
      totals[u.id] = 0;
    });
    (incomes || []).forEach((inc: any) => {
      const uId = inc.userId || inc.ownerUid;
      if (uId && totals[uId] !== undefined) {
        totals[uId] += Number(inc.amount) || 0;
      }
    });
    return totals;
  }, [incomes, users]);

  const totalHouseholdIncome = useMemo(() => {
    return Object.values(incomePerUser).reduce((acc, curr) => acc + curr, 0);
  }, [incomePerUser]);

  // Clasificación y orden de proyectos
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [projects]);

  const activeProject = useMemo(() => {
    return sortedProjects.find((p) => p.status === 'active') || sortedProjects[0] || null;
  }, [sortedProjects]);

  const pendingProjects = useMemo(() => {
    return sortedProjects.filter(
      (p) => p.status === 'pending' || (p.status === 'active' && p.id !== activeProject?.id)
    );
  }, [sortedProjects, activeProject]);

  const completedProjects = useMemo(() => {
    return sortedProjects.filter((p) => p.status === 'completed');
  }, [sortedProjects]);

  // Métricas globales para el Nivel 1
  const totalSavedAllProjects = useMemo(() => {
    return projects.reduce((sum: number, p: any) => sum + (Number(p.savedAmount ?? p.currentAmount ?? 0)), 0);
  }, [projects]);

  const totalTargetAllProjects = useMemo(() => {
    return projects.reduce((sum: number, p: any) => sum + (Number(p.targetAmount || 0)), 0);
  }, [projects]);

  // Proyecto actualmente visualizado en Nivel 2
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p: any) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Estimación de fecha meta
  const getEstimatedDate = (project: any) => {
    if (!project || !project.monthlyQuota || project.monthlyQuota <= 0) return 'Por definir';
    const currentSaved = Number(project.savedAmount ?? project.currentAmount ?? 0);
    const remaining = Math.max(0, Number(project.targetAmount || 0) - currentSaved);
    if (remaining === 0) return '¡Completada!';
    const months = Math.ceil(remaining / project.monthlyQuota);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  // Helper para nombre de cuenta vinculada
  const getAccountDisplayName = (accountRef: string | undefined) => {
    if (!accountRef) return 'Sin cuenta asignada';
    const acc = accounts.find((a: any) => a.id === accountRef || a.name === accountRef);
    return acc ? acc.name : accountRef;
  };

  // Apertura y guardado de proyectos
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const closeProjectForm = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (formData: ProjectFormData) => {
    if (editingProject) {
      if (methods?.updateProject) {
        await methods.updateProject(editingProject.id, {
          name: formData.name,
          targetAmount: formData.targetAmount,
          monthlyQuota: formData.monthlyQuota,
          targetAccountId: formData.targetAccountId,
          targetAccount: formData.targetAccount,
          priority: formData.priority
        });
      }
    } else {
      if (methods?.addProject) {
        await methods.addProject({
          name: formData.name,
          targetAmount: formData.targetAmount,
          monthlyQuota: formData.monthlyQuota,
          targetAccountId: formData.targetAccountId,
          targetAccount: formData.targetAccount,
          priority: formData.priority || projects.length + 1,
          savedAmount: 0,
          currentAmount: 0,
          status: projects.length === 0 ? 'active' : 'pending',
          startDate: new Date().toISOString(),
          milestones: []
        });
      }
    }
    closeProjectForm();
  };

  // Ejecución de aportaciones (Flujo contable de Tarea 4.1)
  const handleOpenContribution = (project: any) => {
    setContributionProject(project);
    setShowContributionModal(true);
  };

  const handleExecuteContribution = async (plan: ProjectContributionPlan) => {
    if (!plan || !plan.isValid) return;

    // 1. Si requiere transferencia contable interna (Origen != Destino)
    if (plan.plannedTransfer && methods?.createJournalWithEntries) {
      try {
        await methods.createJournalWithEntries({
          householdId: data?.houseId || (methods as any)?.houseId,
          date: new Date(plan.plannedTransfer.date).toISOString(),
          description: plan.plannedTransfer.description,
          amount: plan.plannedTransfer.amount,
          debitAccountId: plan.plannedTransfer.targetAccountId,
          creditAccountId: plan.plannedTransfer.sourceAccountId,
          isInternalTransfer: true
        });
      } catch (err) {
        console.warn('Registro de transferencia interna no disponible o diferido:', err);
      }
    }

    // 2. Incrementar el saldo ahorrado del proyecto y registrar aportación
    const projId = plan.contributionRecord?.projectId;
    if (!projId) return;

    if (methods?.addContributionAndUpdateProject) {
      await methods.addContributionAndUpdateProject(
        projId,
        {
          userId: data?.user?.uid || '',
          amount: plan.amount,
          date: plan.contributionRecord?.date || new Date().toISOString().split('T')[0],
          notes: plan.contributionRecord?.notes || 'Aportación a proyecto',
          sourceAccountId: plan.contributionRecord?.sourceAccountId,
          targetAccountId: plan.contributionRecord?.targetAccountId,
          isInternalPiggyBank: plan.isInternalPiggyBank
        },
        plan.newProjectSavedAmount
      );
    } else if (methods?.updateProject) {
      await methods.updateProject(projId, {
        savedAmount: plan.newProjectSavedAmount,
        currentAmount: plan.newProjectSavedAmount,
        status: plan.projectReachedGoal ? 'completed' : undefined
      });
    }

    if (plan.projectReachedGoal && methods?.updateProject) {
      await methods.updateProject(projId, { status: 'completed' });
    }

    setShowContributionModal(false);
    setContributionProject(null);
  };

  // Reordenamiento y cambio de estado
  const changePriority = async (project: any, direction: 'up' | 'down') => {
    const currentIndex = pendingProjects.findIndex((p) => p.id === project.id);
    if (direction === 'up' && currentIndex > 0) {
      const other = pendingProjects[currentIndex - 1];
      if (methods?.updateProject) {
        await methods.updateProject(project.id, { priority: other.priority });
        await methods.updateProject(other.id, { priority: project.priority });
      }
    } else if (direction === 'down' && currentIndex < pendingProjects.length - 1) {
      const other = pendingProjects[currentIndex + 1];
      if (methods?.updateProject) {
        await methods.updateProject(project.id, { priority: other.priority });
        await methods.updateProject(other.id, { priority: project.priority });
      }
    }
  };

  const activateProject = async (project: any) => {
    if (activeProject && methods?.updateProject) {
      await methods.updateProject(activeProject.id, { status: 'pending' });
    }
    if (methods?.updateProject) {
      await methods.updateProject(project.id, { status: 'active' });
    }
  };

  const completeProject = async (project: any) => {
    if (methods?.updateProject) {
      await methods.updateProject(project.id, { status: 'completed' });
    }
  };

  // Manejo de Hitos
  const handleOpenAddMilestone = () => {
    setEditingMilestoneId(null);
    setNewMilestone({ title: '', amountThreshold: '', dateThreshold: '' });
    setShowMilestoneModal(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProj = currentProject || activeProject;
    if (!targetProj || !newMilestone.title.trim()) return;

    let updatedMilestones;
    if (editingMilestoneId) {
      updatedMilestones = (targetProj.milestones || []).map((m: any) =>
        m.id === editingMilestoneId
          ? {
              ...m,
              title: newMilestone.title.trim(),
              amountThreshold: newMilestone.amountThreshold ? Number(newMilestone.amountThreshold) : null,
              dateThreshold: newMilestone.dateThreshold || null
            }
          : m
      );
    } else {
      const milestone = {
        id: Date.now().toString(),
        title: newMilestone.title.trim(),
        amountThreshold: newMilestone.amountThreshold ? Number(newMilestone.amountThreshold) : null,
        dateThreshold: newMilestone.dateThreshold || null,
        isCompleted: false
      };
      updatedMilestones = [...(targetProj.milestones || []), milestone];
    }

    if (methods?.updateProject) {
      await methods.updateProject(targetProj.id, { milestones: updatedMilestones });
    }
    setShowMilestoneModal(false);
    setEditingMilestoneId(null);
    setNewMilestone({ title: '', amountThreshold: '', dateThreshold: '' });
  };

  const toggleMilestone = async (targetProj: any, mId: string, isCompleted: boolean) => {
    if (!targetProj || !methods?.updateProject) return;
    const updatedMilestones = (targetProj.milestones || []).map((m: any) =>
      m.id === mId ? { ...m, isCompleted } : m
    );
    await methods.updateProject(targetProj.id, { milestones: updatedMilestones });
  };

  // Cascada de Excedentes
  const handleApplyCascade = () => {
    if (excedente <= 0) return;
    const targets: SavingsProjectData[] = pendingProjects.map((p) => ({
      id: p.id,
      name: p.name,
      targetAmount: Number(p.targetAmount || 0),
      currentAmount: Number(p.savedAmount ?? p.currentAmount ?? 0),
      priority: Number(p.priority || 0),
      isCompleted: p.status === 'completed'
    }));

    const aportes = distribuirEnCascada(targets, excedente);
    aportes.forEach((a) => {
      const proj = pendingProjects.find((p) => p.id === a.projectId);
      const current = Number(proj?.savedAmount ?? proj?.currentAmount ?? 0);
      if (methods?.updateProject) {
        methods.updateProject(a.projectId, { savedAmount: current + a.aporte, currentAmount: current + a.aporte });
      }
    });
    setShowCascadeModal(false);
    setExcedente(0);
  };

  // =========================================================================
  // NIVEL 2: VISTA DETALLADA DEL PROYECTO
  // =========================================================================
  if (selectedProjectId && currentProject) {
    const saved = Number(currentProject.savedAmount ?? currentProject.currentAmount ?? 0);
    const target = Number(currentProject.targetAmount || 0);
    const remaining = Math.max(0, target - saved);
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    const projectContributions = (contributions || []).filter((c: any) => c.projectId === currentProject.id);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Cabecera con Breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-bold cursor-pointer"
            >
              <ChevronLeft size={18} />
              <span>Metas y Proyectos</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {currentProject.name}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditProject(currentProject)}
              className="flex items-center gap-1.5"
            >
              <Edit2 size={15} />
              <span>Editar Meta</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenContribution(currentProject)}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} />
              <span>Aportar a Meta</span>
            </Button>
          </div>
        </div>

        {/* Tarjeta Principal de Detalle */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full tracking-wider border ${
                    currentProject.status === 'active'
                      ? 'bg-primary/20 text-indigo-300 border-primary/40'
                      : currentProject.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {currentProject.status === 'active'
                    ? 'Meta Activa'
                    : currentProject.status === 'completed'
                    ? 'Completado 🎉'
                    : 'En Cola / Prioridad #' + (currentProject.priority || 1)}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full border border-white/10">
                  <Wallet size={12} className="text-indigo-300" />
                  <span>Apartado en {getAccountDisplayName(currentProject.targetAccountId || currentProject.targetAccount)}</span>
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentProject.name}
              </h2>
              <p className="text-indigo-200 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                <Calendar size={15} />
                Meta estimada: <strong className="text-white">{getEstimatedDate(currentProject)}</strong>
              </p>
            </div>

            <div className="text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 sm:px-6">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 block mb-1">
                Progreso Acumulado
              </span>
              <p className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {FormatCurrency(saved)}
              </p>
              <p className="text-xs text-indigo-200 mt-0.5">
                de una meta de <strong className="text-white">{FormatCurrency(target)}</strong>
              </p>
            </div>
          </div>

          {/* Barra de Progreso Grande */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-emerald-400 text-base font-black">{pct}% Alcanzado</span>
              <span className="text-indigo-200 text-xs">
                {remaining > 0 ? `Faltan ${FormatCurrency(remaining)}` : '¡Meta 100% alcanzada!'}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/10 relative">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-primary to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Botones de Cambio de Estado Rápido */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/10 text-xs">
            {currentProject.status !== 'active' && currentProject.status !== 'completed' && (
              <button
                type="button"
                onClick={() => activateProject(currentProject)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hacer esta mi Meta Activa
              </button>
            )}
            {currentProject.status !== 'completed' && (
              <button
                type="button"
                onClick={() => completeProject(currentProject)}
                className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Marcar como Completada
              </button>
            )}
          </div>
        </div>

        {/* Cuota Mensual y Aportación Sugerida en Pareja */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Aportación Sugerida de Pareja (Cuota Mensual)</h3>
            </div>
            <span className="font-black text-slate-900 text-sm">
              Cuota: {FormatCurrency(currentProject.monthlyQuota || 0)} / mes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(users || []).map((u: any) => {
              const userIncome = incomePerUser[u.id] || 0;
              const ratio = totalHouseholdIncome > 0 ? userIncome / totalHouseholdIncome : (users.length > 0 ? 1 / users.length : 0.5);
              const quota = Number(currentProject.monthlyQuota || 0);
              const suggestedAmount = quota * ratio;

              return (
                <div
                  key={u.id}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-primary font-bold text-sm flex items-center justify-center">
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{u.name || u.email}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ingresos: {FormatCurrency(userIncome)} ({Math.round(ratio * 100)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Sugerido</span>
                    <span className="font-black text-slate-900 text-base tabular-nums">
                      {FormatCurrency(suggestedAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hitos y Tareas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Hitos y Tareas del Proyecto</h3>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpenAddMilestone}>
              + Añadir Hito
            </Button>
          </div>

          {(!currentProject.milestones || currentProject.milestones.length === 0) ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Aún no has registrado tareas o hitos para esta meta.
            </p>
          ) : (
            <div className="space-y-2.5">
              {currentProject.milestones.map((m: any) => {
                const isReached = m.amountThreshold && saved >= m.amountThreshold;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      m.isCompleted
                        ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                        : isReached
                        ? 'bg-amber-50/60 border-amber-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleMilestone(currentProject, m.id, !m.isCompleted)}
                        className="cursor-pointer text-primary shrink-0"
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        ) : (
                          <Circle size={20} className="text-slate-400 hover:text-primary" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm font-bold ${m.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {m.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {m.amountThreshold && <span>Disparador: {FormatCurrency(Number(m.amountThreshold))}</span>}
                          {m.dateThreshold && <span>Fecha: {m.dateThreshold}</span>}
                        </div>
                      </div>
                    </div>

                    {isReached && !m.isCompleted && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                        ¡Monto alcanzado!
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trazabilidad / Historial de Aportaciones */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History size={18} className="text-primary" />
              <h3 className="font-bold text-slate-800 text-base">Historial de Aportaciones</h3>
            </div>
            <Button size="sm" onClick={() => handleOpenContribution(currentProject)}>
              + Registrar Aportación
            </Button>
          </div>

          {projectContributions.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No hay aportaciones registradas para este proyecto aún.
            </p>
          ) : (
            <div className="space-y-2.5">
              {projectContributions
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((c: any) => {
                  const user = users.find((u: any) => u.id === c.userId);
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                          {c.isInternalPiggyBank ? <Sparkles size={16} /> : <ArrowDownUp size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">
                            {c.notes || 'Aportación a proyecto'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.date} • {user?.name || 'Usuario'}
                            {c.isInternalPiggyBank && (
                              <span className="ml-2 text-emerald-700 font-semibold">• Apartado interno</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 text-sm tabular-nums">
                        + {FormatCurrency(c.amount)}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Modales Compartidos */}
        <Modal
          isOpen={showProjectModal}
          onClose={closeProjectForm}
          title={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        >
          <ProjectForm
            initialData={editingProject}
            accounts={accounts}
            onSubmit={handleSaveProject}
            onCancel={closeProjectForm}
          />
        </Modal>

        <ProjectContributionModal
          isOpen={showContributionModal}
          onClose={() => {
            setShowContributionModal(false);
            setContributionProject(null);
          }}
          project={contributionProject || currentProject}
          accounts={accounts}
          activeProjects={projects}
          onContribute={handleExecuteContribution}
        />

        <Modal
          isOpen={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
          title="Añadir Hito o Tarea"
        >
          <form onSubmit={handleSaveMilestone} className="space-y-4">
            <div>
              <label htmlFor="milestone-title" className="block text-sm font-bold text-slate-700 mb-1">
                Descripción del Hito
              </label>
              <input
                id="milestone-title"
                type="text"
                required
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="Ej. Comprar boletos de avión, Dar anticipo"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label htmlFor="milestone-amount" className="block text-sm font-bold text-slate-700 mb-1">
                Monto Disparador ($) (Opcional)
              </label>
              <input
                id="milestone-amount"
                type="number"
                value={newMilestone.amountThreshold}
                onChange={(e) => setNewMilestone({ ...newMilestone, amountThreshold: e.target.value })}
                placeholder="Ej. 15000"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label htmlFor="milestone-date" className="block text-sm font-bold text-slate-700 mb-1">
                Fecha Estimada (Opcional)
              </label>
              <input
                id="milestone-date"
                type="date"
                value={newMilestone.dateThreshold}
                onChange={(e) => setNewMilestone({ ...newMilestone, dateThreshold: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setShowMilestoneModal(false)} type="button">
                Cancelar
              </Button>
              <Button type="submit">Guardar Hito</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // =========================================================================
  // NIVEL 1: DASHBOARD GENERAL DE PROYECTOS (EXPLORADOR)
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Metas y Proyectos de Ahorro
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Efecto Cascada • Conquista un objetivo a la vez sin dispersar tus fondos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {pendingProjects.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowCascadeModal(true)}
              className="flex items-center gap-1.5"
            >
              <Layers size={16} />
              <span>Distribuir Cascada</span>
            </Button>
          )}
          <Button onClick={handleOpenNewProject} className="flex items-center gap-2 shadow-sm">
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </Button>
        </div>
      </div>

      {/* Resumen Ejecutivo Superior (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
            Total en Proyectos
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {FormatCurrency(totalSavedAllProjects)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            de {FormatCurrency(totalTargetAllProjects)} total
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
            Meta Activa
          </span>
          <p className="text-2xl font-black text-primary tabular-nums">
            {activeProject ? '1 Activa' : '0'}
          </p>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {activeProject?.name || 'Ninguna'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
            En Cola (Cascada)
          </span>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {pendingProjects.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Metas pendientes</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
            Completadas
          </span>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {completedProjects.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Metas alcanzadas 🎉</span>
        </div>
      </div>

      {/* Tarjeta Hero del Proyecto Activo Principal */}
      {activeProject ? (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/25 text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full border border-primary/40 uppercase tracking-wider">
                  Meta Activa Principal
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full border border-white/10">
                  <Wallet size={12} className="text-indigo-300" />
                  <span>Apartado en {getAccountDisplayName(activeProject.targetAccountId || activeProject.targetAccount)}</span>
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeProject.name}
              </h3>
              <p className="text-indigo-200 text-sm mt-1 flex items-center gap-1.5 font-medium">
                <Calendar size={15} />
                Meta estimada: <strong className="text-white">{getEstimatedDate(activeProject)}</strong>
              </p>
            </div>

            <div className="text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 sm:px-6">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 block mb-1">
                Progreso Acumulado
              </span>
              <p className="text-3xl font-black text-white tabular-nums tracking-tight">
                {FormatCurrency(Number(activeProject.savedAmount ?? activeProject.currentAmount ?? 0))}
              </p>
              <p className="text-xs text-indigo-200 mt-0.5">
                Meta: <strong className="text-white">{FormatCurrency(Number(activeProject.targetAmount || 0))}</strong>
              </p>
            </div>
          </div>

          {/* Barra de Progreso */}
          {(() => {
            const saved = Number(activeProject.savedAmount ?? activeProject.currentAmount ?? 0);
            const target = Number(activeProject.targetAmount || 0);
            const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
            const remaining = Math.max(0, target - saved);

            return (
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                  <span className="text-emerald-400 font-black">{pct}% Completado</span>
                  <span className="text-indigo-200">
                    {remaining > 0 ? `Restan ${FormatCurrency(remaining)}` : '¡Meta alcanzada!'}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden border border-white/10 relative">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-primary to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Desglose de Cuota Mensual y Botones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <Info size={14} className="text-indigo-400" />
              <span>Cuota mensual sugerida: <strong className="text-white">{FormatCurrency(activeProject.monthlyQuota || 0)}</strong></span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedProjectId(activeProject.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5"
              >
                <span>Ver Detalle y Tareas</span>
                <ArrowRight size={15} />
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenContribution(activeProject)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md"
              >
                <Plus size={16} />
                <span>Aportar</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Target size={36} className="mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800">No tienes proyectos de ahorro activos</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Crea tu primer proyecto para empezar a apartar dinero de forma inteligente.
          </p>
          <Button onClick={handleOpenNewProject} className="mt-2">
            Crear Primer Proyecto
          </Button>
        </div>
      )}

      {/* Listado en Cascada de Proyectos en Cola */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <span>Cola de Proyectos (Efecto Cascada)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Se financiarán automáticamente en este orden conforme completes la meta activa
            </p>
          </div>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl text-center text-xs text-slate-500 font-medium">
            No hay metas en cola. Haz clic en "+ Nuevo Proyecto" para planificar tus próximas metas.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProjects.map((p, index) => {
              const saved = Number(p.savedAmount ?? p.currentAmount ?? 0);
              const target = Number(p.targetAmount || 0);
              const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:border-indigo-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                >
                  <div
                    className="flex-1 cursor-pointer w-full"
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        {getAccountDisplayName(p.targetAccountId || p.targetAccount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Meta: <strong className="text-slate-800">{FormatCurrency(target)}</strong></span>
                      <span>Acumulado: <strong className="text-slate-800">{FormatCurrency(saved)}</strong> ({pct}%)</span>
                      <span>Cuota: {FormatCurrency(p.monthlyQuota || 0)}/mes</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Botones de Reordenamiento */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => changePriority(p, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-500 hover:text-primary disabled:opacity-30 cursor-pointer"
                        title="Subir prioridad"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => changePriority(p, 'down')}
                        disabled={index === pendingProjects.length - 1}
                        className="p-1.5 text-slate-500 hover:text-primary disabled:opacity-30 cursor-pointer"
                        title="Bajar prioridad"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => activateProject(p)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Activar
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                      title="Ver detalle"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proyectos Completados */}
      {completedProjects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={16} className="text-emerald-500" />
            <span>Metas Alcanzadas ({completedProjects.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">{p.name}</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {FormatCurrency(Number(p.targetAmount || 0))} completados
                  </p>
                </div>
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales Compartidos en Nivel 1 */}
      <Modal
        isOpen={showProjectModal}
        onClose={closeProjectForm}
        title={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      >
        <ProjectForm
          initialData={editingProject}
          accounts={accounts}
          onSubmit={handleSaveProject}
          onCancel={closeProjectForm}
        />
      </Modal>

      <ProjectContributionModal
        isOpen={showContributionModal}
        onClose={() => {
          setShowContributionModal(false);
          setContributionProject(null);
        }}
        project={contributionProject || activeProject}
        accounts={accounts}
        activeProjects={projects}
        onContribute={handleExecuteContribution}
      />

      {/* Modal de Cascada de Excedentes */}
      <Modal
        isOpen={showCascadeModal}
        onClose={() => setShowCascadeModal(false)}
        title="Distribuir Excedente en Cascada"
      >
        <div className="p-2 space-y-4">
          <p className="text-xs text-slate-600">
            Ingresa un monto de liquidez excedente (ej. de ingresos variables, bonos o ahorros) para distribuirlo de forma óptima a través de las metas en cola según su prioridad.
          </p>

          <div>
            <label htmlFor="cascade-amount" className="block text-sm font-bold text-slate-700 mb-1">
              Monto Excedente ($)
            </label>
            <input
              id="cascade-amount"
              type="number"
              min="1"
              value={excedente || ''}
              onChange={(e) => setExcedente(Number(e.target.value))}
              placeholder="Ej. 10000"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary font-bold text-slate-900 text-base"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowCascadeModal(false)} type="button">
              Cancelar
            </Button>
            <Button onClick={handleApplyCascade} disabled={excedente <= 0}>
              Aplicar Cascada
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
