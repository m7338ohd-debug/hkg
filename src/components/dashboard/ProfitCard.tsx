import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  CheckCircle2,
  TrendingUp,
  X,
  HelpCircle,
  Calendar,
  Calculator,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, calculatePeriodSummary, getTodayDateString } from '../../utils/calculations';

export const ProfitCard: React.FC = () => {
  const { transactions, settings, setManualDailyProfit } = useCashFlow();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const todayStr = getTodayDateString();
  const periodSummary = calculatePeriodSummary(transactions, settings);
  const today = periodSummary.today;
  const weekly = periodSummary.weekly;
  const monthly = periodSummary.monthly;

  const [manualProfitInput, setManualProfitInput] = useState<string>(
    today.isManualProfit ? today.profit.toString() : today.autoProfit.toString()
  );
  const [profitNotesInput, setProfitNotesInput] = useState<string>(today.manualProfitNotes || '');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const handleOpenEditModal = () => {
    setManualProfitInput(today.isManualProfit ? today.profit.toString() : today.autoProfit.toString());
    setProfitNotesInput(today.manualProfitNotes || '');
    setSelectedDate(todayStr);
    setIsEditModalOpen(true);
  };

  const handleSaveProfit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(manualProfitInput);
    if (!isNaN(numAmount) && numAmount >= 0) {
      setManualDailyProfit(selectedDate, numAmount, profitNotesInput);
      setIsEditModalOpen(false);
    }
  };

  const handleResetToAuto = () => {
    setManualDailyProfit(selectedDate, undefined, undefined);
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30 space-y-4 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              Daily Profit Tracker
              {today.isManualProfit ? (
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Edit3 className="w-2.5 h-2.5" /> Manual Entry
                </span>
              ) : (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Auto Calculated (2%)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Manual daily profit entry + auto purchase/sales calculation</p>
          </div>
        </div>

        <button
          onClick={handleOpenEditModal}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" /> Set Profit
        </button>
      </div>

      {/* Primary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        {/* Main Display Profit */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Today's Profit Earned</span>
            <span className="text-emerald-400 text-[10px] font-mono">
              {today.isManualProfit ? 'Custom Entered' : 'Sales Margin'}
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {formatCurrency(today.profit, settings.currency)}
          </div>
          {today.manualProfitNotes ? (
            <p className="text-[11px] font-semibold text-amber-300 bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/30 mt-1 inline-block">
              Note: {today.manualProfitNotes}
            </p>
          ) : (
            <p className="text-[10px] text-slate-400">
              {today.isManualProfit
                ? `Auto-calc was ${formatCurrency(today.autoProfit, settings.currency)} (sales 2%)`
                : `Calculated automatically from total sales (${formatCurrency(today.totalSales, settings.currency)})`}
            </p>
          )}
        </div>

        {/* Comparison: Auto vs Manual */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Calculated Profit (Sales vs Purchases)</span>
            <span className="text-blue-400 text-[10px] font-bold">Auto Math</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-300 font-mono mt-1">
            {formatCurrency(today.autoProfit, settings.currency)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60">
            <span>Weekly: <strong className="text-emerald-400">{formatCurrency(weekly.profit, settings.currency)}</strong></span>
            <span>Monthly: <strong className="text-emerald-400">{formatCurrency(monthly.profit, settings.currency)}</strong></span>
          </div>
        </div>
      </div>

      {/* Edit Profit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" /> Manually Add Daily Profit
              </h4>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Actual Daily Profit Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={manualProfitInput}
                  onChange={(e) => setManualProfitInput(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-calculated 2% profit for today is {formatCurrency(today.autoProfit, settings.currency)}.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profit Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={profitNotesInput}
                  onChange={(e) => setProfitNotesInput(e.target.value)}
                  placeholder="e.g. Special Sunday grocery peak profit, bulk rice margin"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Profit
                </button>

                {today.isManualProfit && (
                  <button
                    type="button"
                    onClick={handleResetToAuto}
                    className="py-3 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
