import React, { useState, useMemo, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Send,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Receipt,
  Scale,
  Award,
  Zap,
  ArrowRight,
  LineChart as LineChartIcon,
  Calendar,
  Box,
  Layers,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  CreditCard,
  Smartphone,
  Info,
  Eye,
  CalendarCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useCashFlow } from '../../context/CashFlowContext';
import {
  formatCurrency,
  calculateSummary,
  calculateStoreLLMProfitMetrics,
  formatDateDisplay,
  getTodayDateString,
  filterTransactionsByDate,
} from '../../utils/calculations';
import type { ActiveTab } from '../common/BottomNav';

interface StoreLLMScreenProps {
  setActiveTab?: (tab: ActiveTab) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface DetailModalData {
  title: string;
  date?: string;
  isMonthlyView?: boolean;
  cashSalesInflow: number;
  upiInflow: number;
  cashInflow: number;
  profit10Percent: number;
  purchaseProfit: number;
  averageProfit: number;
  notes?: string;
}

export const StoreLLMScreen: React.FC<StoreLLMScreenProps> = ({ setActiveTab }) => {
  const { transactions, settings, setManualDailyProfit } = useCashFlow();

  const todayStr = getTodayDateString();

  // Auto-calculated Daily Cash + Online Inflow Sales for Today
  const todayCashSalesInflow = useMemo(() => {
    const todayTxs = transactions.filter((t) => t.date === todayStr);
    return todayTxs
      .filter((t) => t.type === 'cash_sale' || t.type === 'credit_payment')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  // Live Today Summary strictly for today's date
  const todaySummary = calculateSummary(transactions, settings, todayStr);

  // Core Inputs
  const [cashSales, setCashSales] = useState<number>(todayCashSalesInflow);
  const [manualPurchaseProfit, setManualPurchaseProfit] = useState<number>(
    todaySummary.manualProfit !== undefined ? todaySummary.manualProfit : 0
  );
  const [purchaseNotes, setPurchaseNotes] = useState<string>(
    todaySummary.manualProfitNotes || 'Wholesale discount difference'
  );

  useEffect(() => {
    setCashSales(todayCashSalesInflow);
    setManualPurchaseProfit(todaySummary.manualProfit !== undefined ? todaySummary.manualProfit : 0);
    if (todaySummary.manualProfitNotes) {
      setPurchaseNotes(todaySummary.manualProfitNotes);
    }
  }, [todayCashSalesInflow, todaySummary.manualProfit, todaySummary.manualProfitNotes]);

  // Table Expand / Collapse state (Default 5 rows)
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

  // Interactive Detail Breakdown Modal state
  const [detailModalData, setDetailModalData] = useState<DetailModalData | null>(null);

  // Interactive AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Live calculation metrics for today
  const profitMetrics = calculateStoreLLMProfitMetrics(
    cashSales,
    settings.profitRate || 10,
    manualPurchaseProfit
  );

  // Monthly Cash Flow Calculation (Cash + Online Inflow across current month)
  const monthlyCashFlowMetrics = useMemo(() => {
    const monthlyTxs = filterTransactionsByDate(transactions, 'this_month');
    let totalInflow = 0;
    let upiInflow = 0;
    let cashInflow = 0;

    monthlyTxs.forEach((t) => {
      if (t.type === 'cash_sale' || t.type === 'credit_payment') {
        totalInflow += t.amount;
        if (t.paymentMethod === 'UPI' || t.paymentMethod === 'Bank Transfer') {
          upiInflow += t.amount;
        } else {
          cashInflow += t.amount;
        }
      }
    });

    return {
      totalInflow,
      upiInflow,
      cashInflow,
    };
  }, [transactions]);

  // 1. Single Multi-Attribute Daily Graph Dataset (4 Attributes in 1 Chart)
  const dailyHistoryGraphData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      // Daily cash sales & online flow from ledger
      const dayTxs = transactions.filter((t) => t.date === dateStr && (t.type === 'cash_sale' || t.type === 'credit_payment'));
      const dayCashSales = dayTxs.reduce((sum, t) => sum + t.amount, 0);

      const finalSales = i === 0 ? cashSales : dayCashSales;
      const cProfit = (finalSales * (settings.profitRate || 10)) / 100;

      const rawVal = settings.manualDailyProfits ? settings.manualDailyProfits[dateStr] : undefined;
      let pProfit = 0;
      if (i === 0) {
        pProfit = manualPurchaseProfit;
      } else if (rawVal !== undefined) {
        if (typeof rawVal === 'number') pProfit = rawVal;
        else if (typeof rawVal === 'object' && rawVal !== null) pProfit = rawVal.amount;
      }

      // Formula: Divide by 2 ONLY when purchase profit > 0 is added! Else 100% of 10% sales profit!
      const avgProfit = pProfit > 0 ? (cProfit + pProfit) / 2 : cProfit;

      result.push({
        date: dateStr,
        day: dayLabel,
        salesInflow: finalSales,
        cashSalesProfit: Math.round(cProfit),
        purchasedProfit: Math.round(pProfit),
        averageProfit: Math.round(avgProfit),
      });
    }

    return result;
  }, [transactions, settings, cashSales, manualPurchaseProfit]);

