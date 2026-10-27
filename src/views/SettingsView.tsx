import React, { useState, useEffect } from 'react';
import { User, Palette, Tag, Folder, Plus, Trash2, Edit2, Users } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../components/ui/Button';
import { ProfileView } from './ProfileView';

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [, setForceRender] = useState(0);
  const { user, categories, tags, addCategory, deleteCategoryItem, addTag, deleteTagItem, refreshSettings } = useAppStore(useShallow(state => ({
    user: state.user,
    categories: state.categories,
    tags: state.tags,
    addCategory: state.addCategory,
    deleteCategoryItem: state.deleteCategoryItem,
    addTag: state.addTag,
    deleteTagItem: state.deleteTagItem,
    refreshSettings: state.refreshSettings
  })));

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const [newTagName, setNewTagName] = useState('');
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim());
    setNewTagName('');
  };

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'EXPENSE'|'INCOME'>('EXPENSE');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      ownerType: 'SHARED'
    });
    setNewCategoryName('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row min-h-[600px] gap-8">
      {/* Sidebar for settings tabs */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Ajustes</h2>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <User size={18} />
          Perfil de Usuario
        </button>
        <button
          onClick={() => setActiveTab('household')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'household' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Users size={18} />
          Hogar y Miembros
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Palette size={18} />
          Apariencia
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Folder size={18} />
          Categorías
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'tags' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Tag size={18} />
          Etiquetas (Tags)
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
        
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Perfil de Usuario</h3>
              <p className="text-sm text-slate-500 mt-1">Configura tu información personal.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden">
                {user?.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="m-auto mt-4 text-slate-400" />}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user?.displayName || 'Usuario'}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 italic">Nota: La edición del perfil desde la app aún no está disponible.</p>
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('household')}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <Users size={16} /> Administrar integrantes de mi hogar →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'household' && (
          <ProfileView />
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Apariencia</h3>
              <p className="text-sm text-slate-500 mt-1">Personaliza cómo se ve tu app.</p>
            </div>
            <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-primary"></div>
              <div>
                <p className="font-bold text-slate-700">Tema Claro (Por defecto)</p>
                <p className="text-xs text-slate-500">Próximamente agregaremos modo oscuro.</p>
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 space-y-3">
              <div>
                <p className="font-bold text-slate-700">Color Primario</p>
                <p className="text-xs text-slate-500">Elige un color para los acentos principales en la app.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {['#4f46e5', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#14b8a6'].map(color => {
                  const storedColor = localStorage.getItem('app_primary_color') || '#4f46e5';
                  const isActive = storedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        localStorage.setItem('app_primary_color', color);
                        document.documentElement.style.setProperty('--primary-color', color);
                        setForceRender(prev => prev + 1);
                      }}
                      className={`w-8 h-8 rounded-full transition-transform ${isActive ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 space-y-3">
              <div>
                <p className="font-bold text-slate-700">Color Secundario</p>
                <p className="text-xs text-slate-500">Elige un color para acentos secundarios en la app.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899'].map(color => {
                  const storedColor = localStorage.getItem('app_second_color') || '#f43f5e';
                  const isActive = storedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        localStorage.setItem('app_second_color', color);
                        document.documentElement.style.setProperty('--second-color', color);
                        // Trigger re-render by updating local state variable
                        setForceRender(prev => prev + 1);
                      }}
                      className={`w-8 h-8 rounded-full transition-transform ${isActive ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Categorías Personalizadas</h3>
              <p className="text-sm text-slate-500 mt-1">Administra las categorías de tus ingresos y gastos.</p>
            </div>
            
            <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-3 items-end p-4 border border-slate-100 rounded-xl bg-slate-50">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                <input required type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Ej. Despensa" />
              </div>
              <div className="w-full md:w-32">
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipo</label>
                <select value={newCategoryType} onChange={e => setNewCategoryType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
              </div>
              <div className="w-full md:w-20">
                <label className="block text-xs font-bold text-slate-600 mb-1">Color</label>
                <input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-full h-[38px] cursor-pointer border border-slate-200 rounded-lg" />
              </div>
              <Button type="submit" className="w-full md:w-auto h-[38px]"><Plus size={16}/></Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {categories?.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: c.color || '#ccc'}}></div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{c.type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteCategoryItem(c.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                </div>
              ))}
              {categories?.length === 0 && <p className="text-sm text-slate-500">No hay categorías configuradas.</p>}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Etiquetas (Tags)</h3>
              <p className="text-sm text-slate-500 mt-1">Agrupa gastos transversales usando etiquetas.</p>
            </div>
            
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input 
                type="text" 
                value={newTagName} 
                onChange={e => setNewTagName(e.target.value)} 
                placeholder="Nueva etiqueta (ej. #Viaje2026)" 
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
              <Button type="submit"><Plus size={16}/> Agregar</Button>
            </form>

            <div className="flex flex-wrap gap-2 mt-4">
              {tags?.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  {t.name}
                  <button onClick={() => deleteTagItem(t.id)} className="text-primary hover:text-primary/70"><Trash2 size={14}/></button>
                </div>
              ))}
              {tags?.length === 0 && <p className="text-sm text-slate-500">Aún no has creado ninguna etiqueta.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
