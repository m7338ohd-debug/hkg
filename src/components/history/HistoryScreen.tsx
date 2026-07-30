import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  CreditCard,
  HandCoins,
  ShoppingCart,
  Receipt,
  Wallet,
  Calculator,
  X,
  CheckCircle2,
  RotateCcw,
  Mic,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import type { Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDateDisplay, filterTransactionsByDate } from '../../utils/calculations';
import { useSpeechToText } from '../../utils/useSpeech';

export const HistoryScreen: React.FC = () => {
  const { transactions, settings, deleteTransaction, editTransaction } = useCashFlow();

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

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filtered dataset
  const filteredList = useMemo(() => {
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

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'cash_sale':
        return { label: 'Cash Sale', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300', icon: Calculator };
      case 'credit_sale':
        return { label: 'Udhar Given', bg: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300', icon: CreditCard };
      case 'credit_payment':
        return { label: 'Credit Received', bg: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300', icon: HandCoins };
      case 'purchase':
        return { label: 'Purchase', bg: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300', icon: ShoppingCart };
      case 'expense':
        return { label: 'Expense', bg: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300', icon: Receipt };
      case 'withdrawal':
        return { label: 'Withdrawal', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300', icon: Wallet };
    }
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
    <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto p-4 sm:p-6 pb-28 space-y-4 sm:space-y-5">
      {/* Search Header Bar with Voice Mic */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, amount, notes, category..."
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
        <span>Showing {filteredList.length} Entries</span>
        <span>Tap entry to edit or delete</span>
      </div>

      {/* History List Container */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2 border border-slate-200 dark:border-slate-700">
            <Filter className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Transactions Found</h4>
            <p className="text-xs">Try clearing your search or date filters.</p>
          </div>
        ) : (
          filteredList.map((t) => {
            const badge = getTypeBadge(t.type);
            const Icon = badge.icon;
            const isIncoming = t.type === 'cash_sale' || t.type === 'credit_payment';

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${badge.bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.customerName || t.category || t.takenBy || badge.label}
                      </span>
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDateDisplay(t.date)}</span>
                      {t.time && <span>• {t.time}</span>}
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

                  {/* Edit / Delete Buttons */}
                  <div className="flex flex-col gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-1">
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
    </div>
  );
};
