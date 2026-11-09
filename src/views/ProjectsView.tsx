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
  X,
  Trash2,
  Pause,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormatCurrency } from '../utils';
import { distribuirEnCascada, SavingsProjectData } from '../services/proyectosService';
import { ProjectForm, ProjectFormData } from '../components/forms/ProjectForm';
import { ProjectContributionModal } from '../components/forms/ProjectContributionModal';
import { ProjectContributionPlan } from '../utils/projectCalculations';
import { useAppStore } from '../store/useAppStore';

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

  // Acciones de hitos y proyectos desde store o props
  const storeAddMilestone = useAppStore((state) => state.addMilestone);
  const storeToggleMilestone = useAppStore((state) => state.toggleMilestone);
  const storeDeleteMilestone = useAppStore((state) => state.deleteMilestone);
  const storeDeleteProject = useAppStore((state) => state.deleteProject);
  const storeTogglePauseProject = useAppStore((state) => state.togglePauseProject);

  const addMilestoneAction = methods?.addMilestone || storeAddMilestone;
  const toggleMilestoneAction = methods?.toggleMilestone || storeToggleMilestone;
  const deleteMilestoneAction = methods?.deleteMilestone || storeDeleteMilestone;
  const deleteProjectAction = methods?.deleteProject || storeDeleteProject;
  const togglePauseProjectAction = methods?.togglePauseProject || storeTogglePauseProject;

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
    return [...projects].sort((a, b) => {
      const aPaused = a.priority === 0 || a.status === 'paused' || a.isPaused;
      const bPaused = b.priority === 0 || b.status === 'paused' || b.isPaused;
      if (aPaused && !bPaused) return 1;
      if (!aPaused && bPaused) return -1;
      if ((a.priority || 0) !== (b.priority || 0)) return (a.priority || 0) - (b.priority || 0);
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });
  }, [projects]);

  const activeProject = useMemo(() => {
    const explicitActive = sortedProjects.find((p) => p.status === 'active' && !p.isPaused && p.priority !== 0);
    if (explicitActive) return explicitActive;
    return sortedProjects.find(
      (p) => !p.isCompleted && p.status !== 'completed' && p.status !== 'paused' && !p.isPaused && (p.priority === undefined || p.priority > 0)
    ) || null;
  }, [sortedProjects]);

  const pausedProjects = useMemo(() => {
    return sortedProjects.filter(
      (p) => !p.isCompleted && p.status !== 'completed' && (p.status === 'paused' || p.isPaused || p.priority === 0)
    );
  }, [sortedProjects]);

  const pendingProjects = useMemo(() => {
    return sortedProjects.filter(
      (p) =>
        !p.isCompleted &&
        p.status !== 'completed' &&
        p.status !== 'paused' &&
        !p.isPaused &&
        p.priority !== 0 &&
        p.id !== activeProject?.id
    );
  }, [sortedProjects, activeProject]);

  const completedProjects = useMemo(() => {
    return sortedProjects.filter((p) => p.status === 'completed' || p.isCompleted);
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

  // Helper para formato de fecha DD/MM/AAAA
  const formatDateDDMMAAAA = (rawDate: string | Date | undefined | null): string => {
    if (!rawDate) return '';
    const str = String(rawDate).trim();
    const dateOnly = str.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
    }
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    } catch {
      // fallback
    }
    return str;
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
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pendingProjects.length) return;

    const other = pendingProjects[targetIndex];
    let pPriority = Number(project.priority) || 1;
    let oPriority = Number(other.priority) || 1;

    if (pPriority === oPriority) {
      if (direction === 'up') {
        pPriority = Math.max(1, oPriority - 1);
      } else {
        pPriority = oPriority + 1;
      }
    } else {
      const temp = pPriority;
      pPriority = oPriority;
      oPriority = temp;
    }

    const updates = [
      { id: project.id, priority: pPriority },
      { id: other.id, priority: oPriority }
    ];

    if (methods?.reorderProjects) {
      await methods.reorderProjects(updates);
    } else if (methods?.updateProject) {
      await methods.updateProject(project.id, { priority: pPriority });
      await methods.updateProject(other.id, { priority: oPriority });
    }
  };

  const activateProject = async (project: any) => {
    if (!activeProject || activeProject.id === project.id) return;

    let activePriority = Number(activeProject.priority) || 1;
    let selectedPriority = Number(project.priority) || (activePriority + 1);

    if (selectedPriority === activePriority) {
      selectedPriority = activePriority;
      activePriority = activePriority + 1;
    } else if (selectedPriority < activePriority) {
      const temp = selectedPriority;
      selectedPriority = activePriority;
      activePriority = temp;
    } else {
      const temp = activePriority;
      activePriority = selectedPriority;
      selectedPriority = temp;
    }

    const updates = [
      { id: project.id, priority: selectedPriority },
      { id: activeProject.id, priority: activePriority }
    ];

    if (methods?.reorderProjects) {
      await methods.reorderProjects(updates);
    } else if (methods?.updateProject) {
      await methods.updateProject(project.id, { priority: selectedPriority });
      await methods.updateProject(activeProject.id, { priority: activePriority });
    }
  };

  const completeProject = async (project: any) => {
    if (methods?.updateProject) {
      await methods.updateProject(project.id, { status: 'completed' });
    }
  };

  const reactivateProject = async (project: any) => {
    if (methods?.updateProject) {
      await methods.updateProject(project.id, { status: 'pending' });
    }
  };

  const handleDeleteProject = async (project: any) => {
    if (!project) return;
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la meta "${project.name}"?\nEl historial contable de aportaciones y movimientos bancarios se conservará íntegramente.`
    );
    if (!confirmed) return;

    if (deleteProjectAction) {
      await deleteProjectAction(project.id);
    }
    setSelectedProjectId(null);
  };

  const handleTogglePause = async (project: any) => {
    if (!project) return;
    if (togglePauseProjectAction) {
      await togglePauseProjectAction(project);
    } else if (methods?.updateProject) {
      const isPaused = project.status === 'paused' || project.priority === 0 || project.isPaused;
      const maxP = projects.reduce((max: number, p: any) => Math.max(max, Number(p.priority) || 0), 0);
      await methods.updateProject(project.id, { priority: isPaused ? (maxP > 0 ? maxP + 1 : 1) : 0 });
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

    if (editingMilestoneId) {
      try {
        const { updateProjectMilestone } = await import('../lib/dataconnect');
        const houseId = (useAppStore.getState() as any).houseId;
        if (houseId) {
          await updateProjectMilestone({
            milestoneId: editingMilestoneId,
            householdId: houseId,
            title: newMilestone.title.trim(),
            amountThreshold: newMilestone.amountThreshold ? Number(newMilestone.amountThreshold) : null,
            dateThreshold: newMilestone.dateThreshold || null
          });
          const fetchDashboardData = (useAppStore.getState() as any).fetchDashboardData;
          if (fetchDashboardData) await fetchDashboardData(houseId);
        }
      } catch (err) {
        console.error("Error al actualizar hito:", err);
      }
    } else {
      if (addMilestoneAction) {
        await addMilestoneAction(targetProj.id, newMilestone);
      } else if (methods?.updateProject) {
        const milestone = {
          id: Date.now().toString(),
          title: newMilestone.title.trim(),
          amountThreshold: newMilestone.amountThreshold ? Number(newMilestone.amountThreshold) : null,
          dateThreshold: newMilestone.dateThreshold || null,
          isCompleted: false
        };
        const updatedMilestones = [...(targetProj.milestones || []), milestone];
        await methods.updateProject(targetProj.id, { milestones: updatedMilestones });
      }
    }

    setShowMilestoneModal(false);
    setEditingMilestoneId(null);
    setNewMilestone({ title: '', amountThreshold: '', dateThreshold: '' });
  };

  const toggleMilestone = async (targetProj: any, mId: string, isCompleted: boolean) => {
    if (!targetProj) return;
    if (toggleMilestoneAction) {
      await toggleMilestoneAction(mId, isCompleted);
    } else if (methods?.updateProject) {
      const updatedMilestones = (targetProj.milestones || []).map((m: any) =>
        m.id === mId ? { ...m, isCompleted } : m
      );
      await methods.updateProject(targetProj.id, { milestones: updatedMilestones });
    }
  };

  const handleDeleteMilestone = async (mId: string) => {
    if (deleteMilestoneAction) {
      await deleteMilestoneAction(mId);
    }
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
    const projectContributions = (contributions || []).filter(
      (c: any) => c.projectId === currentProject.id || c.savingsProjectId === currentProject.id
    );
    const contributionsTotal = projectContributions.reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0);
    const saved = contributionsTotal > 0 ? contributionsTotal : Number(currentProject.savedAmount ?? currentProject.currentAmount ?? 0);
    const target = Number(currentProject.targetAmount || 0);
    const remaining = Math.max(0, target - saved);
    const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Cabecera con Breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Metas y Proyectos</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs text-sm">
              {currentProject.name}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleDeleteProject(currentProject)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-[#FDEFEA] px-3.5 py-2 rounded-full transition-colors cursor-pointer border border-[#EEF0F4]"
            >
              <Trash2 size={14} />
              <span>Eliminar Meta</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenEditProject(currentProject)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:bg-[#F8FAFC] px-4 py-2 rounded-full transition-colors cursor-pointer border border-[#EEF0F4]"
            >
              <Edit2 size={14} />
              <span>Editar Meta</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenContribution(currentProject)}
              className="inline-flex items-center gap-1.5 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2.5 font-medium transition-colors duration-150 text-xs shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span>Aportar a Meta</span>
            </button>
          </div>
        </div>

        {/* Tarjeta Principal de Detalle */}
        {(() => {
          const isCurrentPaused = currentProject.status === 'paused' || currentProject.priority === 0 || currentProject.isPaused;
          return (
            <div className="bg-[#111319] border border-[#232733] rounded-3xl p-6 sm:p-8 text-white shadow-bento relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs uppercase font-bold px-3 py-1 rounded-full tracking-wider border ${
                        isCurrentPaused
                          ? 'bg-[#FDEFEA]/20 text-[#F97316] border-[#F97316]/30'
                          : currentProject.status === 'active'
                          ? 'bg-[#E8F8F0]/20 text-[#10B981] border-[#10B981]/30'
                          : currentProject.status === 'completed'
                          ? 'bg-[#E8F8F0]/20 text-[#10B981] border-[#10B981]/30'
                          : 'bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      {isCurrentPaused
                        ? 'Pausada ⏸️'
                        : currentProject.status === 'active'
                        ? 'Meta Activa'
                        : currentProject.status === 'completed'
                        ? 'Completado 🎉'
                        : 'En Cola / Prioridad #' + (currentProject.priority || 1)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full border border-white/10">
                      <Wallet size={12} className="text-slate-300" />
                      <span>Apartado en {getAccountDisplayName(currentProject.targetAccountId || currentProject.targetAccount)}</span>
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    {currentProject.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                    <Calendar size={15} />
                    Meta estimada: <strong className="text-white">{getEstimatedDate(currentProject)}</strong>
                  </p>
                </div>

                <div className="text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 sm:px-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                    Progreso Acumulado
                  </span>
                  <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                    {FormatCurrency(saved)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                    de una meta de <strong className="text-white tabular-nums">{FormatCurrency(target)}</strong>
                  </p>
                </div>
              </div>

              {/* Barra de Progreso Grande */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-[#10B981] text-base font-bold tabular-nums">{pct}% Alcanzado</span>
                  <span className="text-slate-400 text-xs tabular-nums">
                    {remaining > 0 ? `Faltan ${FormatCurrency(remaining)}` : '¡Meta 100% alcanzada!'}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/10 relative">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Botones de Cambio de Estado Rápido */}
              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/10 text-xs">
                {currentProject.status !== 'active' && currentProject.status !== 'completed' && !isCurrentPaused && (
                  <button
                    type="button"
                    onClick={() => activateProject(currentProject)}
                    className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Hacer esta mi Meta Activa
                  </button>
                )}
                {currentProject.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleTogglePause(currentProject)}
                    className={`px-4 py-2 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isCurrentPaused
                        ? 'bg-[#F97316] hover:bg-[#ea580c] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    {isCurrentPaused ? <Play size={14} /> : <Pause size={14} />}
                    <span>{isCurrentPaused ? 'Reanudar Meta' : 'Pausar Meta'}</span>
                  </button>
                )}
                {currentProject.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={() => completeProject(currentProject)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Marcar como Completada
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => reactivateProject(currentProject)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Reactivar Meta / Proyecto
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Cuota Mensual y Aportación Sugerida en Pareja */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEF0F4] shadow-bento space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEF0F4] pb-3">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-slate-800" />
              <h3 className="font-bold text-slate-900 text-base">Aportación Sugerida de Pareja (Cuota Mensual)</h3>
            </div>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
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
                  className="p-4 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold text-sm flex items-center justify-center border-2 border-white shadow-2xs">
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{u.name || u.email}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                        Ingresos: {FormatCurrency(userIncome)} ({Math.round(ratio * 100)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Sugerido</span>
                    <span className="font-bold text-slate-900 text-base tabular-nums">
                      {FormatCurrency(suggestedAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hitos y Tareas */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEF0F4] shadow-bento space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEF0F4] pb-3">
            <div className="flex items-center gap-2">
              <Flag size={18} className="text-slate-800" />
              <h3 className="font-bold text-slate-900 text-base">Hitos y Tareas del Proyecto</h3>
            </div>
            <button 
              type="button" 
              onClick={handleOpenAddMilestone}
              className="bg-white border border-[#EEF0F4] hover:bg-[#F8FAFC] text-slate-700 rounded-full px-4 py-1.5 font-medium transition-colors text-xs cursor-pointer shadow-2xs"
            >
              + Añadir Hito
            </button>
          </div>

          {(!currentProject.milestones || currentProject.milestones.length === 0) ? (
            <p className="text-sm text-slate-400 py-4 text-center">
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
                        ? 'bg-[#F8FAFC] border-[#EEF0F4] text-slate-400'
                        : isReached
                        ? 'bg-[#E8F8F0]/40 border-[#10B981]/20 text-slate-800'
                        : 'bg-white border-[#EEF0F4] text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleMilestone(currentProject, m.id, !m.isCompleted)}
                        className="cursor-pointer text-slate-400 hover:text-slate-700 shrink-0"
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 size={20} className="text-[#10B981]" />
                        ) : (
                          <Circle size={20} className="text-slate-300 hover:text-slate-600" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold ${m.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {m.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 tabular-nums">
                          {m.amountThreshold && <span className="tabular-nums">Disparador: {FormatCurrency(Number(m.amountThreshold))}</span>}
                          {m.dateThreshold && <span className="tabular-nums">Fecha: {formatDateDDMMAAAA(m.dateThreshold)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isReached && !m.isCompleted && (
                        <span className="text-[11px] font-semibold text-[#10B981] bg-[#E8F8F0] px-2.5 py-1 rounded-full border border-[#10B981]/20 tabular-nums">
                          ¡Monto alcanzado!
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMilestoneId(m.id);
                          setNewMilestone({
                            title: m.title || '',
                            amountThreshold: m.amountThreshold ? String(m.amountThreshold) : '',
                            dateThreshold: m.dateThreshold ? String(m.dateThreshold).split('T')[0] : ''
                          });
                          setShowMilestoneModal(true);
                        }}
                        title="Editar hito"
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(m.id)}
                        title="Eliminar hito"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-[#FDEFEA] rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trazabilidad / Historial de Aportaciones */}
        <div className="bg-white rounded-3xl p-6 border border-[#EEF0F4] shadow-bento space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEF0F4] pb-3">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-800" />
              <h3 className="font-bold text-slate-900 text-base">Historial de Aportaciones</h3>
            </div>
            <button
              type="button"
              onClick={() => handleOpenContribution(currentProject)}
              className="bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-4 py-2 font-medium transition-colors text-xs cursor-pointer shadow-2xs"
            >
              + Registrar Aportación
            </button>
          </div>

          {projectContributions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No hay aportaciones registradas para este proyecto aún.
            </p>
          ) : (
            <div className="space-y-2.5">
              {projectContributions
                .slice()
                .sort((a: any, b: any) => {
                  const dateDiff = new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
                  if (dateDiff !== 0) return dateDiff;
                  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                })
                .map((c: any) => {
                  const user = users.find((u: any) => u.id === c.userId || u.id === c.user?.id || u.id === c.user?.uid);
                  const userName = c.user?.displayName || c.userName || user?.displayName || user?.name || user?.email || 'Usuario';
                  const userPhoto = c.user?.photoUrl || c.userPhotoUrl || user?.photoURL || user?.photoUrl;
                  const formattedDate = formatDateDDMMAAAA(c.date || c.createdAt);

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {userPhoto ? (
                          <img
                            src={userPhoto}
                            alt={userName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-[#EEF0F4] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#6366F1] font-bold text-sm flex items-center justify-center shrink-0 border-2 border-white shadow-2xs">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 leading-tight">
                              {userName}
                            </span>
                            {c.isInternalPiggyBank && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#10B981]/20">
                                <Sparkles size={11} />
                                Apartado interno
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-600 tabular-nums">{formattedDate}</span>
                            {c.notes && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{c.notes}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#10B981] text-sm tabular-nums shrink-0">
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
            key={editingProject?.id || 'new'}
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
          onClose={() => {
            setShowMilestoneModal(false);
            setEditingMilestoneId(null);
            setNewMilestone({ title: '', amountThreshold: '', dateThreshold: '' });
          }}
          title={editingMilestoneId ? 'Editar Hito' : 'Añadir Hito o Tarea'}
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
              <Button
                variant="secondary"
                onClick={() => {
                  setShowMilestoneModal(false);
                  setEditingMilestoneId(null);
                  setNewMilestone({ title: '', amountThreshold: '', dateThreshold: '' });
                }}
                type="button"
              >
                Cancelar
              </Button>
              <Button type="submit">{editingMilestoneId ? 'Guardar Cambios' : 'Guardar Hito'}</Button>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EEF0F4] shadow-bento">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E8F8F0] text-[#10B981]">
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
              className="flex items-center gap-1.5 rounded-full px-4 py-2 border-[#EEF0F4] hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              <Layers size={16} />
              <span>Distribuir Cascada</span>
            </Button>
          )}
          <button
            type="button"
            onClick={handleOpenNewProject}
            className="flex items-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Resumen Ejecutivo Superior (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Total en Proyectos
          </span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {FormatCurrency(totalSavedAllProjects)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            de <span className="tabular-nums">{FormatCurrency(totalTargetAllProjects)}</span> total
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Meta Activa
          </span>
          <p className="text-2xl font-bold text-[#10B981] tabular-nums">
            {activeProject ? '1 Activa' : '0'}
          </p>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {activeProject?.name || 'Ninguna'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            En Cola (Cascada)
          </span>
          <p className="text-2xl font-bold text-[#6366F1] tabular-nums">
            {pendingProjects.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Metas pendientes</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Pausadas
          </span>
          <p className="text-2xl font-bold text-[#F97316] tabular-nums">
            {pausedProjects.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Sin cuota mensual</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EEF0F4] shadow-bento col-span-2 sm:col-span-1">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Completadas
          </span>
          <p className="text-2xl font-bold text-[#10B981] tabular-nums">
            {completedProjects.length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Metas alcanzadas 🎉</span>
        </div>
      </div>

      {/* Tarjeta Hero del Proyecto Activo Principal */}
      {activeProject ? (
        <div className="bg-[#111319] border border-[#232733] rounded-3xl p-6 sm:p-8 text-white shadow-bento relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#E8F8F0]/15 text-[#10B981] text-xs font-semibold px-3 py-1 rounded-full border border-[#10B981]/30 uppercase tracking-wider">
                  Meta Activa Principal
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full border border-white/10">
                  <Wallet size={12} className="text-[#10B981]" />
                  <span>Apartado en {getAccountDisplayName(activeProject.targetAccountId || activeProject.targetAccount)}</span>
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeProject.name}
              </h3>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5 font-medium">
                <Calendar size={15} />
                Meta estimada: <strong className="text-white">{getEstimatedDate(activeProject)}</strong>
              </p>
            </div>

            <div className="text-left md:text-right bg-white/5 border border-white/10 rounded-2xl p-4 sm:px-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Progreso Acumulado
              </span>
              <p className="text-3xl font-black text-white tabular-nums tracking-tight">
                {FormatCurrency(Number(activeProject.savedAmount ?? activeProject.currentAmount ?? 0))}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Meta: <strong className="text-white tabular-nums">{FormatCurrency(Number(activeProject.targetAmount || 0))}</strong>
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
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <span className="text-[#10B981] font-bold tabular-nums">{pct}% Completado</span>
                  <span className="text-slate-400 tabular-nums">
                    {remaining > 0 ? `Restan ${FormatCurrency(remaining)}` : '¡Meta alcanzada!'}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/10 relative">
                  <div
                    className="h-full bg-[#10B981] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Desglose de Cuota Mensual y Botones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info size={14} className="text-slate-400" />
              <span>Cuota mensual sugerida: <strong className="text-white tabular-nums">{FormatCurrency(activeProject.monthlyQuota || 0)}</strong></span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenEditProject(activeProject)}
                className="flex items-center justify-center p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors cursor-pointer"
                title="Editar Proyecto"
              >
                <Edit2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedProjectId(activeProject.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Ver Detalle y Tareas</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenContribution(activeProject)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-4 py-2 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Aportar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#EEF0F4] shadow-bento space-y-3">
          <Target size={36} className="mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800">No tienes proyectos de ahorro activos</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Crea tu primer proyecto para empezar a apartar dinero de forma inteligente.
          </p>
          <button
            type="button"
            onClick={handleOpenNewProject}
            className="mt-2 inline-flex items-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2.5 font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Crear Primer Proyecto</span>
          </button>
        </div>
      )}

      {/* Listado en Cascada de Proyectos en Cola */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EEF2FF] text-[#6366F1]">
                <Layers size={18} />
              </span>
              <span>Cola de Proyectos (Efecto Cascada)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Se financiarán automáticamente en este orden conforme completes la meta activa
            </p>
          </div>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-[#EEF0F4] rounded-3xl text-center text-xs text-slate-500 font-medium">
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
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EEF0F4] shadow-bento hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                >
                  <div
                    className="flex-1 cursor-pointer w-full"
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-slate-700 transition-colors">
                        {p.name}
                      </h4>
                      <span className="text-xs text-slate-400 bg-slate-50 border border-[#EEF0F4] px-2 py-0.5 rounded-full hidden sm:inline-block">
                        {getAccountDisplayName(p.targetAccountId || p.targetAccount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Meta: <strong className="text-slate-800 tabular-nums">{FormatCurrency(target)}</strong></span>
                      <span>Acumulado: <strong className="text-slate-800 tabular-nums">{FormatCurrency(saved)}</strong> ({pct}%)</span>
                      <span>Cuota: <span className="tabular-nums">{FormatCurrency(p.monthlyQuota || 0)}</span>/mes</span>
                    </div>

                    <div className="w-full bg-[#EEF2FF] rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-[#10B981] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Botones de Reordenamiento */}
                    <div className="flex items-center bg-[#F8FAFC] border border-[#EEF0F4] rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => changePriority(p, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="Subir prioridad"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => changePriority(p, 'down')}
                        disabled={index === pendingProjects.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                        title="Bajar prioridad"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePause(p)}
                      className="p-1.5 text-slate-400 hover:text-[#F97316] rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Pausar meta"
                    >
                      <Pause size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditProject(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Editar Proyecto"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => activateProject(p)}
                      className="px-3 py-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#6366F1] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Activar
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
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

      {/* Metas Pausadas */}
      {pausedProjects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#EEF0F4]">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#FDEFEA] text-[#F97316]">
                  <Pause size={16} />
                </span>
                <span>Metas Pausadas ({pausedProjects.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sus cuotas mensuales están excluidas del presupuesto base cero. Puedes reanudarlas cuando decidas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pausedProjects.map((p) => {
              const saved = Number(p.savedAmount ?? p.currentAmount ?? 0);
              const target = Number(p.targetAmount || 0);
              const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

              return (
                <div
                  key={p.id}
                  className="bg-[#FDEFEA]/40 rounded-2xl p-4 sm:p-5 border border-[#EEF0F4] shadow-bento transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                >
                  <div
                    className="flex-1 cursor-pointer w-full"
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs font-semibold text-[#F97316] bg-[#FDEFEA] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Pausada
                      </span>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-slate-700 transition-colors">
                        {p.name}
                      </h4>
                      <span className="text-xs text-slate-400 bg-white border border-[#EEF0F4] px-2 py-0.5 rounded-full hidden sm:inline-block">
                        {getAccountDisplayName(p.targetAccountId || p.targetAccount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Meta: <strong className="text-slate-800 tabular-nums">{FormatCurrency(target)}</strong></span>
                      <span>Acumulado: <strong className="text-slate-800 tabular-nums">{FormatCurrency(saved)}</strong> ({pct}%)</span>
                      <span className="text-[#F97316] font-semibold">Cuota pausada (<span className="tabular-nums">{FormatCurrency(p.monthlyQuota || 0)}</span>/mes)</span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-[#F97316] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#FDEFEA]">
                    <button
                      type="button"
                      onClick={() => handleTogglePause(p)}
                      className="px-3.5 py-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Play size={13} />
                      <span>Reanudar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-white/80 transition-colors"
                      title="Ver detalle"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proyectos Completados */}
      {completedProjects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#EEF0F4]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={16} className="text-[#10B981]" />
            <span>Metas Alcanzadas ({completedProjects.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completedProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="bg-[#E8F8F0]/50 border border-[#EEF0F4] rounded-2xl p-4 cursor-pointer hover:shadow-bento transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <span className="tabular-nums">{FormatCurrency(Number(p.targetAmount || 0))}</span> completados
                  </p>
                </div>
                <div className="p-2 rounded-full bg-[#E8F8F0] text-[#10B981]">
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
          key={editingProject?.id || 'new'}
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
