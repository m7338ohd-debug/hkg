import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  PlusCircle,
  MinusCircle,
  X,
  CheckCircle2,
  Phone,
  Copy,
  Check,
  HandCoins,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import type { CustomerCreditSummary } from '../../types';

interface UdharReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCustomer: CustomerCreditSummary | null;
  initialTab?: 'reminder' | 'adjustment';
}

export const UdharReminderModal: React.FC<UdharReminderModalProps> = ({
  isOpen,
  onClose,
  targetCustomer,
  initialTab = 'reminder',
}) => {
  const { settings, addTransaction, showToast } = useCashFlow();

  const [activeTab, setActiveTab] = useState<'reminder' | 'adjustment'>(initialTab);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'payment' | 'credit'>('payment');
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (targetCustomer) {
      setCustomerName(targetCustomer.customerName || '');
      setPhone(targetCustomer.phone || '');
      setAmount(targetCustomer.outstandingBalance ? targetCustomer.outstandingBalance.toString() : '');
      setActiveTab(initialTab);
    }
  }, [targetCustomer, initialTab]);

  if (!isOpen || !targetCustomer) return null;

  const currentDue = targetCustomer.outstandingBalance || 0;
  const storeName = settings.storeName || 'Ayesha Provision Store';
  const currency = settings.currency || '₹';

  // Format Reminder Message Text
  const reminderMessage = `Dear ${customerName}, greetings from ${storeName}! Your total outstanding Udhar balance is ${currency}${currentDue.toLocaleString('en-IN')}. Kindly settle the payment via UPI or Cash. Thank you!`;

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const handleSendWhatsApp = () => {
    let whatsappNum = cleanPhone;
    if (whatsappNum.length === 10) {
      whatsappNum = `91${whatsappNum}`; // Default India country code
    }
    const waUrl = `https://api.whatsapp.com/send?phone=${whatsappNum}&text=${encodeURIComponent(reminderMessage)}`;
    window.open(waUrl, '_blank');
    showToast('WhatsApp Opened', `Sending payment reminder to ${customerName}`);
  };

  const handleSendSMS = () => {
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(reminderMessage)}`;
    window.location.href = smsUrl;
    showToast('SMS App Opened', `Preparing SMS reminder for ${customerName}`);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    showToast('Message Copied', 'Reminder message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid amount', 'error');
      return;
    }

    if (adjustmentType === 'payment') {
      // Received Udhar Payment (-)
      addTransaction({
        type: 'credit_payment',
        amount: numAmount,
        customerName: customerName.trim(),
        phone: phone.trim(),
        paymentMethod: payMethod,
        date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || `Udhar payment received (${payMethod})`,
      });
      showToast('Payment Recorded', `Received ${currency}${numAmount} from ${customerName}`);
    } else {
      // Given Extra Udhar (+)
      addTransaction({
        type: 'credit_sale',
        amount: numAmount,
        customerName: customerName.trim(),
        phone: phone.trim(),
        paymentMethod: payMethod,
        date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || `Extra Udhar given to ${customerName}`,
      });
      showToast('Udhar Given', `Added ${currency}${numAmount} credit for ${customerName}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg shrink-0">
              <HandCoins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">{customerName}</h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-purple-300 text-purple-950">
                  Udhar Ledger
                </span>
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                Outstanding Balance: <strong className="text-white font-mono text-sm">{currency}{currentDue.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-500/30">
            <button
              onClick={() => setActiveTab('reminder')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'reminder'
                  ? 'bg-white text-purple-900 shadow-md font-extrabold'
                  : 'bg-purple-800/50 text-purple-100 hover:bg-purple-800/80'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send Reminder
            </button>
            <button
              onClick={() => setActiveTab('adjustment')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'adjustment'
                  ? 'bg-white text-purple-900 shadow-md font-extrabold'
                  : 'bg-purple-800/50 text-purple-100 hover:bg-purple-800/80'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Adjust Udhar (+ / -)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200 flex-1">
          {/* TAB 1: WhatsApp / SMS Reminder */}
          {activeTab === 'reminder' && (
            <div className="space-y-4">
              {/* Phone Input / Edit */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Reminder Message Box */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Message Preview
                  </label>
                  <button
                    onClick={handleCopyMessage}
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                  <p>{reminderMessage}</p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp vs SMS */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!cleanPhone}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> WhatsApp Message
                </button>

                <button
                  onClick={handleSendSMS}
                  disabled={!cleanPhone}
                  className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" /> SMS Message
                </button>
              </div>

              {/* Clarification Box: How Sending Works */}
              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-3 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> How Message Sending Works:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-purple-800 dark:text-purple-300">
                  <li><strong>WhatsApp:</strong> Opens the WhatsApp app installed on your phone with the customer's chat and pre-filled message ready to hit send!</li>
                  <li><strong>SMS:</strong> Opens your phone's built-in Messages app with the customer number and text pre-filled.</li>
                </ul>
              </div>

              {!cleanPhone && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-semibold">
                  Please enter customer phone number above to enable WhatsApp & SMS buttons.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Manual Udhar Ledger Adjustment */}
          {activeTab === 'adjustment' && (
            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* Mode Switcher: Receive Payment (-) vs Give Udhar (+) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('payment')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adjustmentType === 'payment'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" /> Receive Udhar (-)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustmentType('credit')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      adjustmentType === 'credit'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Add Udhar (+)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  {(['Cash', 'UPI', 'Bank Transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        payMethod === m
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Particulars (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleared GPay ₹200, or Added extra grocery Udhar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                  adjustmentType === 'payment'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {adjustmentType === 'payment'
                  ? `CONFIRM RECEIVE ${currency}${parseFloat(amount) || 0}`
                  : `CONFIRM ADD UDHAR ${currency}${parseFloat(amount) || 0}`}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
          Udhar updates instantly sync across all logged-in store phones.
        </div>
      </div>
    </div>
  );
};
