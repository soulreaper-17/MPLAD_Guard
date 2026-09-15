'use client';

import React from 'react';
import { PeerComparisonResponse } from '@/lib/api';
import { formatCurrency, getStatusBadge } from '@/lib/utils';
import { Scale, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface PeerComparisonTableProps {
  data: PeerComparisonResponse;
}

export default function PeerComparisonTable({ data }: PeerComparisonTableProps) {
  const { benchmarks, peers, peer_group_name, selection_rationale } = data;

  return (
    <div className="space-y-4">
      {/* Benchmark Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Peer Median Cost</span>
          <span className="text-lg font-mono font-bold text-slate-800">
            {formatCurrency(benchmarks.cost_median_lakhs)}
          </span>
          <span className="text-[10px] text-slate-400 block">Across {data.peer_count} category works</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Subject Cost Deviation</span>
          <span
            className={`text-lg font-mono font-bold ${
              benchmarks.subject_cost_deviation_percent > 30 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {benchmarks.subject_cost_deviation_percent > 0 ? '+' : ''}
            {benchmarks.subject_cost_deviation_percent}%
          </span>
          <span className="text-[10px] text-slate-400 block">vs category median</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Peer Median Duration</span>
          <span className="text-lg font-mono font-bold text-slate-800">
            {benchmarks.duration_median_days} days
          </span>
          <span className="text-[10px] text-slate-400 block">Execution timeline</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Subject Delay Overrun</span>
          <span
            className={`text-lg font-mono font-bold ${
              benchmarks.subject_delay_deviation_days > 60 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            +{benchmarks.subject_delay_deviation_days} days
          </span>
          <span className="text-[10px] text-slate-400 block">above peer benchmark</span>
        </div>
      </div>

      {/* Selection Rationale Banner */}
      <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 flex items-start gap-2">
        <Scale className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Peer Selection Methodology:</strong> {selection_rationale}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-3 py-2.5">Project / Case</th>
              <th className="px-3 py-2.5">Agency</th>
              <th className="px-3 py-2.5 text-right">Sanctioned Cost</th>
              <th className="px-3 py-2.5 text-right">Expenditure</th>
              <th className="px-3 py-2.5 text-right">Duration</th>
              <th className="px-3 py-2.5 text-right">Delay</th>
              <th className="px-3 py-2.5 text-center">Similarity</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {peers.map((p) => {
              const statusBadge = getStatusBadge(p.status);
              return (
                <tr
                  key={p.project_id}
                  className={`hover:bg-slate-50 transition-colors ${
                    p.is_subject ? 'bg-amber-50/70 font-semibold border-l-4 border-amber-500' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {p.is_subject ? (
                        <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                          SUBJECT
                        </span>
                      ) : (
                        <Link
                          href={`/projects/${p.project_id}`}
                          className="font-mono text-gov-700 hover:underline flex items-center gap-0.5"
                        >
                          {p.project_id}
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      )}
                      <span className="text-slate-800 truncate max-w-xs block font-medium" title={p.project_name}>
                        {p.is_subject ? p.project_id : p.project_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 truncate max-w-[140px]" title={p.agency_name}>
                    {p.agency_name}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(p.sanctioned_amount)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                    {formatCurrency(p.expenditure)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                    {p.duration_days} d
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono font-bold ${
                      p.delay_days > 60 ? 'text-red-600' : 'text-slate-600'
                    }`}
                  >
                    {p.delay_days > 0 ? `+${p.delay_days} d` : '0 d'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {(p.similarity_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge.bg}`}>
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
  );
}
