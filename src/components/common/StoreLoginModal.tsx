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
  Copy,
  Check,
  Share2,
  Zap,
  Radio,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { sanitizeSyncCode, generateShortConnectionCode } from '../../db/cloudSync';

interface StoreLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreLoginModal: React.FC<StoreLoginModalProps> = ({ isOpen, onClose }) => {
  const { settings, loginStore, showToast } = useCashFlow();

  const [activeTab, setActiveTab] = useState<'connect' | 'generate'>('connect');
  const [inputCode, setInputCode] = useState(settings.storeSyncCode || 'AYESHA-STORE-01');
  const [selectedUser, setSelectedUser] = useState(settings.activeUser || 'Owner / Ayesha');
  const [customUser, setCustomUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: 'AYESHA-STORE-01', code: 'AYESHA-STORE-01' },
    { label: 'STORE-8492', code: 'STORE-8492' },
    { label: 'STORE-1234', code: '1234' },
  ];

  const userRoles = [
    { id: 'Owner / Ayesha', label: 'Owner / Ayesha', icon: ShieldCheck },
    { id: 'Mom / Mother', label: 'Mom / Mother', icon: Users },
    { id: 'Employee 1', label: 'Staff Member 1', icon: User },
    { id: 'Employee 2', label: 'Staff Member 2', icon: User },
  ];

  const handleGenerateShortCode = () => {
    const newCode = generateShortConnectionCode(settings.storeName || 'STORE');
    setInputCode(newCode);
    try {
      navigator.clipboard.writeText(newCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      showToast('Connection Code Generated!', `${newCode} copied to clipboard. Enter this code on Device 2.`);
    } catch (e) {
      showToast('Code Generated!', `Connection Code: ${newCode}`);
    }
  };

  const handleCopyCurrentCode = () => {
    try {
      navigator.clipboard.writeText(inputCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      showToast('Code Copied!', `${inputCode} copied to clipboard`);
    } catch (e) {
      showToast('Code Ready', inputCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeSyncCode(inputCode);
    const userName = selectedUser === 'Other' ? customUser.trim() || 'Store Member' : selectedUser;

    if (!cleanCode) {
      showToast('Invalid Code', 'Please enter a store sync connection code', 'error');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Connection Page Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">Device Connection & Data Sync Page</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Connect 2 mobile phones to share and mirror the exact same store data
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-3 text-xs font-extrabold border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('connect')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'connect' ? 'bg-white text-emerald-700 shadow-md' : 'text-emerald-100 hover:text-white'
              }`}
            >
              🔗 Connect via Code
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('generate');
                handleGenerateShortCode();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'generate' ? 'bg-white text-emerald-700 shadow-md' : 'text-emerald-100 hover:text-white'
              }`}
            >
              ⚡ Generate Short Code
            </button>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-slate-800 dark:text-slate-200">
          {/* Info Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 rounded-2xl text-xs space-y-1 text-emerald-900 dark:text-emerald-300">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> Live Data Mirroring Active:
            </p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
              All transactions, home maintenance & daily profit numbers in this device will reflect on the second device automatically in real-time.
            </p>
          </div>

          {/* GENERATE CODE TAB DISPLAY */}
          {activeTab === 'generate' && (
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-500/30 text-center space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Generated Connection Short Code
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                {inputCode}
              </div>
              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCopyCurrentCode}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'COPIED!' : 'Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateShortCode}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> New Code
                </button>
              </div>
            </div>
          )}

          {/* Store Code Input Placeholder */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Short Connection Code
              </label>
              <button
                type="button"
                onClick={handleGenerateShortCode}
                className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" /> Generate Code
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Type connection code e.g. STORE-8492"
                className="w-full px-3.5 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500 tracking-wider"
              />
              <button
                type="button"
                onClick={handleCopyCurrentCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-500 cursor-pointer"
                title="Copy Connection Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Quick Connection Presets</span>
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

          {/* User Role Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Who is operating this mobile phone?
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

          {/* Connect Action Button */}
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
            {isSubmitting ? 'CONNECTING & MIRRORING DATA...' : 'CONNECT BOTH DEVICES & MIRROR DATA'}
          </button>
        </form>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
          Connected devices auto-mirror transactions, home maintenance & profits live.
        </div>
      </div>
    </div>
  );
};
