import type { Transaction, StoreSettings } from '../types';

const TRANSACTIONS_KEY = 'provision_store_cashflow_transactions';
const SETTINGS_KEY = 'provision_store_cashflow_settings';

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
  profitRate: 2,
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

export const SAMPLE_TRANSACTIONS: Transaction[] = [];

export const loadSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
};

export const getInitialSampleTransactions = (): Transaction[] => {
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return [
    {
      id: `tx_init_1`,
      type: 'cash_sale',
      amount: 15000,
      date: today,
      time: '10:30 AM',
      notes: 'Daily counter cash sales',
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: `tx_init_2`,
      type: 'credit_sale',
      amount: 2500,
      date: today,
      time: '11:45 AM',
      customerName: 'Rahul Kumar',
      phone: '9876543210',
      notes: 'Monthly provision udhar',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: `tx_init_3`,
      type: 'purchase',
      amount: 8000,
      date: today,
      time: '01:15 PM',
      category: 'Groceries',
      notes: 'Wholesale stock purchase',
      createdAt: Date.now() - 3600000 * 1,
    },
  ];
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
  const initData = getInitialSampleTransactions();
  saveTransactions(initData);
  return initData;
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions to storage', e);
  }
};

const HOME_MAINTENANCE_KEY = 'provision_store_home_maintenance';
const FAMILY_INCOME_KEY = 'provision_store_family_income';

export const loadHomeMaintenance = (): any[] => {
  try {
    const data = localStorage.getItem(HOME_MAINTENANCE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading home maintenance data', e);
  }
  return [];
};

export const saveHomeMaintenance = (entries: any[]): void => {
  try {
    localStorage.setItem(HOME_MAINTENANCE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving home maintenance data', e);
  }
};

export const loadFamilyIncome = (): any[] => {
  try {
    const data = localStorage.getItem(FAMILY_INCOME_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading family income data', e);
  }
  return [];
};

export const saveFamilyIncome = (entries: any[]): void => {
  try {
    localStorage.setItem(FAMILY_INCOME_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error saving family income data', e);
  }
};

export const exportDataJSON = (): string => {
  const settings = loadSettings();
  const transactions = loadTransactions();
  const homeMaintenance = loadHomeMaintenance();
  const familyIncome = loadFamilyIncome();
  const backup = {
    appName: 'Provision Store Cash Flow',
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    settings,
    transactions,
    homeMaintenance,
    familyIncome,
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
    return {
      success: true,
      message: `Successfully restored store data and family records!`,
      count: parsed.transactions?.length || 0,
    };
  } catch (e) {
    return { success: false, message: 'Failed to parse JSON file. File may be corrupted.' };
  }
};
