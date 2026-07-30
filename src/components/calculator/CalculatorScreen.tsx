import React, { useState } from 'react';
import { Delete, RotateCcw, CheckCircle, Calculator as CalcIcon, Plus, Sparkles, Mic, MicOff } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, getTodayDateString } from '../../utils/calculations';
import { useSpeechToText } from '../../utils/useSpeech';

export const CalculatorScreen: React.FC = () => {
  const { addTransaction, settings } = useCashFlow();
  const [expression, setExpression] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Voice Input Helper
  const { isListening, startListening } = useSpeechToText((spokenText) => {
    // Parse spoken text for numbers/expression
    const cleanSpoken = spokenText.toLowerCase().replace(/plus/g, '+').replace(/minus/g, '-').replace(/into|times/g, '*').replace(/divided by/g, '/').replace(/[^0-9+\-*/.]/g, '');
    if (cleanSpoken) {
      setExpression((prev) => (prev ? prev + '+' + cleanSpoken : cleanSpoken));
    } else {
      setNotes((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    }
  });

  // Safe expression calculation
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

  const handleSaveSale = () => {
    const finalAmount = isCalculated ? parseFloat(expression) : calculateResult(expression);
    if (finalAmount <= 0) {
      return;
    }

    addTransaction({
      type: 'cash_sale',
      amount: finalAmount,
      date: getTodayDateString(),
      notes: notes.trim() || `Calculator Sale (${expression || finalAmount})`,
    });

    setExpression('');
    setNotes('');
    setIsCalculated(false);
  };

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto p-4 sm:p-6 pb-28 space-y-4 sm:space-y-5">
      {/* Title Banner */}
      <div className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-700 text-white p-4 rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
            <CalcIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg leading-tight">POS Cash Calculator</h2>
            <p className="text-xs text-emerald-100">Tap numbers or speak into Mic</p>
          </div>
        </div>

        {/* Voice Mic Button */}
        <button
          onClick={startListening}
          className={`p-3 rounded-2xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-lg'
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
          title="Voice Mic Input"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-xs hidden sm:inline">{isListening ? 'Listening...' : 'Speak'}</span>
        </button>
      </div>

      {/* Large Digital Display */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 flex flex-col justify-between min-h-[160px] sm:min-h-[180px]">
        {/* Live Expression */}
        <div className="flex justify-between items-start text-slate-400 text-sm sm:text-base font-mono overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <span>{expression || 'Enter numbers or speak...'}</span>
          {expression && !isCalculated && (
            <span className="text-emerald-400 font-bold ml-2">
              = {formatCurrency(currentTotal, settings.currency)}
            </span>
          )}
        </div>

        {/* Big Calculated Result */}
        <div className="flex items-baseline justify-end gap-1.5 mt-2">
          <span className="text-emerald-400 text-2xl sm:text-3xl font-bold">{settings.currency}</span>
          <span className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight text-white">
            {currentTotal ? currentTotal.toLocaleString('en-IN') : '0'}
          </span>
        </div>
      </div>

      {/* Optional Note & Voice Mic Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (e.g. 2kg Rice, Oil 1L)"
          className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <button
          type="button"
          onClick={startListening}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          title="Voice Mic"
        >
          <Mic className="w-5 h-5 text-emerald-500" />
        </button>
      </div>

      {/* Quick Add Preset Buttons (+10, +20, +50, +100, +500) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
        <span className="text-xs uppercase font-extrabold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick:
        </span>
        {[10, 20, 50, 100, 500].map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickAdd(amt)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            +{amt}
          </button>
        ))}
      </div>

      {/* Large Touch Keypad Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="py-5 sm:py-6 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-black text-xl shadow-xs hover:bg-rose-200 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          title="Clear All"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={handleDeleteChar}
          className="py-5 sm:py-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xl shadow-xs hover:bg-slate-300 transition-all cursor-pointer flex items-center justify-center active:scale-95"
          title="Delete Last"
        >
          <Delete className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleKeyPress('/')}
          className="py-5 sm:py-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          ÷
        </button>

        <button
          onClick={() => handleKeyPress('*')}
          className="py-5 sm:py-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          ×
        </button>

        {/* Row 2 */}
        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-5 sm:py-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('-')}
          className="py-5 sm:py-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-3xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          -
        </button>

        {/* Row 3 */}
        {[4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-5 sm:py-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('+')}
          className="py-5 sm:py-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-3xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer active:scale-95"
        >
          +
        </button>

        {/* Row 4 */}
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="py-5 sm:py-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleEquals}
          className="row-span-2 py-5 sm:py-6 rounded-2xl bg-blue-600 text-white font-black text-4xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center active:scale-95"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleKeyPress('0')}
          className="col-span-2 py-5 sm:py-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('.')}
          className="py-5 sm:py-6 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-3xl sm:text-4xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          .
        </button>
      </div>

      {/* Main Save Cash Sale Action Button */}
      <button
        onClick={handleSaveSale}
        disabled={currentTotal <= 0}
        className={`w-full py-4 sm:py-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
          currentTotal > 0
            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/30 active:scale-[0.98]'
            : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
        SAVE CASH SALE ({formatCurrency(currentTotal, settings.currency)})
      </button>
    </div>
  );
};
