import React, { useState } from 'react';
import { CashFlowProvider, useCashFlow } from './context/CashFlowContext';
import { Header } from './components/common/Header';
import { BottomNav, type ActiveTab } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { CalculatorScreen } from './components/calculator/CalculatorScreen';
import { TransactionFormScreen } from './components/transactions/TransactionFormScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { HomeFamilyScreen } from './components/home/HomeFamilyScreen';
import { StoreLLMScreen } from './components/store_llm/StoreLLMScreen';
import { DownloadAppModal } from './components/common/DownloadAppModal';
import { InstallBanner } from './components/common/InstallBanner';
import { StoreLoginModal } from './components/common/StoreLoginModal';
import { AuthScreen } from './components/auth/AuthScreen';

const MainApp: React.FC = () => {
  const { settings } = useCashFlow();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [txFormType, setTxFormType] = useState<any>('credit_sale');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenDownloadApp = () => setIsDownloadModalOpen(true);
  const handleCloseDownloadApp = () => setIsDownloadModalOpen(false);

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  const handleLaunchTxForm = (type: string) => {
    setTxFormType(type);
    setActiveTab('transactions');
  };

  // Device Auth Guard: Show 3D Auth Screen if not logged in on this mobile device
  if (!settings.isLoggedIn) {
    return (
      <>
        <Toast />
        <AuthScreen />
      </>
    );
  }

  return (
    <div
      className={`min-h-dvh w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200 selection:bg-emerald-500 selection:text-white relative overflow-x-hidden ${
        settings.compactMobileView !== false
          ? 'max-w-md sm:max-w-xl mx-auto border-x border-slate-200/80 dark:border-slate-800/80 shadow-2xl'
          : ''
      }`}
    >
      {/* Top Header - Store Icon click opens Settings */}
      <Header
        onOpenDownloadApp={handleOpenDownloadApp}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Global Real-time Toast Notifications */}
      <Toast />

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full animate-in fade-in duration-200">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            setActiveTab={setActiveTab}
            onQuickFormLaunch={handleLaunchTxForm}
          />
        )}
        {activeTab === 'calculator' && <CalculatorScreen />}
        {activeTab === 'transactions' && (
          <TransactionFormScreen key={txFormType} initialType={txFormType} />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'home_family' && <HomeFamilyScreen />}
        {activeTab === 'store_llm' && <StoreLLMScreen setActiveTab={setActiveTab} />}
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
