import React, { useState } from 'react';
import {
  Home,
  Wrench,
  PlusCircle,
  X,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  PiggyBank,
  Zap,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculatePeriodSummary, filterTransactionsByDate, filterHomeMaintenanceByDate, getTodayDateString } from '../../utils/calculations';
import type { WithdrawalPerson } from '../../types';

export const MaintenanceCard: React.FC = () => {
  const { transactions, homeMaintenanceList, settings, addTransaction } = useCashFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<'Home Maintenance' | 'Electricity/Rent' | 'Family Draw' | 'Extra Savings'>('Home Maintenance');
  const [person, setPerson] = useState<WithdrawalPerson | string>('Mother');
  const [notes, setNotes] = useState('');

  const todayStr = getTodayDateString();
  const periodSummary = calculatePeriodSummary(transactions, settings);

  // Calculate maintenance sum including homeMaintenanceList
  const homeMaintenanceTotalToday = homeMaintenanceList
    .filter((m) => m.date === todayStr)
    .reduce((sum, item) => sum + item.amount, 0);

  const todaySpent = periodSummary.today.homeMaintenanceSpent + homeMaintenanceTotalToday;

  // Calculate weekly & monthly maintenance spent
  const weeklyTxs = filterTransactionsByDate(transactions, 'this_week');
  const monthlyTxs = filterTransactionsByDate(transactions, 'this_month');

  const weeklyHomeMaintenance = filterHomeMaintenanceByDate(homeMaintenanceList, 'this_week');
  const monthlyHomeMaintenance = filterHomeMaintenanceByDate(homeMaintenanceList, 'this_month');

  const calcMaintenanceSum = (txList: typeof transactions) => {
    let sum = 0;
    txList.forEach((t) => {
      if (t.type === 'home_use' || t.type === 'withdrawal') {
        sum += t.amount;
      } else if (
        t.type === 'expense' &&
        t.category &&
        (t.category.toLowerCase().includes('maintenance') ||
          t.category.toLowerCase().includes('rent') ||
          t.category.toLowerCase().includes('house') ||
          t.category.toLowerCase().includes('home'))
      ) {
        sum += t.amount;
      }
    });
    return sum;
  };

  const weeklyHomeMaintTotal = weeklyHomeMaintenance.reduce((sum, item) => sum + item.amount, 0);
  const monthlyHomeMaintTotal = monthlyHomeMaintenance.reduce((sum, item) => sum + item.amount, 0);

  const weeklySpent = calcMaintenanceSum(weeklyTxs) + weeklyHomeMaintTotal;
  const monthlySpent = calcMaintenanceSum(monthlyTxs) + monthlyHomeMaintTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (maintenanceType === 'Home Maintenance' || maintenanceType === 'Electricity/Rent') {
      addTransaction({
        type: 'expense',
        amount: numAmount,
        category: maintenanceType === 'Home Maintenance' ? 'Maintenance' : 'House Utility',
        date: todayStr,
        notes: notes.trim() || `${maintenanceType} expense logged`,
      });
    } else if (maintenanceType === 'Family Draw') {
      addTransaction({
        type: 'withdrawal',
        amount: numAmount,
        reason: 'House Expense',
        takenBy: person,
        date: todayStr,
        notes: notes.trim() || `Cash withdrawal for home by ${person}`,
      });
    } else {
      // Extra Savings
      addTransaction({
        type: 'withdrawal',
        amount: numAmount,
        reason: 'Extra Savings',
        takenBy: 'Owner',
        date: todayStr,
        notes: notes.trim() || `Extra savings set aside from store cash flow`,
      });
    }

    setAmount('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-amber-200 dark:border-amber-900/50 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Home Maintenance & Family Draw Card
            </h3>
            <p className="text-[11px] text-slate-400">
              Track household maintenance, family expenses & extra savings
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" /> + Log Home Expense
        </button>
      </div>

      {/* Primary Maintenance Metrics */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50">
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">Today Spent</span>
          <span className="text-base font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5 block">
            {formatCurrency(todaySpent, settings.currency)}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">This Week</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {formatCurrency(weeklySpent, settings.currency)}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">This Month</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {formatCurrency(monthlySpent, settings.currency)}
          </span>
        </div>
      </div>

      {/* Feature Breakdown Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-500" /> Home Repair
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            Upkeep & Fixes
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-500" /> Home Utilities
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            Rent, Gas & Power
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Home className="w-3 h-3 text-emerald-500" /> Family Draw
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            House Expense
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-left">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <PiggyBank className="w-3 h-3 text-purple-500" /> Extra Savings
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            Home Reserve
          </span>
        </div>
      </div>

      {/* Quick Add Home Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-500" /> Log Home Maintenance Expense
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Expense Type</label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Home Maintenance">Home Maintenance & Repairs</option>
                  <option value="Electricity/Rent">House Utility (Rent / Electricity / Gas)</option>
                  <option value="Family Draw">Family Cash Withdrawal</option>
                  <option value="Extra Savings">Set Aside Extra Savings</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {maintenanceType === 'Family Draw' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Taken By</label>
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Ayesha">Ayesha</option>
                    <option value="Owner">Owner</option>
                    <option value="Employee">Employee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Plumber repair, LPG gas refill, home grocery"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> SAVE HOME EXPENSE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
