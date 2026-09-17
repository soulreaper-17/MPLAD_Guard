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
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { LANDING_IMAGES } from '@/lib/landingAssets';
import { api } from '@/lib/api';
import ConstituencySelector from '@/components/ConstituencySelector';
import MethodologySheet from '@/components/MethodologySheet';
import ExplanationModal, { ExplanationTopic } from '@/components/ExplanationModal';
import ConstituencyLeaderboard from '@/components/ConstituencyLeaderboard';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('investigator@mpladguard.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [explanationTopic, setExplanationTopic] = useState<ExplanationTopic>(null);

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
    <div className="min-h-screen architectural-env text-[#182027] flex flex-col font-sans relative selection:bg-[#C88A25]/20 selection:text-[#182027]">

      {/* FLOATING ARCHITECTURAL COMMAND STRIP (HEADER) */}
      <header className="sticky top-0 inset-x-0 w-full z-50 bg-[#F5F6F3]/90 backdrop-blur-xl border-b border-[#E4E7E1]/80 m-0 p-0">
        <div className="max-w-[1650px] mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">

          {/* Logo Branding with Ambient Indian Colour Glow & Emerging Hover Text */}
          <div className="flex items-center gap-3.5 indian-ambient-glow-wrapper group">
            {/* Ambient Soft Saffron (Left) & Soft Green (Right) Light Background Glow */}
            <div className="indian-ambient-glow-bg" />

            <Link href="/" className="flex items-center gap-3.5 relative z-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <img
                    src="/images/sevarth_main_logo.png"
                    alt="Sevaarth AI"
                    className="h-11 sm:h-12 w-auto mix-blend-multiply object-contain filter contrast-125"
                  />
                </div>
                <span className="text-[10px] text-[#285C7A] font-mono tracking-wider uppercase -mt-0.5 emerge-text-hover font-semibold">
                  PUBLIC EXPENDITURE INTELLIGENCE
                </span>
              </div>
            </Link>
          </div>

          {/* In-Page Navigation References / Smooth Scroll Anchors */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#667078] tracking-wide">
            <a href="#platform" className="nav-link-item">
              <span>Platform</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#intelligence" className="nav-link-item">
              <span>Intelligence</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#explainability" className="nav-link-item">
              <span>Explainability</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#constituencies" className="nav-link-item">
              <span>Constituencies</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#efficiency-leaderboard" className="nav-link-item">
              <span>Leaderboard</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#dossiers" className="nav-link-item">
              <span>Dossiers</span>
            </a>
            <span className="text-[#D2D7CE] text-[10px]">&bull;</span>
            <a href="#footer" className="nav-link-item">
              <span>About</span>
            </a>
          </nav>

          {/* Authentication Actions Only */}
          <div className="flex items-center gap-3 font-mono">
            <Link
              href="/login"
              className="tactile-light-switch-active nav-btn-tactile px-6 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 transition shadow-md"
            >
              <span>SIGN IN</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] w-full flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden z-10 max-w-[1650px] mx-auto" id="about">
        
        {/* Subtle Hero Background: Sansad Bhavan Sketch + India Gate Photo + India Map Data Visual + Revolving Ashok Chakra */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">

          {/* Top-Left Revolving Ashoka Chakra (Positioned on Left Background) */}
          <div className="absolute -top-16 -left-16 sm:-top-20 sm:-left-20 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] opacity-[0.14] text-[#000080] pointer-events-none z-0">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
              {/* Solid Outer Circular Rim Band */}
              <circle cx="100" cy="100" r="88.5" fill="none" stroke="currentColor" strokeWidth="13" />

              {/* Central Solid Hub Disk */}
              <circle cx="100" cy="100" r="16" fill="currentColor" />

              {/* 24 Semi-Circular Notches on Inner Edge of Outer Rim (15° apart, offset 7.5°) */}
              {Array.from({ length: 24 }).map((_, i) => (
                <circle
                  key={`notch-${i}`}
                  cx="100"
                  cy="20.5"
                  r="3.2"
                  fill="currentColor"
                  transform={`rotate(${i * 15 + 7.5} 100 100)`}
                />
              ))}

              {/* 24 Authentic Tapered Wedge/Needle Spokes (15° apart) */}
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

          {/* Hand-Drawn Architectural Pencil Sketch of Indian Parliament (Sansad Bhavan) - Enlarged Background */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[75%] lg:w-[65%] h-full pointer-events-none z-0 flex items-center justify-end overflow-hidden select-none opacity-[0.22] mix-blend-multiply">
            <img
              src="/images/parliament_sketch.png"
              alt="Sansad Bhavan Architectural Sketch"
              className="w-full h-auto max-h-[105%] object-contain object-right"
              style={{
                maskImage: 'radial-gradient(ellipse at 75% 50%, black 50%, transparent 92%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 75% 50%, black 50%, transparent 92%)',
              }}
            />
          </div>

          {/* Very Light Photographic India Gate Visual - Significantly Enlarged Background Watermark */}
          <div className="absolute -right-8 sm:-right-12 top-0 sm:-top-16 lg:-top-28 w-[700px] sm:w-[1050px] lg:w-[1350px] xl:w-[1550px] h-[900px] opacity-[0.32] pointer-events-none z-0 flex items-center justify-end mix-blend-multiply">
            <img
              src="/images/india_gate_soft.jpg"
              alt="India Gate Architectural Visual"
              className="w-full h-auto max-h-[120%] object-contain object-right filter brightness-105 contrast-95"
              style={{
                maskImage: 'radial-gradient(ellipse at 75% 50%, black 60%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 75% 50%, black 60%, transparent 95%)',
              }}
            />
          </div>

          {/* Subtle India Map Outline & Data Nodes (Center-Right Background) */}
          <div className="absolute right-4 sm:right-24 top-6 w-[400px] sm:w-[580px] h-[500px] opacity-[0.12] flex items-center justify-center">
            <svg viewBox="0 0 500 550" className="w-full h-full text-[#285C7A]">
              <path
                d="M 230 40 Q 260 50 280 80 T 320 120 T 380 150 T 400 190 T 370 240 T 320 280 T 290 340 T 260 410 T 230 480 T 210 440 T 190 390 T 160 340 T 140 290 T 110 240 T 100 180 T 140 130 T 180 90 Z"
                fill="url(#mapGradient)"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#285C7A" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#C88A25" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              <line x1="230" y1="120" x2="280" y2="180" stroke="#C88A25" strokeWidth="0.75" opacity="0.6" />
              <line x1="280" y1="180" x2="240" y2="280" stroke="#285C7A" strokeWidth="0.75" opacity="0.6" />
              <line x1="240" y1="280" x2="180" y2="240" stroke="#398265" strokeWidth="0.75" opacity="0.6" />
              <line x1="280" y1="180" x2="340" y2="220" stroke="#C88A25" strokeWidth="0.75" opacity="0.6" />
              <line x1="240" y1="280" x2="260" y2="380" stroke="#285C7A" strokeWidth="0.75" opacity="0.6" />

              <circle cx="230" cy="120" r="4" fill="#C88A25" />
              <circle cx="280" cy="180" r="5" fill="#285C7A" />
              <circle cx="240" cy="280" r="6" fill="#C88A25" />
              <circle cx="180" cy="240" r="4" fill="#398265" />
              <circle cx="340" cy="220" r="4" fill="#C45145" />
              <circle cx="260" cy="380" r="5" fill="#285C7A" />
              <circle cx="240" cy="280" r="12" fill="none" stroke="#C88A25" strokeWidth="0.5" className="animate-ping" />
            </svg>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">

          <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-white/90 border border-[#D2D7CE] text-[#285C7A] text-xs font-mono tracking-wide shadow-[0_2px_8px_rgba(24,32,39,0.04)] font-bold backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-[#C88A25]" />
            <span>⚡ NEXT-GEN PUBLIC GOVERNANCE &amp; EXPENDITURE FORENSIC ENGINE</span>
          </div>

          <div className="space-y-4 indian-ambient-glow-wrapper group">
            {/* Ambient Indian Saffron (Left) & Green (Right) Light Glow Layer */}
            <div className="indian-ambient-glow-bg" />

            {/* Main Center 3D Sevarth Logo (Exact 650px width requested by user) */}
            <h1 className="relative z-10 flex flex-col items-center justify-center gap-2">
              <img
                src="/images/sevarth_main_logo.png"
                alt="SEVARTH"
                className="w-[650px] max-w-full h-auto mix-blend-multiply object-contain inline-block filter contrast-125 drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-1.5"
              />
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-[#667078] leading-relaxed font-normal emerge-text-hover relative z-10">
              Unlocking unprecedented financial integrity in public governance &mdash; converting raw constituency expenditure into real-time, AI-driven forensic intelligence to catch anomalies before funds disappear.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 justify-center items-center font-mono">
            <Link
              href="/queue"
              className="tactile-light-switch-active nav-btn-tactile px-8 py-4 rounded-2xl text-sm font-bold shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2.5"
            >
              <span>Explore Platform Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="tactile-light-switch nav-btn-tactile px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4 text-[#285C7A]" />
              <span>Understand Methodology</span>
            </button>
          </div>

          {/* Live Telemetry Slabs (Stats) */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="floating-slab p-5 space-y-1">
              <span className="text-[10px] font-mono text-[#667078] uppercase tracking-wider block font-bold">MONITORED WORKS</span>
              <div className="editorial-number text-3xl text-[#182027]">{stats?.total_projects || 104}</div>
              <span className="text-[11px] text-[#398265] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Telemetry Stream
              </span>
            </div>

            <div className="floating-slab p-5 space-y-1 border-l-4 border-l-[#C45145]">
              <span className="text-[10px] font-mono text-[#C45145] font-bold uppercase tracking-wider block">CRITICAL ALERTS</span>
              <div className="editorial-number text-3xl text-[#C45145]">{stats?.high_priority_count || 14}</div>
              <span className="text-[11px] text-[#667078]">Immediate Physical Audit</span>
            </div>

            <div className="floating-slab p-5 space-y-1">
              <span className="text-[10px] font-mono text-[#667078] uppercase tracking-wider block font-bold">EXECUTIVE AGENCIES</span>
              <div className="editorial-number text-3xl text-[#285C7A]">{stats?.total_agencies || 18}</div>
              <span className="text-[11px] text-[#667078]">Vendor Network Tracked</span>
            </div>

            <div className="floating-slab p-5 space-y-1">
              <span className="text-[10px] font-mono text-[#667078] uppercase tracking-wider block font-bold">SANCTIONED OUTLAY</span>
              <div className="editorial-number text-3xl text-[#C88A25]">
                ₹{stats ? (stats.total_sanctioned_amount / 10000000).toFixed(2) : '24.85'} Cr
              </div>
              <span className="text-[11px] text-[#667078]">Audited Public Outlay</span>
            </div>
          </div>

        </div>
      </section>

      {/* Protocol Banner Strip */}
      <div className="relative z-10 border-y border-[#E4E7E1] bg-[#ECEFEA] py-3.5 px-6 text-center">
        <div className="max-w-[1650px] mx-auto flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#667078]">
          <span className="text-[#285C7A] font-bold">🔥 LIVE FORENSIC PIPELINE:</span>
          <span>REAL-TIME INGESTION &rarr; ISOLATION FOREST AI &rarr; GEOSPATIAL HEATMAPS &rarr; EVIDENTIAL DOSSIERS &rarr; ZERO-HALLUCINATION RAG</span>
        </div>
      </div>

      {/* System Architecture Section */}
      <section className="relative z-10 py-20 px-6 max-w-[1650px] mx-auto w-full space-y-24" id="platform">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-mono font-bold text-[#285C7A] bg-[#285C7A]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#285C7A]/20">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#182027] tracking-tight">
            Autonomous Governance &amp; Forensic Intelligence Stack
          </h2>
          <p className="text-[#667078] text-sm sm:text-base">
            Four high-precision intelligence layers designed to safeguard public funds, track vendor behavior, and deliver unassailable audit transparency.
          </p>
        </div>

        {/* Feature 1: Explainable Fraud & Anomaly Signals */}
        <div className="flex flex-col lg:flex-row items-center gap-12 group scroll-mt-28" id="intelligence">
          <div className="flex-1 w-full rounded-2xl overflow-hidden floating-slab p-2 transition duration-300">
            <img
              src={LANDING_IMAGES.feature1}
              alt="Anomaly Detection Graph"
              className="w-full h-auto rounded-xl object-cover transform group-hover:scale-[1.02] transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#D2D7CE] shadow-[0_4px_12px_rgba(24,32,39,0.05)] flex items-center justify-center text-[#285C7A]">
              <Search className="w-6 h-6 text-[#C88A25]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#182027]">
                Forensic Anomaly &amp; Fraud Intelligence
              </h3>
              <p className="text-[#667078] text-sm sm:text-base leading-relaxed">
                Isolation Forest AI models continuously audit public fund flows, identifying hidden cost overruns, suspicious vendor cartels, and timeline delays with pin-point accuracy.
              </p>
            </div>

            {/* Microcopy Trigger Link */}
            <div className="pt-1">
              <button
                onClick={() => setExplanationTopic('intelligence')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#285C7A] hover:text-[#C88A25] transition group/trigger"
              >
                <span>How is this calculated?</span>
                <span className="text-[#C88A25] group-hover/trigger:translate-x-0.5 group-hover/trigger:-translate-y-0.5 transition">↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature 2: Geospatial Mapping */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 group scroll-mt-28" id="constituencies">
          <div className="flex-1 w-full rounded-2xl overflow-hidden floating-slab p-2 transition duration-300">
            <img
              src={LANDING_IMAGES.feature2}
              alt="Bharat Geospatial Map"
              className="w-full h-auto rounded-xl object-cover transform group-hover:scale-[1.02] transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#D2D7CE] shadow-[0_4px_12px_rgba(24,32,39,0.05)] flex items-center justify-center text-[#285C7A]">
              <MapPin className="w-6 h-6 text-[#285C7A]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#182027]">
                Constituency Geospatial &amp; Spatial Intelligence
              </h3>
              <p className="text-[#667078] text-sm sm:text-base leading-relaxed">
                High-resolution 3D vector maps and dynamic risk heatmaps spotlighting block-level expenditure clusters, physical proximity overlaps, and regional risk anomalies in real time.
              </p>
            </div>

            {/* Microcopy Trigger Link */}
            <div className="pt-1">
              <button
                onClick={() => setExplanationTopic('constituencies')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#285C7A] hover:text-[#C88A25] transition group/trigger"
              >
                <span>Why these cities?</span>
                <span className="text-[#C88A25] group-hover/trigger:translate-x-0.5 group-hover/trigger:-translate-y-0.5 transition">↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature 3: AI Assistant */}
        <div className="flex flex-col lg:flex-row items-center gap-12 group scroll-mt-28" id="explainability">
          <div className="flex-1 w-full rounded-2xl overflow-hidden floating-slab p-2 transition duration-300">
            <img
              src={LANDING_IMAGES.feature3}
              alt="RAG Assistant Workspace"
              className="w-full h-auto rounded-xl object-cover transform group-hover:scale-[1.02] transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#D2D7CE] shadow-[0_4px_12px_rgba(24,32,39,0.05)] flex items-center justify-center text-[#398265]">
              <Bot className="w-6 h-6 text-[#398265]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#182027]">
                Autonomous RAG Audit &amp; Knowledge Engine
              </h3>
              <p className="text-[#667078] text-sm sm:text-base leading-relaxed">
                Query multi-crore scheme guidelines, project vouchers, and regulatory frameworks in natural language with 100% verifiable, source-cited factual precision.
              </p>
            </div>

            {/* Microcopy Trigger Link */}
            <div className="pt-1">
              <button
                onClick={() => setExplanationTopic('explainability')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#285C7A] hover:text-[#C88A25] transition group/trigger"
              >
                <span>How does the AI reason?</span>
                <span className="text-[#C88A25] group-hover/trigger:translate-x-0.5 group-hover/trigger:-translate-y-0.5 transition">↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature 4: Dossiers */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 group scroll-mt-28" id="dossiers">
          <div className="flex-1 w-full rounded-2xl overflow-hidden floating-slab p-2 transition duration-300">
            <img
              src={LANDING_IMAGES.feature4}
              alt="Prioritized Investigation Queue"
              className="w-full h-auto rounded-xl object-cover transform group-hover:scale-[1.02] transition duration-500"
            />
          </div>
          <div className="flex-1 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#D2D7CE] shadow-[0_4px_12px_rgba(24,32,39,0.05)] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-[#C88A25]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#182027]">
                Priority Risk Dossiers &amp; Forensic Queue
              </h3>
              <p className="text-[#667078] text-sm sm:text-base leading-relaxed">
                Automated evidence compiler that converts complex telemetry signals into officer-ready physical audit briefs, ranked by impact, probability, and financial risk.
              </p>
            </div>

            {/* Microcopy Trigger Link */}
            <div className="pt-1">
              <button
                onClick={() => setExplanationTopic('dossiers')}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#285C7A] hover:text-[#C88A25] transition group/trigger"
              >
                <span>How is a dossier ranked?</span>
                <span className="text-[#C88A25] group-hover/trigger:translate-x-0.5 group-hover/trigger:-translate-y-0.5 transition">↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Constituency Efficiency Intelligence Leaderboard Section */}
      <ConstituencyLeaderboard />

      {/* Modals */}
      <MethodologySheet isOpen={isMethodologyOpen} onClose={() => setIsMethodologyOpen(false)} />
      <ExplanationModal
        isOpen={!!explanationTopic}
        topic={explanationTopic}
        onClose={() => setExplanationTopic(null)}
      />

      {/* Comprehensive Public Information Footer */}
      <footer id="footer" className="relative z-10 bg-[#F5F6F3] border-t border-[#E4E7E1] pt-16 pb-12 px-6">
        <div className="max-w-[1650px] mx-auto space-y-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">

            {/* Column 1: Sevaarth AI Branding & Mission */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#182027] flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4 text-[#C88A25]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg text-[#182027] font-sans relative">
                    <span className="relative">
                      <span className="absolute -top-0.5 left-0 right-0 h-[2px] bg-[#C88A25] rounded-full opacity-80" />
                      Sevaarth
                    </span>
                  </span>
                  <span className="text-[#285C7A] font-extrabold text-lg font-mono ml-0.5">AI</span>
                </div>
              </div>

              <p className="text-[#667078] leading-relaxed">
                AI-assisted public expenditure intelligence platform delivering explainable anomaly signals, geospatial analytics, and evidence-backed governance for constituency development schemes.
              </p>

              <div className="pt-1 text-[11px] font-mono text-[#285C7A] font-bold">
                EXPLAINABILITY &bull; TRANSPARENCY &bull; INTEGRITY
              </div>
            </div>

            {/* Column 2: Platform Capabilities */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-[#182027] text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-[#667078]">
                <li><a href="#intelligence" className="hover:text-[#182027] transition">Explainable Fraud &amp; Anomaly Signals</a></li>
                <li><a href="#constituencies" className="hover:text-[#182027] transition">Constituency Geospatial Intelligence</a></li>
                <li><a href="#explainability" className="hover:text-[#182027] transition">RAG-Powered AI Analysis</a></li>
                <li><a href="#dossiers" className="hover:text-[#182027] transition">Physical Evidence Dossiers</a></li>
                <li><a href="#platform" className="hover:text-[#182027] transition">Project Expenditure Intelligence</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-[#182027] text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-[#667078]">
                <li><a href="#platform" className="hover:text-[#182027] transition">How It Works</a></li>
                <li><button onClick={() => setIsMethodologyOpen(true)} className="hover:text-[#182027] transition text-left">5-Signal Risk Methodology</button></li>
                <li><a href="#explainability" className="hover:text-[#182027] transition">Explainability Principles</a></li>
                <li><a href="#about" className="hover:text-[#182027] transition">Data Sources &amp; Standards</a></li>
                <li><a href="#about" className="hover:text-[#182027] transition">Policy Guidelines &amp; Circulars</a></li>
              </ul>
            </div>

            {/* Column 4: Contact & Enquiries */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-[#182027] text-xs uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-[#667078]">
                <li><a href="mailto:info@sevaarth.ai" className="hover:text-[#182027] transition">Contact Governance Team</a></li>
                <li><a href="mailto:feedback@sevaarth.ai" className="hover:text-[#182027] transition">Public Feedback</a></li>
                <li><a href="mailto:support@sevaarth.ai" className="hover:text-[#182027] transition">Report Data Discrepancy</a></li>
                <li><a href="mailto:partnerships@sevaarth.ai" className="hover:text-[#182027] transition">Institutional Enquiries</a></li>
              </ul>
            </div>

            {/* Column 5: Legal & Governance */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold text-[#182027] text-xs uppercase tracking-wider">Legal &amp; Governance</h4>
              <ul className="space-y-2 text-[#667078]">
                <li><span className="hover:text-[#182027] cursor-pointer">Privacy &amp; Data Protection</span></li>
                <li><span className="hover:text-[#182027] cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-[#182027] cursor-pointer">Data Usage &amp; Ethics</span></li>
                <li><span className="hover:text-[#182027] cursor-pointer">Governance Disclaimer</span></li>
                <li><span className="hover:text-[#182027] cursor-pointer">AI Scope &amp; Limitations</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#E4E7E1] pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#667078] font-mono gap-4">
            <div>
              &copy; 2026 <strong>Sevaarth AI</strong> &bull; Public Expenditure Intelligence &amp; Governance Platform
            </div>
            <div className="flex items-center gap-4">
              <span>Explainable AI Engine</span>
              <span>&bull;</span>
              <span>Geospatial Spatial Intelligence</span>
              <span>&bull;</span>
              <span>Policy Alignment</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
