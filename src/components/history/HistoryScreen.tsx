import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  CreditCard,
  HandCoins,
  ShoppingCart,
  Receipt,
  Wallet,
  Calculator,
  X,
  Mic,
  Home,
  TrendingUp,
  PieChart,
  Clock,
  DollarSign,
  Wrench,
  Calendar,
  Layers,
  Tag,
  User,
  HeartPulse,
  ShoppingBag,
  Download,
  Share2,
  FileText,
  Send,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import type { Transaction, TransactionType, HomeMaintenanceEntry } from '../../types';
import { formatCurrency, formatDateDisplay, filterTransactionsByDate, calculateSummary, calculatePeriodSummary } from '../../utils/calculations';
import { exportReportToPDF, generateTextReport } from '../../utils/pdfExport';
import { useSpeechToText } from '../../utils/useSpeech';

export const HistoryScreen: React.FC = () => {
  const {
    transactions,
    settings,
    deleteTransaction,
    editTransaction,
    homeMaintenanceList,
    deleteHomeMaintenance,
    showToast,
  } = useCashFlow();

  // Active View Tab: 'transactions' or 'home_maintenance'
  const [activeView, setActiveView] = useState<'transactions' | 'home_maintenance'>('transactions');

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all'>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Voice Search Helper
  const { isListening, startListening } = useSpeechToText((spokenText) => {
    setSearchQuery(spokenText);
  });

  // Edit Modal State for Transactions
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Message Modal State for single Transaction receipt dispatch
  const [txForMsg, setTxForMsg] = useState<Transaction | null>(null);

  // Report Generator Modal State for Daily, Weekly, Custom Range Reports
  const [reportModalPeriod, setReportModalPeriod] = useState<'daily' | 'weekly' | 'custom' | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Filtered Transaction Dataset
  const filteredTxList = useMemo(() => {
    let list = filterTransactionsByDate(transactions, dateRange, customStart, customEnd);

    if (selectedType !== 'all') {
      list = list.filter((t) => t.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
          (t.phone && t.phone.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.reason && t.reason.toLowerCase().includes(q)) ||
          (t.takenBy && t.takenBy.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q) ||
          t.date.includes(q)
      );
    }

    return list;
  }, [transactions, dateRange, customStart, customEnd, selectedType, searchQuery]);

  // Filtered Home Maintenance Dataset
  const filteredHomeMaintenanceList = useMemo(() => {
    let list = homeMaintenanceList;

    if (dateRange !== 'all') {
      const filteredDatesTxs = filterTransactionsByDate(
        list.map((item) => ({ ...item, type: 'expense', amount: item.amount, date: item.date, id: item.id, createdAt: item.createdAt })),
        dateRange,
        customStart,
        customEnd
      );
      const allowedIds = new Set(filteredDatesTxs.map((t) => t.id));
      list = list.filter((item) => allowedIds.has(item.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.category.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.addedBy && item.addedBy.toLowerCase().includes(q)) ||
          item.amount.toString().includes(q) ||
          item.date.includes(q)
      );
    }

    return list;
  }, [homeMaintenanceList, dateRange, customStart, customEnd, searchQuery]);

  // Financial Statistics for Filtered Selection
  const stats = useMemo(() => {
    let totalSales = 0;
    let totalCashSales = 0;

    filteredTxList.forEach((t) => {
      if (t.type === 'cash_sale') {
        totalCashSales += t.amount;
        totalSales += t.amount;
      } else if (t.type === 'credit_sale' || t.type === 'home_use') {
        totalSales += t.amount;
      }
    });

    const targetDates = new Set(filteredTxList.map((t) => t.date));
    let totalProfit = 0;
    targetDates.forEach((dStr) => {
      totalProfit += calculateSummary(transactions, settings, dStr).profit;
    });

    const totalHomeMaintenanceSpent = filteredHomeMaintenanceList.reduce((sum, item) => sum + item.amount, 0);

    return {
      totalSales,
      totalCashSales,
      totalProfit,
      totalHomeMaintenanceSpent,
    };
  }, [filteredTxList, filteredHomeMaintenanceList, transactions, settings]);

  // Category breakdown for Home Maintenance
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredHomeMaintenanceList.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + item.amount;
    });
    return map;
  }, [filteredHomeMaintenanceList]);

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'cash_sale':
        return { label: 'Cash Sale', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', icon: Calculator };
      case 'credit_sale':
        return { label: 'Udhar Given', bg: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300', icon: CreditCard };
      case 'home_use':
        return { label: 'Home Use Goods', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300', icon: Calculator };
      case 'credit_payment':
        return { label: 'Credit Received', bg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300', icon: HandCoins };
      case 'purchase':
        return { label: 'Purchase', bg: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300', icon: ShoppingCart };
      case 'expense':
        return { label: 'Expense', bg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300', icon: Receipt };
      case 'withdrawal':
        return { label: 'Withdrawal', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icon: Wallet };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Groceries & Milk':
        return ShoppingBag;
      case 'Repairs & Fixes':
        return Wrench;
      case 'Utility Bills':
        return Receipt;
      case 'Medical & Health':
        return HeartPulse;
      default:
        return Home;
    }
  };

  const formatExactTime = (createdAt: number) => {
    if (!createdAt) return '';
    const dateObj = new Date(createdAt);
    return dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    editTransaction(editingTx.id, {
      amount: editingTx.amount,
      customerName: editingTx.customerName,
      phone: editingTx.phone,
      notes: editingTx.notes,
      category: editingTx.category,
      date: editingTx.date,
    });

    setEditingTx(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 pb-28 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Top Overview Cards Banner (Sales & Home Maintenance Spent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Store Sales Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Period Sales
            </span>
            <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Calculator className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {formatCurrency(stats.totalSales, settings.currency)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Total Inflow across selected range
          </p>
        </div>

        {/* Home Maintenance Spent Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Home Maintenance Spent
            </span>
            <span className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Home className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
            {formatCurrency(stats.totalHomeMaintenanceSpent, settings.currency)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Total Spent & Used for Household
          </p>
        </div>
      </div>

      {/* History Report Generation Options Bar (Daily & Weekly Reports) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 shadow-lg border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">Generate History Financial Reports</h4>
            <p className="text-[10px] text-slate-300">Export PDF or share WhatsApp/SMS financial reports</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setReportModalPeriod('daily')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" /> Daily Report
          </button>
          <button
            onClick={() => setReportModalPeriod('weekly')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Clock className="w-4 h-4" /> Weekly Report
          </button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs (Store Transactions vs Home Maintenance Report) */}
      <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'transactions'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-500" />
          Store Transactions ({filteredTxList.length})
        </button>
        <button
          onClick={() => setActiveView('home_maintenance')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeView === 'home_maintenance'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4 text-amber-500" />
          Home Maintenance Report ({filteredHomeMaintenanceList.length})
        </button>
      </div>

      {/* Search Header Bar with Voice Mic */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeView === 'transactions'
                ? 'Search customer, amount, notes, category...'
                : 'Search category, notes, user, amount...'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={startListening}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse border-rose-500 shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
          title="Voice Search Mic"
        >
          <Mic className="w-5 h-5 text-emerald-500" />
        </button>
      </div>

      {/* Date Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Dates' },
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'this_week', label: 'This Week' },
          { id: 'this_month', label: 'This Month' },
          { id: 'custom', label: 'Custom Date' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setDateRange(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateRange === f.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers if selected */}
      {dateRange === 'custom' && (
        <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">From Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">To Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 1: STORE TRANSACTIONS */}
      {activeView === 'transactions' && (
        <div className="space-y-3">
          {/* Type Filter Select */}
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <option value="all">All Transaction Types</option>
              <option value="cash_sale">Cash Sales</option>
              <option value="credit_sale">Credit Sales (Udhar)</option>
              <option value="credit_payment">Credit Received</option>
              <option value="purchase">Store Purchases</option>
              <option value="expense">Store Expenses</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-semibold">
            <span>Showing {filteredTxList.length} Entries</span>
            <span>Tap entry to edit or delete</span>
          </div>

          {/* History List Container */}
          <div className="space-y-2.5">
            {filteredTxList.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2 border border-slate-200 dark:border-slate-700">
                <Filter className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Transactions Found</h4>
                <p className="text-xs">Try clearing your search or date filters.</p>
              </div>
            ) : (
              filteredTxList.map((t) => {
                const badge = getTypeBadge(t.type);
                const Icon = badge.icon;
                const isIncoming = t.type === 'cash_sale' || t.type === 'credit_payment';

                return (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${badge.bg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[180px]">
                            {t.customerName || t.category || t.takenBy || badge.label}
                          </span>
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDateDisplay(t.date)}
                          </span>
                          {t.time && (
                            <span className="flex items-center gap-1 text-slate-500 font-semibold">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              {t.time}
                            </span>
                          )}
                          {t.phone && <span>• {t.phone}</span>}
                        </div>

                        {t.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{t.notes}"</p>}
                      </div>
                    </div>

                    {/* Right Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-base font-black font-mono ${
                            isIncoming
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : t.type === 'credit_sale'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                        </span>
                      </div>

                      {/* Edit / Message / Delete Buttons */}
                      <div className="flex flex-col gap-1 opacity-100 ml-1">
                        <button
                          onClick={() => setTxForMsg(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors cursor-pointer"
                          title="Send Message Receipt (WhatsApp / SMS)"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTx(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: HOME MAINTENANCE DETAILED REPORT */}
      {activeView === 'home_maintenance' && (
        <div className="space-y-4">
          {/* Category Expenditure Summary Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-500" />
                Category Usage Breakdown
              </h3>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                Total Used: {formatCurrency(stats.totalHomeMaintenanceSpent, settings.currency)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['Groceries & Milk', 'Repairs & Fixes', 'Utility Bills', 'Medical & Health', 'General House', 'Other'].map((cat) => {
                const amount = categoryBreakdown[cat] || 0;
                const percent = stats.totalHomeMaintenanceSpent > 0 ? (amount / stats.totalHomeMaintenanceSpent) * 100 : 0;

                return (
                  <div key={cat} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{cat}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                      {formatCurrency(amount, settings.currency)}
                    </span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Itemized Home Maintenance List with Date & Exact Time */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-semibold">
              <span>Home Maintenance Detailed Logs ({filteredHomeMaintenanceList.length})</span>
              <span>Showing exact date and time</span>
            </div>

            {filteredHomeMaintenanceList.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2 border border-slate-200 dark:border-slate-700">
                <Home className="w-8 h-8 mx-auto text-amber-500" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Home Maintenance Records</h4>
                <p className="text-xs">No maintenance entries recorded for this filter selection.</p>
              </div>
            ) : (
              filteredHomeMaintenanceList.map((item) => {
                const IconComponent = getCategoryIcon(item.category);
                const timeLabel = formatExactTime(item.createdAt);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.category}
                          </span>
                          {item.addedBy && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              by {item.addedBy}
                            </span>
                          )}
                        </div>

                        {/* Date and Exact Time */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDateDisplay(item.date)}
                          </span>
                          {timeLabel && (
                            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              {timeLabel}
                            </span>
                          )}
                        </div>

                        {item.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{item.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.amount, settings.currency)}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteHomeMaintenance(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Delete Home Maintenance Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Edit Transaction</h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
                />
              </div>

              {(editingTx.type === 'credit_sale' || editingTx.type === 'credit_payment') && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={editingTx.customerName || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, customerName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingTx.phone || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={editingTx.date}
                  onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes</label>
                <input
                  type="text"
                  value={editingTx.notes || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Transaction WhatsApp / SMS Message Modal */}
      {txForMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-500" /> Send Transaction Receipt
              </h4>
              <button
                onClick={() => setTxForMsg(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-purple-900 dark:text-purple-300">
                  <span>{txForMsg.customerName || txForMsg.category || 'Store Transaction'}</span>
                  <span className="font-mono">{formatCurrency(txForMsg.amount, settings.currency)}</span>
                </div>
                <p className="text-[11px] text-slate-500">Date: {formatDateDisplay(txForMsg.date)} {txForMsg.time ? `• ${txForMsg.time}` : ''}</p>
                {txForMsg.phone && <p className="text-[11px] text-slate-500">Mobile: {txForMsg.phone}</p>}
              </div>

              {(() => {
                const store = settings.storeName || 'Ayesha Provision Store';
                const name = txForMsg.customerName || 'Customer';
                const msgText = `Greetings ${name} from ${store}! Transaction of ${settings.currency}${txForMsg.amount} (${txForMsg.type.replace('_', ' ')}) on ${formatDateDisplay(txForMsg.date)} has been logged. Thank you!`;
                const cleanPhone = txForMsg.phone ? txForMsg.phone.replace(/[^0-9]/g, '') : '';
                const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

                return (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                      "{msgText}"
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const waUrl = waPhone
                            ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(msgText)}`
                            : `https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`;
                          window.open(waUrl, '_blank');
                          showToast('WhatsApp Opened', `Sending receipt to ${name}`);
                          setTxForMsg(null);
                        }}
                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> WhatsApp
                      </button>

                      <button
                        onClick={() => {
                          const smsUrl = cleanPhone
                            ? `sms:${cleanPhone}?body=${encodeURIComponent(msgText)}`
                            : `sms:?body=${encodeURIComponent(msgText)}`;
                          window.location.href = smsUrl;
                          showToast('SMS App Opened', `Preparing SMS for ${name}`);
                          setTxForMsg(null);
                        }}
                        className="py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> SMS App
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* History Financial Report Generator Modal (Daily, Weekly, Custom) */}
      {reportModalPeriod && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-indigo-600 dark:text-indigo-400 capitalize">
                <FileText className="w-4 h-4 text-indigo-500" />
                {reportModalPeriod} Financial Report
              </h4>
              <button
                onClick={() => setReportModalPeriod(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Report Card Container */}
            <div id="history-modal-report-card" className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-black text-base uppercase text-slate-900 dark:text-white">{settings.storeName}</h3>
                  <p className="text-[11px] text-slate-500">Owner: {settings.ownerName}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {reportModalPeriod.toUpperCase()} REPORT
                </span>
              </div>

              {(() => {
                const summary = calculatePeriodSummary(transactions, settings);
                const periodLabel = reportModalPeriod === 'daily' ? 'Today' : reportModalPeriod === 'weekly' ? 'This Week' : 'Filtered Selection';
                const s = reportModalPeriod === 'daily' ? summary.today : reportModalPeriod === 'weekly' ? summary.weekly : {
                  totalSales: stats.totalSales,
                  cashSales: stats.totalCashSales,
                  profit: stats.totalProfit,
                  homeMaintenanceSpent: stats.totalHomeMaintenanceSpent,
                };

                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Total Sales</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(s.totalSales || 0, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Cash Sales</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.cashSales || 0, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">Net Earned Profit</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-300 font-mono text-sm">{formatCurrency(s.profit || 0, settings.currency)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Household Spent</span>
                      <span>{formatCurrency(s.homeMaintenanceSpent || 0, settings.currency)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Export & Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  exportReportToPDF('history-modal-report-card', `${reportModalPeriod}_history_report`);
                  showToast('Exporting PDF...', 'Download starting');
                }}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>

              <button
                onClick={() => {
                  const pMap = { daily: 'Daily', weekly: 'Weekly', custom: 'Monthly' } as const;
                  const txt = generateTextReport(pMap[reportModalPeriod || 'daily'], transactions, settings);
                  navigator.clipboard.writeText(txt);
                  setCopiedReport(true);
                  showToast('Report Copied', 'Copied text report to clipboard');
                  setTimeout(() => setCopiedReport(false), 3000);
                }}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedReport ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
