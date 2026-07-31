import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, StoreSettings, TransactionType } from '../types';
import {
  loadSettings,
  saveSettings,
  loadTransactions,
  saveTransactions,
  importDataJSON,
} from '../db/storage';
import {
  pushToCloudSync,
  pullFromCloudSync,
  subscribeLocalSync,
  subscribeCloudSSE,
  mergeTransactions,
} from '../db/cloudSync';

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
  isSyncing: boolean;
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
  syncNow: () => Promise<void>;
}

const CashFlowContext = createContext<CashFlowContextType | undefined>(undefined);

export const CashFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<StoreSettings>(loadSettings);
  const [transactions, setTransactionsState] = useState<Transaction[]>(loadTransactions);
  const [lastDeletedTx, setLastDeletedTx] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync html dark mode class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // 1. Subscribe to instant local multi-tab / same-device channel sync
  useEffect(() => {
    const unsubscribe = subscribeLocalSync((remoteData) => {
      if (remoteData.transactions) {
        setTransactionsState((prev) => {
          const merged = mergeTransactions(prev, remoteData.transactions);
          saveTransactions(merged);
          return merged;
        });
      }
      if (remoteData.settings) {
        setSettingsState(remoteData.settings);
        saveSettings(remoteData.settings);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Subscribe to Live Firebase SSE EventSource stream (Instant Push when ANY device enters data)
  useEffect(() => {
    const syncCode = settings.storeSyncCode || 'AYESHA-STORE-01';

    const unsubscribeSSE = subscribeCloudSSE(syncCode, (cloudData) => {
      if (cloudData.transactions) {
        setTransactionsState((prev) => {
          const merged = mergeTransactions(prev, cloudData.transactions);
          saveTransactions(merged);
          return merged;
        });
      }
      if (cloudData.settings) {
        setSettingsState((prev) => {
          const mergedS = { ...prev, ...cloudData.settings };
          saveSettings(mergedS);
          return mergedS;
        });
      }
    });

    return unsubscribeSSE;
  }, [settings.storeSyncCode]);

  // 3. Fallback polling every 2 seconds for guaranteed redundancy
  useEffect(() => {
    let isMounted = true;
    const syncCode = settings.storeSyncCode || 'AYESHA-STORE-01';

    const syncInterval = setInterval(async () => {
      if (!navigator.onLine) return;
      try {
        const cloudData = await pullFromCloudSync(syncCode);
        if (cloudData && isMounted) {
          if (cloudData.transactions) {
            setTransactionsState((prev) => {
              const merged = mergeTransactions(prev, cloudData.transactions);
              if (JSON.stringify(merged) !== JSON.stringify(prev)) {
                saveTransactions(merged);
                return merged;
              }
              return prev;
            });
          }
          if (cloudData.settings && JSON.stringify(cloudData.settings) !== JSON.stringify(settings)) {
            setSettingsState(cloudData.settings);
            saveSettings(cloudData.settings);
          }
        }
      } catch (err) {
        // Silently handle network blips
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [settings.storeSyncCode, settings]);

  const syncNow = async () => {
    setIsSyncing(true);
    const syncCode = settings.storeSyncCode || 'AYESHA-STORE-01';
    await pushToCloudSync(syncCode, settings, transactions);
    const remote = await pullFromCloudSync(syncCode);
    if (remote && remote.transactions) {
      const merged = mergeTransactions(transactions, remote.transactions);
      setTransactionsState(merged);
      saveTransactions(merged);
      if (remote.settings) {
        setSettingsState(remote.settings);
        saveSettings(remote.settings);
      }
    }
    setTimeout(() => setIsSyncing(false), 500);
  };

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
    pushToCloudSync(settings.storeSyncCode || 'AYESHA-STORE-01', settings, updated);

    const typeLabels: Record<TransactionType, string> = {
      cash_sale: 'Cash Sale Recorded',
      credit_sale: 'Udhar Given Recorded',
      home_use: 'Home Use Sale Recorded',
      credit_payment: 'Credit Collected Recorded',
      purchase: 'Purchase Recorded',
      expense: 'Expense Recorded',
      withdrawal: 'Withdrawal Recorded',
    };

    showToast(
      typeLabels[txData.type] || 'Transaction Saved',
      `${settings.currency}${txData.amount} added to store ledger`
    );

    return newTx;
  };

  const editTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTransactionsState(updated);
    saveTransactions(updated);
    pushToCloudSync(settings.storeSyncCode || 'AYESHA-STORE-01', settings, updated);
    showToast('Transaction Updated', 'Changes applied instantly across devices');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setLastDeletedTx(target);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactionsState(updated);
    saveTransactions(updated);
    pushToCloudSync(settings.storeSyncCode || 'AYESHA-STORE-01', settings, updated);

    showToast('Transaction Deleted', `Removed ${settings.currency}${target.amount}`, 'info', true);
  };

  const undoDelete = () => {
    if (!lastDeletedTx) return;
    const updated = [lastDeletedTx, ...transactions];
    setTransactionsState(updated);
    saveTransactions(updated);
    pushToCloudSync(settings.storeSyncCode || 'AYESHA-STORE-01', settings, updated);
    showToast('Restored Transaction', `Brought back ${settings.currency}${lastDeletedTx.amount}`);
    setLastDeletedTx(null);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettingsState(merged);
    saveSettings(merged);
    pushToCloudSync(merged.storeSyncCode || 'AYESHA-STORE-01', merged, transactions);
    showToast('Settings Saved', 'Store configuration updated');
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  const resetPeriodData = (period: 'weekly' | 'monthly' | 'all') => {
    let filtered = [...transactions];
    if (period === 'all') {
      filtered = [];
    } else {
      const todayObj = new Date();
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
    }

    setTransactionsState(filtered);
    saveTransactions(filtered);
    pushToCloudSync(settings.storeSyncCode || 'AYESHA-STORE-01', settings, filtered);
    showToast(`Reset ${period === 'weekly' ? 'Weekly' : 'Monthly'} Data`, 'Target entries cleared');
  };

  const importBackup = (jsonStr: string) => {
    const res = importDataJSON(jsonStr);
    if (res.success) {
      const loadedS = loadSettings();
      const loadedT = loadTransactions();
      setSettingsState(loadedS);
      setTransactionsState(loadedT);
      pushToCloudSync(loadedS.storeSyncCode || 'AYESHA-STORE-01', loadedS, loadedT);
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
        isSyncing,
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
        syncNow,
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

