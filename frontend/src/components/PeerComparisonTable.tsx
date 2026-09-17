'use client';

import React from 'react';
import { PeerComparisonResponse } from '@/lib/api';
import { formatCurrency, getStatusBadge } from '@/lib/utils';
import { Scale, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface PeerComparisonTableProps {
  data: PeerComparisonResponse;
}

export default function PeerComparisonTable({ data }: PeerComparisonTableProps) {
  const { benchmarks, peers, selection_rationale } = data;

  return (
    <div className="space-y-6 font-mono">
      {/* Benchmark Summary Floating Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="recessed-light-display p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#667078] uppercase block">Peer Median Cost</span>
          <span className="text-xl font-mono font-extrabold text-[#182027]">
            {formatCurrency(benchmarks.cost_median_lakhs)}
          </span>
          <span className="text-[9px] text-[#9AA3AB] block">Across {data.peer_count} category works</span>
        </div>

        <div className="recessed-light-display p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#667078] uppercase block">Subject Cost Deviation</span>
          <span
            className={`text-xl font-mono font-extrabold ${
              benchmarks.subject_cost_deviation_percent > 30 ? 'text-[#C45145]' : 'text-[#398265]'
            }`}
          >
            {benchmarks.subject_cost_deviation_percent > 0 ? '+' : ''}
            {benchmarks.subject_cost_deviation_percent}%
          </span>
          <span className="text-[9px] text-[#9AA3AB] block">vs category median</span>
        </div>

        <div className="recessed-light-display p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#667078] uppercase block">Peer Median Duration</span>
          <span className="text-xl font-mono font-extrabold text-[#182027]">
            {benchmarks.duration_median_days} days
          </span>
          <span className="text-[9px] text-[#9AA3AB] block">Execution timeline</span>
        </div>

        <div className="recessed-light-display p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#667078] uppercase block">Subject Delay Overrun</span>
          <span
            className={`text-xl font-mono font-extrabold ${
              benchmarks.subject_delay_deviation_days > 60 ? 'text-[#C45145]' : 'text-[#182027]'
            }`}
          >
            +{benchmarks.subject_delay_deviation_days} days
          </span>
          <span className="text-[9px] text-[#9AA3AB] block">above benchmark</span>
        </div>
      </div>

      {/* Selection Rationale Banner */}
      <div className="bg-[#285C7A]/5 border border-[#285C7A]/20 p-4 rounded-xl text-xs text-[#182027] flex items-start gap-3 font-sans">
        <Scale className="w-4 h-4 text-[#285C7A] shrink-0 mt-0.5" />
        <div>
          <strong className="font-mono text-[#285C7A] font-bold uppercase text-[11px] block">PEER SELECTION METHODOLOGY:</strong>
          <span className="text-[#667078]">{selection_rationale}</span>
        </div>
      </div>

      {/* Comparison Landscape Table */}
      <div className="floating-slab overflow-hidden border border-[#E4E7E1]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAFAF7] text-[#667078] font-bold border-b border-[#E4E7E1] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Project / Case</th>
                <th className="px-4 py-3.5">Agency</th>
                <th className="px-4 py-3.5 text-right">Sanctioned Cost</th>
                <th className="px-4 py-3.5 text-right">Expenditure</th>
                <th className="px-4 py-3.5 text-right">Duration</th>
                <th className="px-4 py-3.5 text-right">Delay</th>
                <th className="px-4 py-3.5 text-center">Similarity</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6F3]">
              {peers.map((p) => {
                const statusBadge = getStatusBadge(p.status);
                return (
                  <tr
                    key={p.project_id}
                    className={`transition-colors ${
                      p.is_subject
                        ? 'bg-[#C88A25]/10 font-bold border-l-4 border-[#C88A25] text-[#182027]'
                        : 'hover:bg-[#FAFAF7] text-[#182027]'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {p.is_subject ? (
                          <span className="bg-[#C88A25] text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-black">
                            SUBJECT
                          </span>
                        ) : (
                          <Link
                            href={`/projects/${p.project_id}`}
                            className="font-mono text-[#285C7A] hover:underline flex items-center gap-0.5 font-bold"
                          >
                            {p.project_id}
                            <ArrowUpRight className="w-3 h-3 text-[#9AA3AB]" />
                          </Link>
                        )}
                        <span className="truncate max-w-xs block font-medium" title={p.project_name}>
                          {p.is_subject ? p.project_id : p.project_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#667078] truncate max-w-[150px]" title={p.agency_name}>
                      {p.agency_name}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-[#182027]">
                      {formatCurrency(p.sanctioned_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#667078]">
                      {formatCurrency(p.expenditure)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#182027]">
                      {p.duration_days} d
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono font-bold ${
                        p.delay_days > 60 ? 'text-[#C45145]' : 'text-[#182027]'
                      }`}
                    >
                      {p.delay_days > 0 ? `+${p.delay_days} d` : '0 d'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-mono text-[10px] bg-[#ECEFEA] px-2.5 py-0.5 rounded-full border border-[#E4E7E1] text-[#182027] font-bold">
                        {(p.similarity_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge.bg}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
