import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Auth3DCanvas: React.FC = () => {
  return (
    <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden bg-slate-950 border border-emerald-500/40 shadow-2xl flex items-center justify-center">
      {/* High-Resolution Colored 3D Store Vault Image */}
      <img
        src="/login_3d_vault.png"
        alt="3D Store Cash Vault & Shield"
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />

      {/* Subtle Dark Gradient Overlay for Typography Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Top Left Premium 3D Badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/50 text-[11px] font-extrabold text-emerald-300 flex items-center gap-1.5 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        3D Store Vault Edition
      </div>

      {/* Bottom Floating Badge */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Provision CashFlow Ledger</span>
        </div>
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
          Official 3D Edition
        </span>
      </div>
    </div>
  );
};
