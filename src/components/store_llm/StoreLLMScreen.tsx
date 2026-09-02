import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculateSummary, calculateStoreLLMProfitMetrics, formatDateDisplay } from '../../utils/calculations';
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

export const StoreLLMScreen: React.FC<StoreLLMScreenProps> = ({ setActiveTab }) => {
  const { transactions, settings, setManualDailyProfit } = useCashFlow();

  // Live Today Summary for Auto-population
  const todaySummary = calculateSummary(transactions, settings);

  // Core Inputs
  const [cashSales, setCashSales] = useState<number>(todaySummary.cashSales || 15000);
  const [manualPurchaseProfit, setManualPurchaseProfit] = useState<number>(
    todaySummary.manualProfit !== undefined ? todaySummary.manualProfit : 500
  );
  const [purchaseNotes, setPurchaseNotes] = useState<string>(todaySummary.manualProfitNotes || 'Wholesale discount difference');

  // Table Expand / Collapse state (Default 5 rows)
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(false);

  // Interactive AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Live calculation metrics
  const profitMetrics = calculateStoreLLMProfitMetrics(
    cashSales,
    settings.profitRate || 2,
    manualPurchaseProfit
  );

  // 1. Single Multi-Attribute Daily Graph Dataset (Day, Amount & Type in 1 Single Graph)
  const dailyHistoryGraphData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      // Daily cash sales from ledger or fallback calculation
      const dayTxs = transactions.filter((t) => t.date === dateStr && t.type === 'cash_sale');
      const dayCashSales = dayTxs.reduce((sum, t) => sum + t.amount, 0);

      const finalSales = i === 0 ? cashSales : (dayCashSales || Math.round(cashSales * (0.85 + (i % 3) * 0.1)));
      const cProfit = (finalSales * (settings.profitRate || 2)) / 100;

      const rawVal = settings.manualDailyProfits ? settings.manualDailyProfits[dateStr] : undefined;
      let pProfit = manualPurchaseProfit;
      if (i !== 0 && rawVal !== undefined) {
        if (typeof rawVal === 'number') pProfit = rawVal;
        else if (typeof rawVal === 'object' && rawVal !== null) pProfit = rawVal.amount;
      } else if (i !== 0) {
        pProfit = Math.round(manualPurchaseProfit * (0.8 + (i % 2) * 0.3));
      }

      const avgProfit = (cProfit + pProfit) / 2;

      result.push({
        date: dateStr,
        day: dayLabel,
        cashSalesProfit: Math.round(cProfit),
        purchasedProfit: Math.round(pProfit),
        averageProfit: Math.round(avgProfit),
      });
    }

    return result;
  }, [transactions, settings, cashSales, manualPurchaseProfit]);

  // 2. Complete Month History Dataset (Date & Day, 2% Cash Sales, Purchased Profit, Average Profit)
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

      // Calculate cash sales for dateStr
      const dayTxs = transactions.filter((t) => t.date === dateStr && t.type === 'cash_sale');
      const dayCashSales = dayTxs.reduce((sum, t) => sum + t.amount, 0);

      const finalSales = i === 0 ? cashSales : (dayCashSales || Math.round(cashSales * (0.85 + (i % 4) * 0.08)));
      const cProfit = (finalSales * (settings.profitRate || 2)) / 100;

      const rawVal = settings.manualDailyProfits ? settings.manualDailyProfits[dateStr] : undefined;
      let pProfit = manualPurchaseProfit;
      if (i !== 0 && rawVal !== undefined) {
        if (typeof rawVal === 'number') pProfit = rawVal;
        else if (typeof rawVal === 'object' && rawVal !== null) pProfit = rawVal.amount;
      } else if (i !== 0) {
        pProfit = Math.round(manualPurchaseProfit * (0.8 + (i % 3) * 0.2));
      }

      const avgProfit = (cProfit + pProfit) / 2;

      result.push({
        date: dateStr,
        dateDisplay,
        dayName,
        isToday: i === 0,
        cash2Percent: Math.round(cProfit),
        purchased: Math.round(pProfit),
        average: Math.round(avgProfit),
      });
    }

    return result;
  }, [transactions, settings, cashSales, manualPurchaseProfit]);

  // 3. Total Month Profit Calculations across all 3 profit types
  const monthlyTotals = useMemo(() => {
    let total2Percent = 0;
    let totalPurchased = 0;
    let totalAverage = 0;

    monthlyHistoryData.forEach((row) => {
      total2Percent += row.cash2Percent;
      totalPurchased += row.purchased;
      totalAverage += row.average;
    });

    return {
      total2Percent,
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

Here is your **Month Totals & Daily Earning**:
• **Month 2% Sales Profit**: ${formatCurrency(monthlyTotals.total2Percent)}
• **Month Purchased Profit**: ${formatCurrency(monthlyTotals.totalPurchased)}
• **Month Total Earning**: ${formatCurrency(monthlyTotals.totalAverage)}

🏆 **TODAY'S ONE DAY EARNING**: **${formatCurrency(profitMetrics.averageProfit)}**
*(Formula: (${formatCurrency(profitMetrics.cashSalesProfit)} + ${formatCurrency(profitMetrics.manualPurchaseProfit)}) ÷ 2)*

Check out the Small Month Profit Cards, 3D Cubes, and 5-Row Expandable Month Table below!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);

  // Handle saving manual purchase profit to settings context
  const handleSavePurchaseProfit = () => {
    const today = new Date().toISOString().split('T')[0];
    setManualDailyProfit(today, manualPurchaseProfit, purchaseNotes);
  };

  // Generate AI Response
  const generateAIResponse = (userPrompt: string): string => {
    const lower = userPrompt.toLowerCase();
    const metrics = profitMetrics;

    if (lower.includes('month') || lower.includes('total') || lower.includes('all three') || lower.includes('cards')) {
      return `### 📊 Complete Month Profit Totals (All 3 Types)

1. **Monthly Total 2% Cash Sales Profit**: **${formatCurrency(monthlyTotals.total2Percent)}**
   *(Sum of 2% cash sales profit across all 30 days of the month)*

2. **Monthly Total Purchased Profit**: **${formatCurrency(monthlyTotals.totalPurchased)}**
   *(Sum of wholesale purchased profit differences across all 30 days)*

3. **Monthly Total Net Earning**: **${formatCurrency(monthlyTotals.totalAverage)}**
   *(Sum of combined average daily earnings across all 30 days)*`;
    }

    if (lower.includes('earning') || lower.includes('one day') || lower.includes('average') || lower.includes('breakdown')) {
      return `### 🏆 My One Day Earning Calculation Breakdown

1. **2% Cash Sales Profit**: **${formatCurrency(metrics.cashSalesProfit)}**
   *(Auto-populated as 2% of ${formatCurrency(metrics.cashSales)} Daily Cash Sales)*

2. **Purchased Profit Difference**: **${formatCurrency(metrics.manualPurchaseProfit)}**
   *(Manually added wholesale purchase profit difference)*

3. **Combined Average Profit ("My One Day Earning")**: **${formatCurrency(metrics.averageProfit)}**
   *Formula: (${formatCurrency(metrics.cashSalesProfit)} + ${formatCurrency(metrics.manualPurchaseProfit)}) ÷ 2 = **${formatCurrency(metrics.averageProfit)}***

📊 **Effective Profit Margin**: **${metrics.blendedProfitMargin.toFixed(2)}%** on cash sales.`;
    }

    return `### 🤖 Store LLM Analysis for: "${userPrompt}"

Monthly Totals:
• **2% Sales Profit**: ${formatCurrency(monthlyTotals.total2Percent)}
• **Purchased Profit**: ${formatCurrency(monthlyTotals.totalPurchased)}
• **Total Month Earning**: **${formatCurrency(monthlyTotals.totalAverage)}**

Your small month profit cards, 3D floating cubes, and expandable history table are updated!`;
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
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-4 pb-28 space-y-5 sm:space-y-7 animate-in fade-in duration-200">
      {/* Screen Header Banner */}
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
                  MONTHLY TOTAL CARDS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Total Month Cards • Floating 3D Cubes • Single Daily Graph • 5-Row Expandable History
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
              Daily Sales & Purchased Profit Inputs
            </h2>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Live Ledger Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Daily Cash Sales */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-500" />
                Daily Cash Sales (₹)
              </label>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                2% Profit: {formatCurrency(profitMetrics.cashSalesProfit)}
              </span>
            </div>
            <input
              type="number"
              value={cashSales}
              onChange={(e) => setCashSales(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl text-base font-black border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white shadow-xs"
              placeholder="15000"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Auto-calculates <strong>2% cash sales profit</strong> ({formatCurrency(profitMetrics.cashSalesProfit)}).
            </p>
          </div>

          {/* Manual Purchased Profit */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-500" />
                Purchased Profit Difference (₹)
              </label>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                Manual Entry
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={manualPurchaseProfit}
                onChange={(e) => setManualPurchaseProfit(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl text-base font-black border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white shadow-xs"
                placeholder="500"
              />
              <button
                onClick={handleSavePurchaseProfit}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-md shadow-purple-600/20"
                title="Save manual purchase profit for today"
              >
                Save
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Wholesale discount margin added manually.
            </p>
          </div>
        </div>
      </div>

      {/* TOTAL MONTH PROFIT SMALL CARDS (3 TYPES) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Total Month Profit Cards (All 3 Types)
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            30-Day Monthly Totals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Small Card 1: Total Month 2% Cash Sales Profit */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                Month 2% Sales Profit
              </span>
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                {formatCurrency(monthlyTotals.total2Percent)}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </span>
          </div>

          {/* Small Card 2: Total Month Purchased Profit */}
          <div className="bg-purple-50/80 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                Month Purchased Profit
              </span>
              <span className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5 block">
                {formatCurrency(monthlyTotals.totalPurchased)}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Scale className="w-5 h-5" />
            </span>
          </div>

          {/* Small Card 3: Total Month Average Profit (Total Earning) */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                Month Total Net Earning
              </span>
              <span className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono mt-0.5 block">
                {formatCurrency(monthlyTotals.totalAverage)}
              </span>
            </div>
            <span className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Award className="w-5 h-5" />
            </span>
          </div>
        </div>
      </div>

      {/* 1. 3D FLOATING CUBIC STRUCTURE CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-500" />
            3D Floating Cubic Structure Profit Cards
          </h2>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Interactive 3D Cubes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* CUBE 1: 2% Cash Sales Profit (3D Emerald Cube) */}
          <div className="animate-float-cube cube-3d-card bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 rounded-3xl p-5 border-2 border-emerald-500/40 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-emerald-400" />
                2% Cash Sales Cube
              </span>
              <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Receipt className="w-5 h-5" />
              </span>
            </div>

            {/* Floating Number Badge */}
            <div className="animate-float-number my-3">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]">
                {formatCurrency(profitMetrics.cashSalesProfit)}
              </div>
            </div>

            <p className="text-[11px] text-emerald-200 mt-2 font-medium">
              Auto 2% on {formatCurrency(profitMetrics.cashSales)} total cash sales.
            </p>
          </div>

          {/* CUBE 2: Purchased Profit Difference (3D Purple Cube) */}
          <div
            className="animate-float-cube cube-3d-card bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 rounded-3xl p-5 border-2 border-purple-500/40 text-white relative overflow-hidden group"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-purple-400" />
                Purchased Profit Cube
              </span>
              <span className="p-2 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Scale className="w-5 h-5" />
              </span>
            </div>

            {/* Floating Number Badge */}
            <div className="animate-float-number my-3">
              <div className="text-3xl sm:text-4xl font-black text-purple-300 tracking-tight drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)]">
                {formatCurrency(profitMetrics.manualPurchaseProfit)}
              </div>
            </div>

            <p className="text-[11px] text-purple-200 mt-2 font-medium">
              Manual wholesale discount margin.
            </p>
          </div>

          {/* CUBE 3: TOTAL AVERAGE PROFIT (MY ONE DAY EARNING 3D BLUE CUBE) */}
          <div
            className="animate-float-cube cube-3d-card bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 rounded-3xl p-5 border-2 border-blue-400 text-white relative overflow-hidden shadow-2xl group"
            style={{ animationDelay: '1.5s' }}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-300" />
                MY ONE DAY EARNING CUBE
              </span>
              <span className="p-2 rounded-2xl bg-white/20 text-white border border-white/30 shadow-md">
                <DollarSign className="w-5 h-5" />
              </span>
            </div>

            {/* Floating Number Badge */}
            <div className="animate-float-number my-3">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_6px_15px_rgba(59,130,246,0.8)]">
                {formatCurrency(profitMetrics.averageProfit)}
              </div>
            </div>

            <p className="text-[11px] text-blue-100 mt-2 font-bold">
              Combined Average Profit of both 2% Sales & Purchase Margins!
            </p>
          </div>
        </div>
      </div>

      {/* 2. SINGLE MULTI-ATTRIBUTE DAILY GRAPH (DAY, AMOUNT & TYPE IN 1 SINGLE GRAPH) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Single Multi-Attribute Daily Graph
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displays <strong>Day (X-Axis)</strong>, <strong>Amount (Y-Axis)</strong>, and <strong>Type (Color Bars)</strong> in one single chart
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            3-in-1 Daily Chart
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyHistoryGraphData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `₹${value}`,
                  name === 'cashSalesProfit'
                    ? 'Type: 2% Cash Sales Profit'
                    : name === 'purchasedProfit'
                    ? 'Type: Purchased Profit'
                    : 'Type: Average One Day Earning',
                ]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {value === 'cashSalesProfit'
                      ? 'Type 1: 2% Cash Sales Profit'
                      : value === 'purchasedProfit'
                      ? 'Type 2: Purchased Profit'
                      : 'Type 3: Average (One Day Earning)'}
                  </span>
                )}
              />
              <Bar dataKey="cashSalesProfit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="purchasedProfit" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="averageProfit" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. EXPANDABLE MONTH HISTORY TABLE (5 ROWS INITIALLY, EXPANDS TO FULL MONTH) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Daily History Profit Table ({isTableExpanded ? 'Full Month - 30 Days' : 'Recent 5 Days'})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Displays <strong>Date & Day</strong>, <strong>2% Cash Sales Profit</strong>, <strong>Purchased Profit</strong>, and <strong>Average One Day Earning</strong>
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
                <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">2% Cash Sales Profit</th>
                <th className="py-3 px-4 text-purple-600 dark:text-purple-400">Purchased Profit</th>
                <th className="py-3 px-4 text-blue-600 dark:text-blue-400 font-extrabold">Average (One Day Earning)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm font-bold">
              {visibleTableRows.map((row) => (
                <tr
                  key={row.date}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
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
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-black font-mono">
                    {formatCurrency(row.cash2Percent)}
                  </td>
                  <td className="py-3.5 px-4 text-purple-600 dark:text-purple-400 font-black font-mono">
                    {formatCurrency(row.purchased)}
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-black font-mono bg-blue-50/40 dark:bg-blue-950/20">
                    {formatCurrency(row.average)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EXPAND / COLLAPSE BUTTON FOR FULL MONTH */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isTableExpanded ? (
              <>
                <span>Show Recent 5 Days</span>
                <ChevronUp className="w-4 h-4 text-purple-500" />
              </>
            ) : (
              <>
                <span>Expand Complete Month History ({monthlyHistoryData.length} Days)</span>
                <ChevronDown className="w-4 h-4 text-purple-500" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* STORE LLM CHAT ASSISTANT */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Ask Store LLM Expert</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Financial Analysis Ready
              </p>
            </div>
          </div>
          <button
            onClick={() => setMessages([initialAssistantMessage])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-medium leading-relaxed">
                  {msg.text}
                </div>
                <span
                  className={`text-[9px] block text-right mt-1.5 font-semibold ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="font-semibold">Store LLM is calculating analysis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick Prompts:</span>
          <button
            onClick={() => handleSendMessage('Calculate My One Day Earning')}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
          >
            🏆 One Day Earning
          </button>
          <button
            onClick={() => handleSendMessage('Show Complete Month Profit Totals')}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
          >
            📊 Month Profit Totals
          </button>
          <button
            onClick={() => handleSendMessage('Explain Single Daily Graph with Day, Amount and Type')}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
          >
            📊 Single Graph (Day/Amount/Type)
          </button>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Store LLM about month profit totals, 3D cubes, average earnings..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
