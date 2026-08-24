import React, { useState } from 'react';
import {
  LogIn,
  KeyRound,
  User,
  X,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { sanitizeSyncCode } from '../../db/cloudSync';

interface StoreLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreLoginModal: React.FC<StoreLoginModalProps> = ({ isOpen, onClose }) => {
  const { settings, loginStore, showToast } = useCashFlow();

  const [inputCode, setInputCode] = useState(settings.storeSyncCode || 'AYESHA-STORE-01');
  const [selectedUser, setSelectedUser] = useState(settings.activeUser || 'Owner / Ayesha');
  const [customUser, setCustomUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: 'AYESHA-STORE-01', code: 'AYESHA-STORE-01' },
    { label: 'Store PIN 1234', code: '1234' },
    { label: 'Store PIN 5678', code: '5678' },
  ];

  const userRoles = [
    { id: 'Owner / Ayesha', label: 'Owner / Ayesha', icon: ShieldCheck },
    { id: 'Mom / Mother', label: 'Mom / Mother', icon: Users },
    { id: 'Employee 1', label: 'Staff Member 1', icon: User },
    { id: 'Employee 2', label: 'Staff Member 2', icon: User },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeSyncCode(inputCode);
    const userName = selectedUser === 'Other' ? customUser.trim() || 'Store Member' : selectedUser;

    if (!cleanCode) {
      showToast('Invalid Code', 'Please enter a store sync code or PIN', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = await loginStore(cleanCode, userName);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Store Mobile Login</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Log in to sync all store data across your mobile & mom's mobile
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-slate-800 dark:text-slate-200">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3.5 rounded-2xl text-xs space-y-1 text-emerald-900 dark:text-emerald-300">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Instant Cross-Mobile Mirroring:
            </p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
              Entering the same Store Code/PIN on your mobile phone and your mom's phone binds both devices together. All sales, daily profits & expenses will update live on both screens!
            </p>
          </div>

          {/* Store Code / PIN Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Store Sync Code / PIN
            </label>
            <input
              type="text"
              required
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. AYESHA-STORE-01 or 1234"
              className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500 tracking-wider"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setInputCode(p.code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    inputCode === p.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select User Profile */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Who is using this mobile phone?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {userRoles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedUser === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedUser(role.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="truncate">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isSubmitting ? 'CONNECTING & SYNCING...' : 'LOG IN & SYNC MOBILE'}
          </button>
        </form>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
          Logged in data auto-syncs live every 1.5 seconds between phones.
        </div>
      </div>
    </div>
  );
};
