import React from 'react';
import { Store, Moon, Sun, RefreshCw, Radio } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculateSummary } from '../../utils/calculations';

interface HeaderProps {
  onOpenQuickForm?: (type: string) => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { settings, transactions, toggleDarkMode, isSyncing, syncNow } = useCashFlow();
  const summary = calculateSummary(transactions, settings);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Store Title & Owner */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight truncate max-w-[140px] sm:max-w-xs">
                {settings.storeName}
              </h1>
              <button
                onClick={syncNow}
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-200 cursor-pointer transition-all"
                title="Tap to sync across 4 mobile devices"
              >
                <Radio className={`w-3 h-3 text-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
                <span>4-Staff Sync</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{settings.ownerName}</span>
            </p>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sync Button */}
          <button
            onClick={syncNow}
            className={`p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
              isSyncing ? 'animate-spin text-emerald-500' : ''
            }`}
            title="Sync store data with team"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Quick Invested Amount Pill */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Invested Capital</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(settings.investedAmount || 25000, settings.currency)}
            </span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle Theme"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
