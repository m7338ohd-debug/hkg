import React, { useState } from 'react';
import { Store, Moon, Sun, RefreshCw, Radio, Smartphone, UserCheck, LogOut, Settings, MoreVertical, X } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';

interface HeaderProps {
  onOpenQuickForm?: (type: string) => void;
  onOpenDownloadApp?: () => void;
  onOpenLoginModal?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDownloadApp, onOpenLoginModal, onOpenSettings }) => {
  const { settings, toggleDarkMode, isSyncing, syncNow, logoutStore } = useCashFlow();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeUserLabel = settings.activeUser || 'Owner / Ayesha';
  const syncCodeLabel = settings.storeSyncCode || 'AYESHA-STORE-01';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 shadow-xs safe-top-padding w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 w-full relative">
        {/* Store Title & Owner - Clickable to open Settings */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onOpenSettings}
            className="group flex items-center gap-2 text-left cursor-pointer focus:outline-hidden active:scale-95 transition-transform min-w-0"
            title="Click to Open Store Settings"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -bottom-1 -right-1 bg-slate-900 text-emerald-400 p-0.5 rounded-full border border-slate-700 shadow-xs" title="Settings">
                <Settings className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-base leading-tight tracking-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {settings.storeName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  <UserCheck className="w-3 h-3 text-emerald-500" />
                  <span className="truncate max-w-[90px]">{activeUserLabel}</span>
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold truncate max-w-[110px] sm:max-w-[180px]">{syncCodeLabel}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Device Live Connected" />
              </p>
            </div>
          </button>
        </div>

        {/* Right 3-Dots Vertical Menu Trigger */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              isMenuOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="More Options"
            aria-label="More Options Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
          </button>

          {/* Vertical Dropdown Action List */}
          {isMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
                onClick={() => setIsMenuOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Store Quick Menu</span>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> {activeUserLabel}
                  </span>
                </div>

                {/* Connect Devices */}
                {onOpenLoginModal && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>Connect Devices</span>
                  </button>
                )}

                {/* Download / Install App */}
                {onOpenDownloadApp && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDownloadApp();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-teal-500" />
                    <span>Install Mobile App</span>
                  </button>
                )}

                {/* Quick Cloud Sync */}
                <button
                  onClick={() => {
                    syncNow();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud Data</span>
                </button>

                {/* Toggle Dark / Light Theme */}
                <button
                  onClick={() => {
                    toggleDarkMode();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                >
                  {settings.darkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Store Settings */}
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-purple-500" />
                    <span>Store Settings</span>
                  </button>
                )}

                {/* Logout Button */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutStore();
                    }}
                    className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 font-extrabold text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout Store</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
