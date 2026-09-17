'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Printer,
  ShieldAlert,
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
    <div className="space-y-8 font-mono pb-12">
      {/* Header & Controls (Hidden when printing) */}
      <div className="floating-slab p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#285C7A]" />
            <h1 className="text-lg font-black text-[#182027] tracking-wider uppercase">
              INVESTIGATION DECISION SUPPORT REPORT STUDIO
            </h1>
          </div>
          <p className="text-xs text-[#667078] font-sans mt-1">
            Standardized, exportable investigation profile and evidence dossier for statutory vigilance review.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#667078]">CASE ID:</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-[#FAFAF7] border border-[#D2D7CE] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#285C7A] focus:outline-hidden"
              placeholder="e.g. MPLAD-NAL-2023-042"
            />
          </div>

          <button
            onClick={handlePrint}
            className="tactile-light-switch tactile-light-switch-active px-5 py-2.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>PRINT / EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Sheet (Light Paper Sheet Aesthetic) */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#667078]">
          <div className="w-8 h-8 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>GENERATING STRUCTURED FORENSIC DOSSIER...</span>
        </div>
      ) : error || !reportData ? (
        <div className="floating-slab bg-[#C45145]/10 border border-[#C45145]/30 p-6 text-xs text-[#C45145] font-bold">
          {error || 'Report data not found.'}
        </div>
      ) : (
        <div className="light-dossier-sheet p-10 print-page max-w-4xl mx-auto space-y-8 text-[#182027]">
          {/* Official Document Header */}
          <div className="border-b-2 border-[#182027] pb-5 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#667078] uppercase">
                GOVERNMENT OF INDIA &bull; VIGILANCE INTELLIGENCE SYSTEM
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#173F58] uppercase mt-1">
                MPLADS PROJECT INVESTIGATION DOSSIER
              </h2>
              <div className="text-xs text-[#667078] font-medium font-sans">
                Nalanda Lok Sabha Constituency, District Nalanda, Bihar
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div className="font-bold text-[#182027]">{reportData.report_id}</div>
              <div className="text-[#667078] text-[10px]">{reportData.generated_at}</div>
              <div className="bg-[#C45145]/10 text-[#C45145] text-[9px] px-2.5 py-0.5 rounded-full border border-[#C45145]/30 inline-block font-bold">
                CONFIDENTIAL / AUDIT USE ONLY
              </div>
            </div>
          </div>

          {/* Statutory Guardrail Notice */}
          <div className="recessed-light-display p-4 text-[11px] text-[#182027] font-mono">
            <strong className="text-[#285C7A]">STATUTORY NOTICE:</strong> {reportData.guardrail_notice}
          </div>

          {/* Section 1: Project Metadata & Identification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#285C7A] border-b border-[#E4E7E1] pb-1.5">
              1. Project Identification &amp; Sanction Profile
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Project Identifier</span>
                <span className="font-mono font-bold text-[#285C7A] text-sm">{reportData.project.project_id}</span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Work Category</span>
                <span className="font-semibold text-[#182027]">{reportData.project.work_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Sanctioned Name</span>
                <span className="font-bold text-[#182027]">{reportData.project.project_name}</span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Implementing Agency</span>
                <span className="font-medium text-[#182027]">{reportData.project.agency_name}</span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Location (Block / Ward)</span>
                <span className="font-medium text-[#182027]">
                  {reportData.project.block_name}, {reportData.project.gram_panchayat_or_ward}
                </span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Sanctioned Cost / Released</span>
                <span className="font-mono font-bold text-[#182027]">
                  {formatCurrency(reportData.project.sanctioned_amount)} / {formatCurrency(reportData.project.released_amount)}
                </span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Recorded Expenditure</span>
                <span className="font-mono font-bold text-[#182027]">
                  {formatCurrency(reportData.project.expenditure)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Multi-dimensional Risk Priority Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#285C7A] border-b border-[#E4E7E1] pb-1.5 flex items-center justify-between">
              <span>2. Multi-Dimensional Risk Priority Score (0–100)</span>
              <span className="font-mono font-black text-[#C45145] text-base">
                OVERALL PRIORITY: {reportData.dossier_summary.priority_score.toFixed(1)} / 100
              </span>
            </h3>

            <div className="grid grid-cols-5 gap-3 text-center text-xs">
              <div className="recessed-light-display p-3">
                <span className="text-[9px] text-[#667078] block font-bold uppercase">Financial (25%)</span>
                <span className="font-mono font-bold text-[#182027] text-base">
                  {reportData.dossier_summary.financial_risk.toFixed(1)}
                </span>
              </div>
              <div className="recessed-light-display p-3">
                <span className="text-[9px] text-[#667078] block font-bold uppercase">Timeline (25%)</span>
                <span className="font-mono font-bold text-[#182027] text-base">
                  {reportData.dossier_summary.timeline_risk.toFixed(1)}
                </span>
              </div>
              <div className="recessed-light-display p-3">
                <span className="text-[9px] text-[#667078] block font-bold uppercase">Agency (20%)</span>
                <span className="font-mono font-bold text-[#182027] text-base">
                  {reportData.dossier_summary.agency_risk.toFixed(1)}
                </span>
              </div>
              <div className="recessed-light-display p-3">
                <span className="text-[9px] text-[#667078] block font-bold uppercase">Geographic (15%)</span>
                <span className="font-mono font-bold text-[#182027] text-base">
                  {reportData.dossier_summary.geographic_risk.toFixed(1)}
                </span>
              </div>
              <div className="recessed-light-display p-3">
                <span className="text-[9px] text-[#667078] block font-bold uppercase">Similarity (15%)</span>
                <span className="font-mono font-bold text-[#182027] text-base">
                  {reportData.dossier_summary.similarity_risk.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="recessed-light-display p-4 text-xs text-[#182027] space-y-1 font-sans">
              <strong className="font-bold text-[#285C7A] font-mono text-[11px] block uppercase">Explainable Reason for Prioritization:</strong>
              <p>{reportData.project.risk?.overall_explanation}</p>
            </div>
          </div>

          {/* Section 3: Peer Comparison Benchmark */}
          {reportData.peer_comparison && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#285C7A] border-b border-[#E4E7E1] pb-1.5">
                3. Peer Group Benchmark Comparison (Nalanda)
              </h3>
              <div className="text-xs space-y-1.5 text-[#667078] font-sans">
                <div>
                  &bull; <strong>Peer Group:</strong> {reportData.peer_comparison.peer_group_name} ({reportData.peer_comparison.peer_count} comparative works)
                </div>
                <div>
                  &bull; <strong>Category Median Cost:</strong> {formatCurrency(reportData.peer_comparison.benchmarks.cost_median_lakhs)} (Subject deviation: <strong className="text-[#C45145] font-mono">{reportData.peer_comparison.benchmarks.subject_cost_deviation_percent > 0 ? '+' : ''}{reportData.peer_comparison.benchmarks.subject_cost_deviation_percent}%</strong>)
                </div>
                <div>
                  &bull; <strong>Category Delay Benchmark:</strong> {reportData.peer_comparison.benchmarks.delay_median_days} days (Subject overrun: <strong className="text-[#C45145] font-mono">+{reportData.peer_comparison.benchmarks.subject_delay_deviation_days} days</strong>)
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Supporting Evidence Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#285C7A] border-b border-[#E4E7E1] pb-1.5">
              4. Indexed Evidence Artifacts ({reportData.project.evidence_items.length})
            </h3>
            <div className="space-y-2.5 text-xs">
              {reportData.project.evidence_items.map((e: any) => (
                <div key={e.evidence_id} className="recessed-light-display p-3.5 space-y-1">
                  <div className="flex items-center justify-between font-mono font-bold text-[11px] text-[#285C7A]">
                    <span>[{e.evidence_id}] {e.title}</span>
                    <span className="text-[#667078] font-sans text-[10px]">{e.source}</span>
                  </div>
                  <p className="text-[#182027] font-sans text-xs">{e.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Investigator Findings & Status */}
          <div className="space-y-3 pt-6 border-t-2 border-[#182027]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#285C7A]">
              5. Human Investigator Decision &amp; Official Action Log
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs recessed-light-display p-5 font-sans">
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Investigation Status</span>
                <span className="font-bold text-[#182027] font-mono text-sm">{reportData.dossier_summary.investigation_status}</span>
              </div>
              <div>
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Assigned Investigator</span>
                <span className="font-medium text-[#182027]">Vigilance Officer</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#667078] block text-[10px] font-mono font-bold uppercase">Investigator Notes &amp; Field Observations</span>
                <p className="text-[#182027] mt-1.5 italic">
                  {reportData.dossier_summary.investigator_notes || 'No notes entered yet. Initial desk review stage.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sign-off Block */}
          <div className="pt-10 flex justify-between items-end text-xs text-[#667078] font-mono">
            <div>
              <div className="border-t border-[#182027] w-56 pt-2 font-bold text-[#182027]">
                Investigating Officer Signature
              </div>
              <div className="text-[10px] text-[#667078]">District Vigilance Directorate, Nalanda</div>
            </div>

            <div className="text-right">
              <div className="border-t border-[#182027] w-56 pt-2 font-bold text-[#182027]">
                Authorized Sanctioning Authority
              </div>
              <div className="text-[10px] text-[#667078]">District Planning Office, Nalanda</div>
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
        <div className="p-16 text-center text-xs text-[#667078] font-mono">
          <div className="w-8 h-8 border-4 border-[#285C7A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>LOADING REPORT STUDIO...</span>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
