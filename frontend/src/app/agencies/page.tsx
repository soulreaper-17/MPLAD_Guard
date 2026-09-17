'use client';

import React, { useEffect, useState } from 'react';
import { api, AgencySummary } from '@/lib/api';
import { Building2, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AgenciesDirectoryPage() {
  const [agencies, setAgencies] = useState<AgencySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAgencies() {
      setLoading(true);
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

    const handleConstituencyChange = () => {
      loadAgencies();
    };
    window.addEventListener('constituency-changed', handleConstituencyChange);
    return () => {
      window.removeEventListener('constituency-changed', handleConstituencyChange);
    };
  }, []);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-[#C45145]/10 text-[#C45145] border-[#C45145]/30';
      case 'ELEVATED':
        return 'bg-[#C88A25]/10 text-[#C88A25] border-[#C88A25]/30';
      default:
        return 'bg-[#398265]/10 text-[#398265] border-[#398265]/30';
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="floating-slab p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-black text-[#182027] tracking-wider uppercase">
              3D INSTITUTIONAL AGENCY DIRECTORY
            </h1>
          </div>
          <p className="text-xs text-[#667078] font-sans mt-1">
            Behavioral profiling, portfolio delay frequency, and cross-project concentration in Nalanda.
          </p>
        </div>
      </div>

      {/* Grid of 3D Agency Identity Profiles */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#667078]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#285C7A] mb-3" />
          <span>LOADING AGENCY BEHAVIORAL PROFILES...</span>
        </div>
      ) : error ? (
        <div className="floating-slab bg-[#C45145]/10 border border-[#C45145]/30 p-6 text-center text-xs text-[#C45145] font-bold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.agency_id}
              className="floating-slab floating-slab-interactive p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#E4E7E1] pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#285C7A]">{agency.agency_id}</span>
                    <span
                      className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-extrabold border uppercase tracking-wider ${getRiskBadge(
                        agency.risk_profile_level
                      )}`}
                    >
                      {agency.risk_profile_level} RISK
                    </span>
                  </div>
                  <h3 className="font-bold text-[#182027] text-base font-sans mt-1">{agency.agency_name}</h3>
                  <p className="text-xs text-[#667078] font-sans">{agency.agency_type}</p>
                </div>
              </div>

              {/* Stats Recessed Gauges */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="recessed-light-display p-3">
                  <span className="text-[9px] text-[#667078] block font-bold uppercase">WORKS</span>
                  <span className="font-mono font-extrabold text-[#182027] text-lg">
                    {agency.project_count}
                  </span>
                </div>
                <div className="recessed-light-display p-3">
                  <span className="text-[9px] text-[#667078] block font-bold uppercase">DELAY RATE</span>
                  <span
                    className={`font-mono font-extrabold text-lg ${
                      agency.delay_rate > 0.5 ? 'text-[#C45145]' : 'text-[#182027]'
                    }`}
                  >
                    {(agency.delay_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="recessed-light-display p-3">
                  <span className="text-[9px] text-[#667078] block font-bold uppercase">AVG DELAY</span>
                  <span
                    className={`font-mono font-extrabold text-lg ${
                      agency.average_delay > 90 ? 'text-[#C45145]' : 'text-[#182027]'
                    }`}
                  >
                    {agency.average_delay.toFixed(0)} d
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#667078]">
                  Avg Cost: <strong className="text-[#182027] font-mono">₹{agency.average_cost.toFixed(1)}L</strong>
                </span>
                <Link
                  href={`/queue?agency_id=${agency.agency_id}`}
                  className="tactile-light-switch inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-[#285C7A] font-bold"
                >
                  <span>FILTER ASSIGNED WORKS</span>
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
