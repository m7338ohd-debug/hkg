import React, { useState, useRef } from 'react';
import {
  Store,
  User,
  DollarSign,
  Wallet,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Database,
  FileJson,
  ShieldCheck,
  Sparkles,
  Smartphone,
  QrCode,
  X,
  Radio,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { exportDataJSON, SAMPLE_TRANSACTIONS } from '../../db/storage';
import { generateShortConnectionCode } from '../../db/cloudSync';
import { formatCurrency } from '../../utils/calculations';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface SettingsScreenProps {
  onOpenDownloadApp?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onOpenDownloadApp }) => {
  const { settings, updateSettings, resetPeriodData, importBackup, showToast, toggleDarkMode, syncNow, isSyncing, logoutStore } = useCashFlow();
  const { isInstalled } = usePWAInstall();

  const [confirmResetTarget, setConfirmResetTarget] = useState<'weekly' | 'monthly' | 'all' | null>(null);
  const [connectCodeInput, setConnectCodeInput] = useState('');

  const [storeName, setStoreName] = useState(settings.storeName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currency, setCurrency] = useState(settings.currency);
  const [openingCash, setOpeningCash] = useState(settings.openingCash.toString());
  const [investedAmount, setInvestedAmount] = useState((settings.investedAmount || 25000).toString());
  const [profitRate, setProfitRate] = useState((settings.profitRate || 2).toString());
  const [storeSyncCode, setStoreSyncCode] = useState(settings.storeSyncCode || 'AYESHA-STORE-01');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const numOpening = parseFloat(openingCash);
    const numInvested = parseFloat(investedAmount);
    const numRate = parseFloat(profitRate);

    updateSettings({
      storeName: storeName.trim() || 'Provision Store',
      ownerName: ownerName.trim() || 'Store Owner',
      currency: currency.trim() || '₹',
      openingCash: isNaN(numOpening) ? 0 : numOpening,
      investedAmount: isNaN(numInvested) ? 25000 : numInvested,
      profitRate: isNaN(numRate) ? 2 : numRate,
      storeSyncCode: storeSyncCode.trim() || 'AYESHA-STORE-01',
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provision_store_cashflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateSettings({ lastBackupDate: new Date().toISOString() });
    showToast('Backup Generated', 'JSON file saved to your device downloads');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSampleData = () => {
    if (confirm('Load sample provision store transactions? This will pre-fill realistic store sales.')) {
      importBackup(
        JSON.stringify({
          settings,
          transactions: SAMPLE_TRANSACTIONS,
        })
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 pb-28 space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Store Settings</h2>
            <p className="text-xs text-slate-400">Configure profile, 2% profit, 25k investment & cloud sync</p>
          </div>
        </div>

        <button
          onClick={syncNow}
          className={`flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 cursor-pointer border border-emerald-500/30 ${
            isSyncing ? 'animate-pulse' : ''
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync
        </button>
      </div>

      {/* Mobile Device Identity & Auth Session Card */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 p-4 rounded-3xl text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-xs text-emerald-300 uppercase tracking-wider">Active Device Session</h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Authenticated ✓
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Active User Profile</span>
            <span className="font-bold text-white truncate block">{settings.activeUser || 'Owner'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Store Sync Code</span>
            <span className="font-mono font-bold text-amber-400 truncate block">{settings.storeSyncCode}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Mobile Device ID</span>
            <span className="font-mono text-[10px] text-emerald-400 truncate block">{settings.deviceId || 'mob_active'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Screen Spec</span>
            <span className="text-[10px] text-slate-300 truncate block">{settings.deviceFingerprint || 'Mobile Viewport'}</span>
          </div>
        </div>

        <button
          onClick={logoutStore}
          className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-extrabold text-xs cursor-pointer transition-all active:scale-98"
        >
          Switch Account / Logout Device
        </button>
      </div>

      {/* MULTI-DEVICE CONNECTION PAGE CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 rounded-3xl shadow-xl border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Multi-Device Connection Page</h3>
              <p className="text-xs text-emerald-200">Connect 2 mobile phones to share and mirror exact same store data</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
              Active Connection Code:
            </span>
            <span className="font-mono font-black text-amber-400 text-sm sm:text-base">
              {settings.storeSyncCode}
            </span>
          </div>

          {/* Buttons: Generate Short Code & Copy */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                const newCode = generateShortConnectionCode(settings.storeName);
                setStoreSyncCode(newCode);
                await logoutStore(); // re-log into new code
                try {
                  await navigator.clipboard.writeText(newCode);
                } catch (e) {}
                showToast('Short Connection Code Generated!', `${newCode} active & copied to clipboard. Enter this code on Device 2.`);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" /> Generate Short Code
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(settings.storeSyncCode);
                } catch (e) {}
                showToast('Code Copied!', `${settings.storeSyncCode} copied to clipboard`);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        </div>

        {/* Connection Code Input Placeholder for Device 2 */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-300 block">
            Enter Code to Connect Device 2 to Device 1:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={connectCodeInput}
              onChange={(e) => setConnectCodeInput(e.target.value.toUpperCase())}
              placeholder="Type connection code e.g. STORE-8492"
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-black text-white uppercase focus:ring-2 focus:ring-emerald-500 tracking-wider"
            />
            <button
              type="button"
              onClick={async () => {
                if (!connectCodeInput.trim()) return;
                await logoutStore();
                setConnectCodeInput('');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
            >
              Connect
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Entering the same short code on both mobile phones mirrors all sales, home goods & daily profits live between both screens.
          </p>
        </div>
      </div>

      {/* Store Profile Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
          Store Profile & Investment Capital
        </h3>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Store Name</label>
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Owner Name</label>
          <input
            type="text"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Invested Amount ({currency})
            </label>
            <input
              type="number"
              step="any"
              required
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              placeholder="25000"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Profit Rate (%)
            </label>
            <input
              type="number"
              step="any"
              required
              value={profitRate}
              onChange={(e) => setProfitRate(e.target.value)}
              placeholder="2"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Currency Symbol</label>
            <input
              type="text"
              required
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="₹"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Opening Cash ({currency})</label>
            <input
              type="number"
              step="any"
              required
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            4-Staff Store Sync Code (For Vercel Multi-Mobile Sync)
          </label>
          <input
            type="text"
            required
            value={storeSyncCode}
            onChange={(e) => setStoreSyncCode(e.target.value)}
            placeholder="AYESHA-STORE-01"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">All 4 store staff members entering data on their mobiles should use this same sync code.</p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
        >
          SAVE STORE PROFILE
        </button>
      </form>

      {/* Theme & Display Options */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
          Display & Appearance
        </h3>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            {settings.darkMode ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Dark Mode</h4>
              <p className="text-[10px] text-slate-400">Saves mobile battery life</p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              settings.darkMode ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile App Download & PWA Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                Mobile App Download
                {isInstalled && (
                  <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    Installed ✓
                  </span>
                )}
              </h3>
              <p className="text-xs text-emerald-200/80">Android APK, iOS Web App & QR Code</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          Install the 100% offline Provision Cash Flow app on your mobile phone. Access your store ledger with 1 tap from your home screen.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onOpenDownloadApp}
            className="py-3 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Download App
          </button>

          <button
            onClick={onOpenDownloadApp}
            className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 transition-all"
          >
            <QrCode className="w-4 h-4" /> Scan QR Code
          </button>
        </div>
      </div>

      {/* One-Click Backup & Restore Section */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            Backup & Restore Data
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">JSON Format</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Save your complete store ledger to your phone or restore an existing backup file instantly.
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-3 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" /> Download Backup
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" /> Restore Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Load Sample Data Button */}
        <button
          onClick={handleLoadSampleData}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Load Sample Provision Store Data
        </button>
      </div>

      {/* Danger Zone - Reset Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-3">
        <h3 className="font-extrabold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Reset Store & Home Data
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setConfirmResetTarget('weekly')}
            className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 cursor-pointer"
          >
            Reset Weekly Data
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetTarget('monthly')}
            className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 cursor-pointer"
          >
            Reset Monthly Data
          </button>
        </div>

        <button
          type="button"
          onClick={() => setConfirmResetTarget('all')}
          className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-md hover:bg-rose-700 cursor-pointer transition-all"
        >
          Reset All Store & Home Data Completely
        </button>
      </div>

      {/* Custom Confirmation Modal for Data Reset */}
      {confirmResetTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-rose-200 dark:border-rose-900 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Confirm Data Reset
              </h3>
              <button
                type="button"
                onClick={() => setConfirmResetTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {confirmResetTarget === 'all'
                  ? 'Delete ALL Store & Home Records?'
                  : confirmResetTarget === 'weekly'
                  ? 'Reset This Week Data?'
                  : 'Reset This Month Data?'}
              </p>
              <p>
                {confirmResetTarget === 'all'
                  ? 'This action will permanently delete all store transactions, home maintenance expenses, family member income, and manual profit overrides.'
                  : confirmResetTarget === 'weekly'
                  ? 'This action will permanently clear store transactions, home maintenance, and family records logged during this week.'
                  : 'This action will permanently clear store transactions, home maintenance, and family records logged during this month.'}
              </p>
              <p className="text-[11px] text-rose-500 font-bold">This operation cannot be undone!</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmResetTarget;
                  setConfirmResetTarget(null);
                  resetPeriodData(target);
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-rose-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
