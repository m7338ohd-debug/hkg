import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  CheckCircle2,
  X,
  PlusCircle,
  RotateCcw,
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

  const [profitAmountInput, setProfitAmountInput] = useState<string>(
    today.isManualProfit ? today.profit.toString() : ''
  );
  const [profitNotesInput, setProfitNotesInput] = useState<string>(today.manualProfitNotes || '');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const handleOpenEditModal = () => {
    setSelectedDate(todayStr);
    setProfitAmountInput(today.isManualProfit ? today.profit.toString() : '');
    setProfitNotesInput(today.manualProfitNotes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfit = (e: React.FormEvent) => {
    e.preventDefault();

    const val = parseFloat(profitAmountInput);
    if (isNaN(val) || val < 0) return;

    setManualDailyProfit(selectedDate, val, profitNotesInput.trim() || undefined);
    setIsEditModalOpen(false);
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
                  Auto Calculated (10%)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">Independent manual profit & auto cash sales profit</p>
          </div>
        </div>

        <button
          onClick={handleOpenEditModal}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Set Profit
        </button>
      </div>

      {/* Primary Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        {/* Main Display Profit */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Today's Recorded Profit</span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold">
              {today.isManualProfit ? 'Manual Entry' : '10% Cash Sales'}
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {formatCurrency(today.profit, settings.currency)}
          </div>
          {today.isManualProfit ? (
            <div className="pt-1">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-500/30 inline-block">
                Manual: {formatCurrency(today.profit, settings.currency)} {today.manualProfitNotes ? `(${today.manualProfitNotes})` : ''}
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400">
              Calculated automatically as 10% of Cash Sales ({formatCurrency(today.cashSales, settings.currency)})
            </p>
          )}
        </div>

        {/* Auto Calculated Profit (Unmixed) */}
        <div className="p-3.5 sm:p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-center text-xs gap-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] truncate">Auto Calculated Profit</span>
            <span className="text-blue-400 text-[10px] font-bold shrink-0">10% Cash Sales</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-300 font-mono mt-1">
            {formatCurrency(today.autoProfit, settings.currency)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-700/60 gap-1">
            <span className="truncate">Weekly: <strong className="text-emerald-400">{formatCurrency(weekly.profit, settings.currency)}</strong></span>
            <span className="truncate">Monthly: <strong className="text-emerald-400">{formatCurrency(monthly.profit, settings.currency)}</strong></span>
          </div>
        </div>
      </div>

      {/* Daily Profit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl text-slate-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <PlusCircle className="w-4 h-4 text-emerald-500" /> Manual Daily Profit Entry
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

              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Auto Sales Profit (10%):</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(today.autoProfit, settings.currency)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Enter Manual Profit Amount ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={profitAmountInput}
                    onChange={(e) => setProfitAmountInput(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-3 bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700 rounded-xl text-xl font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This amount will be saved cleanly as your manual profit without mixing with auto calculation.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  value={profitNotesInput}
                  onChange={(e) => setProfitNotesInput(e.target.value)}
                  placeholder="e.g. Evening grocery profit"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> SAVE MANUAL PROFIT
                </button>

                {today.isManualProfit && (
                  <button
                    type="button"
                    onClick={handleResetToAuto}
                    className="py-3 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    title="Reset to Auto Calculation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
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
