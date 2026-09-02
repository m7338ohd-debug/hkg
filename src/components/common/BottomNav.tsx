import React from 'react';
import { LayoutDashboard, Calculator, PlusCircle, History, FileText, Bot, Home } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'calculator' | 'transactions' | 'history' | 'reports' | 'home_family' | 'store_llm' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'POS', icon: Calculator },
    { id: 'transactions', label: 'Entry', icon: PlusCircle, isHighlight: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'home_family', label: 'Home', icon: Home },
    { id: 'store_llm', label: 'Store LLM', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 z-40 w-full sm:max-w-xl px-0 sm:px-4 no-print">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t sm:border border-slate-200/90 dark:border-slate-800/90 px-1 py-1 shadow-2xl sm:rounded-full">
        <div className="flex items-center justify-around w-full max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isHighlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className="flex flex-col items-center justify-center -mt-4 sm:-mt-6 cursor-pointer group focus:outline-hidden shrink-0"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/40 ring-2 sm:ring-4 ring-emerald-100 dark:ring-emerald-950 scale-105'
                        : 'bg-emerald-500 text-white shadow-emerald-500/30 group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className={`text-[8px] xs:text-[9px] sm:text-xs font-extrabold mt-0.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex flex-col items-center justify-center py-1 px-1 sm:px-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer shrink-0 min-w-0 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[8px] xs:text-[9px] sm:text-xs mt-0.5 font-semibold truncate max-w-[42px] sm:max-w-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
