import React from 'react';
import { LayoutDashboard, Calculator, PlusCircle, History, FileText, Settings, Home } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'calculator' | 'transactions' | 'history' | 'reports' | 'home_family' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'transactions', label: 'New Entry', icon: PlusCircle, isHighlight: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'home_family', label: 'Home', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-4 z-40 w-full sm:max-w-xl sm:px-4 no-print">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t sm:border border-slate-200/90 dark:border-slate-800/90 px-3 py-1.5 sm:py-2 sm:rounded-3xl shadow-xl sm:shadow-2xl">
        <div className="flex items-center justify-around max-w-md sm:max-w-full mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isHighlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className="flex flex-col items-center justify-center -mt-5 sm:-mt-6 cursor-pointer group focus:outline-hidden"
                >
                  <div
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-100 dark:ring-emerald-950 scale-105'
                        : 'bg-emerald-500 text-white shadow-emerald-500/30 group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-extrabold mt-1 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-3.5 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] sm:text-xs mt-0.5 font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
