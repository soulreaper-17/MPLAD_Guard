'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Search,
  MapPin,
  Bot,
  FileSpreadsheet,
  Building2,
  FileText,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Lock,
  Mail,
  AlertTriangle,
  Layers,
  Sparkles,
  UserCheck,
  LayoutDashboard,
  Globe,
  Compass,
} from 'lucide-react';
import { LANDING_IMAGES } from '@/lib/landingAssets';
import { api } from '@/lib/api';
import ConstituencySelector from '@/components/ConstituencySelector';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('investigator@mpladguard.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    // Scroll listener for smooth background image fade
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(0.12, 1 - scrollY / 600);
      setScrollOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.getDashboardStats()
      .then(data => setStats(data))
      .catch(() => {
        setStats({
          total_projects: 104,
          total_agencies: 18,
          high_priority_count: 14,
          medium_priority_count: 22,
          total_sanctioned_amount: 248500000,
        });
      });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const scrollToCaps = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('caps')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAutoFill = () => {
    setEmail('investigator@mpladguard.gov.in');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#0a1a30] text-white flex flex-col font-sans relative selection:bg-amber-400 selection:text-slate-950">
      
      {/* 3D NETWORK GRAPH BACKGROUND LAYER (WITH SMOOTH SCROLL FADE) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 ease-out bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${LANDING_IMAGES.networkGraph})`,
          opacity: scrollOpacity * 0.45,
        }}
      >
        {/* Dark Atmosphere Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a30]/60 via-[#0f294a]/75 to-[#0a1a30]" />
      </div>

      {/* Navigation Header */}
      <header className="bg-[#0f294a]/90 backdrop-blur-md border-b border-[#1d4674] px-6 py-3.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 3D Shield Logo */}
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0">
              <img src={LANDING_IMAGES.logoShield} alt="MPLAD-GUARD 3D Shield Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">MPLAD-GUARD AI</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                  LIVE MVP
                </span>
              </div>
              <p className="text-[11px] text-[#94c0e6] tracking-wide">
                Explainable Investigation Intelligence
              </p>
            </div>
          </div>

          {/* Constituency Selector & Quick Nav Links */}
          <div className="hidden lg:flex items-center gap-3">
            <ConstituencySelector variant="header" />

            <div className="flex items-center gap-1 bg-[#0a1a30]/80 p-1.5 rounded-xl border border-[#1d4674]">
              <Link href="/dashboard" className="px-3 py-1.5 text-xs font-semibold text-white hover:text-amber-300 transition flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Dashboard</span>
              </Link>
              <Link href="/queue" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Queue</span>
              </Link>
              <Link href="/map" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Bharat Map</span>
              </Link>
              <Link href="/assistant" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Assistant</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-400/20"
            >
              <span>Sign In / Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[88vh] w-full flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono tracking-wide shadow-inner">
            <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>SIH26102 &bull; Bharat Geospatial Fund-Flow Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white">
            MPLAD&#8209;GUARD <span className="text-amber-400">AI</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#c3daf0] leading-relaxed font-normal">
            Explainable, AI-powered investigation intelligence for the MPLAD Scheme &mdash; turning constituency project data across Bharat into transparent, evidence-backed investigation priorities.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-4 rounded-xl text-sm shadow-2xl shadow-amber-400/30 transition transform hover:-translate-y-0.5"
            >
              <span>Enter Investigation Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#caps"
              onClick={scrollToCaps}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Explore 3D Capabilities</span>
            </a>
          </div>
        </div>

        {/* Scroll Down Prompt */}
        <a
          href="#caps"
          onClick={scrollToCaps}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-slate-400 hover:text-amber-400 transition animate-bounce-slow flex flex-col items-center gap-1 text-xs"
        >
          <span>Scroll Down</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </section>

      {/* Protocol Banner Strip */}
      <div className="relative z-10 border-y border-white/10 bg-[#0f294a]/90 backdrop-blur-md py-4 px-6 text-center shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-mono text-[#94c0e6]">
          <span>Investigation Protocol &rarr; Risk Signal &rarr; Evidence &rarr; Priority &rarr; Human Verification.</span>
        </div>
      </div>

      {/* Capabilities Section */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto w-full space-y-24" id="caps">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            3D Evidence &amp; Intelligence Capabilities
          </h2>
          <p className="text-[#94c0e6] text-sm sm:text-base">
            Four connected 3D intelligence features powered by explainable AI models.
          </p>
        </div>

        {/* Feature 1: Fraud Detection */}
        <div className="flex flex-col lg:flex-row items-center gap-12 group">
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f294a] transition duration-300 group-hover:border-amber-400/50">
            <img
              src={LANDING_IMAGES.feature1}
              alt="3D Glass Network Graph - Anomaly Detection"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1d4674] border border-[#1e528d] flex items-center justify-center text-2xl shadow-inner">
              <Search className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Explainable Fraud &amp; Anomaly Detection
            </h3>
            <p className="text-[#94c0e6] text-sm sm:text-base leading-relaxed">
              Isolation Forest and statistical signal analysis surface irregular fund flows across 3D network nodes, with every risk score backed by a transparent evidence trail.
            </p>
            <div className="pt-2">
              <Link href="/queue" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                <span>Inspect Signal Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 2: Geospatial Mapping (Reverse) */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 group">
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f294a] transition duration-300 group-hover:border-amber-400/50">
            <img
              src={LANDING_IMAGES.feature2}
              alt="Bharat Holographic Geospatial Map"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1d4674] border border-[#1e528d] flex items-center justify-center text-2xl shadow-inner">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Constituency-Wide Geospatial Intelligence
            </h3>
            <p className="text-[#94c0e6] text-sm sm:text-base leading-relaxed">
              Every MPLADS project is mapped on a 3D holographic India fragment with PostGIS-backed spatial context, spotlighting risk clusters across Bihar &amp; all India.
            </p>
            <div className="pt-2">
              <Link href="/map" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                <span>Open Bharat GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3: AI Assistant */}
        <div className="flex flex-col lg:flex-row items-center gap-12 group">
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f294a] transition duration-300 group-hover:border-amber-400/50">
            <img
              src={LANDING_IMAGES.feature3}
              alt="3D Glass Brain Node-Cluster RAG Assistant"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1d4674] border border-[#1e528d] flex items-center justify-center text-2xl shadow-inner">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              RAG-Powered Investigation Assistant
            </h3>
            <p className="text-[#94c0e6] text-sm sm:text-base leading-relaxed">
              Ask natural-language questions over the full project and agency corpus. The 3D brain assistant retrieves and cites underlying evidence behind every answer.
            </p>
            <div className="pt-2">
              <Link href="/assistant" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                <span>Query RAG AI Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 4: Prioritized Queue (Reverse) */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 group">
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f294a] transition duration-300 group-hover:border-amber-400/50">
            <img
              src={LANDING_IMAGES.feature4}
              alt="3D Glass Dossier Folders with Red Flag"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1d4674] border border-[#1e528d] flex items-center justify-center text-2xl shadow-inner">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Prioritized Investigation Queue
            </h3>
            <p className="text-[#94c0e6] text-sm sm:text-base leading-relaxed">
              Flagged projects are ranked and dossiered in 3D glass folders, ensuring vigilance officers focus on critical-risk cases first.
            </p>
            <div className="pt-2">
              <Link href="/queue" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                <span>View Ranked Queue Dossiers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Investigation Modules Grid Showcase */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explore All Investigation Modules
          </h2>
          <p className="text-xs sm:text-sm text-[#94c0e6]">
            Select a module to enter the live workspace directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-amber-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <LayoutDashboard className="w-7 h-7 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">OVERVIEW</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">Constituency Dashboard</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              High-level intelligence dashboard summarizing risk distribution, agency peer clusters, and financial telemetry.
            </p>
          </Link>

          <Link
            href="/queue"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-rose-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-7 h-7 text-rose-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">SCORE 0-100</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition">Investigation Queue</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              Ranked list of works prioritized by multi-signal risk scoring with instant evidence dossier generation.
            </p>
          </Link>

          <Link
            href="/agencies"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-purple-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <Building2 className="w-7 h-7 text-purple-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">PROFILER</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">Agency Directory</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              Detailed vendor and agency risk profiling, contractor connection graphs, and delay history analysis.
            </p>
          </Link>

          <Link
            href="/map"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-blue-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <MapPin className="w-7 h-7 text-blue-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">GIS SPATIAL</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition">Bharat GIS Spatial Map</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              Interactive OpenStreetMap &amp; Leaflet spatial mapping of works across Nalanda blocks with risk heatmap layers.
            </p>
          </Link>

          <Link
            href="/assistant"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-emerald-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <Bot className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">RAG Q&amp;A</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">AI Investigation Assistant</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              Conversational intelligence engine trained on MoSPI guidelines and Nalanda project evidence.
            </p>
          </Link>

          <Link
            href="/reports"
            className="group bg-[#0f294a] p-6 rounded-2xl border border-white/10 hover:border-sky-400/60 transition shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-7 h-7 text-sky-400 group-hover:scale-110 transition" />
              <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">EXPORT</span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">Reports &amp; Export</h3>
            <p className="text-xs text-[#94c0e6] leading-relaxed">
              Generate formal investigation briefs, PDF dossiers, and CSV data exports for official proceedings.
            </p>
          </Link>
        </div>
      </section>

      {/* Sign-In Preview Section */}
      <section className="relative z-10 py-20 px-6 bg-[#0f172a] border-t border-white/10 flex flex-col items-center justify-center">
        <div className="max-w-md w-full glass-card p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white">MPLAD-GUARD AI</h3>
            <p className="text-xs text-[#94c0e6]">Investigation Workspace Sign In</p>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="investigator@mpladguard.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFill}
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
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 bg-[#0f294a] border-t border-white/10 py-20 px-6 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#1e528d] border-2 border-amber-400 overflow-hidden mx-auto shadow-2xl">
          <img src={LANDING_IMAGES.logoShield} alt="3D Shield Logo" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white max-w-xl mx-auto leading-snug">
          Ready to investigate with evidence, not guesswork?
        </h2>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-xl shadow-amber-400/25 transition transform hover:-translate-y-0.5"
          >
            <span>Sign In to Investigation Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-xs text-[#94c0e6] pt-2">
          SIH Prototype Environment &bull; Synthetic demo dataset (Nalanda Lok Sabha Constituency, Bihar)
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0a1a30] border-t border-white/10 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-slate-300">
          MPLAD-GUARD AI &mdash; Smart India Hackathon 2024 Prototype (Problem Statement SIH26102)
        </p>
        <p className="text-[11px]">
          Developed by <strong>Team Reaperzz</strong> for Ministry of Statistics and Programme Implementation (MoSPI).
        </p>
      </footer>
    </div>
  );
}
