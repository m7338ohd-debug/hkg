export type TransactionType = 
  | 'cash_sale' 
  | 'credit_sale' 
  | 'credit_payment' 
  | 'purchase' 
  | 'expense' 
  | 'withdrawal'
  | 'home_use';

export type PurchaseCategory = 'Milk' | 'Groceries' | 'Snacks' | 'Beverages' | 'Other';

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Transport' | 'Miscellaneous' | 'Salary' | 'Maintenance';

export type WithdrawalReason = 'House Expense' | 'Petrol' | 'Medical' | 'Personal' | 'Other';

export type WithdrawalPerson = 'Mother' | 'Ayesha' | 'Employee' | 'Owner' | 'Other';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  customerName?: string;
  phone?: string;
  category?: PurchaseCategory | ExpenseCategory | string;
  takenBy?: WithdrawalPerson | string;
  reason?: WithdrawalReason | string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  createdAt: number; // timestamp
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  currency: string;
  openingCash: number;
  investedAmount: number; // Default 25000
  profitRate: number; // Default 2 (%)
  storeSyncCode: string; // Default 'AYESHA-STORE-01' for 4-user mobile sync
  darkMode: boolean;
  autoBackupReminder: boolean;
  lastBackupDate?: string;
  manualDailyProfits?: Record<string, number | { amount: number; notes?: string }>; // Record of YYYY-MM-DD -> profit amount or object
  activeUser?: string; // e.g. 'Owner / Ayesha', 'Mom / Mother', 'Employee'
  isLoggedIn?: boolean; // Whether phone is logged into a store code
  deviceId?: string; // Unique persistent mobile identity token
  deviceFingerprint?: string; // User agent / screen resolution description
  lastLoginTimestamp?: number; // Unix timestamp of last authentication
  createdAccountDate?: string; // YYYY-MM-DD
  mobileNumber?: string; // e.g. '+91 98765 43210'
  isPhoneVerified?: boolean; // Whether phone OTP was verified
}

export interface CustomerCreditSummary {
  customerName: string;
  phone?: string;
  totalCreditGiven: number;
  totalCreditCollected: number;
  outstandingBalance: number;
  lastTransactionDate: string;
}

export interface DailySummary {
  date: string;
  openingCash: number;
  investedAmount: number;
  cashSales: number;
  creditSales: number;
  homeUseSales: number;
  totalSales: number;
  creditReceived: number;
  purchases: number;
  expenses: number;
  withdrawals: number;
  cashInHand: number;
  profit: number; // Final daily profit used
  autoProfit: number; // Auto-calculated 2% or Sales - Purchases
  manualProfit?: number; // User manually entered daily profit if set
  manualProfitNotes?: string; // Optional description/notes for manual profit
  isManualProfit: boolean; // Whether profit was manually overridden
  investorProfit: number;
  outstandingCredit: number;
  homeMaintenanceSpent: number; // Total spent on Home Maintenance & Personal drawings
}

export interface HomeMaintenanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'Groceries & Milk' | 'Repairs & Fixes' | 'Utility Bills' | 'Medical & Health' | 'General House' | 'Other';
  amount: number;
  notes?: string;
  addedBy?: string;
  createdAt: number;
}

export interface FamilyIncomeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  memberName: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Self / Owner' | 'Other Member';
  incomeSource: 'Salary / Job' | 'Pension' | 'Business' | 'House Rent' | 'Extra Earnings' | 'Other';
  amount: number;
  notes?: string;
  createdAt: number;
}

export interface DateFilterOption {
  label: string;
  value: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all';
}

