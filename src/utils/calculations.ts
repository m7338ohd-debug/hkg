import type { Transaction, StoreSettings, DailySummary, CustomerCreditSummary } from '../types';

export const formatCurrency = (amount: number, symbol = '₹'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const filterTransactionsByDate = (
  transactions: Transaction[],
  range: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all',
  customStart?: string,
  customEnd?: string
): Transaction[] => {
  const today = getTodayDateString();
  const todayObj = new Date();

  if (range === 'today') {
    return transactions.filter((t) => t.date === today);
  }

  if (range === 'yesterday') {
    const yObj = new Date(todayObj);
    yObj.setDate(yObj.getDate() - 1);
    const yesterday = yObj.toISOString().split('T')[0];
    return transactions.filter((t) => t.date === yesterday);
  }

  if (range === 'this_week') {
    const firstDay = new Date(todayObj);
    const day = todayObj.getDay();
    const diff = todayObj.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    firstDay.setDate(diff);
    firstDay.setHours(0, 0, 0, 0);

    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= firstDay && tDate <= todayObj;
    });
  }

  if (range === 'this_month') {
    const currentMonth = todayObj.getMonth();
    const currentYear = todayObj.getFullYear();
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
  }

  if (range === 'custom' && customStart && customEnd) {
    return transactions.filter((t) => t.date >= customStart && t.date <= customEnd);
  }

  return transactions;
};

export const calculateSummary = (
  transactions: Transaction[],
  settingsOrOpeningCash: StoreSettings | number,
  targetDate?: string
): DailySummary => {
  const settings: StoreSettings =
    typeof settingsOrOpeningCash === 'number'
      ? {
          storeName: 'Ayesha Provision Store',
          ownerName: 'Ayesha',
          currency: '₹',
          openingCash: settingsOrOpeningCash,
          investedAmount: 25000,
          profitRate: 2,
          storeSyncCode: 'AYESHA-STORE-01',
          darkMode: true,
          autoBackupReminder: true,
        }
      : settingsOrOpeningCash;

  const openingCash = settings.openingCash;
  const investedAmount = settings.investedAmount || 25000;
  const profitRate = settings.profitRate || 2;

  const dateToUse = targetDate || getTodayDateString();
  const filtered = targetDate ? transactions.filter((t) => t.date === targetDate) : transactions;

  let cashSales = 0;
  let creditSales = 0;
  let homeUseSales = 0;
  let creditReceived = 0;
  let purchases = 0;
  let expenses = 0;
  let withdrawals = 0;

  filtered.forEach((t) => {
    switch (t.type) {
      case 'cash_sale':
        cashSales += t.amount;
        break;
      case 'credit_sale':
        creditSales += t.amount;
        break;
      case 'home_use':
        homeUseSales += t.amount;
        break;
      case 'credit_payment':
        creditReceived += t.amount;
        break;
      case 'purchase':
        purchases += t.amount;
        break;
      case 'expense':
        expenses += t.amount;
        break;
      case 'withdrawal':
        withdrawals += t.amount;
        break;
    }
  });

  let totalCreditGivenAllTime = 0;
  let totalCreditCollectedAllTime = 0;
  transactions.forEach((t) => {
    if (t.type === 'credit_sale') totalCreditGivenAllTime += t.amount;
    if (t.type === 'credit_payment') totalCreditCollectedAllTime += t.amount;
  });
  const outstandingCredit = Math.max(0, totalCreditGivenAllTime - totalCreditCollectedAllTime);

  // Total Sales includes Cash Sales, Udhar Given, and Home Use entries
  const totalSales = cashSales + creditSales + homeUseSales;
  
  // Daily Profit calculation is 2% of Total Sales
  const profit = totalSales * (profitRate / 100);
  const investorProfit = profit;

  const cashInHand = openingCash + cashSales + creditReceived - purchases - expenses - withdrawals;

  return {
    date: dateToUse,
    openingCash,
    investedAmount,
    cashSales,
    creditSales,
    homeUseSales,
    totalSales,
    creditReceived,
    purchases,
    expenses,
    withdrawals,
    cashInHand,
    profit,
    investorProfit,
    outstandingCredit,
  };
};

