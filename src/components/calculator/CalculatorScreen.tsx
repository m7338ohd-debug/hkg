import React, { useState } from 'react';
import { Delete, RotateCcw, CheckCircle, Calculator as CalcIcon, Sparkles, Mic, MicOff, CreditCard, Home, X, User, Phone } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, getTodayDateString, getCustomerCreditSummaries } from '../../utils/calculations';
import { useSpeechToText } from '../../utils/useSpeech';

export const CalculatorScreen: React.FC = () => {
  const { addTransaction, transactions, settings } = useCashFlow();
  const [expression, setExpression] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Udhar Modal State inside Calculator
  const [showUdharModal, setShowUdharModal] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Existing Udhar customers list for quick selection
  const existingCustomers = getCustomerCreditSummaries(transactions);

  // Voice Input Helper
  const { isListening, startListening } = useSpeechToText((spokenText) => {
    const cleanSpoken = spokenText.toLowerCase().replace(/plus/g, '+').replace(/minus/g, '-').replace(/into|times/g, '*').replace(/divided by/g, '/').replace(/[^0-9+\-*/.]/g, '');
    if (cleanSpoken) {
      setExpression((prev) => (prev ? prev + '+' + cleanSpoken : cleanSpoken));
    } else if (showUdharModal) {
      setCustomerName(spokenText);
    } else {
      setNotes((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    }
  });

  const calculateResult = (expr: string): number => {
    if (!expr) return 0;
    try {
      const cleaned = expr.replace(/[+\-*/]+$/, '');
      if (!cleaned) return 0;
      const evalFunc = new Function(`return (${cleaned})`);
      const res = evalFunc();
      return typeof res === 'number' && !isNaN(res) && isFinite(res) ? Math.max(0, res) : 0;
    } catch {
      return 0;
    }
  };

  const currentTotal = calculateResult(expression);

  const handleKeyPress = (val: string) => {
    if (isCalculated) {
      if (['+', '-', '*', '/'].includes(val)) {
        setExpression(currentTotal.toString() + val);
      } else {
        setExpression(val);
      }
      setIsCalculated(false);
      return;
    }

    const lastChar = expression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar) && ['+', '-', '*', '/'].includes(val)) {
      setExpression(expression.slice(0, -1) + val);
      return;
    }

    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression('');
    setNotes('');
    setIsCalculated(false);
  };

  const handleDeleteChar = () => {
    if (isCalculated) {
      setExpression('');
      setIsCalculated(false);
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEquals = () => {
    if (!expression) return;
    const res = calculateResult(expression);
    setExpression(res.toString());
    setIsCalculated(true);
  };

  const handleQuickAdd = (amount: number) => {
    if (!expression) {
      setExpression(amount.toString());
    } else {
      const lastChar = expression.slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
        setExpression(expression + amount.toString());
      } else {
        setExpression(expression + '+' + amount.toString());
      }
    }
    setIsCalculated(false);
  };

  const handleSaveCashSale = () => {
    const finalAmount = isCalculated ? parseFloat(expression) : calculateResult(expression);
    if (finalAmount <= 0) return;

    addTransaction({
      type: 'cash_sale',
      amount: finalAmount,
      date: getTodayDateString(),
      notes: notes.trim() || `POS Cash Sale (${expression || finalAmount})`,
    });

    setExpression('');
    setNotes('');
    setIsCalculated(false);
  };

  const handleSaveHomeUse = () => {
    const finalAmount = isCalculated ? parseFloat(expression) : calculateResult(expression);
    if (finalAmount <= 0) return;

    addTransaction({
      type: 'home_use',
      amount: finalAmount,
      date: getTodayDateString(),
      notes: notes.trim() || `Home Use Goods (${expression || finalAmount})`,
    });

    setExpression('');
    setNotes('');
    setIsCalculated(false);
  };

  const handleConfirmUdharSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isCalculated ? parseFloat(expression) : calculateResult(expression);
    if (finalAmount <= 0 || !customerName.trim()) return;

    addTransaction({
      type: 'credit_sale',
      amount: finalAmount,
      customerName: customerName.trim(),
      phone: phone.trim() || undefined,
      date: getTodayDateString(),
      notes: notes.trim() || `Calculator Udhar Sale (${expression || finalAmount})`,
    });

    setExpression('');
    setNotes('');
    setCustomerName('');
    setPhone('');
    setShowUdharModal(false);
    setIsCalculated(false);
  };

  return (
    <div className="max-w-sm sm:max-w-md mx-auto p-3.5 sm:p-4 pb-28 space-y-3.5">
      {/* Title Banner */}
      <div className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base leading-tight">POS Cash & Udhar Calculator</h2>
            <p className="text-[11px] text-emerald-100">Tap numbers, speak mic, save to Sales</p>
          </div>
        </div>

        {/* Voice Mic Button */}
        <button
          onClick={startListening}
          className={`p-2 sm:p-2.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title="Voice Mic Input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-xs">{isListening ? 'Listening...' : 'Speak'}</span>
        </button>
      </div>

      {/* Digital Display */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col justify-between min-h-[110px]">
        {/* Live Expression */}
        <div className="flex justify-between items-start text-slate-400 text-xs sm:text-sm font-mono overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <span>{expression || 'Enter numbers...'}</span>
          {expression && !isCalculated && (
            <span className="text-emerald-400 font-bold ml-2">
              = {formatCurrency(currentTotal, settings.currency)}
            </span>
          )}
        </div>

        {/* Calculated Result */}
        <div className="flex items-baseline justify-end gap-1 mt-1">
          <span className="text-emerald-400 text-xl font-bold">{settings.currency}</span>
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
            {currentTotal ? currentTotal.toLocaleString('en-IN') : '0'}
          </span>
        </div>
      </div>

      {/* Optional Note Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (e.g. Rice 2kg, Oil 1L)"
          className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={startListening}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <Mic className="w-4 h-4 text-emerald-500" />
        </button>
      </div>

      {/* Quick Add Preset Buttons (+10, +20, +50, +100, +500) */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-0.5">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
        </span>
        {[10, 20, 50, 100, 500].map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickAdd(amt)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            +{amt}
          </button>
        ))}
      </div>

      {/* Touch Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="py-3 sm:py-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-black text-lg shadow-xs hover:bg-rose-200 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          title="Clear All"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleDeleteChar}
          className="py-3 sm:py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-lg shadow-xs hover:bg-slate-300 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          title="Delete Last"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleKeyPress('/')}
          className="py-3 sm:py-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          ÷
        </button>

        <button
          onClick={() => handleKeyPress('*')}
          className="py-3 sm:py-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          ×
        </button>

        {/* Row 2 */}
        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-3 sm:py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('-')}
          className="py-3 sm:py-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          -
        </button>

        {/* Row 3 */}
        {[4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-3 sm:py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('+')}
          className="py-3 sm:py-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          +
        </button>

        {/* Row 4 */}
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-3 sm:py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleEquals}
          className="row-span-2 py-3 sm:py-3.5 rounded-xl bg-blue-600 text-white font-black text-2xl shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center active:scale-95"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleKeyPress('0')}
          className="col-span-2 py-3 sm:py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('.')}
          className="py-3 sm:py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl sm:text-2xl shadow-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          .
        </button>
      </div>

      {/* Triple Action Buttons: Save Cash Sale, Save Udhar, Save Home Use */}
      <div className="space-y-2 pt-1">
        {/* Main Save Cash Sale */}
        <button
          onClick={handleSaveCashSale}
          disabled={currentTotal <= 0}
          className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            currentTotal > 0
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25 active:scale-[0.98]'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          SAVE CASH SALE ({formatCurrency(currentTotal, settings.currency)})
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Save to Udhar (Credit Sale) */}
          <button
            onClick={() => setShowUdharModal(true)}
            disabled={currentTotal <= 0}
            className={`py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
              currentTotal > 0
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            SAVE TO UDHAR
          </button>

          {/* Save as Home Use */}
          <button
            onClick={handleSaveHomeUse}
            disabled={currentTotal <= 0}
            className={`py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
              currentTotal > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Home className="w-4 h-4" />
            SAVE HOME USE
          </button>
        </div>
      </div>

      {/* Save Udhar Customer Selection Modal */}
      {showUdharModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-purple-200 dark:border-purple-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Save Calculator Sale to Udhar
              </h3>
              <button
                onClick={() => setShowUdharModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-200 dark:border-purple-800 flex justify-between items-center text-xs font-bold text-purple-700 dark:text-purple-300">
              <span>Total Udhar Amount:</span>
              <span className="text-base font-black font-mono">{formatCurrency(currentTotal, settings.currency)}</span>
            </div>

            <form onSubmit={handleConfirmUdharSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Quick Select from existing customer list */}
              {existingCustomers.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Quick Select Customer:</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {existingCustomers.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCustomerName(c.customerName);
                          if (c.phone) setPhone(c.phone);
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 cursor-pointer"
                      >
                        {c.customerName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                CONFIRM SAVE TO UDHAR ({formatCurrency(currentTotal, settings.currency)})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

