import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  HardDrive,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useCashFlow } from '../../context/CashFlowContext';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const { showToast } = useCashFlow();

  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'qr' | 'ios' | 'offline'>('install');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await promptInstall();
    if (success) {
      showToast('App Installed!', 'Provision Store Cash Flow Manager is now installed on your device home screen');
      onClose();
    } else {
      showToast('Install Prompt Ready', 'If prompt did not show, use browser menu > Add to Home screen');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('Link Copied', 'Mobile link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOfflineHTML = () => {
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Provision_Store_CashFlow_Mobile_App.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Offline App Downloaded', 'Open the downloaded .html file in any mobile browser to run completely offline!');
  };

  // Generate QR Code SVG matrix algorithm for rendering QR code cleanly without external npm packages
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentUrl || 'https://provision-store-cashflow.vercel.app'
  )}&color=059669&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <img
              src="/app_logo_3d.png"
              alt="Provision Store Cash Flow Mobile App 3D Logo"
              className="w-13 h-13 rounded-2xl shadow-xl border-2 border-white/40 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">Download Mobile App</h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  Android & iOS
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Install 1-Tap Offline Store Cash Flow Manager on your Phone
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-emerald-500/30 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('install')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'install'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold'
                  : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700/80'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 1-Click Install
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold'
                  : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700/80'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Mobile QR Scan
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold'
                  : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700/80'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> iPhone / iOS Guide
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'offline'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold'
                  : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700/80'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" /> Offline Package
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200 flex-1">
          {/* TAB 1: 1-Click PWA Native Installation */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Native PWA Mobile Application</p>
                  <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Installs directly as an app icon on your phone home screen. Works 100% offline, opens instantly in full screen with no browser url bars!
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">App is Already Installed!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You are already using or have installed this app on your phone. You can launch it anytime from your home screen.
                  </p>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" /> INSTALL MOBILE APP NOW
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-5 h-5" /> Download / Add App To Home Screen
                  </button>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Manual 1-Step Install for Android/Chrome:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <li>Tap the <strong>3 Dots (⋮) Menu</strong> at top right of Chrome browser</li>
                      <li>
                        Tap <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">"Install app"</strong> or <strong>"Add to Home Screen"</strong>
                      </li>
                      <li>Confirm to add Provision Cash Flow App to your home screen!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> 100% Offline Access
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Record sales without internet connection</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" /> Multi-Staff Sync
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Sync 4 store mobile phones real-time</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR Code Mobile Scanner */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Scan this QR code using your phone camera to open and install the Mobile App on your phone instantly!
              </p>

              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-500/30 inline-block shadow-xl">
                <img
                  src={qrSvgUrl}
                  alt="Scan QR Code to install Mobile App"
                  className="w-48 h-48 mx-auto rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 truncate max-w-[240px] font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: iOS iPhone Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <strong>iPhone & iPad (Safari) Installation:</strong> Apple iOS supports installing web apps directly from Safari in 3 easy steps!
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Tap Share Button <Share2 className="w-4 h-4 text-blue-500" />
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">At the bottom menu bar of Safari browser</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-emerald-500" />
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">Scroll down in the action list and select it</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Tap "Add" at Top Right</p>
                    <p className="text-slate-500 dark:text-slate-400">App icon will appear on your iPhone home screen!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Offline Mobile HTML Package */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-500" /> Standalone Mobile Offline App Bundle
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Download a complete self-contained offline application package file (.html). You can save this file directly onto any Android phone or tablet storage and open it without internet connection ever needed!
                </p>
              </div>

              <button
                onClick={handleDownloadOfflineHTML}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" /> DOWNLOAD OFFLINE MOBILE PACKAGE (.HTML)
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 font-medium">v1.0.0 Mobile Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