export const calculatePeriodSummary = (transactions: Transaction[], settings: StoreSettings) => {
  const todaySummary = calculateSummary(transactions, settings, getTodayDateString());
  const profitRate = settings.profitRate || 2;

  const weeklyTxs = filterTransactionsByDate(transactions, 'this_week');
  let weeklyCashSales = 0;
  let weeklyCreditSales = 0;
  let weeklyHomeUseSales = 0;
  let weeklyCreditCollected = 0;
  let weeklyPurchases = 0;
  let weeklyExpenses = 0;
  let weeklyWithdrawals = 0;

  weeklyTxs.forEach((t) => {
    if (t.type === 'cash_sale') weeklyCashSales += t.amount;
    if (t.type === 'credit_sale') weeklyCreditSales += t.amount;
    if (t.type === 'home_use') weeklyHomeUseSales += t.amount;
    if (t.type === 'credit_payment') weeklyCreditCollected += t.amount;
    if (t.type === 'purchase') weeklyPurchases += t.amount;
    if (t.type === 'expense') weeklyExpenses += t.amount;
    if (t.type === 'withdrawal') weeklyWithdrawals += t.amount;
  });

  const weeklyTotalSales = weeklyCashSales + weeklyCreditSales + weeklyHomeUseSales;
  const weeklyProfit = weeklyTotalSales * (profitRate / 100);

  const monthlyTxs = filterTransactionsByDate(transactions, 'this_month');
  let monthlyCashSales = 0;
  let monthlyCreditSales = 0;
  let monthlyHomeUseSales = 0;
  let monthlyCreditCollected = 0;
  let monthlyPurchases = 0;
  let monthlyExpenses = 0;
  let monthlyWithdrawals = 0;

  monthlyTxs.forEach((t) => {
    if (t.type === 'cash_sale') monthlyCashSales += t.amount;
    if (t.type === 'credit_sale') monthlyCreditSales += t.amount;
    if (t.type === 'home_use') monthlyHomeUseSales += t.amount;
    if (t.type === 'credit_payment') monthlyCreditCollected += t.amount;
    if (t.type === 'purchase') monthlyPurchases += t.amount;
    if (t.type === 'expense') monthlyExpenses += t.amount;
    if (t.type === 'withdrawal') monthlyWithdrawals += t.amount;
  });

  const monthlyTotalSales = monthlyCashSales + monthlyCreditSales + monthlyHomeUseSales;
  const monthlyProfit = monthlyTotalSales * (profitRate / 100);

  return {
    today: todaySummary,
    weekly: {
      cashSales: weeklyCashSales,
      creditSales: weeklyCreditSales,
      homeUseSales: weeklyHomeUseSales,
      totalSales: weeklyTotalSales,
      creditCollected: weeklyCreditCollected,
      purchases: weeklyPurchases,
      expenses: weeklyExpenses,
      withdrawals: weeklyWithdrawals,
      profit: weeklyProfit,
    },
    monthly: {
      cashSales: monthlyCashSales,
      creditSales: monthlyCreditSales,
      homeUseSales: monthlyHomeUseSales,
      totalSales: monthlyTotalSales,
      creditCollected: monthlyCreditCollected,
      purchases: monthlyPurchases,
      expenses: monthlyExpenses,
      withdrawals: monthlyWithdrawals,
      profit: monthlyProfit,
      revenue: monthlyTotalSales,
    },
  };
};

export const getCustomerCreditSummaries = (transactions: Transaction[]): CustomerCreditSummary[] => {
  const map = new Map<string, CustomerCreditSummary>();

  transactions.forEach((t) => {
    if ((t.type === 'credit_sale' || t.type === 'credit_payment') && t.customerName) {
      const nameKey = t.customerName.trim().toLowerCase();
      const existing = map.get(nameKey) || {
        customerName: t.customerName.trim(),
        phone: t.phone || '',
        totalCreditGiven: 0,
        totalCreditCollected: 0,
        outstandingBalance: 0,
        lastTransactionDate: t.date,
      };

      if (t.type === 'credit_sale') {
        existing.totalCreditGiven += t.amount;
      } else if (t.type === 'credit_payment') {
        existing.totalCreditCollected += t.amount;
      }

      if (t.phone && !existing.phone) {
        existing.phone = t.phone;
      }

      if (t.date > existing.lastTransactionDate) {
        existing.lastTransactionDate = t.date;
      }

      existing.outstandingBalance = Math.max(0, existing.totalCreditGiven - existing.totalCreditCollected);
      map.set(nameKey, existing);
    }
  });

  return Array.from(map.values()).sort((a, b) => b.outstandingBalance - a.outstandingBalance);
};

export const getChartData = (transactions: Transaction[], days = 7) => {
  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    const dayTxs = transactions.filter((t) => t.date === dateStr);

    let cashIn = 0;
    let cashOut = 0;
    let profit = 0;
    let sales = 0;

    dayTxs.forEach((t) => {
      if (t.type === 'cash_sale') {
        cashIn += t.amount;
        sales += t.amount;
        profit += t.amount;
      } else if (t.type === 'credit_payment') {
        cashIn += t.amount;
      } else if (t.type === 'credit_sale') {
        sales += t.amount;
        profit += t.amount;
      } else if (t.type === 'purchase') {
        cashOut += t.amount;
        profit -= t.amount;
      } else if (t.type === 'expense') {
        cashOut += t.amount;
        profit -= t.amount;
      } else if (t.type === 'withdrawal') {
        cashOut += t.amount;
      }
    });

    result.push({
      date: dateStr,
      label,
      cashIn,
      cashOut,
      netCashFlow: cashIn - cashOut,
      sales,
      profit,
    });
  }

  return result;
};