  // 2. Complete Month History Dataset (Date & Day, 10% Cash Sales, Purchased Profit, Average Profit, Cash Flow)
  const monthlyHistoryData = useMemo(() => {
    const result = [];
    const today = new Date();
    const daysInMonth = 30; // Complete 30-day month history

    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateDisplay = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      // Calculate cash & online sales for dateStr
      const dayTxs = transactions.filter((t) => t.date === dateStr && (t.type === 'cash_sale' || t.type === 'credit_payment'));
      let dayCashSales = 0;
      let dayUpiSales = 0;
      let dayPureCashSales = 0;

      dayTxs.forEach((t) => {
        dayCashSales += t.amount;
        if (t.paymentMethod === 'UPI' || t.paymentMethod === 'Bank Transfer') {
          dayUpiSales += t.amount;
        } else {
          dayPureCashSales += t.amount;
        }
      });

      const finalSales = i === 0 ? cashSales : dayCashSales;
      const cProfit = (finalSales * (settings.profitRate || 10)) / 100;

      const rawVal = settings.manualDailyProfits ? settings.manualDailyProfits[dateStr] : undefined;
      let pProfit = 0;
      let hasManualOverride = false;
      let notes = '';

      if (i === 0) {
        pProfit = manualPurchaseProfit;
        notes = purchaseNotes;
        if (todaySummary.manualProfit !== undefined) hasManualOverride = true;
      } else if (rawVal !== undefined) {
        hasManualOverride = true;
        if (typeof rawVal === 'number') {
          pProfit = rawVal;
        } else if (typeof rawVal === 'object' && rawVal !== null) {
          pProfit = rawVal.amount;
          notes = rawVal.notes || '';
        }
      }

      // Formula: Divide by 2 ONLY when purchase profit > 0 is added! Else 100% of 10% sales profit!
      const avgProfit = pProfit > 0 ? (cProfit + pProfit) / 2 : cProfit;

      result.push({
        date: dateStr,
        dateDisplay,
        dayName,
        isToday: i === 0,
        salesInflow: finalSales,
        cashInflow: dayPureCashSales,
        upiInflow: dayUpiSales,
        cash10Percent: Math.round(cProfit),
        purchased: Math.round(pProfit),
        average: Math.round(avgProfit),
        hasManualOverride,
        notes,
      });
    }

    return result;
  }, [transactions, settings, cashSales, manualPurchaseProfit, purchaseNotes, todaySummary.manualProfit]);

  // 3. Total Month Profit Calculations across all 3 profit types & cash flows
  const monthlyTotals = useMemo(() => {
    let totalSalesInflow = 0;
    let total10Percent = 0;
    let totalPurchased = 0;
    let totalAverage = 0;

    monthlyHistoryData.forEach((row) => {
      totalSalesInflow += row.salesInflow;
      total10Percent += row.cash10Percent;
      totalPurchased += row.purchased;
      totalAverage += row.average;
    });

    return {
      totalSalesInflow,
      total10Percent,
      totalPurchased,
      totalAverage,
    };
  }, [monthlyHistoryData]);

  // Visible Table Rows: 5 rows by default, expands to all 30 rows of the month
  const visibleTableRows = isTableExpanded ? monthlyHistoryData : monthlyHistoryData.slice(0, 5);

  const initialAssistantMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Hello ${settings.ownerName || 'Store Owner'}! I am your **Store LLM Profit Expert** 🤖.

