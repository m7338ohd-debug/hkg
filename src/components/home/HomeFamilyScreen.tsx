import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  PlusCircle,
  Trash2,
  X,
  CheckCircle2,
  Wrench,
  Briefcase,
  CalendarCheck,
  Check,
  Plus,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, getTodayDateString, formatDateDisplay } from '../../utils/calculations';
import type { HomeMaintenanceEntry, FamilyIncomeEntry, FixedMonthlyExpenseEntry, InvestmentRecord } from '../../types';
import { loadInvestmentRecords, saveInvestmentRecords } from '../../db/storage';

export const HomeFamilyScreen: React.FC = () => {
  const {
    homeMaintenanceList,
    familyIncomeList,
    fixedMonthlyList,
    addHomeMaintenance,
    deleteHomeMaintenance,
    addFamilyIncome,
    deleteFamilyIncome,
    addFixedMonthlyExpense,
    deleteFixedMonthlyExpense,
    settings,
    showToast,
  } = useCashFlow();

  const [activeTab, setActiveTab] = useState<'maintenance' | 'fixed_monthly' | 'earnings'>('maintenance');

  // Investment & Profit Predictor Persistent State (Standalone - Not linked to daily sales)
  const [investmentRecords, setInvestmentRecords] = useState<InvestmentRecord[]>(() => loadInvestmentRecords());
  const [investTitle, setInvestTitle] = useState<string>('');
  const [investCapital, setInvestCapital] = useState<string>('50000');
  const [investProfitMode, setInvestProfitMode] = useState<'percent' | 'amount'>('percent');
  const [investProfitInput, setInvestProfitInput] = useState<string>('15');
  const [investNotes, setInvestNotes] = useState<string>('');

  useEffect(() => {
    saveInvestmentRecords(investmentRecords);
  }, [investmentRecords]);

  // Modals
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);

  // Daily Maintenance Form State
  const [mCategory, setMCategory] = useState<HomeMaintenanceEntry['category']>('Groceries & Milk');
  const [mAmount, setMAmount] = useState<string>('');
  const [mNotes, setMNotes] = useState<string>('');
  const [mDate, setMDate] = useState<string>(getTodayDateString());

  // Fixed Monthly Commitment Form State
  const [fTitle, setFTitle] = useState<string>('');
  const [fAmount, setFAmount] = useState<string>('');
  const [fCategory, setFCategory] = useState<NonNullable<FixedMonthlyExpenseEntry['category']>>('Maid / Domestic');
  const [fNotes, setFNotes] = useState<string>('');

  // Family Income Form State
  const [iMember, setIMember] = useState<FamilyIncomeEntry['memberName']>('Father');
  const [iSource, setISource] = useState<FamilyIncomeEntry['incomeSource']>('Salary / Job');
  const [iAmount, setIAmount] = useState<string>('');
  const [iNotes, setINotes] = useState<string>('');
  const [iDate, setIDate] = useState<string>(getTodayDateString());

  // Daily Maintenance Spent
  const totalMaintenanceSpent = homeMaintenanceList.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedMonthlyRequired = fixedMonthlyList.reduce((sum, item) => sum + item.amount, 0);
  const totalFamilyIncome = familyIncomeList.reduce((sum, item) => sum + item.amount, 0);

  // Investment Predictor Math & Actions
  const numCapital = parseFloat(investCapital) || 0;
  const numProfitVal = parseFloat(investProfitInput) || 0;
  const computedPredictedProfit =
    investProfitMode === 'percent'
      ? (numCapital * numProfitVal) / 100
      : numProfitVal;
  const computedTotalReturn = numCapital + computedPredictedProfit;
  const computedRoiPercent =
    numCapital > 0
      ? investProfitMode === 'percent'
        ? numProfitVal
        : ((numProfitVal / numCapital) * 100)
      : 0;

  const handleAddInvestmentRecord = () => {
    if (numCapital <= 0) {
      showToast('Invalid Capital', 'Please enter a valid investment capital amount', 'error');
      return;
    }

    const newRecord: InvestmentRecord = {
      id: `inv_${Date.now()}`,
      title: investTitle.trim() || `Investment Capital ${investmentRecords.length + 1}`,
      capital: numCapital,
      profitMode: investProfitMode,
      profitValue: numProfitVal,
      predictedProfit: computedPredictedProfit,
      totalReturn: computedTotalReturn,
      status: 'active',
      date: getTodayDateString(),
      notes: investNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    setInvestmentRecords((prev) => [newRecord, ...prev]);
    setInvestTitle('');
    setInvestNotes('');
    showToast('Investment Recorded', `Saved ${formatCurrency(numCapital, settings.currency)} capital record`);
  };

  const handleToggleInvestmentStatus = (id: string) => {
    setInvestmentRecords((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: rec.status === 'active' ? 'completed' : 'active' } : rec
      )
    );
  };

  const handleDeleteInvestmentRecord = (id: string) => {
    setInvestmentRecords((prev) => prev.filter((rec) => rec.id !== id));
    showToast('Record Deleted', 'Investment entry removed');
  };

  const activeInvestmentsTotal = investmentRecords
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + r.capital, 0);

  const activeProfitTotal = investmentRecords
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + r.predictedProfit, 0);

  const completedInvestmentsTotal = investmentRecords
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.totalReturn, 0);

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(mAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addHomeMaintenance({
      date: mDate,
      category: mCategory,
      amount: numAmount,
      notes: mNotes.trim() || undefined,
      addedBy: settings.activeUser || 'Owner',
    });

    setMAmount('');
    setMNotes('');
    setIsMaintenanceModalOpen(false);
  };

  const handleFixedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(fAmount);
    if (isNaN(numAmount) || numAmount <= 0 || !fTitle.trim()) return;

    addFixedMonthlyExpense({
      title: fTitle.trim(),
      amount: numAmount,
      category: fCategory,
      notes: fNotes.trim() || undefined,
    });

    setFTitle('');
    setFAmount('');
    setFNotes('');
    setIsFixedModalOpen(false);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(iAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addFamilyIncome({
      date: iDate,
      memberName: iMember,
      incomeSource: iSource,
      amount: numAmount,
      notes: iNotes.trim() || undefined,
    });

    setIAmount('');
    setINotes('');
    setIsIncomeModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 pb-28 space-y-5 overflow-x-hidden">
      {/* Top Header & Overview Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-indigo-500/30 space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col gap-2.5 pb-3 border-b border-indigo-500/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/40 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate">Home Expenses & Family Manager</h2>
              <p className="text-[11px] text-indigo-200 truncate">Daily goods usage, fixed monthly commitments & family earnings</p>
            </div>
          </div>

          {/* Action Buttons Grid (3-Column Mobile Fit) */}
          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="py-2.5 px-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-[11px] shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Daily Use</span>
            </button>
            <button
              onClick={() => setIsFixedModalOpen(true)}
              className="py-2.5 px-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-extrabold text-[11px] shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Fixed (Maid/Rent)</span>
            </button>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="py-2.5 px-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-[11px] shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 min-w-0"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">+ Income</span>
            </button>
          </div>
        </div>

        {/* 3-Column Summary Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1 min-w-0">
            <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-wider block truncate">
              Daily Goods Spent
            </span>
            <div className="text-base sm:text-xl font-black text-emerald-400 font-mono truncate">
              {formatCurrency(totalMaintenanceSpent, settings.currency)}
            </div>
            <span className="text-[9px] text-slate-400 block truncate">{homeMaintenanceList.length} daily items</span>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1 min-w-0">
            <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-wider block truncate">
              Fixed Monthly Commitments
            </span>
            <div className="text-base sm:text-xl font-black text-amber-400 font-mono truncate">
              {formatCurrency(totalFixedMonthlyRequired, settings.currency)}
            </div>
            <span className="text-[9px] text-slate-400 block truncate">{fixedMonthlyList.length} fixed items</span>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1 min-w-0">
            <span className="text-[9px] font-extrabold text-purple-300 uppercase tracking-wider block truncate">
              Family Earnings
            </span>
            <div className="text-base sm:text-xl font-black text-purple-400 font-mono truncate">
              {formatCurrency(totalFamilyIncome, settings.currency)}
            </div>
            <span className="text-[9px] text-slate-400 block truncate">{familyIncomeList.length} earnings</span>
          </div>
        </div>
      </div>

      {/* STANDALONE INVESTMENT CAPITAL & PROFIT RECORD TRACKER CARD */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-blue-500/30 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                Investment Capital & Profit Tracker
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono">
                  Standalone Records ({investmentRecords.length})
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Independent capital investment, percentage/amount profit & completion records</p>
            </div>
          </div>
        </div>

        {/* Live Capital Summary Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Capital</span>
            <span className="text-sm sm:text-base font-black text-blue-400 font-mono block mt-0.5">
              {formatCurrency(activeInvestmentsTotal, settings.currency)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Predicted Profit</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block mt-0.5">
              {formatCurrency(activeProfitTotal, settings.currency)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Completed Capital</span>
            <span className="text-sm sm:text-base font-black text-purple-400 font-mono block mt-0.5">
              {formatCurrency(completedInvestmentsTotal, settings.currency)}
            </span>
          </div>
        </div>

        {/* Calculator & New Record Form */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-300">
              ⚡ Add New Investment Capital & Target Profit
            </span>
            {/* Profit Mode Switcher: % Percentage vs ₹ Fixed Amount */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
              <button
                type="button"
                onClick={() => setInvestProfitMode('percent')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  investProfitMode === 'percent'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => setInvestProfitMode('amount')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  investProfitMode === 'amount'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {settings.currency} Fixed Amount
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Investment Title / Purpose
              </label>
              <input
                type="text"
                value={investTitle}
                onChange={(e) => setInvestTitle(e.target.value)}
                placeholder="e.g. Stock Purchase, Shop Upgrade"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Investment Capital Amount ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                value={investCapital}
                onChange={(e) => setInvestCapital(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-blue-400 font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                {investProfitMode === 'percent'
                  ? 'Target Profit Rate (%)'
                  : `Target Profit Amount (${settings.currency})`}
              </label>
              <input
                type="number"
                step="any"
                value={investProfitInput}
                onChange={(e) => setInvestProfitInput(e.target.value)}
                placeholder={investProfitMode === 'percent' ? 'e.g. 15' : 'e.g. 7500'}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-emerald-400 font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Investment Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={investNotes}
                onChange={(e) => setInvestNotes(e.target.value)}
                placeholder="e.g. Expected return in 30 days"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Live Calculation Preview & Save Button */}
          <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Predicted Profit:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">
                  +{formatCurrency(computedPredictedProfit, settings.currency)} ({computedRoiPercent.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Projected Total Return:</span>
                <span className="font-mono text-blue-300 font-black text-sm">
                  {formatCurrency(computedTotalReturn, settings.currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddInvestmentRecord}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> SAVE INVESTMENT RECORD
            </button>
          </div>
        </div>

        {/* Investment Records Table / Cards List */}
        {investmentRecords.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              📋 Recorded Standalone Investments ({investmentRecords.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {investmentRecords.map((rec) => {
                const isCompleted = rec.status === 'completed';
                return (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isCompleted
                        ? 'bg-slate-900/90 border-slate-700/80 opacity-80'
                        : 'bg-slate-800/90 border-blue-500/40 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              isCompleted
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {isCompleted ? '✓ Completed / Capital Taken' : '⏳ Active Investment'}
                          </span>
                          <span className="text-[9px] text-slate-400">{formatDateDisplay(rec.date)}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-white mt-1">{rec.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDeleteInvestmentRecord(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-700/40 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Capital Invested</span>
                        <span className="font-mono font-black text-blue-400 text-xs">
                          {formatCurrency(rec.capital, settings.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">
                          Predicted Profit ({rec.profitMode === 'percent' ? `${rec.profitValue}%` : 'Fixed'})
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-xs">
                          +{formatCurrency(rec.predictedProfit, settings.currency)}
                        </span>
                      </div>
                    </div>

                    {rec.notes && <p className="text-[10px] text-slate-400 italic">"{rec.notes}"</p>}

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-bold">
                        Total Projected Return: <strong className="text-white font-mono">{formatCurrency(rec.totalReturn, settings.currency)}</strong>
                      </span>

                      <button
                        onClick={() => handleToggleInvestmentStatus(rec.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {isCompleted ? 'Reopen Active' : 'Mark Completed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section Switcher Tabs */}
      <div className="grid grid-cols-3 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
            activeTab === 'maintenance'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Daily Goods (3D)</span>
        </button>
        <button
          onClick={() => setActiveTab('fixed_monthly')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
            activeTab === 'fixed_monthly'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Fixed Monthly Record</span>
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0 ${
            activeTab === 'earnings'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Family Income (3D)</span>
        </button>
      </div>

      {/* TAB 1: DAILY HOME USAGE & GOODS MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-500" />
              Daily Household Usage & Goods ({homeMaintenanceList.length})
            </h3>
            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + Add Daily Usage
            </button>
          </div>

          {homeMaintenanceList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Home className="w-7 h-7 mx-auto text-slate-400" />
              <p className="font-bold text-xs">No Daily Home Entries Recorded</p>
              <p className="text-[11px] text-slate-400">Click "+ Daily Use" to add daily groceries, milk or house usage goods.</p>
            </div>
          ) : (
            <>
              {/* SECTION A: FEATURED 3D CUBIC CARDS FOR AMOUNT > ₹1,000 */}
              {homeMaintenanceList.filter((item) => item.amount > 1000).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-500 block px-1">
                    🌟 Featured 3D Cubic Cards (Major Expenses &gt; ₹1,000)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {homeMaintenanceList
                      .filter((item) => item.amount > 1000)
                      .map((item) => {
                        const getCategoryStyle = (cat: string) => {
                          switch (cat) {
                            case 'Groceries & Milk':
                              return 'from-emerald-600 to-teal-800 border-emerald-400/60 shadow-xl shadow-emerald-950/40';
                            case 'Repairs & Fixes':
                              return 'from-amber-600 to-orange-800 border-amber-400/60 shadow-xl shadow-amber-950/40';
                            case 'Utility Bills':
                              return 'from-blue-600 to-indigo-800 border-blue-400/60 shadow-xl shadow-blue-950/40';
                            case 'Medical & Health':
                              return 'from-rose-600 to-pink-800 border-rose-400/60 shadow-xl shadow-rose-950/40';
                            default:
                              return 'from-purple-600 to-indigo-800 border-purple-400/60 shadow-xl shadow-purple-950/40';
                          }
                        };

                        return (
                          <div
                            key={item.id}
                            className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${getCategoryStyle(
                              item.category
                            )} border text-white flex flex-col justify-between space-y-2 transition-transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
                          >
                            <div className="flex items-start justify-between relative z-10">
                              <div>
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-black/40 border border-white/20 inline-block mb-1">
                                  {item.category}
                                </span>
                                <h4 className="font-extrabold text-xs text-white line-clamp-1">
                                  {item.notes || item.category}
                                </h4>
                                <span className="text-[9px] text-white/70 block">{formatDateDisplay(item.date)}</span>
                              </div>

                              <button
                                onClick={() => deleteHomeMaintenance(item.id)}
                                className="p-1 bg-black/20 hover:bg-rose-600 text-white/80 hover:text-white rounded-lg cursor-pointer transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="pt-1.5 border-t border-white/20 flex justify-between items-end relative z-10">
                              <span className="text-[9px] uppercase font-bold text-white/70">Amount</span>
                              <span className="text-base font-black text-white font-mono tracking-tight">
                                {formatCurrency(item.amount, settings.currency)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* SECTION B: MEDIUM 3D CARDS FOR AMOUNT BETWEEN ₹100 AND ₹1,000 */}
              {homeMaintenanceList.filter((item) => item.amount >= 100 && item.amount <= 1000).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 block px-1">
                    📦 3D Usage Cards (₹100 to ₹1,000)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {homeMaintenanceList
                      .filter((item) => item.amount >= 100 && item.amount <= 1000)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-3 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col justify-between space-y-1.5"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-500/30 truncate max-w-[100px]">
                              {item.category}
                            </span>
                            <button
                              onClick={() => deleteHomeMaintenance(item.id)}
                              className="text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <h5 className="font-bold text-xs text-white truncate">{item.notes || item.category}</h5>

                          <div className="flex justify-between items-end pt-1 border-t border-slate-700/60 text-xs">
                            <span className="text-[9px] text-slate-400">{formatDateDisplay(item.date)}</span>
                            <span className="font-black text-emerald-400 font-mono">
                              {formatCurrency(item.amount, settings.currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SECTION C: COMPACT MANUAL ENTRIES FOR AMOUNT < ₹100 */}
              {homeMaintenanceList.filter((item) => item.amount < 100).length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
                    📋 Manual Small Goods Entries (&lt; ₹100)
                  </span>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {homeMaintenanceList
                      .filter((item) => item.amount < 100)
                      .map((item) => (
                        <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {item.category}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {item.notes || item.category}
                              </h5>
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {formatDateDisplay(item.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                              {formatCurrency(item.amount, settings.currency)}
                            </span>
                            <button
                              onClick={() => deleteHomeMaintenance(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: FIXED MONTHLY REQUIREMENTS RECORD (MAID SALARY / MEEI, RENT, COMMITMENTS) */}
      {activeTab === 'fixed_monthly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                Fixed Monthly Requirements ({fixedMonthlyList.length})
              </h3>
              <p className="text-[10px] text-slate-400">Fixed commitments required for the month (Maid salary, Rent, etc.) maintained separately</p>
            </div>
            <button
              onClick={() => setIsFixedModalOpen(true)}
              className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer shrink-0"
            >
              + Add Fixed Record
            </button>
          </div>

          {fixedMonthlyList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CalendarCheck className="w-7 h-7 mx-auto text-amber-500" />
              <p className="font-bold text-xs">No Fixed Monthly Requirements Added</p>
              <p className="text-[11px] text-slate-400">Click "+ Fixed (Maid/Rent)" to add maid salary (meei), house rent, or fixed monthly commitments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fixedMonthlyList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                        {item.category || 'Fixed Commitment'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                    </div>
                    {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{item.notes}"</p>}
                    <span className="text-[10px] text-slate-400 block">Required Monthly Commitment</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                    <button
                      onClick={() => deleteFixedMonthlyExpense(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FAMILY MEMBER EARNINGS - CIRCLE CARDS */}
      {activeTab === 'earnings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Monthly Family Income ({familyIncomeList.length})
            </h3>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              + Add Family Income
            </button>
          </div>

          {familyIncomeList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-7 h-7 mx-auto text-slate-400" />
              <p className="font-bold text-xs">No Family Member Income Recorded</p>
              <p className="text-[11px] text-slate-400">Click "+ Income" to log Father, Mother or Pension contribution.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
              {familyIncomeList.map((item) => (
                <div
                  key={item.id}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 p-2.5 border-2 border-purple-400/60 shadow-lg shadow-purple-950/40 flex flex-col items-center justify-center text-center text-white relative group transition-all hover:scale-105 cursor-default overflow-hidden shrink-0"
                >
                  <button
                    onClick={() => deleteFamilyIncome(item.id)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-all cursor-pointer shadow-md z-20"
                    title="Delete Record"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>

                  <span className="text-[8px] font-black uppercase text-purple-300 bg-purple-950/90 px-2 py-0.5 rounded-full border border-purple-500/40 z-10 truncate max-w-[72px] mt-1">
                    {item.memberName}
                  </span>

                  <div className="text-xs font-black text-amber-300 font-mono tracking-tight my-0.5 z-10 truncate max-w-[80px]">
                    {formatCurrency(item.amount, settings.currency)}
                  </div>

                  <span className="text-[8px] font-semibold text-slate-300 z-10 truncate max-w-[75px]">
                    {item.incomeSource}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD DAILY MAINTENANCE EXPENSE */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <Wrench className="w-4 h-4 text-emerald-500" /> Add Daily Goods & Usage Expense
              </h4>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Groceries & Milk">Groceries & Milk</option>
                  <option value="Repairs & Fixes">Repairs & Fixes</option>
                  <option value="Utility Bills">Utility Bills</option>
                  <option value="Medical & Health">Medical & Health</option>
                  <option value="General House">General House</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount Spent ({settings.currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  placeholder="e.g. Daily milk, electrician fix"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> SAVE DAILY GOODS USAGE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FIXED MONTHLY REQUIREMENT (MAID / MEEI / RENT) */}
      {isFixedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <CalendarCheck className="w-4 h-4 text-amber-500" /> Add Fixed Monthly Commitment
              </h4>
              <button
                onClick={() => setIsFixedModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFixedSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Item Title / Name</label>
                <input
                  type="text"
                  required
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  placeholder="e.g. Maid Salary (Meei), House Rent"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Maid / Domestic">Maid / Domestic (Meei)</option>
                  <option value="House Rent">House Rent</option>
                  <option value="Electricity & Water">Electricity & Water</option>
                  <option value="School / College Fee">School / College Fee</option>
                  <option value="Other Fixed Commitment">Other Fixed Commitment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Required Amount ({settings.currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={fAmount}
                  onChange={(e) => setFAmount(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  placeholder="e.g. Paid on 5th of every month"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> SAVE FIXED REQUIREMENT RECORD
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FAMILY MEMBER INCOME */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <Users className="w-4 h-4 text-purple-500" /> Add Family Member Income
              </h4>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Family Member</label>
                <select
                  value={iMember}
                  onChange={(e) => setIMember(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Self / Owner">Self / Owner</option>
                  <option value="Other Member">Other Member</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Income Source</label>
                <select
                  value={iSource}
                  onChange={(e) => setISource(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Salary / Job">Salary / Job</option>
                  <option value="Pension">Pension</option>
                  <option value="Business">Business</option>
                  <option value="House Rent">House Rent</option>
                  <option value="Extra Earnings">Extra Earnings</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount ({settings.currency})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={iAmount}
                  onChange={(e) => setIAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-purple-600 dark:text-purple-400 focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={iDate}
                  onChange={(e) => setIDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> SAVE FAMILY CIRCLE CARD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
