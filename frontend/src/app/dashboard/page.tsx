'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, DashboardStats } from '@/lib/api';
import { formatCurrency, getPriorityTier } from '@/lib/utils';
import RiskBadge from '@/components/RiskBadge';
import {
  ShieldAlert,
  AlertTriangle,
  FolderSearch,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
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
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-4 border-gov-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading constituency intelligence...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" />
          <span>Error Loading Dashboard</span>
        </div>
        <p className="text-xs">{error || 'Unknown error. Check backend connection.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Constituency Intelligence Dashboard
            </h1>
            <span className="bg-gov-100 text-gov-800 text-[11px] font-mono px-2 py-0.5 rounded font-bold">
              NALANDA (BIHAR)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable investigation prioritization across {stats.total_projects} sanctioned MPLADS works and {stats.total_agencies} executing bodies.
          </p>
        </div>

        <Link
          href="/queue"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gov-900 hover:bg-gov-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
        >
          <FolderSearch className="w-4 h-4 text-amber-400" />
          <span>Open Investigation Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Golden Demo Project Spotlight Alert Banner */}
      <div className="bg-gradient-to-r from-gov-900 to-gov-950 text-white p-5 rounded-xl shadow-md border border-gov-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              GOLDEN DEMO CASE
            </span>
            <span className="font-mono text-xs text-amber-300 font-bold">MPLAD-NAL-2023-042</span>
          </div>
          <h2 className="text-sm font-bold text-white leading-snug">
            Construction of PCC Road and Covered Drain from Main Road to High School, Ward 12, Bihar Sharif
          </h2>
          <p className="text-xs text-gov-200 font-sans">
            Priority Score <strong>95.0 / 100</strong> &bull; Elevated cost deviation (2.8x peer median), 396-day execution delay, and spatial proximity overlap (&lt;170m from 2021 road asset).
          </p>
        </div>

        <Link
          href="/projects/MPLAD-NAL-2023-042"
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Inspect Case Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Projects</span>
            <Layers className="w-4 h-4 text-gov-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">{stats.total_projects}</div>
          <div className="text-[11px] text-slate-400">Sanctioned in constituency</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">High Priority</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-600">{stats.high_priority_count}</div>
          <div className="text-[11px] text-red-600/70">Score &ge; 75 / 100 &bull; Requires desk audit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Medium Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-700">{stats.medium_priority_count}</div>
          <div className="text-[11px] text-amber-700/70">Score 45–74 &bull; Periodic review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sanctioned</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {formatCurrency(stats.total_sanctioned_amount)}
          </div>
          <div className="text-[11px] text-slate-400">
            Exp: {formatCurrency(stats.total_expenditure)}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Prioritized Projects & Risk Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Priority Projects Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Top Prioritized Investigation Cases</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by multi-dimensional explainable risk score (0–100)
              </p>
            </div>
            <Link
              href="/queue"
              className="text-xs text-gov-700 hover:text-gov-900 font-bold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.top_priority_projects.map((proj) => (
              <div
                key={proj.project_id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-lg transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gov-900">
                      {proj.project_id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {proj.work_type}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 truncate max-w-md">
                    {proj.project_name}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Agency: <span className="text-slate-600 font-medium">{proj.agency_name}</span> &bull; Cost: <span className="font-mono font-semibold text-slate-700">{formatCurrency(proj.sanctioned_amount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <RiskBadge score={proj.priority_score} isAnomaly={proj.is_anomaly} size="sm" />
                  <Link
                    href={`/projects/${proj.project_id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-gov-900 hover:text-white text-slate-600 transition"
                    title="Investigate"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Constituency Risk & Work Distribution */}
        <div className="space-y-4">
          {/* Risk Breakdown Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-gov-600" />
              <span>Priority Score Distribution</span>
            </h3>

            <div className="space-y-2.5">
              {Object.entries(stats.risk_distribution).map(([label, count]) => {
                const pct = Math.round((count / stats.total_projects) * 100);
                const color =
                  label.includes('High') ? 'bg-red-500' : label.includes('Medium') ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">{label}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Investigation Shortcuts
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <Link
                href="/map"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gov-600" />
                  <span>Constituency GIS Map</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/agencies"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Agency Risk Profiles ({stats.total_agencies})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/assistant"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Ask AI Investigation Assistant</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
