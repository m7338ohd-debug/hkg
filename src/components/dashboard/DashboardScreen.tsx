import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Calculator,
  HandCoins,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Check,
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
import { formatCurrency, calculatePeriodSummary, getChartData, getCustomerCreditSummaries, getTodayDateString } from '../../utils/calculations';
import type { CustomerCreditSummary } from '../../types';
import type { ActiveTab } from '../common/BottomNav';

interface DashboardScreenProps {
  setActiveTab: (tab: ActiveTab) => void;
  onQuickFormLaunch?: (type: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab }) => {
  const { transactions, settings, addTransaction } = useCashFlow();
  const [chartTimeframe, setChartTimeframe] = useState<'7days' | '14days' | '30days'>('7days');
  const [selectedChart, setSelectedChart] = useState<'cashflow' | 'profit' | 'expenses'>('cashflow');

  // Quick Collect Udhar Modal State
  const [collectTarget, setCollectTarget] = useState<CustomerCreditSummary | null>(null);
  const [customCollectAmount, setCustomCollectAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI'>('Cash');

  const periodSummary = calculatePeriodSummary(transactions, settings);
  const today = periodSummary.today;
  const weekly = periodSummary.weekly;
  const monthly = periodSummary.monthly;
  const customerUdharList = getCustomerCreditSummaries(transactions).filter((c) => c.outstandingBalance > 0);

  const daysCount = chartTimeframe === '7days' ? 7 : chartTimeframe === '14days' ? 14 : 30;
  const chartData = getChartData(transactions, daysCount);

  const handleOpenCollectModal = (cust: CustomerCreditSummary) => {
    setCollectTarget(cust);
    setCustomCollectAmount(cust.outstandingBalance.toString());
    setPayMethod('Cash');
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectTarget) return;

    const numAmount = parseFloat(customCollectAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    addTransaction({
      type: 'credit_payment',
      amount: numAmount,
      customerName: collectTarget.customerName,
      phone: collectTarget.phone,
      paymentMethod: payMethod,
      date: getTodayDateString(),
      notes: `Cleared Udhar balance (${payMethod})`,
    });

    setCollectTarget(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pb-28 space-y-5">
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
          onClick={() => setActiveTab('transactions')}
          className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Give Udhar</h4>
            <p className="text-[10px] text-purple-100">Credit Sale</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <HandCoins className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Got Udhar</h4>
            <p className="text-[10px] text-blue-100">Receive Credit</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-3 group active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-xs">Purchases</h4>
            <p className="text-[10px] text-rose-100">Store Expenses</p>
          </div>
        </button>
      </div>

      {/* Main Cash Balance Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1">
                <Wallet className="w-4 h-4" /> Live Cash Balance
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Real-Time
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{settings.currency}</span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                {today.cashInHand.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Opening Cash: <span className="font-semibold text-slate-200">{formatCurrency(today.openingCash, settings.currency)}</span>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Today Net Profit</span>
              <div className={`text-lg font-black ${today.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(today.profit, settings.currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Outstanding Udhar</span>
              <div className="text-base font-bold text-purple-400">
                {formatCurrency(today.outstandingCredit, settings.currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Udhar Summary & Quick Pay Section */}
      {customerUdharList.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-purple-200 dark:border-purple-900/50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Udhar Customers</h3>
                <p className="text-[10px] text-slate-400">Tap "Receive Payment" in row to collect & remove</p>
              </div>
            </div>
            <span className="text-xs font-black text-purple-600 dark:text-purple-400">
              Total Udhar: {formatCurrency(today.outstandingCredit, settings.currency)}
            </span>
          </div>

          {/* List of Udhar Customers with row Receive button */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-64 overflow-y-auto pr-1">
            {customerUdharList.map((cust, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cust.customerName}</h4>
                  {cust.phone && <p className="text-[11px] text-slate-400">{cust.phone}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-purple-600 dark:text-purple-400 block text-sm font-mono">
                      {formatCurrency(cust.outstandingBalance, settings.currency)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Udhar Due</span>
                  </div>

                  {/* Inline Quick Action Button */}
                  <button
                    onClick={() => handleOpenCollectModal(cust)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <HandCoins className="w-3.5 h-3.5" />
                    Receive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Today Cash Sales</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(today.cashSales, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Today Credit Sales (Udhar)</span>
              <span className="font-extrabold text-purple-600 dark:text-purple-400">
                {formatCurrency(today.creditSales, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
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
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Today Purchases</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(today.purchases, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Today Store Expenses</span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrency(today.expenses, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
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
                  required
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
    </div>
  );
};
