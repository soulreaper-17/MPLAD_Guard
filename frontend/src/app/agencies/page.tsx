'use client';

import React, { useEffect, useState } from 'react';
import { api, AgencySummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Building2, AlertTriangle, ShieldCheck, Clock, Layers, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AgenciesDirectoryPage() {
  const [agencies, setAgencies] = useState<AgencySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAgencies() {
      try {
        const data = await api.getAgencies();
        setAgencies(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agencies');
      } finally {
        setLoading(false);
      }
    }
    loadAgencies();
  }, []);

  const getRiskBadge = (level: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Executing Agencies Intelligence Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical behavioral profiling, portfolio delay frequency, and cross-project concentration in Nalanda.
          </p>
        </div>
      </div>

      {/* Grid of Agency Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gov-600 mb-2" />
          <span>Loading agency behavioral profiles...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-red-600 font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agencies.map((agency) => (
            <div
              key={agency.agency_id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{agency.agency_id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${getRiskBadge(
                        agency.risk_profile_level
                      )}`}
                    >
                      {agency.risk_profile_level} RISK
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{agency.agency_name}</h3>
                  <p className="text-xs text-slate-500">{agency.agency_type}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Works</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {agency.project_count}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Delay Rate</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      agency.delay_rate > 0.5 ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {(agency.delay_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Avg Delay</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      agency.average_delay > 90 ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {agency.average_delay.toFixed(0)} d
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Avg Cost: <strong className="text-slate-800 font-mono">₹{agency.average_cost.toFixed(1)}L</strong>
                </span>
                <Link
                  href={`/queue?agency_id=${agency.agency_id}`}
                  className="inline-flex items-center gap-1 text-xs text-gov-700 font-bold hover:underline"
                >
                  <span>Filter Assigned Works</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
