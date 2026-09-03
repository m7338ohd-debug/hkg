import React, { useState } from 'react';
import {
  Home,
  Users,
  PlusCircle,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
  Wrench,
  Receipt,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  DollarSign,
  Briefcase,
  Building,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, getTodayDateString, formatDateDisplay } from '../../utils/calculations';
import type { HomeMaintenanceEntry, FamilyIncomeEntry, FixedMonthlyExpenseEntry } from '../../types';

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
  } = useCashFlow();

  const [activeTab, setActiveTab] = useState<'maintenance' | 'fixed_monthly' | 'earnings'>('maintenance');

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

  // Daily Maintenance Spent (Only daily usage goods, NOT fixed monthly Commitments)
  const totalMaintenanceSpent = homeMaintenanceList.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedMonthlyRequired = fixedMonthlyList.reduce((sum, item) => sum + item.amount, 0);
  const totalFamilyIncome = familyIncomeList.reduce((sum, item) => sum + item.amount, 0);

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
                    🌟 Featured 3D Cards (Expenses &gt; ₹1,000)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {homeMaintenanceList
                      .filter((item) => item.amount > 1000)
                      .map((item) => {
                        const getCategoryStyle = (cat: string) => {
                          switch (cat) {
                            case 'Groceries & Milk':
                              return 'from-emerald-600 to-teal-700 border-emerald-400/50 shadow-emerald-950/30';
                            case 'Repairs & Fixes':
                              return 'from-amber-600 to-orange-700 border-amber-400/50 shadow-amber-950/30';
                            case 'Utility Bills':
                              return 'from-blue-600 to-indigo-700 border-blue-400/50 shadow-blue-950/30';
                            case 'Medical & Health':
                              return 'from-rose-600 to-pink-700 border-rose-400/50 shadow-rose-950/30';
                            default:
                              return 'from-purple-600 to-indigo-700 border-purple-400/50 shadow-purple-950/30';
                          }
                        };

                        return (
                          <div
                            key={item.id}
                            className={`relative p-3 rounded-2xl bg-gradient-to-br ${getCategoryStyle(
                              item.category
                            )} shadow-lg border text-white flex flex-col justify-between space-y-2 group overflow-hidden`}
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
                                className="p-1 bg-black/20 hover:bg-rose-600 text-white/80 hover:text-white rounded-lg cursor-pointer"
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

              {/* SECTION B: SIMPLE COMPACT LIST RECORD FOR AMOUNT <= ₹1,000 */}
              {homeMaintenanceList.filter((item) => item.amount <= 1000).length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-md border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-400 block pb-1 border-b border-slate-100 dark:border-slate-800">
                    📋 Regular Maintenance & Daily Goods (≤ ₹1,000)
                  </span>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {homeMaintenanceList
                      .filter((item) => item.amount <= 1000)
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
