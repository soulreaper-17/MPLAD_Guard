'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  UserPlus,
  ChevronLeft,
  KeyRound,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';

const STATES = [
  { id: 'BIHAR', name: 'Bihar (Nalanda)', code: 'BR' },
  { id: 'KARNATAKA', name: 'Karnataka (Bangalore)', code: 'KA' },
  { id: 'MAHARASHTRA', name: 'Maharashtra (Mumbai)', code: 'MH' },
  { id: 'TAMIL_NADU', name: 'Tamil Nadu (Chennai)', code: 'TN' },
  { id: 'UTTAR_PRADESH', name: 'Uttar Pradesh (Lucknow)', code: 'UP' },
  { id: 'DELHI', name: 'Delhi NCR', code: 'DL' },
];

const USER_ROLES = [
  { id: 'PUBLIC_CITIZEN', label: 'Common Public of India (Citizen)', desc: 'Public user filing ground complaints and reporting project inaccuracies' },
  { id: 'VIGILANCE_OFFICER', label: 'Vigilance Officer / Auditor', desc: 'Official investigator with full dossier access' },
  { id: 'CITIZEN_WHISTLEBLOWER', label: 'Citizen Whistleblower', desc: 'Public user raising verified expenditure complaints' },
  { id: 'NGO_AUDITOR', label: 'NGO / Independent Auditor', desc: 'Civil society expenditure monitoring' },
  { id: 'EXECUTIVE_AGENCY', label: 'Executive Agency Representative', desc: 'PWD / Rural Development departmental access' },
];

