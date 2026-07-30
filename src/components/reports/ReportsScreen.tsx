import React, { useState } from 'react';
import { Download, Share2, Printer, Calendar, FileText, Check, Copy } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, formatDateDisplay, calculatePeriodSummary } from '../../utils/calculations';
import { exportReportToPDF, generateTextReport } from '../../utils/pdfExport';

export const ReportsScreen: React.FC = () => {
  const { transactions, settings, showToast } = useCashFlow();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [copied, setCopied] = useState<boolean>(false);

  const summary = calculatePeriodSummary(transactions, settings);
  const today = summary.today;
  const weekly = summary.weekly;
  const monthly = summary.monthly;
  const todayDateStr = formatDateDisplay(new Date().toISOString().split('T')[0]);

  const handleExportPDF = () => {
    exportReportToPDF('printable-report-card', `${activeTab}_financial_report`);
    showToast('Exporting PDF...', 'Download will begin shortly');
  };

  const handleCopyTextReport = () => {
    const periodMap = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' } as const;
    const text = generateTextReport(periodMap[activeTab], transactions, settings);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to Clipboard', 'You can paste and share via WhatsApp or SMS');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-4 sm:space-y-5">
      {/* Report Tab Selector */}
      <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl">
        {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {/* Main Printable / Exportable Card */}
      <div
        id="printable-report-card"
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
      >
        {/* Printable Header */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
              {settings.storeName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Owner: <span className="font-semibold text-slate-700 dark:text-slate-300">{settings.ownerName}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 block">
              {activeTab} Financial Summary
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{todayDateStr}</span>
          </div>
        </div>

        {/* DAILY REPORT CONTENT */}
        {activeTab === 'daily' && (
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Opening Cash</span>
                <span className="font-bold">{formatCurrency(today.openingCash, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Cash Sales (+)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(today.cashSales, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Credit Sales (Udhar)</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(today.creditSales, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Credit Received (+)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(today.creditReceived, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Purchases (-)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(today.purchases, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Expenses (-)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(today.expenses, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-600 dark:text-slate-400">Withdrawals (-)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(today.withdrawals, settings.currency)}
                </span>
              </div>
            </div>

            <div className="bg-emerald-600 text-white p-4 rounded-2xl space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 uppercase font-bold">Current Cash In Hand</span>
                <span className="text-lg font-black">{formatCurrency(today.cashInHand, settings.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-500">
                <span className="text-emerald-100 font-semibold">Today Net Profit</span>
                <span className="font-bold">{formatCurrency(today.profit, settings.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-emerald-100 font-semibold">Outstanding Udhar</span>
                <span className="font-bold">{formatCurrency(today.outstandingCredit, settings.currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY REPORT CONTENT */}
        {activeTab === 'weekly' && (
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Total Cash Sales</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(weekly.cashSales, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Total Credit Sales</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(weekly.creditSales, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Credit Collected</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(weekly.creditCollected, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Purchases</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(weekly.purchases, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(weekly.expenses, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-600 dark:text-slate-400">Withdrawals</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(weekly.withdrawals, settings.currency)}
                </span>
              </div>
            </div>

            <div className="bg-purple-700 text-white p-4 rounded-2xl space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-200 uppercase font-bold">Weekly Net Profit</span>
                <span className="text-lg font-black">{formatCurrency(weekly.profit, settings.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-purple-600">
                <span className="text-purple-200 font-semibold">Live Cash In Hand</span>
                <span className="font-bold">{formatCurrency(today.cashInHand, settings.currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY REPORT CONTENT */}
        {activeTab === 'monthly' && (
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Total Store Revenue</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {formatCurrency(monthly.revenue, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60 pl-3">
                <span className="text-slate-500">• Cash Sales</span>
                <span className="font-semibold">{formatCurrency(monthly.cashSales, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60 pl-3">
                <span className="text-slate-500">• Credit Sales</span>
                <span className="font-semibold">{formatCurrency(monthly.creditSales, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Purchases</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(monthly.purchases, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(monthly.expenses, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-600 dark:text-slate-400">Withdrawals</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(monthly.withdrawals, settings.currency)}
                </span>
              </div>
            </div>

            <div className="bg-blue-700 text-white p-4 rounded-2xl space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-200 uppercase font-bold">Monthly Net Profit</span>
                <span className="text-lg font-black">{formatCurrency(monthly.profit, settings.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-600">
                <span className="text-blue-200 font-semibold">Total Outstanding Udhar</span>
                <span className="font-bold">{formatCurrency(today.outstandingCredit, settings.currency)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-[10px] text-slate-400">
          Generated automatically by Provision Store Cash Flow Manager (Offline)
        </div>
      </div>

      {/* Action Buttons: Export PDF & Share */}
      <div className="grid grid-cols-2 gap-3 no-print">
        <button
          onClick={handleExportPDF}
          className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" /> Export PDF Report
        </button>

        <button
          onClick={handleCopyTextReport}
          className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy / Share Text'}
        </button>
      </div>
    </div>
  );
};
