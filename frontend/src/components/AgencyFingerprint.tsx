'use client';

import React from 'react';
import { AgencyDetail } from '@/lib/api';
import { Building2, AlertTriangle, CheckCircle, Clock, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

interface AgencyFingerprintProps {
  agency: AgencyDetail;
}

export default function AgencyFingerprint({ agency }: AgencyFingerprintProps) {
  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'ELEVATED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Agency Header Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{agency.agency_name}</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRiskLevelBadge(
                  agency.risk_profile_level
                )}`}
              >
                {agency.risk_profile_level} RISK PROFILE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              {agency.agency_type} &bull; {agency.district}, {agency.state}
            </p>
          </div>
        </div>

        <Link
          href={`/agencies`}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition self-start md:self-auto border border-slate-200"
        >
          View All Agencies &rarr;
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Works</span>
          <span className="text-xl font-mono font-bold text-slate-900">{agency.project_count}</span>
          <span className="text-[10px] text-slate-400 block">{agency.completed_count} completed</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Delay Rate</span>
          <span
            className={`text-xl font-mono font-bold ${
              agency.delay_rate > 0.5 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {(agency.delay_rate * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400 block">{agency.delayed_count} delayed works</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Average Delay</span>
          <span
            className={`text-xl font-mono font-bold ${
              agency.average_delay > 90 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {agency.average_delay.toFixed(0)} d
          </span>
          <span className="text-[10px] text-slate-400 block">per delayed work</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Average Cost</span>
          <span className="text-xl font-mono font-bold text-slate-900">
            ₹{agency.average_cost.toFixed(1)}L
          </span>
          <span className="text-[10px] text-slate-400 block">per sanctioned project</span>
        </div>
      </div>

      {/* Historical Behaviour Signals */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-gov-600" />
          <span>Historical Behavioral Fingerprint</span>
        </h4>
        <div className="space-y-1.5">
          {agency.historical_risk_signals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
