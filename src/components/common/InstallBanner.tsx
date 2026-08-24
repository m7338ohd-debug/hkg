import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallBannerProps {
  onOpenModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('hkg_pwa_banner_dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  if (isInstalled || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    localStorage.setItem('hkg_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-3 right-3 sm:left-auto sm:right-6 z-30 sm:max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div
        onClick={onOpenModal}
        className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer group hover:border-emerald-400 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-extrabold text-white leading-tight">Install Mobile App</h4>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> 1-Tap Access
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Run 100% offline on your Android or iPhone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInstallClick();
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
