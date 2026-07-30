import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';

export const Toast: React.FC = () => {
  const { toast, hideToast, undoDelete } = useCashFlow();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between p-3.5 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
        <div className="flex items-start gap-3">
          {icons[toast.type]}
          <div>
            <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
            {toast.message && <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          {toast.undoable && (
            <button
              onClick={() => {
                undoDelete();
                hideToast();
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          )}

          <button
            onClick={hideToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
