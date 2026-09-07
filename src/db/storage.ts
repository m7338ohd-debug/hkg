import type { Transaction, StoreSettings } from '../types';

const TRANSACTIONS_KEY = 'provision_store_cashflow_transactions';
const TRANSACTIONS_VAULT_KEY = 'provision_store_cashflow_transactions_vault';

const SETTINGS_KEY = 'provision_store_cashflow_settings';
const SETTINGS_VAULT_KEY = 'provision_store_cashflow_settings_vault';

const HOME_MAINTENANCE_KEY = 'provision_store_home_maintenance';
const HOME_MAINTENANCE_VAULT_KEY = 'provision_store_home_maintenance_vault';

const FAMILY_INCOME_KEY = 'provision_store_family_income';
const FAMILY_INCOME_VAULT_KEY = 'provision_store_family_income_vault';

const FIXED_MONTHLY_KEY = 'provision_store_fixed_monthly_expenses';
const FIXED_MONTHLY_VAULT_KEY = 'provision_store_fixed_monthly_expenses_vault';

const DEVICE_ID_KEY = 'provision_store_device_id';

export const getOrCreateDeviceId = (): string => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `mob_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return `mob_${Date.now()}`;
  }
};

export const getDeviceFingerprint = (): string => {
  try {
    const ua = navigator.userAgent;
    let deviceType = 'Mobile Device';
    if (/android/i.test(ua)) deviceType = 'Android Mobile';
    if (/iphone|ipad|ipod/i.test(ua)) deviceType = 'iOS Mobile';
    if (/oppo/i.test(ua)) deviceType = 'Oppo Mobile';
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    return `${deviceType} (${screenWidth}x${screenHeight})`;
  } catch (e) {
    return 'Mobile Screen';
  }
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Ayesha Provision Store',
  ownerName: 'Ayesha',
  currency: '₹',
  openingCash: 5000,
  investedAmount: 25000,
  profitRate: 10,
  storeSyncCode: 'AYESHA-STORE-01',
  darkMode: true,
  autoBackupReminder: true,
  manualDailyProfits: {},
  activeUser: 'Owner / Ayesha',
  isLoggedIn: true,
  deviceId: getOrCreateDeviceId(),
  deviceFingerprint: getDeviceFingerprint(),
  lastLoginTimestamp: Date.now(),
  createdAccountDate: new Date().toISOString().split('T')[0],
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
    time: '09:30 AM',
    paymentMethod: 'Cash',
    notes: 'Morning Provisions & Oil Sale',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'tx_sample_2',
    type: 'credit_sale',
    amount: 650,
    customerName: 'Ramesh Kumar',
    phone: '9876543210',
    date: getTodayString(0),
    time: '11:15 AM',
    notes: 'Monthly Rice 5kg & Sugar Udhar',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'tx_sample_3',
    type: 'cash_sale',
    amount: 2200,
    date: getTodayString(0),
    time: '02:40 PM',
    paymentMethod: 'UPI',
    notes: 'UPI Scanner Payment - Groceries',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'tx_sample_4',
    type: 'credit_payment',
    amount: 400,
    customerName: 'Ramesh Kumar',
    phone: '9876543210',
    date: getTodayString(0),
    time: '04:20 PM',
    paymentMethod: 'Cash',
    notes: 'Partial Udhar Collected from Ramesh',
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'tx_sample_5',
    type: 'home_use',
    amount: 230,
    date: getTodayString(0),
    time: '06:10 PM',
    notes: 'Took Tea Powder & Milk packet for home',
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'tx_sample_6',
    type: 'purchase',
    amount: 3200,
    category: 'Groceries',
    date: getTodayString(1),
    time: '10:00 AM',
    notes: 'Wholesale Rice & Dal Stock Purchase',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx_sample_7',
    type: 'expense',
    amount: 450,
    category: 'Electricity',
    date: getTodayString(1),
    time: '03:00 PM',
    notes: 'Store Freezer Electricity Bill',
    createdAt: Date.now() - 86400000 + 3600000,
  },
  {
    id: 'tx_sample_8',
    type: 'credit_sale',
    amount: 890,
    customerName: 'Anita Sharma',
    phone: '9123456780',
    date: getTodayString(1),
    time: '05:30 PM',
    notes: 'Atta & Cooking Oil on Udhar',
    createdAt: Date.now() - 86400000 + 7200000,
  },
];

export const loadSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(SETTINGS_VAULT_KEY);
    const deviceId = getOrCreateDeviceId();
    const fingerprint = getDeviceFingerprint();

    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.storeName === 'Mahboob Provision Store' || !parsed.storeName) {
        parsed.storeName = 'Ayesha Provision Store';
        parsed.ownerName = 'Ayesha';
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        deviceId,
        deviceFingerprint: fingerprint,
      };
    }
  } catch (e) {
    console.error('Error loading settings from storage', e);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: StoreSettings): void => {
  try {
    const json = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, json);
    localStorage.setItem(SETTINGS_VAULT_KEY, json);
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY) || localStorage.getItem(TRANSACTIONS_VAULT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveTransactions(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading transactions from storage', e);
  }
  return [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    const json = JSON.stringify(transactions);
    localStorage.setItem(TRANSACTIONS_KEY, json);
    if (Array.isArray(transactions) && transactions.length > 0) {
      localStorage.setItem(TRANSACTIONS_VAULT_KEY, json);
    }
  } catch (e) {
    console.error('Error saving transactions to storage', e);
  }
};

export const loadHomeMaintenance = (): any[] => {
  try {
    const data = localStorage.getItem(HOME_MAINTENANCE_KEY) || localStorage.getItem(HOME_MAINTENANCE_VAULT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveHomeMaintenance(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading home maintenance data', e);
  }
  return [];
};

export const saveHomeMaintenance = (entries: any[]): void => {
  try {
    const json = JSON.stringify(entries);
    localStorage.setItem(HOME_MAINTENANCE_KEY, json);
    if (Array.isArray(entries) && entries.length > 0) {
      localStorage.setItem(HOME_MAINTENANCE_VAULT_KEY, json);
    }
  } catch (e) {
    console.error('Error saving home maintenance data', e);
  }
};

export const loadFamilyIncome = (): any[] => {
  try {
    const data = localStorage.getItem(FAMILY_INCOME_KEY) || localStorage.getItem(FAMILY_INCOME_VAULT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveFamilyIncome(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading family income data', e);
  }
  return [];
};

export const saveFamilyIncome = (entries: any[]): void => {
  try {
    const json = JSON.stringify(entries);
    localStorage.setItem(FAMILY_INCOME_KEY, json);
    if (Array.isArray(entries) && entries.length > 0) {
      localStorage.setItem(FAMILY_INCOME_VAULT_KEY, json);
    }
  } catch (e) {
    console.error('Error saving family income data', e);
  }
};

export const loadFixedMonthlyExpenses = (): any[] => {
  try {
    const data = localStorage.getItem(FIXED_MONTHLY_KEY) || localStorage.getItem(FIXED_MONTHLY_VAULT_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveFixedMonthlyExpenses(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading fixed monthly expenses data', e);
  }
  return [];
};

export const saveFixedMonthlyExpenses = (entries: any[]): void => {
  try {
    const json = JSON.stringify(entries);
    localStorage.setItem(FIXED_MONTHLY_KEY, json);
    if (Array.isArray(entries) && entries.length > 0) {
      localStorage.setItem(FIXED_MONTHLY_VAULT_KEY, json);
    }
  } catch (e) {
    console.error('Error saving fixed monthly expenses data', e);
  }
};

export const exportDataJSON = (): string => {
  const settings = loadSettings();
  const transactions = loadTransactions();
  const homeMaintenance = loadHomeMaintenance();
  const familyIncome = loadFamilyIncome();
  const fixedMonthlyExpenses = loadFixedMonthlyExpenses();
  const backup = {
    appName: 'Provision Store Cash Flow',
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    settings,
    transactions,
    homeMaintenance,
    familyIncome,
    fixedMonthlyExpenses,
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
    }
    if (Array.isArray(parsed.homeMaintenance)) {
      saveHomeMaintenance(parsed.homeMaintenance);
    }
    if (Array.isArray(parsed.familyIncome)) {
      saveFamilyIncome(parsed.familyIncome);
    }
    if (Array.isArray(parsed.fixedMonthlyExpenses)) {
      saveFixedMonthlyExpenses(parsed.fixedMonthlyExpenses);
    }
    return {
      success: true,
      message: `Successfully restored store data and family records!`,
      count: parsed.transactions?.length || 0,
    };
  } catch (e) {
    return { success: false, message: 'Failed to parse JSON file. File may be corrupted.' };
  }
};
