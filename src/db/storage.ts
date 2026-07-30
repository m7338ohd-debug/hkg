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

export const SAMPLE_TRANSACTIONS: Transaction[] = [];

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
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading transactions from storage', e);
  }
  saveTransactions([]);
  return [];
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
