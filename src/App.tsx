import React, { useState } from 'react';
import { CashFlowProvider } from './context/CashFlowContext';
import { Header } from './components/common/Header';
import { BottomNav, type ActiveTab } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { CalculatorScreen } from './components/calculator/CalculatorScreen';
import { TransactionFormScreen } from './components/transactions/TransactionFormScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { DownloadAppModal } from './components/common/DownloadAppModal';
import { InstallBanner } from './components/common/InstallBanner';
import { StoreLoginModal } from './components/common/StoreLoginModal';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenDownloadApp = () => setIsDownloadModalOpen(true);
  const handleCloseDownloadApp = () => setIsDownloadModalOpen(false);

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenDownloadApp={handleOpenDownloadApp}
        onOpenLoginModal={handleOpenLoginModal}
      />

      {/* Global Real-time Toast Notifications */}
      <Toast />

      {/* Main Tab Screen Content */}
      <main className="animate-in fade-in duration-200">
        {activeTab === 'dashboard' && <DashboardScreen setActiveTab={setActiveTab} />}
        {activeTab === 'calculator' && <CalculatorScreen />}
        {activeTab === 'transactions' && <TransactionFormScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'settings' && <SettingsScreen onOpenDownloadApp={handleOpenDownloadApp} />}
      </main>

      {/* Floating Mobile App Install Banner */}
      <InstallBanner onOpenModal={handleOpenDownloadApp} />

      {/* Download Mobile App Modal Dialog */}
      <DownloadAppModal isOpen={isDownloadModalOpen} onClose={handleCloseDownloadApp} />

      {/* Store Mobile Login Modal Dialog */}
      <StoreLoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />

      {/* Bottom Mobile Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <CashFlowProvider>
      <MainApp />
    </CashFlowProvider>
  );
}

export default App;
