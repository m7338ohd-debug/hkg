import type { Transaction, StoreSettings } from '../types';

const TRANSACTIONS_KEY = 'provision_store_cashflow_transactions';
const SETTINGS_KEY = 'provision_store_cashflow_settings';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Ayesha Provision Store',
  ownerName: 'Ayesha',
  currency: '₹',
  openingCash: 5000,
  darkMode: true,
  autoBackupReminder: true,
};

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_sample_1',
    type: 'cash_sale',
    amount: 1450,
    date: getTodayString(0),
    time: '08:30 AM',
    notes: 'Morning counter cash sales',
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'tx_sample_2',
    type: 'purchase',
    amount: 850,
    date: getTodayString(0),
    time: '09:15 AM',
    category: 'Milk',
    notes: 'Dairy supplier morning milk crates',
    createdAt: Date.now() - 3600000 * 7,
  },
  {
    id: 'tx_sample_3',
    type: 'credit_sale',
    amount: 320,
    date: getTodayString(0),
    time: '10:00 AM',
    customerName: 'Ramesh Kumar',
    phone: '9876543210',
    notes: '2kg Sugar, 1L Oil (Udhar)',
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'tx_sample_4',
    type: 'credit_payment',
    amount: 500,
    date: getTodayString(0),
    time: '11:45 AM',
    customerName: 'Suresh Sharma',
    phone: '9123456789',
    paymentMethod: 'Cash',
    notes: 'Old bill balance payment',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'tx_sample_5',
    type: 'expense',
    amount: 120,
    date: getTodayString(0),
    time: '01:10 PM',
    category: 'Miscellaneous',
    notes: 'Tea & Snacks for store staff',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tx_sample_6',
    type: 'withdrawal',
    amount: 200,
    date: getTodayString(0),
    time: '03:00 PM',
    takenBy: 'Mother',
    reason: 'House Expense',
    notes: 'Vegetables & domestic needs',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'tx_sample_7',
    type: 'cash_sale',
    amount: 2340,
    date: getTodayString(0),
    time: '05:40 PM',
    notes: 'Afternoon store sales',
    createdAt: Date.now() - 3600000 * 2,
  },
  // Yesterday sample entries
  {
    id: 'tx_sample_8',
    type: 'cash_sale',
    amount: 3800,
    date: getTodayString(1),
    time: '07:30 PM',
    notes: 'Full day cash sales',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx_sample_9',
    type: 'purchase',
    amount: 1500,
    date: getTodayString(1),
    time: '11:00 AM',
    category: 'Groceries',
    notes: 'Wholesale rice and dal stock',
    createdAt: Date.now() - 86400000 + 3600000,
  },
  {
    id: 'tx_sample_10',
    type: 'expense',
    amount: 600,
    date: getTodayString(1),
    time: '04:00 PM',
    category: 'Electricity',
    notes: 'Shop electricity bill payment',
    createdAt: Date.now() - 86400000 + 7200000,
  },
];

export const loadSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.storeName === 'Mahboob Provision Store' || !parsed.storeName) {
        parsed.storeName = 'Ayesha Provision Store';
        parsed.ownerName = 'Ayesha';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading settings from storage', e);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading transactions from storage', e);
  }
  saveTransactions(SAMPLE_TRANSACTIONS);
  return SAMPLE_TRANSACTIONS;
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions to storage', e);
  }
};

export const exportDataJSON = (): string => {
  const settings = loadSettings();
  const transactions = loadTransactions();
  const backup = {
    appName: 'Provision Store Cash Flow',
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    settings,
    transactions,
  };
  return JSON.stringify(backup, null, 2);
};

export const importDataJSON = (jsonString: string): { success: boolean; message: string; count?: number } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file format.' };
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
    }
    if (Array.isArray(parsed.transactions)) {
      saveTransactions(parsed.transactions);
      return {
        success: true,
        message: `Successfully restored ${parsed.transactions.length} transactions and store settings!`,
        count: parsed.transactions.length,
      };
    }
    return { success: false, message: 'No valid transactions array found in backup file.' };
  } catch (e) {
    return { success: false, message: 'Failed to parse JSON file. File may be corrupted.' };
  }
};
