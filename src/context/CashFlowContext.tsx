import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, StoreSettings, TransactionType } from '../types';
import {
  loadSettings,
  saveSettings,
  loadTransactions,
  saveTransactions,
  importDataJSON,
} from '../db/storage';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  undoable?: boolean;
}

interface CashFlowContextType {
  transactions: Transaction[];
  settings: StoreSettings;
  toast: ToastMessage | null;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info', undoable?: boolean) => void;
  hideToast: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetPeriodData: (period: 'weekly' | 'monthly' | 'all') => void;
  importBackup: (jsonStr: string) => { success: boolean; message: string };
  toggleDarkMode: () => void;
}

const CashFlowContext = createContext<CashFlowContextType | undefined>(undefined);

export const CashFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<StoreSettings>(loadSettings);
  const [transactions, setTransactionsState] = useState<Transaction[]>(loadTransactions);
  const [lastDeletedTx, setLastDeletedTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync html dark mode class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'error' | 'info' = 'success',
    undoable = false
  ) => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type,
      undoable,
    });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const hideToast = () => setToast(null);

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const now = new Date();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: txData.time || now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.getTime(),
    };

    const updated = [newTx, ...transactions];
    setTransactionsState(updated);
    saveTransactions(updated);

    const typeLabels: Record<TransactionType, string> = {
      cash_sale: 'Cash Sale Recorded',
      credit_sale: 'Udhar Given Recorded',
      credit_payment: 'Credit Collected Recorded',
      purchase: 'Purchase Recorded',
      expense: 'Expense Recorded',
      withdrawal: 'Withdrawal Recorded',
    };

    showToast(
      typeLabels[txData.type] || 'Transaction Saved',
      `${settings.currency}${txData.amount} added to live cash book`
    );

    return newTx;
  };

  const editTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTransactionsState(updated);
    saveTransactions(updated);
    showToast('Transaction Updated', 'Changes applied instantly');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setLastDeletedTx(target);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactionsState(updated);
    saveTransactions(updated);

    showToast('Transaction Deleted', `Removed ${settings.currency}${target.amount}`, 'info', true);
  };

  const undoDelete = () => {
    if (!lastDeletedTx) return;
    const updated = [lastDeletedTx, ...transactions];
    setTransactionsState(updated);
    saveTransactions(updated);
    showToast('Restored Transaction', `Brought back ${settings.currency}${lastDeletedTx.amount}`);
    setLastDeletedTx(null);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettingsState(merged);
    saveSettings(merged);
    showToast('Settings Saved', 'Store configuration updated');
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const resetPeriodData = (period: 'weekly' | 'monthly' | 'all') => {
    if (period === 'all') {
      setTransactionsState([]);
      saveTransactions([]);
      showToast('All Data Reset', 'Cleared transaction history');
      return;
    }

    const todayObj = new Date();
    let filtered = [...transactions];

    if (period === 'weekly') {
      const firstDay = new Date(todayObj);
      const day = todayObj.getDay();
      const diff = todayObj.getDate() - day + (day === 0 ? -6 : 1);
      firstDay.setDate(diff);
      firstDay.setHours(0, 0, 0, 0);

      filtered = transactions.filter((t) => new Date(t.date) < firstDay);
    } else if (period === 'monthly') {
      const currentMonth = todayObj.getMonth();
      const currentYear = todayObj.getFullYear();

      filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return !(d.getMonth() === currentMonth && d.getFullYear() === currentYear);
      });
    }

    setTransactionsState(filtered);
    saveTransactions(filtered);
    showToast(`Reset ${period === 'weekly' ? 'Weekly' : 'Monthly'} Data`, 'Target entries cleared');
  };

  const importBackup = (jsonStr: string) => {
    const res = importDataJSON(jsonStr);
    if (res.success) {
      setSettingsState(loadSettings());
      setTransactionsState(loadTransactions());
      showToast('Restore Complete', res.message);
    } else {
      showToast('Restore Failed', res.message, 'error');
    }
    return res;
  };

  return (
    <CashFlowContext.Provider
      value={{
        transactions,
        settings,
        toast,
        showToast,
        hideToast,
        addTransaction,
        editTransaction,
        deleteTransaction,
        undoDelete,
        updateSettings,
        resetPeriodData,
        importBackup,
        toggleDarkMode,
      }}
    >
      {children}
    </CashFlowContext.Provider>
  );
};

export const useCashFlow = () => {
  const context = useContext(CashFlowContext);
  if (!context) {
    throw new Error('useCashFlow must be used within a CashFlowProvider');
  }
  return context;
};
