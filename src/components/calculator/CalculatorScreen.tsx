import React, { useState } from 'react';
import { Delete, RotateCcw, CheckCircle, Calculator as CalcIcon, Plus, Sparkles } from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { formatCurrency, getTodayDateString } from '../../utils/calculations';

export const CalculatorScreen: React.FC = () => {
  const { addTransaction, settings } = useCashFlow();
  const [expression, setExpression] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Helper to safely calculate expression
  const calculateResult = (expr: string): number => {
    if (!expr) return 0;
    try {
      // Clean up multiple trailing operators
      const cleaned = expr.replace(/[+\-*/]+$/, '');
      if (!cleaned) return 0;
      
      // Safe evaluation using Function
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

    // Prevent duplicate operator
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
      alert('Please enter a valid sale amount greater than 0');
      return;
    }

    addTransaction({
      type: 'cash_sale',
      amount: finalAmount,
      date: getTodayDateString(),
      notes: notes.trim() || `Calculator Sale (${expression || finalAmount})`,
    });

    // Reset state after instant save
    setExpression('');
    setNotes('');
    setIsCalculated(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4">
      {/* Title Banner */}
      <div className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <CalcIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">Calculator Cash Sale</h2>
            <p className="text-xs text-emerald-100">Add multiple items & save instantly</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-900/50 px-2.5 py-1 rounded-full font-bold">
          Cash In Hand +
        </span>
      </div>

      {/* Android Calculator Digital Display Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 flex flex-col justify-between min-h-[140px]">
        {/* Live Formula Expression */}
        <div className="flex justify-between items-start text-slate-400 text-xs sm:text-sm font-mono overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <span>{expression || 'Enter numbers...'}</span>
          {expression && !isCalculated && (
            <span className="text-emerald-400 font-semibold ml-2">
              = {formatCurrency(currentTotal, settings.currency)}
            </span>
          )}
        </div>

        {/* Big Calculated Result */}
        <div className="flex items-baseline justify-end gap-1 mt-2">
          <span className="text-emerald-400 text-lg font-bold">{settings.currency}</span>
          <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
            {currentTotal ? currentTotal.toLocaleString('en-IN') : '0'}
          </span>
        </div>
      </div>

      {/* Optional Note / Item Description Input */}
      <div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (e.g. Rice 5kg, Oil 1L, Biscuits)"
          className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
        />
      </div>

      {/* Quick Add Preset Buttons (+10, +20, +50, +100, +500) */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
        </span>
        {[10, 20, 50, 100, 500].map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickAdd(amt)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            +{amt}
          </button>
        ))}
      </div>

      {/* Calculator Touch Keypad Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-black text-lg shadow-xs hover:bg-rose-200 dark:hover:bg-rose-900 transition-all cursor-pointer flex items-center justify-center"
          title="Clear All"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleDeleteChar}
          className="p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-lg shadow-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
          title="Delete Last"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleKeyPress('/')}
          className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer"
        >
          ÷
        </button>

        <button
          onClick={() => handleKeyPress('*')}
          className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer"
        >
          ×
        </button>

        {/* Row 2 */}
        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-2xl shadow-xs border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('-')}
          className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer"
        >
          -
        </button>

        {/* Row 3 */}
        {[4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-2xl shadow-xs border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('+')}
          className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-2xl shadow-xs hover:bg-emerald-200 transition-all cursor-pointer"
        >
          +
        </button>

        {/* Row 4 */}
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-2xl shadow-xs border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleEquals}
          className="row-span-2 p-4 rounded-2xl bg-blue-600 text-white font-black text-3xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleKeyPress('0')}
          className="col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-2xl shadow-xs border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('.')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-2xl shadow-xs border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          .
        </button>
      </div>

      {/* Main Save Cash Sale Action Button */}
      <button
        onClick={handleSaveSale}
        disabled={currentTotal <= 0}
        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
          currentTotal > 0
            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/30 active:scale-[0.98]'
            : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle className="w-6 h-6" />
        SAVE CASH SALE ({formatCurrency(currentTotal, settings.currency)})
      </button>
    </div>
  );
};
