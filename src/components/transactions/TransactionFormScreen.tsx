import React, { useState } from 'react';
import {
  CreditCard,
  HandCoins,
  ShoppingCart,
  Receipt,
  Wallet,
  CheckCircle2,
  UserCheck,
  Calendar,
  DollarSign,
  Phone,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import type { TransactionType, PurchaseCategory, ExpenseCategory, WithdrawalPerson, WithdrawalReason, PaymentMethod } from '../../types';
import { getTodayDateString, getCustomerCreditSummaries, formatCurrency } from '../../utils/calculations';

interface TransactionFormScreenProps {
  initialType?: TransactionType;
  onSuccess?: () => void;
}

export const TransactionFormScreen: React.FC<TransactionFormScreenProps> = ({
  initialType = 'credit_sale',
  onSuccess,
}) => {
  const { addTransaction, transactions, settings } = useCashFlow();
  const [type, setType] = useState<TransactionType>(initialType);

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries');
  const [takenBy, setTakenBy] = useState<WithdrawalPerson>('Mother');
  const [reason, setReason] = useState<WithdrawalReason>('House Expense');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  const customerSummaries = getCustomerCreditSummaries(transactions).filter((c) => c.outstandingBalance > 0);

  // Filter existing customer list for autocomplete
  const filteredCustomers = customerSummaries.filter(
    (c) => customerName && c.customerName.toLowerCase().includes(customerName.toLowerCase())
  );

  const handleSelectCustomer = (name: string, custPhone?: string, balance?: number) => {
    setCustomerName(name);
    if (custPhone) setPhone(custPhone);
    if (balance && type === 'credit_payment') setAmount(balance.toString());
  };

  const handleQuickReceiveRow = (name: string, custPhone?: string, dueAmount?: number) => {
    setType('credit_payment');
    setCustomerName(name);
    if (custPhone) setPhone(custPhone);
    if (dueAmount) setAmount(dueAmount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    if ((type === 'credit_sale' || type === 'credit_payment') && !customerName.trim()) {
      alert('Please enter a customer name for credit/udhar transactions');
      return;
    }

    addTransaction({
      type,
      amount: numAmount,
      date,
      customerName: customerName.trim() || undefined,
      phone: phone.trim() || undefined,
      category: type === 'purchase' || type === 'expense' ? category : undefined,
      takenBy: type === 'withdrawal' ? takenBy : undefined,
      reason: type === 'withdrawal' ? reason : undefined,
      paymentMethod: type === 'credit_payment' ? paymentMethod : undefined,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setAmount('');
    setCustomerName('');
    setPhone('');
    setNotes('');

    if (onSuccess) onSuccess();
  };

  const typeTabs: { id: TransactionType; label: string; icon: any; color: string }[] = [
    { id: 'credit_sale', label: 'Credit Sale (Udhar)', icon: CreditCard, color: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50' },
    { id: 'credit_payment', label: 'Credit Received', icon: HandCoins, color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' },
    { id: 'purchase', label: 'Store Purchase', icon: ShoppingCart, color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50' },
    { id: 'expense', label: 'Store Expense', icon: Receipt, color: 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50' },
    { id: 'withdrawal', label: 'Withdrawal', icon: Wallet, color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' },
  ];

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto p-4 sm:p-6 pb-28 space-y-4 sm:space-y-5">
      {/* Tab Selector Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {typeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = type === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setType(tab.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? `${tab.color} border-2 shadow-xs`
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
        {/* Form Title & Indicator */}
        <div className="pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            {type === 'credit_sale' && <CreditCard className="w-5 h-5 text-purple-500" />}
            {type === 'credit_payment' && <HandCoins className="w-5 h-5 text-emerald-500" />}
            {type === 'purchase' && <ShoppingCart className="w-5 h-5 text-blue-500" />}
            {type === 'expense' && <Receipt className="w-5 h-5 text-rose-500" />}
            {type === 'withdrawal' && <Wallet className="w-5 h-5 text-amber-500" />}
            {typeTabs.find((t) => t.id === type)?.label}
          </h3>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Offline Saved
          </span>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Amount ({settings.currency}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
              {settings.currency}
            </span>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Specific Fields for Credit Sale & Credit Payment */}
        {(type === 'credit_sale' || type === 'credit_payment') && (
          <>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Autocomplete Customer Suggestions */}
              {customerName && filteredCustomers.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                  {filteredCustomers.map((cust, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCustomer(cust.customerName, cust.phone, cust.outstandingBalance)}
                      className="w-full text-left p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex justify-between items-center cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{cust.customerName}</span>
                        {cust.phone && <span className="text-slate-400 text-[10px] ml-2">({cust.phone})</span>}
                      </div>
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                        Udhar: {formatCurrency(cust.outstandingBalance, settings.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Payment Method for Credit Payment */}
        {type === 'credit_payment' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <div className="flex gap-2">
              {(['Cash', 'UPI', 'Bank Transfer'] as PaymentMethod[]).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purchases Category */}
        {type === 'purchase' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Purchase Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['Milk', 'Groceries', 'Snacks', 'Beverages', 'Other'] as PurchaseCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Category */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['Rent', 'Electricity', 'Transport', 'Miscellaneous', 'Salary'] as ExpenseCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal Taken By & Reason */}
        {type === 'withdrawal' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Money Taken By
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['Mother', 'Ayesha', 'Employee', 'Owner', 'Other'] as WithdrawalPerson[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTakenBy(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      takenBy === p
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['House Expense', 'Petrol', 'Medical', 'Personal', 'Other'] as WithdrawalReason[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      reason === r
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Date Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add details..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
        >
          <CheckCircle2 className="w-5 h-5" />
          SAVE TRANSACTION ({formatCurrency(parseFloat(amount) || 0, settings.currency)})
        </button>
      </form>

      {/* Active Udhar Customers List (Visible when on Credit tabs) */}
      {(type === 'credit_sale' || type === 'credit_payment') && customerSummaries.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-purple-200 dark:border-purple-900/50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-500" />
              Active Outstanding Udhar Customers
            </h3>
            <span className="text-[10px] text-slate-400">Tap row to pre-fill</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto pr-1">
            {customerSummaries.map((cust, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{cust.customerName}</h4>
                  {cust.phone && <p className="text-[10px] text-slate-400">{cust.phone}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                    {formatCurrency(cust.outstandingBalance, settings.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickReceiveRow(cust.customerName, cust.phone, cust.outstandingBalance)}
                    className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px] hover:bg-purple-200 flex items-center gap-1 cursor-pointer"
                  >
                    Receive <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
