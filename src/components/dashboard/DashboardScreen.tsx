import React, { useState, useRef } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  Receipt,
  Calculator,
  HandCoins,
  BarChart3,
  Sparkles,
  CheckCircle2,
  X,
  Users,
  Search,
  MessageSquare,
  Send,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculatePeriodSummary, getChartData, getCustomerCreditSummaries, getTodayDateString, formatDateDisplay } from '../../utils/calculations';
import type { CustomerCreditSummary } from '../../types';
import type { ActiveTab } from '../common/BottomNav';
import { ProfitCard } from './ProfitCard';
import { MaintenanceCard } from './MaintenanceCard';
import { UdharReminderModal } from '../common/UdharReminderModal';

interface DashboardScreenProps {
  setActiveTab: (tab: ActiveTab) => void;
  onQuickFormLaunch?: (type: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab, onQuickFormLaunch }) => {
  const { transactions, settings, addTransaction } = useCashFlow();
  const [chartTimeframe, setChartTimeframe] = useState<'7days' | '14days' | '30days'>('7days');
  const [selectedChart, setSelectedChart] = useState<'cashflow' | 'profit' | 'expenses'>('cashflow');

  // Udhar Search filter inside Udhar report card
  const [udharSearch, setUdharSearch] = useState<string>('');

  // Ref to scroll to Udhar List
  const udharSectionRef = useRef<HTMLDivElement>(null);

  // Quick Collect Udhar Modal State
  const [collectTarget, setCollectTarget] = useState<CustomerCreditSummary | null>(null);
  const [customCollectAmount, setCustomCollectAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI'>('Cash');

  // Udhar Reminder & Adjustment Modal State
  const [reminderTarget, setReminderTarget] = useState<CustomerCreditSummary | null>(null);
  const [reminderInitialTab, setReminderInitialTab] = useState<'reminder' | 'adjustment'>('reminder');

  const handleOpenReminderModal = (cust: CustomerCreditSummary, tab: 'reminder' | 'adjustment' = 'reminder') => {
    setReminderTarget(cust);
    setReminderInitialTab(tab);
  };

  const periodSummary = calculatePeriodSummary(transactions, settings);
  const today = periodSummary.today;
  const weekly = periodSummary.weekly;
  const monthly = periodSummary.monthly;

  // Filter all active customer credit summaries
  const customerUdharList = getCustomerCreditSummaries(transactions).filter((c) => c.outstandingBalance > 0);
  const filteredUdharList = customerUdharList.filter(
    (c) =>
      !udharSearch ||
      c.customerName.toLowerCase().includes(udharSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(udharSearch))
  );

  const daysCount = chartTimeframe === '7days' ? 7 : chartTimeframe === '14days' ? 14 : 30;
  const chartData = getChartData(transactions, daysCount);

  const scrollToUdharList = () => {
    if (udharSectionRef.current) {
      udharSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (onQuickFormLaunch) onQuickFormLaunch('credit_payment');
      else setActiveTab('transactions');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 pb-28 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Hero Quick Action Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab('calculator')}
          className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">POS Sale</h4>
            <p className="text-[10px] text-emerald-100">Calculator Entry</p>
          </div>
        </button>

        <button
          onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('credit_sale') : setActiveTab('transactions'))}
          className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Gave Udhar</h4>
            <p className="text-[10px] text-purple-100">+ New Credit Sale</p>
          </div>
        </button>

        <button
          onClick={scrollToUdharList}
          className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <HandCoins className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Got Udhar</h4>
            <p className="text-[10px] text-blue-100">View All ({customerUdharList.length})</p>
          </div>
        </button>

        <button
          onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('purchase') : setActiveTab('transactions'))}
          className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Store Purchase</h4>
            <p className="text-[10px] text-rose-100">Store Expenses</p>
          </div>
        </button>
      </div>

      {/* Main Invested Amount Hero Banner (Replaces plain Live Cash Balance) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1">
                <Wallet className="w-4 h-4" /> Invested Capital Amount
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Fixed Capital
              </span>
            </div>

            {/* Primary Display: Invested Capital Amount (Default ₹25,000) */}
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{settings.currency}</span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                {(settings.investedAmount || 25000).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
              <p className="text-slate-400">
                Live Working Cash: <span className="font-bold text-emerald-400">{formatCurrency(today.cashInHand, settings.currency)}</span>
              </p>
              <span>•</span>
              <p className="text-slate-400">
                Opening Cash: <span className="font-semibold text-slate-200">{formatCurrency(today.openingCash, settings.currency)}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t sm:border-t-0 border-slate-800/80 w-full">
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-emerald-500/20 text-left min-w-0">
              <span className="text-[10px] text-emerald-400 uppercase font-extrabold block truncate">2% Daily Net Profit</span>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5 truncate">
                {formatCurrency(today.profit, settings.currency)}
              </div>
              <span className="text-[9px] text-slate-400 block truncate">Sales: {formatCurrency(today.totalSales, settings.currency)}</span>
            </div>

            <button
              onClick={scrollToUdharList}
              className="bg-slate-950/60 p-2.5 rounded-2xl border border-purple-500/20 text-left group cursor-pointer hover:border-purple-500/40 transition-colors min-w-0"
            >
              <span className="text-[10px] text-purple-300 uppercase font-extrabold block truncate">Outstanding Udhar</span>
              <div className="text-lg font-black text-purple-400 font-mono mt-0.5 truncate group-hover:underline">
                {formatCurrency(today.outstandingCredit, settings.currency)}
              </div>
              <span className="text-[9px] text-purple-200 block truncate">Tap to View List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Daily Profit Card (Manual Entry + Auto Purchases/Sales Calculation) */}
      <ProfitCard />

      {/* Home Maintenance & Family Draw Expense Card */}
      <MaintenanceCard />

      {/* Grocery Investment Cycle & 2% Daily Profit Flow Card */}
      <div className="bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-900 rounded-3xl p-5 shadow-xl border border-emerald-500/20 text-white space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Grocery Re-Investment & 2% Profit Cycle
              </h3>
              <p className="text-[11px] text-slate-400">Invest Capital ➔ Buy Stock ➔ Sell Goods ➔ Earn 2% Profit ➔ Re-invest</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase">
            2% Earn Rate
          </span>
        </div>

        {/* 4-Step Visual Cycle Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block">1. Invest Capital</span>
            <span className="text-sm font-extrabold text-emerald-400 block mt-0.5">
              {formatCurrency(settings.investedAmount || 25000, settings.currency)}
            </span>
            <span className="text-[9px] text-slate-400">Initial Investment</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="text-[9px] uppercase font-extrabold text-rose-400 block">2. Groceries Bought</span>
            <span className="text-sm font-extrabold text-rose-300 block mt-0.5">
              {formatCurrency(today.purchases, settings.currency)}
            </span>
            <span className="text-[9px] text-slate-400">Store Purchases</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <span className="text-[9px] uppercase font-extrabold text-blue-400 block">3. Total Sales</span>
            <span className="text-sm font-extrabold text-blue-300 block mt-0.5">
              {formatCurrency(today.totalSales, settings.currency)}
            </span>
            <span className="text-[9px] text-slate-400">Cash + Udhar + Home</span>
          </div>

          <div className="p-3 bg-emerald-950/80 rounded-2xl border border-emerald-500/40">
            <span className="text-[9px] uppercase font-extrabold text-emerald-400 block">4. Net 2% Profit</span>
            <span className="text-sm font-black text-emerald-400 block mt-0.5">
              {formatCurrency(today.profit, settings.currency)}
            </span>
            <span className="text-[9px] text-emerald-200">Owner Net Earnings</span>
          </div>
        </div>
      </div>

      {/* Customer Udhar Summary & Full List Report */}
      <div ref={udharSectionRef} className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-purple-200 dark:border-purple-900/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Active Customer Udhar Report ({customerUdharList.length})
              </h3>
              <p className="text-[10px] text-slate-400">Full list of customers owing money with instant Receive button</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input for Udhar List */}
            {customerUdharList.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={udharSearch}
                  onChange={(e) => setUdharSearch(e.target.value)}
                  placeholder="Filter customer..."
                  className="pl-7 pr-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium w-36"
                />
              </div>
            )}

            <span className="text-xs font-black text-purple-600 dark:text-purple-400 shrink-0">
              Total: {formatCurrency(today.outstandingCredit, settings.currency)}
            </span>
          </div>
        </div>

        {/* List of All Active Udhar Customers with row Receive button */}
        {filteredUdharList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-medium space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No Outstanding Udhar!</p>
            <p className="text-[11px]">All customer credit balances have been cleared.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto pr-1">
            {filteredUdharList.map((cust, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cust.customerName}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    {cust.phone && <span>Ph: {cust.phone}</span>}
                    <span>• Last entry: {formatDateDisplay(cust.lastTransactionDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-black text-purple-600 dark:text-purple-400 block text-sm font-mono">
                      {formatCurrency(cust.outstandingBalance, settings.currency)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Udhar Due</span>
                  </div>

                  {/* Inline Quick Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenReminderModal(cust, 'reminder')}
                      className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      title="Send WhatsApp or SMS Payment Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Message</span>
                    </button>

                    <button
                      onClick={() => handleOpenReminderModal(cust, 'adjustment')}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      title="Receive or Adjust Udhar Balance"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      Adjust
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Sales Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Sales Breakdown</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">TODAY</span>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => setActiveTab('history')}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Cash Sales</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(today.cashSales, settings.currency)}
              </span>
            </div>
            <div
              onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('credit_sale') : setActiveTab('transactions'))}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Credit Sales (Udhar)</span>
              <span className="font-extrabold text-purple-600 dark:text-purple-400">
                {formatCurrency(today.creditSales, settings.currency)}
              </span>
            </div>
            <div
              onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('credit_payment') : setActiveTab('transactions'))}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Credit Received</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(today.creditReceived, settings.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Outflow / Expenses Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Store Outflows</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">TODAY</span>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('purchase') : setActiveTab('transactions'))}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Purchases</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(today.purchases, settings.currency)}
              </span>
            </div>
            <div
              onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('expense') : setActiveTab('transactions'))}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Store Expenses</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(today.expenses, settings.currency)}
              </span>
            </div>
            <div
              onClick={() => (onQuickFormLaunch ? onQuickFormLaunch('withdrawal') : setActiveTab('transactions'))}
              className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">Today Withdrawals</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">
                {formatCurrency(today.withdrawals, settings.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Profit Summary (Today, Weekly, Monthly) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg border border-slate-200/80 dark:border-slate-700/80 space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Profit Analysis</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">NET</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-bold block">Today</span>
              <span className={`text-xs font-black ${today.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatCurrency(today.profit, settings.currency)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-bold block">Weekly</span>
              <span className={`text-xs font-black ${weekly.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatCurrency(weekly.profit, settings.currency)}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 font-bold block">Monthly</span>
              <span className={`text-xs font-black ${monthly.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {formatCurrency(monthly.profit, settings.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Cash Book Formula Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Automatic Live Cash Book Calculation
          </h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            No Manual Math Needed
          </span>
        </div>

        {/* Responsive Formula Steps */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs font-bold">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            <span className="text-[10px] block text-slate-400 font-normal">Opening Cash</span>
            {formatCurrency(today.openingCash, settings.currency)}
          </div>

          <span className="text-emerald-500 text-lg font-black">+</span>

          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] block text-emerald-500 font-normal">Cash Sales</span>
            {formatCurrency(today.cashSales, settings.currency)}
          </div>

          <span className="text-emerald-500 text-lg font-black">+</span>

          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <span className="text-[10px] block text-emerald-500 font-normal">Credit Received</span>
            {formatCurrency(today.creditReceived, settings.currency)}
          </div>

          <span className="text-rose-500 text-lg font-black">-</span>

          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <span className="text-[10px] block text-rose-500 font-normal">Purchases</span>
            {formatCurrency(today.purchases, settings.currency)}
          </div>

          <span className="text-rose-500 text-lg font-black">-</span>

          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <span className="text-[10px] block text-rose-500 font-normal">Expenses</span>
            {formatCurrency(today.expenses, settings.currency)}
          </div>

          <span className="text-amber-500 text-lg font-black">-</span>

          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <span className="text-[10px] block text-amber-500 font-normal">Withdrawals</span>
            {formatCurrency(today.withdrawals, settings.currency)}
          </div>

          <span className="text-slate-800 dark:text-slate-200 text-lg font-black">=</span>

          <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-md">
            <span className="text-[10px] block text-emerald-200 font-normal">Current Cash</span>
            {formatCurrency(today.cashInHand, settings.currency)}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Store Analytics & Trends</h3>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setSelectedChart('cashflow')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedChart === 'cashflow' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'}`}
              >
                Cash Flow
              </button>
              <button
                onClick={() => setSelectedChart('profit')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedChart === 'profit' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'}`}
              >
                Profit Trend
              </button>
            </div>

            {/* Timeframe */}
            <select
              value={chartTimeframe}
              onChange={(e) => setChartTimeframe(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="14days">Last 14 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Recharts Render Container */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChart === 'cashflow' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, settings.currency)}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="cashIn" name="Cash Received (+)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cashOut" name="Cash Out (-)" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, settings.currency)}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="profit" name="Daily Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Collect Udhar Modal */}
      {collectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-emerald-500" />
                Receive Udhar Payment
              </h3>
              <button
                onClick={() => setCollectTarget(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="space-y-3.5">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">Customer</span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{collectTarget.customerName}</h4>
                {collectTarget.phone && <p className="text-xs text-slate-400">{collectTarget.phone}</p>}
                <div className="mt-1 pt-1 border-t border-purple-200 dark:border-purple-800 flex justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                  <span>Outstanding Due:</span>
                  <span>{formatCurrency(collectTarget.outstandingBalance, settings.currency)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount Received ({settings.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={customCollectAmount}
                  onChange={(e) => setCustomCollectAmount(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <div className="flex gap-2">
                  {(['Cash', 'UPI'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        payMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                CONFIRM PAYMENT RECEIVED ({formatCurrency(parseFloat(customCollectAmount) || 0, settings.currency)})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp / SMS Reminder & Manual Udhar Adjustment Modal */}
      <UdharReminderModal
        isOpen={!!reminderTarget}
        onClose={() => setReminderTarget(null)}
        targetCustomer={reminderTarget}
        initialTab={reminderInitialTab}
      />
    </div>
  );
};
