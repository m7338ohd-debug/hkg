import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Transaction, StoreSettings } from '../types';
import { formatCurrency, formatDateDisplay, calculatePeriodSummary } from './calculations';

export const exportReportToPDF = async (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Report container not found for export');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('PDF generation error:', err);
    window.print();
  }
};

export const generateTextReport = (
  period: 'Daily' | 'Weekly' | 'Monthly',
  transactions: Transaction[],
  settings: StoreSettings
): string => {
  const summary = calculatePeriodSummary(transactions, settings);
  const sym = settings.currency;
  const todayStr = formatDateDisplay(new Date().toISOString().split('T')[0]);

  if (period === 'Daily') {
    const t = summary.today;
    return `=== ${settings.storeName.toUpperCase()} ===
Daily Store Finance Report (${todayStr})
Owner: ${settings.ownerName}
----------------------------------------
Opening Cash:        ${formatCurrency(t.openingCash, sym)}
Today Cash Sales:   ${formatCurrency(t.cashSales, sym)}
Today Credit Sales: ${formatCurrency(t.creditSales, sym)}
Credit Collected:   ${formatCurrency(t.creditReceived, sym)}
Purchases:          ${formatCurrency(t.purchases, sym)}
Expenses:           ${formatCurrency(t.expenses, sym)}
Withdrawals:        ${formatCurrency(t.withdrawals, sym)}
----------------------------------------
Current Cash In Hand: ${formatCurrency(t.cashInHand, sym)}
Today Net Profit:    ${formatCurrency(t.profit, sym)}
Outstanding Credit:  ${formatCurrency(t.outstandingCredit, sym)}
----------------------------------------
Generated on ${new Date().toLocaleTimeString()}
App: Offline Provision Store Cash Flow
`;
  } else if (period === 'Weekly') {
    const w = summary.weekly;
    return `=== ${settings.storeName.toUpperCase()} ===
Weekly Cash Flow Report
Owner: ${settings.ownerName}
Date: ${todayStr}
----------------------------------------
Total Cash Sales:   ${formatCurrency(w.cashSales, sym)}
Total Credit Sales: ${formatCurrency(w.creditSales, sym)}
Credit Collected:   ${formatCurrency(w.creditCollected, sym)}
Purchases:          ${formatCurrency(w.purchases, sym)}
Expenses:           ${formatCurrency(w.expenses, sym)}
Withdrawals:        ${formatCurrency(w.withdrawals, sym)}
----------------------------------------
Weekly Net Profit:  ${formatCurrency(w.profit, sym)}
Outstanding Udhar:  ${formatCurrency(summary.today.outstandingCredit, sym)}
Cash In Hand:       ${formatCurrency(summary.today.cashInHand, sym)}
----------------------------------------
`;
  } else {
    const m = summary.monthly;
    return `=== ${settings.storeName.toUpperCase()} ===
Monthly Financial Report
Owner: ${settings.ownerName}
Date: ${todayStr}
----------------------------------------
Total Revenue:      ${formatCurrency(m.revenue, sym)}
  - Cash Sales:     ${formatCurrency(m.cashSales, sym)}
  - Credit Sales:   ${formatCurrency(m.creditSales, sym)}
Purchases:          ${formatCurrency(m.purchases, sym)}
Expenses:           ${formatCurrency(m.expenses, sym)}
Withdrawals:        ${formatCurrency(m.withdrawals, sym)}
----------------------------------------
Monthly Net Profit: ${formatCurrency(m.profit, sym)}
Cash Balance:       ${formatCurrency(summary.today.cashInHand, sym)}
Outstanding Udhar:  ${formatCurrency(summary.today.outstandingCredit, sym)}
----------------------------------------
`;
  }
};
