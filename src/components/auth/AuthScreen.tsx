import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Users,
  User,
  Sparkles,
  Store,
  Wallet,
  Coins,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Send,
  MessageSquareCode,
} from 'lucide-react';
import { useCashFlow } from '../../context/CashFlowContext';
import { Auth3DCanvas } from './Auth3DCanvas';
import { sanitizeSyncCode } from '../../db/cloudSync';

export const AuthScreen: React.FC = () => {
  const { settings, loginStore, registerStoreAccount, sendMobileOTP, verifyMobileOTP, showToast } = useCashFlow();

  const [authMode, setAuthMode] = useState<'otp' | 'code' | 'register'>('otp');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile OTP Form state
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);
  const [simulatedOTP, setSimulatedOTP] = useState('482910');
  const [otpUserRole, setOtpUserRole] = useState(settings.activeUser || 'Owner / Ayesha');

  // Store Code Login state
  const [loginSyncCode, setLoginSyncCode] = useState(settings.storeSyncCode || 'AYESHA-STORE-01');
  const [loginUser, setLoginUser] = useState(settings.activeUser || 'Owner / Ayesha');

  // Register Form state
  const [regStoreName, setRegStoreName] = useState('Ayesha Provision Store');
  const [regOwnerName, setRegOwnerName] = useState('Ayesha');
  const [regMobile, setRegMobile] = useState('9876543210');
  const [regSyncCode, setRegSyncCode] = useState(`STORE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [regUserName, setRegUserName] = useState('Owner / Ayesha');
  const [regOpeningCash, setRegOpeningCash] = useState('5000');
  const [regInvestedAmount, setRegInvestedAmount] = useState('25000');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regSimulatedOTP, setRegSimulatedOTP] = useState('482910');
  const [regOtpDigits, setRegOtpDigits] = useState(['4', '8', '2', '9', '1', '0']);

  const presets = [
    { label: 'AYESHA-STORE-01', code: 'AYESHA-STORE-01' },
    { label: 'PIN 1234', code: '1234' },
    { label: 'PIN 5678', code: '5678' },
  ];

  const userRoles = [
    { id: 'Owner / Ayesha', label: 'Owner / Ayesha', icon: ShieldCheck },
    { id: 'Mom / Mother', label: 'Mom / Mother', icon: Users },
    { id: 'Staff Member 1', label: 'Staff Member 1', icon: User },
    { id: 'Staff Member 2', label: 'Staff Member 2', icon: User },
  ];

  // 1. Mobile OTP Request & Verification
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      showToast('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    const code = await sendMobileOTP(mobileNumber);
    setIsSubmitting(false);

    setSimulatedOTP(code);
    setOtpDigits(code.split(''));
    setOtpSent(true);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOTP = otpDigits.join('');
    if (enteredOTP.length < 6) {
      showToast('Enter 6-Digit OTP', 'Please enter all 6 digits of your OTP code', 'error');
      return;
    }

    setIsSubmitting(true);
    await verifyMobileOTP(mobileNumber, enteredOTP, otpUserRole);
    setIsSubmitting(false);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.substring(value.length - 1);
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // 2. Store Code Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeSyncCode(loginSyncCode);

    if (!cleanCode) {
      showToast('Invalid Code', 'Please enter a valid store sync code or PIN', 'error');
      return;
    }

    setIsSubmitting(true);
    await loginStore(cleanCode, loginUser);
    setIsSubmitting(false);
  };

  // 3. Register with Mobile OTP Submit
  const handleRegisterSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeSyncCode(regSyncCode);

    if (!cleanCode) {
      showToast('Invalid Sync Code', 'Please enter a valid store sync code', 'error');
      return;
    }

    if (!regMobile || regMobile.trim().length < 10) {
      showToast('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number for account creation', 'error');
      return;
    }

    setIsSubmitting(true);
    const code = await sendMobileOTP(regMobile);
    setIsSubmitting(false);

    setRegSimulatedOTP(code);
    setRegOtpDigits(code.split(''));
    setRegOtpSent(true);
  };

  const handleRegisterVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = sanitizeSyncCode(regSyncCode);
    const enteredOTP = regOtpDigits.join('');

    if (enteredOTP.length < 6) {
      showToast('Enter 6-Digit OTP', 'Please enter the 6-digit OTP code to complete account registration', 'error');
      return;
    }

    setIsSubmitting(true);
    const verified = await verifyMobileOTP(regMobile, enteredOTP, regUserName);
    if (verified) {
      await registerStoreAccount({
        storeName: regStoreName,
        ownerName: regOwnerName,
        syncCode: cleanCode,
        userName: regUserName,
        openingCash: parseFloat(regOpeningCash) || 0,
        investedAmount: parseFloat(regInvestedAmount) || 0,
        mobileNumber: regMobile,
      });
    }
    setIsSubmitting(false);
  };

  const handleDemoAccess = async () => {
    setIsSubmitting(true);
    await loginStore('AYESHA-STORE-01', 'Owner / Ayesha');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-dvh h-dvh w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto antialiased selection:bg-emerald-500 selection:text-white">
      {/* Main Container */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col p-4 sm:p-5 space-y-3.5">
        
        {/* Header Title */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-base tracking-wider">
              HKG
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1">
                Provision Store Manager <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">OTP Auth</span>
              </h1>
              <p className="text-[10px] text-slate-400">Offline & Multi-Mobile Live Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
            <Smartphone className="w-3 h-3" />
            <span>Mobile Ready</span>
          </div>
        </div>

        {/* 3D Interactive Canvas Banner */}
        <Auth3DCanvas />

        {/* Auth Mode Tabs Switcher */}
        <div className="grid grid-cols-3 p-1 bg-slate-900 border border-slate-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              authMode === 'otp'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile OTP
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('code')}
            className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              authMode === 'code'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Store PIN
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Account
          </button>
        </div>

        {/* METHOD 1: MOBILE NUMBER + OTP AUTH */}
        {authMode === 'otp' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {!otpSent ? (
              // Step 1: Mobile Phone Number Input
              <form onSubmit={handleSendOTP} className="space-y-3">
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-2xl text-xs space-y-1 text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <Smartphone className="w-4 h-4 text-emerald-400" /> Instant Mobile Login:
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Enter your 10-digit mobile number. We will send a 6-digit OTP code to log in immediately.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-slate-400 text-xs">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-sm font-mono font-bold text-white tracking-wider focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Profile Role Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Who is logging in?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {userRoles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = otpUserRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setOtpUserRole(role.id)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="truncate">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'SENDING OTP...' : 'SEND 6-DIGIT OTP CODE'}
                </button>
              </form>
            ) : (
              // Step 2: 6-Digit OTP Verification Screen
              <form onSubmit={handleVerifyOTP} className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                {/* Simulated SMS Notification Card */}
                <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-2xl text-xs space-y-1 text-amber-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                      <MessageSquareCode className="w-4 h-4 text-amber-400" /> Live Simulated SMS OTP Received:
                    </p>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
                      SMS Delivered
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 font-mono font-bold pt-0.5">
                    Your verification OTP code for +91 {mobileNumber} is:{' '}
                    <span className="text-white bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/50 text-sm tracking-widest font-black">
                      {simulatedOTP}
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Enter 6-Digit Verification OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        className="w-full h-12 text-center bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-lg font-mono font-black text-amber-400 focus:ring-2 focus:ring-emerald-500/40"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  )}
                  {isSubmitting ? 'VERIFYING OTP...' : 'VERIFY OTP & LOG IN'}
                </button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const code = await sendMobileOTP(mobileNumber);
                      setSimulatedOTP(code);
                      setOtpDigits(code.split(''));
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold cursor-pointer"
                  >
                    Didn't receive SMS? <span className="text-emerald-400 underline">Resend OTP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* METHOD 2: STORE PIN / SYNC CODE */}
        {authMode === 'code' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-2xl text-xs space-y-1 text-emerald-200">
              <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                <KeyRound className="w-4 h-4 text-emerald-400" /> Store Code & PIN Login:
              </p>
              <p className="text-[11px] text-slate-300">
                Log in with your shared store code to connect across your mobile & mom's mobile.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Store Sync Code / PIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginSyncCode}
                  onChange={(e) => setLoginSyncCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AYESHA-STORE-01 or 1234"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs font-mono font-black text-white uppercase tracking-wider pl-10"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Quick Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setLoginSyncCode(p.code)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      loginSyncCode === p.code
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Select Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {userRoles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = loginUser === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setLoginUser(role.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="truncate">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isSubmitting ? 'CONNECTING...' : 'LOG IN & SYNC STORE'}
            </button>
          </form>
        )}

        {/* METHOD 3: CREATE NEW STORE ACCOUNT WITH MOBILE OTP */}
        {authMode === 'register' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {!regOtpSent ? (
              <form onSubmit={handleRegisterSendOTP} className="space-y-2.5">
                <div className="bg-teal-950/40 border border-teal-800/60 p-2.5 rounded-2xl text-xs space-y-1 text-teal-200">
                  <p className="font-bold flex items-center gap-1.5 text-teal-300">
                    <Store className="w-4 h-4 text-emerald-400" /> Mobile OTP Account Creation:
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Register a new store ledger with your mobile number. An SMS OTP will be sent to verify.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Store Name</label>
                    <input
                      type="text"
                      required
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="e.g. Ayesha Store"
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Owner Name</label>
                    <input
                      type="text"
                      required
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="e.g. Ayesha"
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Mobile Phone Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 font-bold text-slate-400 text-xs">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-2.5 py-2 pl-10 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-300 block">Store Sync Code</label>
                    <button
                      type="button"
                      onClick={() => setRegSyncCode(`STORE-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Auto-Code
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={regSyncCode}
                    onChange={(e) => setRegSyncCode(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-black text-amber-400 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Opening Cash (₹)</label>
                    <input
                      type="number"
                      required
                      value={regOpeningCash}
                      onChange={(e) => setRegOpeningCash(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Invested Capital (₹)</label>
                    <input
                      type="number"
                      required
                      value={regInvestedAmount}
                      onChange={(e) => setRegInvestedAmount(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {isSubmitting ? 'SENDING OTP...' : 'GET OTP & CREATE STORE ACCOUNT'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterVerifyAndCreate} className="space-y-3">
                {/* Simulated SMS Notification Card */}
                <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-2xl text-xs space-y-1 text-amber-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                      <MessageSquareCode className="w-4 h-4 text-amber-400" /> Account Verification SMS OTP Delivered:
                    </p>
                  </div>
                  <p className="text-xs text-amber-100 font-mono font-bold pt-0.5">
                    Verification OTP for +91 {regMobile} is:{' '}
                    <span className="text-white bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/50 text-sm tracking-widest font-black">
                      {regSimulatedOTP}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Enter 6-Digit OTP to Complete Registration
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {regOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length > 1) val = val.substring(val.length - 1);
                          const updated = [...regOtpDigits];
                          updated[idx] = val;
                          setRegOtpDigits(updated);
                        }}
                        className="w-full h-11 text-center bg-slate-900 border border-slate-700 rounded-xl text-base font-mono font-black text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                  {isSubmitting ? 'CREATING ACCOUNT...' : 'VERIFY OTP & COMPLETE REGISTRATION'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setRegOtpSent(false)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Change Account Registration Details
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Instant Demo Access Footer link */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isSubmitting}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> 1-Click Demo Login (Ayesha Store)
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 text-center text-[10px] text-slate-400">
        <p>🔒 Mobile OTP Verified • Encrypted Local Storage • Automatic Device Fitting</p>
      </div>
    </div>
  );
};
