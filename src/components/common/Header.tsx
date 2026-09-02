import React from 'react';
import { Store, Moon, Sun, RefreshCw, Radio, Smartphone, LogIn, UserCheck, LogOut } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency } from '../../utils/calculations';

interface HeaderProps {
  onOpenQuickForm?: (type: string) => void;
  onOpenDownloadApp?: () => void;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDownloadApp, onOpenLoginModal }) => {
  const { settings, toggleDarkMode, isSyncing, syncNow, logoutStore } = useCashFlow();

  const activeUserLabel = settings.activeUser || 'Owner / Ayesha';
  const syncCodeLabel = settings.storeSyncCode || 'AYESHA-STORE-01';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2.5 shadow-xs safe-top-padding">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Store Title & Owner */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight truncate max-w-[130px] sm:max-w-xs">
                {settings.storeName}
              </h1>
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-200 cursor-pointer transition-all"
                title="Active Store Login Session - Tap to manage"
              >
                <UserCheck className="w-3 h-3 text-emerald-500" />
                <span className="truncate max-w-[90px]">{activeUserLabel}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Code: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{syncCodeLabel}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Device Live Connected" />
            </p>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile App Download Button */}
          {onOpenDownloadApp && (
            <button
              onClick={onOpenDownloadApp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
              title="Download & Install Mobile App"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">App</span>
            </button>
          )}

          {/* Store Login / Switch Button */}
          {onOpenLoginModal && (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-extrabold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all"
              title="Store Login & Sync Settings"
            >
              <LogIn className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Store Login</span>
            </button>
          )}

          {/* Prominent Logout Button */}
          <button
            onClick={logoutStore}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800/80 font-black text-xs cursor-pointer active:scale-95 transition-all"
            title="Logout of Store Session"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Quick Sync Button */}
          <button
            onClick={syncNow}
            className={`p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
              isSyncing ? 'animate-spin text-emerald-500' : ''
            }`}
            title="Sync store data with cloud"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

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
