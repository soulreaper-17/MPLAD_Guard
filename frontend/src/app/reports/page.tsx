'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, getPriorityTier } from '@/lib/utils';
import {
  FileText,
  Printer,
  ShieldAlert,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Download,
} from 'lucide-react';

function ReportsContent() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('projectId') || 'MPLAD-NAL-2023-042';

  const [projectId, setProjectId] = useState<string>(queryProjectId);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async (idToFetch: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProjectReport(idToFetch);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(projectId);
  }, [projectId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls (Hidden when printing) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gov-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Investigation Decision Support Report
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized, exportable investigation profile and evidence dossier for vigilance review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-600">Case ID:</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
              placeholder="e.g. MPLAD-NAL-2023-042"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gov-900 hover:bg-gov-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Sheet (Printable Document) */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500">
          <div className="w-8 h-8 border-4 border-gov-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Generating structured investigation dossier...</span>
        </div>
      ) : error || !reportData ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {error || 'Report data not found.'}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md print-page max-w-4xl mx-auto space-y-6 text-slate-900">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                GOVERNMENT OF INDIA &bull; VIGILANCE INTELLIGENCE SYSTEM
              </div>
              <h2 className="text-xl font-black tracking-tight text-gov-950 uppercase mt-0.5">
                MPLADS PROJECT INVESTIGATION DOSSIER
              </h2>
              <div className="text-xs text-slate-600 font-medium">
                Nalanda Lok Sabha Constituency, District Nalanda, Bihar
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-0.5">
              <div className="font-bold text-slate-900">{reportData.report_id}</div>
              <div className="text-slate-500 text-[10px]">{reportData.generated_at}</div>
              <div className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded inline-block font-semibold">
                CONFIDENTIAL / AUDIT USE
              </div>
            </div>
          </div>

          {/* Statutory Guardrail Notice */}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 text-[11px] text-slate-700 font-mono">
            <strong>STATUTORY NOTICE:</strong> {reportData.guardrail_notice}
          </div>

          {/* Section 1: Project Metadata & Identification */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-900 border-b border-slate-200 pb-1">
              1. Project Identification & Sanction Profile
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Project Identifier</span>
                <span className="font-mono font-bold text-slate-900">{reportData.project.project_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Work Category</span>
                <span className="font-semibold text-slate-900">{reportData.project.work_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sanctioned Name</span>
                <span className="font-bold text-slate-900">{reportData.project.project_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Implementing Agency</span>
                <span className="font-medium text-slate-900">{reportData.project.agency_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Location (Block / Ward)</span>
                <span className="font-medium text-slate-900">
                  {reportData.project.block_name}, {reportData.project.gram_panchayat_or_ward}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sanctioned Cost / Released</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(reportData.project.sanctioned_amount)} / {formatCurrency(reportData.project.released_amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Recorded Expenditure</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(reportData.project.expenditure)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-dimensional Risk Priority Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-900 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>2. Multi-Dimensional Risk Priority Score (0–100)</span>
              <span className="font-mono font-black text-red-700 text-sm">
                OVERALL PRIORITY: {reportData.dossier_summary.priority_score.toFixed(1)} / 100
              </span>
            </h3>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Financial (25%)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {reportData.dossier_summary.financial_risk.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Timeline (25%)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {reportData.dossier_summary.timeline_risk.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Agency (20%)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {reportData.dossier_summary.agency_risk.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Geographic (15%)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {reportData.dossier_summary.geographic_risk.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Similarity (15%)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {reportData.dossier_summary.similarity_risk.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-slate-800 space-y-1">
              <strong className="font-bold text-amber-900">Explainable Reason for Prioritization:</strong>
              <p>{reportData.project.risk?.overall_explanation}</p>
            </div>
          </div>

          {/* Section 3: Peer Comparison Benchmark */}
          {reportData.peer_comparison && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-900 border-b border-slate-200 pb-1">
                3. Peer Group Benchmark Comparison (Nalanda)
              </h3>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  &bull; <strong>Peer Group:</strong> {reportData.peer_comparison.peer_group_name} ({reportData.peer_comparison.peer_count} comparative works)
                </div>
                <div>
                  &bull; <strong>Category Median Cost:</strong> {formatCurrency(reportData.peer_comparison.benchmarks.cost_median_lakhs)} (Subject deviation: <strong>{reportData.peer_comparison.benchmarks.subject_cost_deviation_percent > 0 ? '+' : ''}{reportData.peer_comparison.benchmarks.subject_cost_deviation_percent}%</strong>)
                </div>
                <div>
                  &bull; <strong>Category Delay Benchmark:</strong> {reportData.peer_comparison.benchmarks.delay_median_days} days (Subject overrun: <strong>+{reportData.peer_comparison.benchmarks.subject_delay_deviation_days} days</strong>)
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Supporting Evidence Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-900 border-b border-slate-200 pb-1">
              4. Indexed Evidence Artifacts ({reportData.project.evidence_items.length})
            </h3>
            <div className="space-y-2 text-xs">
              {reportData.project.evidence_items.map((e: any) => (
                <div key={e.evidence_id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between font-mono font-bold text-[11px] text-slate-800">
                    <span>[{e.evidence_id}] {e.title}</span>
                    <span className="text-slate-500 font-sans">{e.source}</span>
                  </div>
                  <p className="text-slate-700 mt-1">{e.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Investigator Findings & Status */}
          <div className="space-y-2 pt-2 border-t-2 border-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-900">
              5. Human Investigator Decision & Official Action Log
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investigation Status</span>
                <span className="font-bold text-gov-900">{reportData.dossier_summary.investigation_status}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Assigned Investigator</span>
                <span className="font-medium text-slate-900">R. K. Verma (Senior Vigilance Officer)</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investigator Notes & Field Observations</span>
                <p className="font-sans text-slate-800 mt-1 italic">
                  {reportData.dossier_summary.investigator_notes || 'No notes entered yet. Initial desk review stage.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sign-off Block */}
          <div className="pt-8 flex justify-between items-end text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 w-48 pt-1 font-bold text-slate-900">
                Investigating Officer Signature
              </div>
              <div className="text-[10px] text-slate-500">District Vigilance Directorate, Nalanda</div>
            </div>

            <div>
              <div className="border-t border-slate-400 w-48 pt-1 font-bold text-slate-900 text-right">
                Authorized Sanctioning Authority
              </div>
              <div className="text-[10px] text-slate-500 text-right">District Planning Office, Nalanda</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-xs text-slate-500">
          <div className="w-8 h-8 border-4 border-gov-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading Report Generator...</span>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
