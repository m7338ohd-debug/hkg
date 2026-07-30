export type TransactionType = 
  | 'cash_sale' 
  | 'credit_sale' 
  | 'credit_payment' 
  | 'purchase' 
  | 'expense' 
  | 'withdrawal';

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
  darkMode: boolean;
  autoBackupReminder: boolean;
  lastBackupDate?: string;
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
  cashSales: number;
  creditSales: number;
  creditReceived: number;
  purchases: number;
  expenses: number;
  withdrawals: number;
  cashInHand: number;
  profit: number;
  outstandingCredit: number;
}

export interface DateFilterOption {
  label: string;
  value: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all';
}
