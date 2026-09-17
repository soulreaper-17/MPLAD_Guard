'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  Home,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  KeyRound,
  Building2,
  RefreshCw,
  Sparkles,
  UserCheck,
} from 'lucide-react';

const STATES = [
  { id: 'BIHAR', name: 'Bihar (Nalanda)', code: 'BR' },
  { id: 'KARNATAKA', name: 'Karnataka (Bangalore)', code: 'KA' },
  { id: 'MAHARASHTRA', name: 'Maharashtra (Mumbai)', code: 'MH' },
  { id: 'TAMIL_NADU', name: 'Tamil Nadu (Chennai)', code: 'TN' },
  { id: 'UTTAR_PRADESH', name: 'Uttar Pradesh (Lucknow)', code: 'UP' },
  { id: 'DELHI', name: 'Delhi NCR', code: 'DL' },
];

const DEPARTMENTS = [
  'Rural Development & Panchayat',
  'Public Works Department (PWD)',
  'Urban Infrastructure & Planning',
  'Local Administration & Vigilance',
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth Method Mode: 'email' or 'otp'
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('email');

  // Phone OTP State
  const [phone, setPhone] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp' | 'select_role'>('enter_phone');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string>('');
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string>('');
  const [otpErrorMsg, setOtpErrorMsg] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Email Sign-In State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCapsLock, setIsCapsLock] = useState<boolean>(false);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  // Handle mode param from URL
  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode === 'otp') {
      setAuthMethod('otp');
    } else if (initialMode === 'email') {
      setAuthMethod('email');
    }
  }, [searchParams]);

  // Resend Countdown Timer Effect
  useEffect(() => {
    let interval: any;
    if (otpStep === 'enter_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  // Handle Caps Lock Warning for password
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLock(true);
    } else {
      setIsCapsLock(false);
    }
  };

  // Indian Mobile Validation (Strict Client-side)
  const validateIndianPhone = (input: string) => {
    if (!input || !input.trim()) {
      return { isValid: false, cleanDigits: '', error: 'Mobile number is required' };
    }
    
    let clean = input.trim().replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('+91')) clean = clean.slice(3);
    if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
    if (clean.startsWith('0') && clean.length === 11) clean = clean.slice(1);

    if (!/^\d+$/.test(clean)) {
      return { isValid: false, cleanDigits: clean, error: 'Enter digits only (no letters or special characters)' };
    }
    if (clean.length !== 10) {
      return { isValid: false, cleanDigits: clean, error: 'Mobile number must be exactly 10 digits' };
    }
    if (!/^[6-9]/.test(clean)) {
      return { isValid: false, cleanDigits: clean, error: 'Indian mobile numbers must start with 6, 7, 8, or 9' };
    }

    return { isValid: true, cleanDigits: clean };
  };

  // Send OTP Action
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpErrorMsg('');
    setPhoneError('');

    const validation = validateIndianPhone(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Enter a valid 10-digit mobile number');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.sendOtp(`+91${validation.cleanDigits}`);
      setMaskedPhone(res.masked_phone || `+91 XXXXXXX${validation.cleanDigits.slice(-4)}`);
      setDevOtp(res.dev_otp || '');
      setOtpSuccessMsg(`OTP sent to ${res.masked_phone || `+91 XXXXXXX${validation.cleanDigits.slice(-4)}`}`);
      setOtpStep('enter_otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setOtpErrorMsg(err.message || 'Failed to send OTP. Please check the number and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP Action
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpErrorMsg('');
    setOtpSuccessMsg('');

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      setOtpErrorMsg('Enter all 6 digits of the OTP sent to your phone.');
      return;
    }

    const validation = validateIndianPhone(phone);
    setVerifyingOtp(true);
    try {
      const user = await api.verifyOtp(`+91${validation.cleanDigits}`, fullOtp);
      setOtpSuccessMsg('Mobile number verified ✓');
      setOtpStep('select_role');
    } catch (err: any) {
      setOtpErrorMsg(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleSendOtp();
  };

  // OTP Digit Box Navigation
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto-focus next input box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Email Login Handler
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');

    try {
      const user = await api.login(email, password);
      localStorage.setItem('mplad_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setEmailError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen architectural-env flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-[#C88A25]/20 selection:text-[#182027]">
      
      {/* Top Portal Navigation Link */}
      <div className="absolute top-8 left-8 z-20 font-mono">
        <Link
          href="/"
          className="tactile-light-switch inline-flex items-center gap-2 text-xs font-bold text-[#182027] px-4 py-2 rounded-full shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-[#C88A25]" />
          <span>RETURN TO SEVAARTH AI</span>
        </Link>
      </div>

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-[#E4E7E1] shadow-[0_12px_32px_rgba(24,32,39,0.06)] flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-[#285C7A]" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#182027] font-sans">
            <span className="relative">
              <span className="absolute -top-0.5 left-0 right-0 h-[2.5px] bg-[#C88A25] rounded-full opacity-80" />
              Sevaarth
            </span>{' '}
            <span className="text-[#285C7A] font-mono ml-0.5">AI</span>
          </h1>
          <p className="text-[11px] text-[#667078] font-mono tracking-wider uppercase mt-0.5">
            PUBLIC EXPENDITURE INTELLIGENCE AUTHENTICATION
          </p>
        </div>

        {/* Authentication Mode Switcher */}
        <div className="inline-flex p-1 bg-white border border-[#E4E7E1] rounded-full text-xs font-mono font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`px-5 py-2 rounded-full transition-all duration-200 ${
              authMethod === 'email' ? 'tactile-light-switch-active text-white shadow-xs' : 'text-[#667078] hover:text-[#182027]'
            }`}
          >
            EMAIL &amp; PASSWORD SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('otp')}
            className={`px-5 py-2 rounded-full transition-all duration-200 ${
              authMethod === 'otp' ? 'tactile-light-switch-active text-white shadow-xs' : 'text-[#667078] hover:text-[#182027]'
            }`}
          >
            MOBILE OTP AUTH
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 font-mono">
        <div className="floating-slab p-8 space-y-6 shadow-[0_24px_60px_rgba(24,32,39,0.08)] bg-white/95 rounded-3xl border border-[#E4E7E1]">
          
          {/* MODE 1: REAL MOBILE OTP AUTHENTICATION */}
          {authMethod === 'otp' && (
            <div className="space-y-6">
              
              {/* STEP 1: ENTER MOBILE NUMBER */}
              {otpStep === 'enter_phone' && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-bold text-[#285C7A] uppercase tracking-wider block">
                      MOBILE NUMBER VERIFICATION
                    </span>
                    <p className="text-xs text-[#667078] font-sans">
                      Enter your 10-digit Indian mobile number to receive a one-time passcode.
                    </p>
                  </div>

                  {phoneError && (
                    <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-3 rounded-xl text-xs flex items-center gap-2 font-sans">
                      <AlertTriangle className="w-4 h-4 text-[#C45145] shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  {otpErrorMsg && (
                    <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-3 rounded-xl text-xs flex items-center gap-2 font-sans">
                      <AlertTriangle className="w-4 h-4 text-[#C45145] shrink-0" />
                      <span>{otpErrorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-[#182027] uppercase tracking-wider mb-1.5">
                      MOBILE NUMBER
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-[#285C7A] border-r border-[#D2D7CE] pr-2.5">
                        <Phone className="w-3.5 h-3.5 text-[#285C7A]" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError('');
                        }}
                        className={`w-full bg-[#FAFAF7] border rounded-xl pl-20 pr-4 py-3 text-sm text-[#182027] font-bold tracking-wider focus:outline-none transition ${
                          phoneError ? 'border-[#C45145]' : 'border-[#D2D7CE] focus:border-[#285C7A]'
                        }`}
                        placeholder="98765 43210"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <span>{sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER & VERIFY 6-DIGIT OTP */}
              {otpStep === 'enter_otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#285C7A] uppercase tracking-wider block">
                      VERIFY YOUR MOBILE
                    </span>
                    <p className="text-xs text-[#667078] font-sans">
                      Enter the 6-digit OTP sent to <strong className="text-[#182027] font-mono">{maskedPhone}</strong>
                    </p>
                  </div>

                  {otpSuccessMsg && (
                    <div className="bg-[#398265]/10 border border-[#398265]/30 text-[#398265] p-3 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#398265]" />
                      <span>{otpSuccessMsg}</span>
                    </div>
                  )}

                  {otpErrorMsg && (
                    <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-3 rounded-xl text-xs font-sans flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#C45145] shrink-0" />
                      <span>{otpErrorMsg}</span>
                    </div>
                  )}

                  {/* 6 Individual Digit Inputs */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-mono font-extrabold bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl text-[#182027] focus:outline-none focus:border-[#285C7A] shadow-xs focus:bg-white transition"
                      />
                    ))}
                  </div>

                  {/* Resend Timer Controls */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#667078] pt-1">
                    <span>
                      {resendTimer > 0 ? (
                        <>RESEND OTP IN: <strong className="text-[#285C7A]">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</strong></>
                      ) : (
                        <span className="text-[#398265]">OTP Expired</span>
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!canResend}
                      onClick={handleResendOtp}
                      className={`text-xs font-bold flex items-center gap-1 ${
                        canResend ? 'text-[#285C7A] hover:underline cursor-pointer' : 'text-[#9AA3AB] cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>RESEND OTP</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={verifyingOtp}
                      className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <span>{verifyingOtp ? 'VERIFYING OTP...' : 'VERIFY & CONTINUE'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('enter_phone');
                        setOtpErrorMsg('');
                        setOtpSuccessMsg('');
                      }}
                      className="text-xs text-[#667078] hover:text-[#182027] font-mono underline block mx-auto pt-1"
                    >
                      Change Mobile Number
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: ROLE SELECTION POST OTP */}
              {otpStep === 'select_role' && (
                <div className="space-y-5 text-center font-mono">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#398265] uppercase tracking-wider block">
                      PASSCODE VERIFIED ✓ SELECT YOUR SESSION ROLE
                    </span>
                    <p className="text-xs text-[#667078] font-sans">
                      Choose how you would like to participate in this intelligence session:
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const officerUser = {
                          email: 'investigator@mpladguard.gov.in',
                          name: 'Shivam Kumar',
                          role: 'Senior Vigilance Officer',
                          user_role: 'OFFICER',
                          agency: 'District Vigilance Bureau',
                          token: 'officer-token'
                        };
                        localStorage.setItem('mplad_user', JSON.stringify(officerUser));
                        router.push('/dashboard');
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-[#285C7A] bg-[#285C7A]/5 hover:bg-[#285C7A] hover:text-white text-left transition group shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-[#182027] group-hover:text-white">
                          <ShieldCheck className="w-4 h-4 text-[#285C7A] group-hover:text-white" />
                          <span>CONTINUE AS VIGILANCE OFFICER</span>
                        </div>
                        <p className="text-[11px] text-[#667078] group-hover:text-white/80 font-sans">
                          Official investigator mode with write access to Officer Log (Tab 9).
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#285C7A] group-hover:text-white shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const citizenUser = {
                          email: 'citizen@mpladguard.gov.in',
                          name: 'Public Citizen of India',
                          role: 'Public Citizen',
                          user_role: 'CITIZEN',
                          agency: 'Citizen Audit & Feedback Network',
                          token: 'citizen-token'
                        };
                        localStorage.setItem('mplad_user', JSON.stringify(citizenUser));
                        router.push('/dashboard');
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-[#C88A25] bg-[#C88A25]/5 hover:bg-[#C88A25] hover:text-white text-left transition group shadow-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold text-xs text-[#182027] group-hover:text-white">
                          <UserCheck className="w-4 h-4 text-[#C88A25] group-hover:text-white" />
                          <span>CONTINUE AS COMMON PUBLIC OF INDIA</span>
                        </div>
                        <p className="text-[11px] text-[#667078] group-hover:text-white/80 font-sans">
                          Public citizen mode with access to Report Inaccuracy & file ground complaints (Tab 10).
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C88A25] group-hover:text-white shrink-0" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* MODE 2: EMAIL / SERVICE ID AUTHENTICATION */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4 text-xs">
              <div className="text-center space-y-1 pb-2 border-b border-[#E4E7E1]">
                <span className="text-xs font-bold text-[#285C7A] uppercase tracking-wider block">
                  OFFICER CREDENTIAL LOGIN
                </span>
                <p className="text-xs text-[#667078] font-sans">
                  Sign in using your official email address and password.
                </p>
              </div>

              {emailError && (
                <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-3 rounded-xl text-xs flex items-center gap-2 font-sans">
                  <AlertTriangle className="w-4 h-4 text-[#C45145] shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[#182027] uppercase tracking-wider mb-1.5">
                  OFFICIAL EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9AA3AB] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#182027] focus:outline-none focus:border-[#285C7A]"
                    placeholder="officer@sevaarth.ai"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-[#182027] uppercase tracking-wider">
                    PASSWORD
                  </label>
                  {isCapsLock && (
                    <span className="text-[9px] font-bold text-[#C88A25] uppercase">
                      CAPS LOCK IS ON
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9AA3AB] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#182027] focus:outline-none focus:border-[#285C7A]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#9AA3AB] hover:text-[#182027]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md pt-2"
              >
                <span>{emailLoading ? 'AUTHENTICATING...' : 'SIGN IN TO WORKSPACE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Sign-In Option for Common Public of India */}
          <div className="pt-4 border-t border-[#E4E7E1] space-y-2">
            <span className="text-[10px] font-bold text-[#667078] uppercase tracking-wider block text-center">
              OR SIGN IN AS A CITIZEN OF INDIA
            </span>
            <button
              type="button"
              onClick={() => {
                const citizenUser = {
                  email: 'citizen@mpladguard.gov.in',
                  name: 'Public Citizen of India',
                  role: 'Public Citizen',
                  agency: 'Citizen Audit & Feedback Network',
                  token: 'citizen-jwt-token'
                };
                localStorage.setItem('mplad_user', JSON.stringify(citizenUser));
                router.push('/dashboard');
              }}
              className="w-full py-3 px-4 rounded-xl border border-[#285C7A] bg-[#285C7A]/10 text-[#285C7A] hover:bg-[#285C7A] hover:text-white transition font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C88A25]" />
              <span>CONTINUE AS COMMON PUBLIC OF INDIA</span>
            </button>
          </div>

        </div>

        {/* Bottom Link to Sign Up */}
        <div className="text-center font-mono text-xs text-[#667078]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-[#285C7A] hover:underline">
            Create an Account / Register &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6F3] flex items-center justify-center font-mono text-xs text-[#667078]">
          <div className="w-8 h-8 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin mr-3" />
          <span>INITIALIZING AUTHENTICATION CONSOLE...</span>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
