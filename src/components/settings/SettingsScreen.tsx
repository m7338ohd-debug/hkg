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
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { exportDataJSON, SAMPLE_TRANSACTIONS } from '../../db/storage';
import { formatCurrency } from '../../utils/calculations';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, resetPeriodData, importBackup, showToast, toggleDarkMode, syncNow, isSyncing } = useCashFlow();

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
    <div className="max-w-md mx-auto p-4 pb-24 space-y-5">
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
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> 4-Staff Sync
        </button>
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
          <Trash2 className="w-4 h-4" /> Reset Store Data
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              if (confirm('Reset this week transactions?')) resetPeriodData('weekly');
            }}
            className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 cursor-pointer"
          >
            Reset Weekly Data
          </button>

          <button
            onClick={() => {
              if (confirm('Reset this month transactions?')) resetPeriodData('monthly');
            }}
            className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 cursor-pointer"
          >
            Reset Monthly Data
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('DANGER: This will delete ALL transactions! Are you sure?')) resetPeriodData('all');
          }}
          className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-md hover:bg-rose-700 cursor-pointer transition-all"
        >
          Reset All Data Completely
        </button>
      </div>
    </div>
  );
};
