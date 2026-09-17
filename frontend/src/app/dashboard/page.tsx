'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, DashboardStats } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import RiskBadge from '@/components/RiskBadge';
import {
  ShieldAlert,
  AlertTriangle,
  FolderSearch,
  Building2,
  DollarSign,
  Activity,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const handleOpenDossier = (e: React.MouseEvent, projectId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!projectId) return;
    router.push(`/projects/${encodeURIComponent(projectId)}`);
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();

    const handleConstituencyChange = () => {
      loadStats();
    };
    window.addEventListener('constituency-changed', handleConstituencyChange);
    return () => {
      window.removeEventListener('constituency-changed', handleConstituencyChange);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // gentle 4 deg tilt
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 font-mono">
        <div className="w-10 h-10 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#667078]">INITIALIZING CONSTITUENCY SPATIAL INTELLIGENCE LANDSCAPE...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="floating-slab bg-[#C45145]/10 border border-[#C45145]/30 p-6 rounded-2xl space-y-3 font-mono text-[#C45145]">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>SYSTEM ERROR: UNABLE TO LOAD DASHBOARD INTELLIGENCE</span>
        </div>
        <p className="text-xs">{error || 'Unknown error. Verify backend service connection.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="tactile-light-switch tactile-light-switch-active px-5 py-2.5 rounded-xl text-xs font-mono font-bold"
        >
          RETRY ENGINE INITIALIZATION
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-sans pb-12">
      
      {/* 3D COMMAND HEADER & JURISDICTION SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E4E7E1]">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#285C7A] bg-[#285C7A]/10 px-3 py-1 rounded-full">
              CONSTITUENCY COMMAND LANDSCAPE
            </span>
            <span className="text-xs font-mono text-[#667078]">NALANDA &bull; BIHAR</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#182027] tracking-tight font-mono">
            Vigilance Investigation Intelligence
          </h1>
          <p className="text-sm text-[#667078] leading-relaxed">
            Multi-dimensional explainable risk prioritization across {stats.total_projects} sanctioned works &amp; {stats.total_agencies} executing bodies in Nalanda Lok Sabha constituency.
          </p>
        </div>

        <Link
          href="/queue"
          className="tactile-light-switch tactile-light-switch-active px-6 py-3.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2.5 shadow-[0_12px_28px_rgba(23,63,88,0.25)] shrink-0"
        >
          <FolderSearch className="w-4 h-4 text-white" />
          <span>OPEN INVESTIGATION QUEUE</span>
          <ArrowRight className="w-4 h-4 text-[#C88A25]" />
        </Link>
      </div>

      {/* CRITICAL CONCERN SPOTLIGHT (PHYSICAL SPATIAL SLAB) */}
      <div className="floating-slab p-6 border-l-4 border-[#C88A25] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_18px_45px_rgba(40,50,55,0.06)]">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#C88A25] text-white text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              CRITICAL CONCERN
            </span>
            <span className="font-mono text-xs text-[#C88A25] font-bold">MPLAD-NAL-2023-042</span>
          </div>
          <h2 className="text-base font-bold text-[#182027] leading-snug">
            Construction of PCC Road and Covered Drain from Main Road to High School, Ward 12, Bihar Sharif
          </h2>
          <p className="text-xs text-[#667078] font-sans">
            Priority Score <strong className="text-[#C45145] font-mono text-sm font-extrabold">95.0 / 100</strong> &bull; Elevated cost deviation (2.8x peer median), 396-day execution delay, and spatial proximity overlap (&lt;170m from 2021 road asset).
          </p>
        </div>

        <Link
          href="/projects/MPLAD-NAL-2023-042"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = '/projects/MPLAD-NAL-2023-042';
          }}
          className="tactile-light-switch tactile-light-switch-active px-5 py-3.5 rounded-xl text-xs font-mono font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 transition select-none relative z-10"
        >
          <span>INSPECT CASE DOSSIER</span>
          <ArrowRight className="w-4 h-4 text-[#C88A25]" />
        </Link>
      </div>

      {/* ASYMMETRICAL 3D INFORMATION LANDSCAPE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center command-viewport">
        
        {/* HERO 3D SCULPTURAL RISK OBJECT (7 COLS) */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center gap-8 py-6 preserve-3d transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
        >
          {/* 3D Ceramic Disc */}
          <div className="w-64 h-64 ceramic-disc flex flex-col items-center justify-center text-center p-4 relative shrink-0">
            {/* Outer Ring Segment */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#C45145]/30 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-5 rounded-full border-2 border-[#C88A25]/30 border-t-[#C88A25] animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Center Editorial Number Callout */}
            <span className="editorial-number text-7xl text-[#C45145] drop-shadow-xs">
              {stats.high_priority_count}
            </span>
            <span className="text-xs font-mono font-extrabold text-[#182027] uppercase tracking-widest mt-1">
              HIGH RISK
            </span>
            <span className="text-[10px] font-mono text-[#667078] uppercase">
              PRIORITY &ge; 75
            </span>
          </div>

          {/* Sculptural Object Context & Breakdown */}
          <div className="space-y-4 max-w-sm">
            <div>
              <span className="text-xs font-mono font-bold text-[#285C7A] uppercase tracking-wider block mb-1">
                3D SCULPTURAL RISK MATRIX
              </span>
              <h3 className="text-xl font-bold text-[#182027]">Constituency Threat Score</h3>
              <p className="text-xs text-[#667078] leading-relaxed mt-1 font-sans">
                Real-time risk core calculating multi-factorial anomalies across all sanctioned infrastructure works in Nalanda.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E4E7E1] shadow-xs">
                <span className="text-[#667078]">HIGH RISK (SCORE &ge;75)</span>
                <span className="font-extrabold text-[#C45145] text-sm">{stats.high_priority_count} WORKS</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E4E7E1] shadow-xs">
                <span className="text-[#667078]">MEDIUM RISK (45–74)</span>
                <span className="font-extrabold text-[#C88A25] text-sm">{stats.medium_priority_count} WORKS</span>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING TYPOGRAPHIC KPI METRICS (5 COLS - NO RECTANGULAR CARD WALL!) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* KPI 1: Floating Large Number */}
          <div className="flex items-center gap-6 p-2">
            <div className="w-1.5 h-16 bg-[#285C7A] rounded-full" />
            <div>
              <div className="editorial-number text-5xl text-[#182027]">{stats.total_projects}</div>
              <span className="text-xs font-mono font-bold text-[#667078] uppercase tracking-wider">
                SANCTIONED CONSTITUENCY WORKS
              </span>
            </div>
          </div>

          {/* KPI 2: Floating Monetary Value */}
          <div className="flex items-center gap-6 p-2">
            <div className="w-1.5 h-16 bg-[#398265] rounded-full" />
            <div>
              <div className="editorial-number text-4xl text-[#398265]">
                {formatCurrency(stats.total_sanctioned_amount)}
              </div>
              <span className="text-xs font-mono font-bold text-[#667078] uppercase tracking-wider">
                TOTAL CAPITAL MONITORED (EXP: {formatCurrency(stats.total_expenditure)})
              </span>
            </div>
          </div>

          {/* KPI 3: Floating Agency Count Indicator */}
          <div className="flex items-center gap-6 p-2">
            <div className="w-1.5 h-16 bg-purple-600 rounded-full" />
            <div>
              <div className="editorial-number text-4xl text-purple-700">{stats.total_agencies}</div>
              <span className="text-xs font-mono font-bold text-[#667078] uppercase tracking-wider">
                EXECUTING AGENCIES PROFILED
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* SPATIAL EVIDENCE WORKSTATION BOARD (TOP CASES & DISTRIBUTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
        
        {/* TOP PRIORITIZED CASES (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E1]">
            <div>
              <h3 className="text-base font-extrabold text-[#182027] font-mono tracking-wide uppercase flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#C45145]" />
                <span>TOP PRIORITIZED INVESTIGATION CASES</span>
              </h3>
              <p className="text-xs text-[#667078] font-sans mt-0.5">
                Ranked by multi-dimensional explainable risk score (0–100)
              </p>
            </div>
            <Link
              href="/queue"
              className="text-xs text-[#285C7A] font-mono font-bold hover:underline"
            >
              VIEW ALL QUEUE &rarr;
            </Link>
          </div>

          {/* Open Spatial Case Records */}
          <div className="space-y-3">
            {stats.top_priority_projects.map((proj) => (
              <div
                key={proj.project_id}
                className="floating-slab floating-slab-interactive p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-[#285C7A]">
                      {proj.project_id}
                    </span>
                    <span className="text-[10px] font-mono text-[#667078] bg-[#ECEFEA] px-2 py-0.5 rounded-full font-bold border border-[#E4E7E1]">
                      {proj.work_type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#182027] font-sans truncate max-w-lg">
                    {proj.project_name}
                  </h4>
                  <div className="text-xs text-[#667078] font-sans">
                    Agency: <span className="text-[#182027] font-semibold">{proj.agency_name}</span> &bull; Cost: <span className="font-mono font-bold text-[#182027]">{formatCurrency(proj.sanctioned_amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                  <RiskBadge score={proj.priority_score} isAnomaly={proj.is_anomaly} size="sm" />
                  <Link
                    href={`/projects/${proj.project_id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (proj.project_id) {
                        window.location.href = `/projects/${proj.project_id}`;
                      }
                    }}
                    className="tactile-light-switch p-2.5 rounded-xl text-[#182027] hover:text-[#285C7A] hover:border-[#285C7A] transition inline-flex items-center justify-center cursor-pointer active:scale-95 select-none relative z-10"
                    title="Open Investigation Dossier"
                  >
                    <ArrowRight className="w-4 h-4 text-[#285C7A]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUTION & COMMAND SHORTCUTS (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Priority Score Breakdown */}
          <div className="floating-slab p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#182027] uppercase tracking-wider border-b border-[#E4E7E1] pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#285C7A]" />
              <span>SCORE DISTRIBUTION</span>
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              {Object.entries(stats.risk_distribution).map(([label, count]) => {
                const pct = Math.round((count / stats.total_projects) * 100);
                const color =
                  label.includes('High') ? 'bg-[#C45145]' : label.includes('Medium') ? 'bg-[#C88A25]' : 'bg-[#398265]';
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#667078]">{label}</span>
                      <span className="font-bold text-[#182027]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="recessed-light-display h-2.5 p-0.5 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="floating-slab p-6 space-y-3 font-mono">
            <h3 className="text-xs font-bold text-[#182027] uppercase tracking-wider border-b border-[#E4E7E1] pb-3">
              COMMAND SHORTCUTS
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/map"
                className="tactile-light-switch p-3.5 rounded-xl font-bold text-[#182027] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#285C7A]" />
                  <span>Constituency GIS Map</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#667078]" />
              </Link>

              <Link
                href="/agencies"
                className="tactile-light-switch p-3.5 rounded-xl font-bold text-[#182027] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Agency Risk Profiles ({stats.total_agencies})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#667078]" />
              </Link>

              <Link
                href="/assistant"
                className="tactile-light-switch p-3.5 rounded-xl font-bold text-[#182027] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C88A25]" />
                  <span>AI Investigation Assistant</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#667078]" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