Here is your **Month Summary**:
• **Total Month Cash Flow**: ${formatCurrency(monthlyTotals.totalSalesInflow)}
• **Month 10% Sales Profit**: ${formatCurrency(monthlyTotals.total10Percent)}
• **Month Wholesale Purchase Profit**: ${formatCurrency(monthlyTotals.totalPurchased)}
• **Month Net Total Earning**: ${formatCurrency(monthlyTotals.totalAverage)}

🏆 **TODAY'S ONE DAY EARNING**: **${formatCurrency(profitMetrics.averageProfit)}**
*(Formula: (${formatCurrency(profitMetrics.cashSalesProfit)} + ${formatCurrency(profitMetrics.manualPurchaseProfit)}) ÷ 2)*

Tap any card or table row below to open detailed date-wise breakdown popups!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);

  // Handle saving manual purchase profit to settings context
  const handleSavePurchaseProfit = () => {
    const today = getTodayDateString();
    setManualDailyProfit(today, manualPurchaseProfit, purchaseNotes);
  };

  // Open Detail Modal for specific card or date row
  const openDetailModal = (data: DetailModalData) => {
    setDetailModalData(data);
  };

  // Generate AI Response
  const generateAIResponse = (userPrompt: string): string => {
    const lower = userPrompt.toLowerCase();
    const metrics = profitMetrics;

    if (lower.includes('month') || lower.includes('total') || lower.includes('all three') || lower.includes('cards')) {
      return `### 📊 Complete Month Profit & Cash Flow Totals

1. **Monthly Total Cash Flow**: **${formatCurrency(monthlyTotals.totalSalesInflow)}**
   *(Combined Cash & UPI inflow sales across all 30 days)*

2. **Monthly Total 10% Cash Sales Profit**: **${formatCurrency(monthlyTotals.total10Percent)}**
   *(Sum of 10% sales profit across 30 days)*

3. **Monthly Total Wholesale Purchase Profit**: **${formatCurrency(monthlyTotals.totalPurchased)}**
   *(Sum of wholesale purchase discount margins across 30 days)*

4. **Monthly Net Total Earning**: **${formatCurrency(monthlyTotals.totalAverage)}**
   *(Sum of combined average daily earnings)*`;
    }

    if (lower.includes('earning') || lower.includes('one day') || lower.includes('average') || lower.includes('breakdown')) {
      return `### 🏆 My One Day Earning Calculation Breakdown

1. **10% Cash Sales Profit**: **${formatCurrency(metrics.cashSalesProfit)}**
   *(Auto-populated as 10% of ${formatCurrency(metrics.cashSales)} Daily Cash & UPI Sales)*

2. **Purchased Profit Difference**: **${formatCurrency(metrics.manualPurchaseProfit)}**
   *(Wholesale purchase profit difference: ${purchaseNotes})*

3. **Combined Average Profit ("My One Day Earning")**: **${formatCurrency(metrics.averageProfit)}**
   *Formula: (${formatCurrency(metrics.cashSalesProfit)} + ${formatCurrency(metrics.manualPurchaseProfit)}) ÷ 2 = **${formatCurrency(metrics.averageProfit)}***

📊 **Effective Profit Margin**: **${metrics.blendedProfitMargin.toFixed(2)}%** on cash sales.`;
    }

    if (lower.includes('upi') || lower.includes('online') || lower.includes('bank')) {
      return `### 📱 UPI & Online Cash Flow Summary

• **Monthly UPI & Bank Inflow**: **${formatCurrency(monthlyCashFlowMetrics.upiInflow)}**
• **Monthly Pure Cash Inflow**: **${formatCurrency(monthlyCashFlowMetrics.cashInflow)}**
• **Total Monthly Cash Flow**: **${formatCurrency(monthlyCashFlowMetrics.totalInflow)}**

*(UPI represents **${((monthlyCashFlowMetrics.upiInflow / (monthlyCashFlowMetrics.totalInflow || 1)) * 100).toFixed(1)}%** of your total month cash flow)*`;
    }

    return `### 🤖 Store LLM Analysis for: "${userPrompt}"

Monthly Totals:
• **Total Month Cash Flow**: ${formatCurrency(monthlyTotals.totalSalesInflow)}
• **10% Sales Profit**: ${formatCurrency(monthlyTotals.total10Percent)}
• **Purchased Profit**: ${formatCurrency(monthlyTotals.totalPurchased)}
• **Total Month Net Earning**: **${formatCurrency(monthlyTotals.totalAverage)}**

Your small cards, 3D floating cubes, multi-attribute graphs, and 30-day expandable history table are synchronized!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 pb-28 space-y-5 sm:space-y-6 overflow-x-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Store LLM 3D Profit Suite</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  LIVE CALCULATION
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Daily & Monthly Profit Cards • Cash Flow Cards • Multi-Graphs • Day-by-Day Popup Reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DAILY PROFIT CALCULATION CARDS (2 CARDS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            Daily Profit Calculation Cards (10% Sales & Purchase Profit)
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Auto Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CARD 1: DAILY 10% SALES PROFIT CALCULATION CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                10% Daily Sales Profit Calculation Card
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                10% Sales Margin
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Daily Sales Cash & Online Flow (₹)
              </label>
              <input
                type="number"
                value={cashSales}
                onChange={(e) => setCashSales(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl text-lg font-black border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white shadow-xs font-mono"
                placeholder="15000"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                  Calculated 10% Profit
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  {formatCurrency(profitMetrics.cashSalesProfit)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-emerald-500/20">
                10% of {formatCurrency(cashSales)}
              </span>
            </div>
          </div>

          {/* CARD 2: WHOLESALE PURCHASE PROFIT CALCULATION CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border-2 border-purple-500/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4" />
                Wholesale Purchase Profit Calculation Card
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Wholesale Discount
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Purchased Profit Difference (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualPurchaseProfit}
                  onChange={(e) => setManualPurchaseProfit(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl text-lg font-black border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white shadow-xs font-mono"
                  placeholder="500"
                />
                <button
                  onClick={handleSavePurchaseProfit}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-all active:scale-95 shadow-md shadow-purple-600/20 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 block">
                  Wholesale Difference Margin
                </span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
                  {formatCurrency(manualPurchaseProfit)}
                </span>
              </div>
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-purple-500/20">
                Manual / Dashboard Entry
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DAILY SUMMARY TOTALS (3 CARDS - CLICKABLE FOR TODAY) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Today's Totals & Profit Summary (Tap Cards for Details)
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            Interactive Popups
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Cash & Online Sales Inflow */}
          <div
            onClick={() =>
              openDetailModal({
                title: "Today's Total Cash & Online Sales Inflow",
                date: todayStr,
                cashSalesInflow: cashSales,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: profitMetrics.cashSalesProfit,
                purchaseProfit: manualPurchaseProfit,
                averageProfit: profitMetrics.averageProfit,
                notes: 'Total Cash Sales + Credit Payments Collected Today',
              })
            }
            className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-700 shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Today Cash Sales Inflow
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(cashSales)}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Tap to view detail breakdown
              </span>
            </div>
            <span className="p-3 rounded-2xl bg-white/10 text-white group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <DollarSign className="w-6 h-6" />
            </span>
          </div>

          {/* Card 2: Total 10% Cash Flow Profit */}
          <div
            onClick={() =>
              openDetailModal({
                title: "Today's 10% Cash Flow Sales Profit",
                date: todayStr,
                cashSalesInflow: cashSales,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: profitMetrics.cashSalesProfit,
                purchaseProfit: manualPurchaseProfit,
                averageProfit: profitMetrics.averageProfit,
                notes: '10% calculated automatically on total daily cash sales inflow',
              })
            }
            className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl border border-emerald-400/40 shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                Today 10% Sales Profit
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(profitMetrics.cashSalesProfit)}
              </span>
              <span className="text-[9px] text-emerald-100 font-bold mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Tap to view detail breakdown
              </span>
            </div>
            <span className="p-3 rounded-2xl bg-white/20 text-white group-hover:bg-white group-hover:text-emerald-700 transition-colors">
              <Receipt className="w-6 h-6" />
            </span>
          </div>

          {/* Card 3: Total Purchase Profit Difference */}
          <div
            onClick={() =>
              openDetailModal({
                title: "Today's Wholesale Purchase Profit Difference",
                date: todayStr,
                cashSalesInflow: cashSales,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: profitMetrics.cashSalesProfit,
                purchaseProfit: manualPurchaseProfit,
                averageProfit: profitMetrics.averageProfit,
                notes: purchaseNotes,
              })
            }
            className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-4 rounded-3xl border border-purple-400/40 shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-100 block">
                Today Purchase Profit
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(manualPurchaseProfit)}
              </span>
              <span className="text-[9px] text-purple-100 font-bold mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Tap to view detail breakdown
              </span>
            </div>
            <span className="p-3 rounded-2xl bg-white/20 text-white group-hover:bg-white group-hover:text-purple-700 transition-colors">
              <Scale className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: MONTHLY PROFIT CARDS (2 NEW CARDS - CLICKABLE FOR DAY-BY-DAY MONTHLY REPORT) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            Monthly Profit Cards (Tap Cards to View Day-by-Day Monthly Breakdown)
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            30-Day Profit Report
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card A: Monthly 10% Cash Flow Profit Card */}
          <div
            onClick={() =>
              openDetailModal({
                title: 'Monthly 10% Cash Flow Sales Profit Report',
                isMonthlyView: true,
                cashSalesInflow: monthlyTotals.totalSalesInflow,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: monthlyTotals.total10Percent,
                purchaseProfit: monthlyTotals.totalPurchased,
                averageProfit: monthlyTotals.totalAverage,
                notes: 'Complete day-by-day 10% sales profit earned across all 30 days of the month',
              })
            }
            className="bg-gradient-to-br from-emerald-700 via-teal-900 to-slate-900 text-white p-4.5 rounded-3xl border border-emerald-400/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                Monthly 10% Cash Sales Profit
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
                {formatCurrency(monthlyTotals.total10Percent)}
              </span>
              <p className="text-[10px] text-emerald-200 mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Tap to view day-by-day monthly profit list
              </p>
            </div>
            <span className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <Receipt className="w-6 h-6" />
            </span>
          </div>

          {/* Card B: Monthly Wholesale Purchase Profit Card */}
          <div
            onClick={() =>
              openDetailModal({
                title: 'Monthly Wholesale Purchase Profit Report',
                isMonthlyView: true,
                cashSalesInflow: monthlyTotals.totalSalesInflow,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: monthlyTotals.total10Percent,
                purchaseProfit: monthlyTotals.totalPurchased,
                averageProfit: monthlyTotals.totalAverage,
                notes: 'Complete day-by-day wholesale purchase discount profit earned across all 30 days',
              })
            }
            className="bg-gradient-to-br from-purple-700 via-indigo-900 to-slate-900 text-white p-4.5 rounded-3xl border border-purple-400/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200 block">
                Monthly Purchase Profit Card
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
                {formatCurrency(monthlyTotals.totalPurchased)}
              </span>
              <p className="text-[10px] text-purple-200 mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Tap to view day-by-day monthly purchase profit
              </p>
            </div>
            <span className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-200 border border-purple-400/30 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Scale className="w-6 h-6" />
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: DEDICATED CASH FLOW CARDS (3 CARDS - PURE CASH, UPI ONLINE & TOTAL COMBINED CASH FLOW) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Monthly Cash Flow Cards (Pure Cash, UPI & Total Combined)
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            Tap Cards for Details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card A: Pure Cash Flow Card */}
          <div
            onClick={() =>
              openDetailModal({
                title: 'Monthly Pure Cash Flow Inflow Report',
                isMonthlyView: true,
                cashSalesInflow: monthlyCashFlowMetrics.cashInflow,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: (monthlyCashFlowMetrics.cashInflow * 10) / 100,
                purchaseProfit: monthlyTotals.totalPurchased,
                averageProfit: (monthlyCashFlowMetrics.cashInflow * 10) / 100,
                notes: 'Pure physical cash sales collected across all 30 days of the month',
              })
            }
            className="bg-gradient-to-br from-emerald-800 via-teal-950 to-slate-900 text-white p-4 rounded-3xl border border-emerald-500/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                Pure Cash Flow Card
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(monthlyCashFlowMetrics.cashInflow)}
              </span>
              <p className="text-[10px] text-emerald-200 mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Cash Share: {((monthlyCashFlowMetrics.cashInflow / (monthlyCashFlowMetrics.totalInflow || 1)) * 100).toFixed(1)}%
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>

          {/* Card B: UPI & Online Cash Flow Card */}
          <div
            onClick={() =>
              openDetailModal({
                title: 'UPI & Online Cash Flow Inflow Report',
                isMonthlyView: true,
                cashSalesInflow: monthlyCashFlowMetrics.upiInflow,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: (monthlyCashFlowMetrics.upiInflow * 10) / 100,
                purchaseProfit: monthlyTotals.totalPurchased,
                averageProfit: (monthlyCashFlowMetrics.upiInflow * 10) / 100,
                notes: 'UPI & Bank Transfer sales flow collected across the month',
              })
            }
            className="bg-gradient-to-br from-blue-900 via-sky-950 to-slate-900 text-white p-4 rounded-3xl border border-sky-500/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 block">
                UPI & Online Flow Card
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(monthlyCashFlowMetrics.upiInflow)}
              </span>
              <p className="text-[10px] text-sky-200 mt-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> UPI Share: {((monthlyCashFlowMetrics.upiInflow / (monthlyCashFlowMetrics.totalInflow || 1)) * 100).toFixed(1)}%
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Smartphone className="w-5 h-5" />
            </span>
          </div>

          {/* Card C: Total Combined Cash Flow Card */}
          <div
            onClick={() =>
              openDetailModal({
                title: 'Total Combined Monthly Cash Flow Report',
                isMonthlyView: true,
                cashSalesInflow: monthlyCashFlowMetrics.totalInflow,
                upiInflow: monthlyCashFlowMetrics.upiInflow,
                cashInflow: monthlyCashFlowMetrics.cashInflow,
                profit10Percent: monthlyTotals.total10Percent,
                purchaseProfit: monthlyTotals.totalPurchased,
                averageProfit: monthlyTotals.totalAverage,
                notes: 'Total Combined Sales Cash Flow (Pure Cash + UPI Online) across all 30 days',
              })
            }
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-3xl border border-indigo-500/40 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                Total Combined Cash Flow Card
              </span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {formatCurrency(monthlyCashFlowMetrics.totalInflow)}
              </span>
              <p className="text-[10px] text-indigo-200 mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Pure Cash + UPI Combined Total
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 5: MULTI-ATTRIBUTE PROFIT & CASH FLOW CHART (3/4 BAR & LINE TYPES) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Multi-Attribute Daily Profit & Cash Flow Graph
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displays <strong>Cash Flow</strong>, <strong>10% Sales Profit</strong>, <strong>Purchase Profit</strong> & <strong>One Day Net Earning</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            4-in-1 Chart
          </span>
        </div>

        {/* Graph Legend Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
            1: Cash Flow Inflow
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            2: 10% Sales Profit
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            3: Purchase Profit
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            4: Net One Day Earning
          </span>
        </div>

        <div className="h-64 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyHistoryGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 9 }} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `₹${value}`,
                  name === 'salesInflow'
                    ? 'Total Cash Sales Flow'
                    : name === 'cashSalesProfit'
                    ? '10% Sales Profit'
                    : name === 'purchasedProfit'
                    ? 'Wholesale Purchase Profit'
                    : 'Net One Day Earning',
                ]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="salesInflow" fill="#64748b" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="cashSalesProfit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="purchasedProfit" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="averageProfit" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 6: EXPANDABLE 30-DAY HISTORY TABLE (CLICKABLE ROWS) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Daily Profit & Cash Flow Table ({isTableExpanded ? 'Full Month - 30 Days' : 'Recent 5 Days'})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row to open the full date-by-date detail popup
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            {isTableExpanded ? 'Expanded (30 Days)' : 'Initial 5 Rows'}
          </span>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-400 font-black tracking-wider">
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4 text-slate-700 dark:text-slate-300">Sales Inflow</th>
                <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">10% Sales Profit</th>
                <th className="py-3 px-4 text-purple-600 dark:text-purple-400">Purchased Profit</th>
                <th className="py-3 px-4 text-blue-600 dark:text-blue-400 font-extrabold">Average Earning</th>
                <th className="py-3 px-4 text-center text-slate-400">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm font-bold">
              {visibleTableRows.map((row) => (
                <tr
                  key={row.date}
                  onClick={() =>
                    openDetailModal({
                      title: `Profit & Cash Flow Breakdown for ${row.dateDisplay} (${row.dayName})`,
                      date: row.date,
                      cashSalesInflow: row.salesInflow,
                      upiInflow: row.upiInflow,
                      cashInflow: row.cashInflow,
                      profit10Percent: row.cash10Percent,
                      purchaseProfit: row.purchased,
                      averageProfit: row.average,
                      notes: row.notes,
                    })
                  }
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    row.isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{row.dateDisplay}</span>
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">({row.dayName})</span>
                    {row.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                    {formatCurrency(row.salesInflow)}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-black font-mono">
                    {formatCurrency(row.cash10Percent)}
                  </td>
                  <td className="py-3.5 px-4 text-purple-600 dark:text-purple-400 font-black font-mono">
                    {formatCurrency(row.purchased)}
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-black font-mono bg-blue-50/40 dark:bg-blue-950/20">
                    {formatCurrency(row.average)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                      title="View date breakdown"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXPAND / COLLAPSE BUTTON FOR FULL MONTH */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="py-2.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 shadow-xs"
          >
            {isTableExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Collapse Table (Show 5 Rows)
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Expand Full Month (Show All 30 Days)
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 7: INTERACTIVE DETAIL BREAKDOWN MODAL (DAILY OR DAY-BY-DAY MONTHLY LIST) */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 shrink-0">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-500" />
                  {detailModalData.title}
                </h4>
                {detailModalData.date && (
                  <span className="text-xs text-slate-400 font-bold block mt-0.5">
                    Target Date: {formatDateDisplay(detailModalData.date)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDetailModalData(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {/* Overall Summary Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block">
                  {detailModalData.isMonthlyView ? 'Total Month Sales Cash Flow Inflow' : 'Daily Sales Cash Flow Inflow'}
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(detailModalData.cashSalesInflow)}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Pure Cash Inflow</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {formatCurrency(detailModalData.cashInflow)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-400 font-bold block">UPI / Online Flow</span>
                    <span className="font-bold text-sky-400 font-mono">
                      {formatCurrency(detailModalData.upiInflow)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profit Calculation Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[9px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 block">
                    {detailModalData.isMonthlyView ? 'Monthly 10% Sales Profit' : '10% Daily Sales Profit'}
                  </span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatCurrency(detailModalData.profit10Percent)}
                  </div>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300">10% of Sales Inflow</span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-200 dark:border-purple-800/60">
                  <span className="text-[9px] font-extrabold uppercase text-purple-800 dark:text-purple-300 block">
                    {detailModalData.isMonthlyView ? 'Monthly Purchase Profit' : 'Daily Purchase Profit'}
                  </span>
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                    {formatCurrency(detailModalData.purchaseProfit)}
                  </div>
                  <span className="text-[9px] text-purple-700 dark:text-purple-300">Wholesale Margin</span>
                </div>
              </div>

              {/* Final Net Average Earning Banner */}
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl border border-blue-400/40 space-y-1 shadow-lg">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-100 font-bold uppercase text-[10px]">
                    {detailModalData.isMonthlyView ? 'MONTHLY NET TOTAL EARNING' : 'MY ONE DAY EARNING'}
                  </span>
                  <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    Net Combined Profit
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  {formatCurrency(detailModalData.averageProfit)}
                </div>
                <p className="text-[10px] text-blue-100 pt-1 border-t border-blue-400/40 mt-1">
                  {detailModalData.isMonthlyView
                    ? 'Total combined net earnings across all 30 days of the month'
                    : detailModalData.purchaseProfit > 0
                    ? `Formula: (${formatCurrency(detailModalData.profit10Percent)} + ${formatCurrency(detailModalData.purchaseProfit)}) ÷ 2`
                    : '100% of 10% Daily Cash Sales Profit'}
                </p>
              </div>

              {/* DAY-BY-DAY MONTHLY PROFIT BREAKDOWN LIST (Visible when isMonthlyView is true) */}
              {detailModalData.isMonthlyView && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Day-by-Day Monthly Profit Earned ({monthlyHistoryData.length} Days)
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Date-wise List</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800">
                    {monthlyHistoryData.map((row) => (
                      <div key={row.date} className="py-2 flex items-center justify-between text-xs gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{row.dateDisplay}</span>
                            <span className="text-[10px] text-slate-400">({row.dayName})</span>
                            {row.isToday && (
                              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500 text-white">
                                Today
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                            Sales: {formatCurrency(row.salesInflow)}
                          </span>
                        </div>

                        <div className="text-right space-y-0.5 font-mono">
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            10% Profit: +{formatCurrency(row.cash10Percent)}
                          </div>
                          {row.purchased > 0 && (
                            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              Purchase Profit: +{formatCurrency(row.purchased)}
                            </div>
                          )}
                          <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                            Net Day Earning: {formatCurrency(row.average)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailModalData.notes && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                  <strong>Notes:</strong> {detailModalData.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: AI STORE LLM PROFIT ASSISTANT CHAT ROOM */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                AI Store LLM Profit Advisor
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask questions about 10% sales profit, wholesale purchase margins & cash flow
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/30">
            Store AI Active
          </span>
        </div>

        {/* Quick Query Chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendMessage('Breakdown my 10% daily sales profit')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            💡 10% Profit Breakdown
          </button>
          <button
            onClick={() => handleSendMessage('Show complete month profit totals')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            📊 Month Totals
          </button>
          <button
            onClick={() => handleSendMessage('Show UPI vs Cash Flow split')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            📱 UPI Cash Flow
          </button>
        </div>

        {/* Chat Messages Log */}
        <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                    {line}
                  </p>
                ))}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold p-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing store profit metrics...
            </div>
          )}
        </div>

        {/* Chat Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask AI Store LLM about today's cash sales or profit..."
            className="w-full bg-slate-950 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-white"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
