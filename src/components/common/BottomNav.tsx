import React from 'react';
import { LayoutDashboard, Calculator, PlusCircle, History, FileText, Settings } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'calculator' | 'transactions' | 'history' | 'reports' | 'settings';

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
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 no-print shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className="flex flex-col items-center justify-center -mt-5 cursor-pointer group focus:outline-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : 'bg-emerald-500 text-white shadow-emerald-500/30 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
