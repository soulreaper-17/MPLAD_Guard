'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShieldCheck, Lock, Mail, AlertTriangle, ArrowRight, UserCheck, Sparkles, Home } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('investigator@mpladguard.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.login(email, password);
      localStorage.setItem('mplad_user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setEmail('investigator@mpladguard.gov.in');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#3882c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-amber-400 transition bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
          <Home className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1e528d] border-2 border-amber-400 flex items-center justify-center font-black text-amber-400 text-2xl shadow-2xl">
          MG
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">MPLAD-GUARD <span className="text-amber-400">AI</span></h1>
        <p className="text-xs text-[#94c0e6]">
          Explainable AI-Powered Investigation Intelligence for MPLADS
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-mono">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>SIH26102 &bull; Team Reaperzz</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl border border-white/15 sm:px-10 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Investigator Portal Access
            </h2>
            <p className="text-xs text-[#94c0e6]">
              Authorized vigilance and monitoring officers only.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="investigator@mpladguard.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password / Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Investigation Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-[10px] text-amber-400 font-bold hover:underline"
              >
                Auto-Fill
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
              <div>Email: <strong>investigator@mpladguard.gov.in</strong></div>
              <div>Password: <strong>admin123</strong></div>
            </div>
          </div>
        </div>

        {/* Guardrail Disclaimer */}
        <p className="mt-6 text-center text-[11px] text-slate-400 font-sans">
          Guardrail Protocol: Risk Signal &rarr; Evidence &rarr; Priority &rarr; Human Verification.
        </p>
      </div>
    </div>
  );
}