function SignupPageContent() {
  const router = useRouter();

  // Step 1: Email Input
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');

  // Step 2: OTP Verification
  const [step, setStep] = useState<'enter_email' | 'verify_otp' | 'set_password'>('enter_email');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  // Step 3: Account Creation
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES[0].id);
  const [selectedState, setSelectedState] = useState(STATES[0].id);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Error Messages
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resend Timer Effect
  useEffect(() => {
    let interval: any;
    if (step === 'verify_otp' && resendTimer > 0) {
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
  }, [step, resendTimer]);

  const validateEmail = (input: string) => {
    const clean = input.trim();
    if (!clean) return { isValid: false, error: 'Email address is required' };
    if (!clean.includes('@') || !clean.includes('.')) {
      return { isValid: false, error: 'Enter a valid email address (e.g. officer@gmail.com)' };
    }
    return { isValid: true, clean };
  };

  // Step 1 Handler: Send Email OTP
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendEmailOtp(validation.clean);
      setMaskedEmail(res.masked_email || validation.clean);
      setDevOtp(res.dev_otp || '');
      setSuccessMsg(`OTP sent to ${res.masked_email || validation.clean}`);
      setStep('verify_otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Handler: Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      setErrorMsg('Enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyEmailOtp(email, fullOtp);
      setVerificationToken(res.verification_token);
      setSuccessMsg('Email verified successfully! Now set your account password.');
      setStep('set_password');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    await handleSendEmailOtp();
  };

  // OTP Box Navigation
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`email-otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 3 Handler: Register Account & Save Credentials
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const roleObj = USER_ROLES.find((r) => r.id === selectedRole);
      const user = await api.register({
        email: email.trim(),
        password,
        name: fullName.trim(),
        role: roleObj?.label || 'Vigilance Investigator',
        agency: `District Vigilance Bureau (${selectedState})`,
        state: selectedState,
        verification_token: verificationToken,
      });

      // Save user session in localStorage
      localStorage.setItem('mplad_user', JSON.stringify(user));
      setSuccessMsg('Account registered successfully! Redirecting to workspace...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen architectural-env flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-[#C88A25]/20 selection:text-[#182027]">
      
      {/* Background Institutional Watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
        <div className="absolute top-10 right-10 w-[500px] h-[500px] text-[#285C7A]">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
            <circle cx="100" cy="100" r="88.5" fill="none" stroke="currentColor" strokeWidth="13" />
            <circle cx="100" cy="100" r="16" fill="currentColor" />
            {Array.from({ length: 24 }).map((_, i) => (
              <polygon
                key={`spoke-${i}`}
                points="100,18 97.2,65 98.4,84 101.6,84 102.8,65"
                fill="currentColor"
                transform={`rotate(${i * 15} 100 100)`}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 space-y-6">

        {/* Top Header Links */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#667078] hover:text-[#285C7A] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RETURN TO SEVAARTH AI</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-mono font-extrabold text-[#285C7A] hover:underline"
          >
            <span>SIGN IN INSTEAD &rarr;</span>
          </Link>
        </div>

        {/* Branding Plaque */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-[#E4E7E1] shadow-[0_12px_32px_rgba(24,32,39,0.06)] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[#285C7A]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#182027]">
            REGISTER FOR SEVAARTH AI
          </h1>
          <p className="text-xs text-[#667078] font-mono tracking-wider uppercase">
            EMAIL OTP VERIFICATION &amp; ACCOUNT CREATION
          </p>
        </div>

        {/* Multi-Step Wizard Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-[#E4E7E1] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(24,32,39,0.08)] space-y-6">
          
          {/* STEP INDICATOR HEADER */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E1] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step === 'enter_email' ? 'bg-[#285C7A] text-white' : 'bg-[#398265] text-white'
              }`}>
                1
              </span>
              <span className={step === 'enter_email' ? 'font-bold text-[#182027]' : 'text-[#667078]'}>EMAIL</span>
            </div>

            <div className="h-0.5 w-8 bg-[#D2D7CE]" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step === 'verify_otp' ? 'bg-[#285C7A] text-white' : step === 'set_password' ? 'bg-[#398265] text-white' : 'bg-[#E4E7E1] text-[#667078]'
              }`}>
                2
              </span>
              <span className={step === 'verify_otp' ? 'font-bold text-[#182027]' : 'text-[#667078]'}>OTP</span>
            </div>

            <div className="h-0.5 w-8 bg-[#D2D7CE]" />

            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step === 'set_password' ? 'bg-[#285C7A] text-white' : 'bg-[#E4E7E1] text-[#667078]'
              }`}>
                3
              </span>
              <span className={step === 'set_password' ? 'font-bold text-[#182027]' : 'text-[#667078]'}>PASSWORD</span>
            </div>
          </div>

          {/* Global Alert Banners */}
          {errorMsg && (
            <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-3 rounded-xl text-xs flex items-center gap-2 font-sans">
              <AlertTriangle className="w-4 h-4 text-[#C45145] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-[#398265]/10 border border-[#398265]/30 text-[#398265] p-3 rounded-xl text-xs font-sans font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#398265] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: ENTER EMAIL & REQUEST OTP */}
          {step === 'enter_email' && (
            <form onSubmit={handleSendEmailOtp} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#285C7A] uppercase tracking-wider block">
                  ENTER OFFICIAL / PERSONAL EMAIL
                </span>
                <p className="text-xs text-[#667078]">
                  We will send a 6-digit verification OTP to your email address.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1.5">
                  EMAIL ADDRESS (GMAIL OR OFFICIAL) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9AA3AB] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. officer@gmail.com or auditor@mpladguard.gov.in"
                    className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#182027] font-bold focus:outline-none focus:border-[#285C7A] focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                <span>{loading ? 'SENDING EMAIL OTP...' : 'GET EMAIL OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY EMAIL OTP */}
          {step === 'verify_otp' && (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4 text-xs font-sans">
              <div className="space-y-1 text-center">
                <span className="text-xs font-mono font-bold text-[#285C7A] uppercase tracking-wider block">
                  VERIFY EMAIL OTP
                </span>
                <p className="text-xs text-[#667078]">
                  Enter the 6-digit OTP code sent to <strong className="text-[#182027] font-mono">{maskedEmail}</strong>
                </p>
              </div>

              {/* 6 OTP DIGIT INPUT BOXES */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`email-otp-box-${idx}`}
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

              {/* Resend Timer */}
              <div className="flex items-center justify-between text-xs font-mono text-[#667078] pt-1">
                <span>
                  {resendTimer > 0 ? (
                    <>RESEND IN: <strong className="text-[#285C7A]">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</strong></>
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
                  disabled={loading}
                  className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <span>{loading ? 'VERIFYING OTP...' : 'VERIFY EMAIL OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setStep('enter_email')}
                  className="text-xs text-[#667078] hover:text-[#182027] font-mono underline block mx-auto pt-1"
                >
                  &larr; Change Email Address
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CREATE PASSWORD & SAVE ACCOUNT */}
          {step === 'set_password' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs font-sans">
              <div className="space-y-1 pb-2 border-b border-[#E4E7E1]">
                <span className="text-xs font-mono font-bold text-[#285C7A] uppercase tracking-wider block">
                  CREATE ACCOUNT &amp; SET PASSWORD
                </span>
                <p className="text-xs text-[#667078]">
                  Set your login password for <strong className="text-[#182027] font-mono">{email}</strong>.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1">
                  FULL NAME *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9AA3AB] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#182027] font-bold focus:outline-none focus:border-[#285C7A]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1">
                  ROLE &amp; DESIGNATION *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-3.5 py-2.5 text-xs text-[#182027] font-bold focus:outline-none focus:border-[#285C7A]"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Jurisdiction */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1">
                  STATE JURISDICTION *
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-3.5 py-2.5 text-xs text-[#182027] font-bold focus:outline-none focus:border-[#285C7A]"
                >
                  {STATES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1">
                    CREATE PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9AA3AB] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-9 pr-8 py-2 text-xs text-[#182027] focus:outline-none focus:border-[#285C7A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#182027] uppercase tracking-wider mb-1">
                    CONFIRM PASSWORD *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9AA3AB] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl pl-9 pr-8 py-2 text-xs text-[#182027] focus:outline-none focus:border-[#285C7A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#9AA3AB]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="tactile-light-switch-active w-full py-3.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md pt-2"
              >
                <span>{loading ? 'CREATING ACCOUNT & SAVING...' : 'SAVE CREDS & SIGN IN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Bottom Link to Sign In */}
        <div className="text-center font-mono text-xs text-[#667078]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#285C7A] hover:underline">
            Sign In with Email &amp; Password &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6F3] flex items-center justify-center font-mono text-xs text-[#667078]">
          <div className="w-8 h-8 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin mr-3" />
          <span>INITIALIZING REGISTRATION CONSOLE...</span>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
