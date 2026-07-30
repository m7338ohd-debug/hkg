import React from 'react';
import { Store, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculateSummary } from '../../utils/calculations';

interface HeaderProps {
  onOpenQuickForm?: (type: string) => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { settings, transactions, toggleDarkMode } = useCashFlow();
  const summary = calculateSummary(transactions, settings.openingCash);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Store Title & Owner */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight tracking-tight">
                {settings.storeName}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Offline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{settings.ownerName}</span>
            </p>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Cash In Hand Pill */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Cash In Hand</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.cashInHand, settings.currency)}
            </span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle Theme"
          >
            {settings.darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
