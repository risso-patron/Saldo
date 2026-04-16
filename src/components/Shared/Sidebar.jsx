import React from 'react';
import { 
  ChartBar, 
  ChartLine, 
  Receipt, 
  Target, 
  Wrench,
  MagnifyingGlass,
  ArrowSquareOut,
  AppWindow,
  CloudCheck
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import BudgetLogo from './BudgetLogo';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  onOpenOmnibar, 
  ProfileMenuComponent, 
  ThemeToggleComponent, 
  CurrencySelectorComponent 
}) => {
  const { t } = useTranslation()
  const menuItems = [
    { id: 'resumen', label: t('sidebar.dashboard'), Icon: ChartBar },
    { id: 'movimientos', label: t('sidebar.transactions'), Icon: Receipt },
    { id: 'graficos', label: t('sidebar.analytics'), Icon: ChartLine },
    { id: 'planificacion', label: t('sidebar.goals'), Icon: Target },
    { id: 'herramientas', label: t('sidebar.tools'), Icon: Wrench },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-screen bg-slate-900 border-r border-white/5 shadow-2xl relative z-[100] transition-all duration-500">
      
      {/* 1. BRANDING / LOGO AREA */}
      <div className="p-8 pb-6 text-white">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('resumen')}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <BudgetLogo size={48} className="relative !bg-slate-800 border border-white/10" />
          </div>
          <div className="flex flex-col leading-none">
            <h2 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
              Saldo
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">
                Finanzas
              </span>
              <CloudCheck size={12} weight="fill" className="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH / OMNIBAR TRIGGER */}
      <div className="px-6 mb-8">
        <button 
          onClick={onOpenOmnibar}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-400 transition-all group"
        >
          <MagnifyingGlass size={18} weight="bold" className="group-hover:text-white transition-colors" />
          <span className="text-sm font-bold tracking-tight">{t('sidebar.search')}</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-white/10 rounded border border-white/10">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-white/10 rounded border border-white/10">K</kbd>
          </div>
        </button>
      </div>

      {/* 3. CORE NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar-sidebar">
        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{t('sidebar.panel')}</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 group relative ${
              activeTab === item.id
                ? 'bg-primary-600/10 text-primary-400 shadow-[inset_0_1px_rgba(255,255,255,0.05)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {/* Active Indicator */}
            {activeTab === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            )}
            
            <item.Icon 
              size={20} 
              weight={activeTab === item.id ? 'fill' : 'regular'} 
              className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}
            />
            <span>{item.label}</span>

            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* 4. FOOTER AREA (CONFIG & PROFILE) */}
      <div className="p-6 mt-auto border-t border-white/5 bg-slate-900/50 backdrop-blur-xl">
        
        {/* Quick Tools Row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            {CurrencySelectorComponent && (
              <div className="w-full">
                {React.cloneElement(CurrencySelectorComponent, { align: 'sidebar' })}
              </div>
            )}
          </div>
          <div className="p-1 px-2.5 bg-slate-800/80 rounded-xl border border-white/5 shadow-inner">
            {ThemeToggleComponent}
          </div>
        </div>

        {/* Language selector */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <LanguageSelector compact />
        </div>

        {/* User Profile Card */}
        <div className="relative group">
          {/* ProfileMenu ya soporta align="sidebar" */}
          {React.cloneElement(ProfileMenuComponent, { align: 'sidebar' })}
        </div>
      </div>
    </aside>
  );
};
