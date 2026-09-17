'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Clock,
  FileText,
  Lock,
  Layers,
  Info,
  TrendingUp,
} from 'lucide-react';

interface PublicReportTabProps {
  projectId: string;
}

export default function PublicReportTab({ projectId }: PublicReportTabProps) {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [complaintText, setComplaintText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [submitErrorMsg, setSubmitErrorMsg] = useState('');
  const [lastSubmittedReport, setLastSubmittedReport] = useState<any>(null);

  // User Info from localStorage
  const [user, setUser] = useState<{ email?: string; name?: string; role?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('mplad_user');
        if (u) {
          setUser(JSON.parse(u));
        } else {
          setUser({ email: 'citizen@mpladguard.gov.in', name: 'Public Citizen', role: 'CITIZEN' });
        }
      } catch (e) {
        setUser({ email: 'citizen@mpladguard.gov.in', name: 'Public Citizen', role: 'CITIZEN' });
      }
    }
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const email = user?.email || 'citizen@mpladguard.gov.in';
      const data = await api.getPublicReports(projectId, email);
      setReportsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load public reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadReports();
    }
  }, [projectId, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setSubmitErrorMsg('Please enter details of the ground discrepancy or complaint.');
      return;
    }

    setSubmitting(true);
    setSubmitErrorMsg('');
    setSubmitSuccessMsg('');

    const textWithTag = selectedTag ? `[Tag: ${selectedTag}] ${complaintText}` : complaintText;

    try {
      const res = await api.submitPublicReport(projectId, {
        complaint_text: textWithTag,
        user_email: user?.email || 'citizen@mpladguard.gov.in',
        user_name: user?.name || 'Public Citizen',
      });

      setSubmitSuccessMsg('Public Report Filed & Synthesized by AI! Sent to Vigilance Officers.');
      setLastSubmittedReport(res);
      setComplaintText('');
      setSelectedTag('');
      loadReports();
    } catch (err: any) {
      setSubmitErrorMsg(err.message || 'Failed to file report. You may have exceeded your daily quota.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 font-mono">
        <div className="w-8 h-8 border-3 border-[#285C7A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#667078]">LOADING PUBLIC REPORT & CITIZEN FEEDBACK DATA...</p>
      </div>
    );
  }

  const totalReports = reportsData?.total_reports_count || 0;
  const maxCapacity = reportsData?.max_capacity || 1000;
  const canSubmit = reportsData?.user_can_submit_today ?? true;
  const reportsList = reportsData?.reports || [];
  const capacityPct = Math.min(100, Math.round((totalReports / maxCapacity) * 100));

  return (
    <div className="space-y-8 font-sans">
      
      {/* HEADER & CAPACITY INDICATOR BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-[#FAFAF7] border border-[#E4E7E1] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E1] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C88A25] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#C88A25]" />
              <span>PUBLIC AUDIT & GROUND REPORTING LAYER</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#182027] font-sans">
              Citizen Discrepancy & Inaccuracy Filing
            </h3>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs shrink-0">
            <div className="bg-white p-3 rounded-2xl border border-[#E4E7E1] text-center shadow-xs">
              <span className="text-[10px] text-[#667078] block font-bold">TOTAL REPORTS</span>
              <span className="text-lg font-black text-[#285C7A]">
                {totalReports} <span className="text-xs text-[#667078]">/ {maxCapacity}</span>
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-[#E4E7E1] text-center shadow-xs">
              <span className="text-[10px] text-[#667078] block font-bold">DAILY RATE LIMIT</span>
              <span className="text-xs font-bold text-[#398265]">1 / User / Day</span>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[#667078]">
            <span>Project Complaint Capacity ({totalReports} filed)</span>
            <span className="font-bold text-[#182027]">{capacityPct}% Capacity Used</span>
          </div>
          <div className="w-full h-2 bg-[#E4E7E1] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacityPct > 80 ? 'bg-[#C45145]' : capacityPct > 50 ? 'bg-[#C88A25]' : 'bg-[#285C7A]'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* REPORT SUBMISSION FORM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E7E1] shadow-[0_12px_32px_rgba(24,32,39,0.04)] space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4E7E1] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#285C7A]/10 text-[#285C7A] flex items-center justify-center font-extrabold text-sm">
              ✍️
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#182027]">File Ground Complaint / Report Discrepancy</h4>
              <p className="text-xs text-[#667078] font-mono">
                Logged in as: <strong className="text-[#182027]">{user?.name || 'Public Citizen'}</strong> ({user?.email || 'citizen@mpladguard.gov.in'})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#398265]/10 text-[#398265] border border-[#398265]/20">
            AI SYNTHESIS ACTIVE
          </span>
        </div>

        {submitErrorMsg && (
          <div className="bg-[#C45145]/10 border border-[#C45145]/30 text-[#C45145] p-4 rounded-2xl text-xs flex items-center gap-3 font-mono">
            <AlertTriangle className="w-5 h-5 shrink-0 text-[#C45145]" />
            <span>{submitErrorMsg}</span>
          </div>
        )}

        {submitSuccessMsg && (
          <div className="bg-[#398265]/10 border border-[#398265]/30 text-[#398265] p-4 rounded-2xl text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#398265]" />
              <span>{submitSuccessMsg}</span>
            </div>
            {lastSubmittedReport?.ai_critical_points && (
              <div className="pt-2 border-t border-[#398265]/20 space-y-1 text-xs">
                <span className="font-bold text-[#182027] uppercase tracking-wider block">✨ AI Key Critical Point Extraction:</span>
                <ul className="list-disc list-inside space-y-1 text-[#182027]">
                  {lastSubmittedReport.ai_critical_points.map((pt: string, idx: number) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!canSubmit ? (
          <div className="p-6 rounded-2xl bg-[#FAFAF7] border border-[#E4E7E1] text-center space-y-2 font-mono">
            <Lock className="w-6 h-6 text-[#667078] mx-auto" />
            <h5 className="font-bold text-sm text-[#182027]">Daily Report Limit Reached</h5>
            <p className="text-xs text-[#667078] max-w-md mx-auto">
              You have submitted 1 report for this project today. To ensure high-quality citizen intelligence, each citizen can submit 1 report per project per day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#182027] uppercase tracking-wider mb-2">
                Quick Category Tag
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {[
                  'Execution Delay & Halted Work',
                  'Substandard Material Quality',
                  'Suspected Over-Invoicing / Cost Inflated',
                  'Asset Non-Existent on Ground',
                  'Location Discrepancy',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedTag === tag
                        ? 'bg-[#182027] text-white border-[#182027]'
                        : 'bg-[#FAFAF7] text-[#667078] border-[#E4E7E1] hover:border-[#285C7A] hover:text-[#182027]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#182027] uppercase tracking-wider mb-2">
                Ground Observation Details &amp; Complaint Text
              </label>
              <textarea
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe ground realities (e.g. work stopped 4 months ago, road broken within 2 weeks, non-existent tubewell, over-invoiced bill)..."
                className="w-full p-4 rounded-2xl border border-[#D2D7CE] bg-[#FAFAF7] focus:bg-white focus:border-[#285C7A] text-sm text-[#182027] font-sans transition outline-none shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-2 font-mono">
              <span className="text-[11px] text-[#667078]">
                Ground complaints are processed by AI to extract critical signals for Vigilance Officers.
              </span>

              <button
                type="submit"
                disabled={submitting || !complaintText.trim()}
                className="tactile-light-switch-active px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#182027] hover:bg-[#285C7A] transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SYNTHESIZING REPORT...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#C88A25]" />
                    <span>SUBMIT PUBLIC REPORT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FILED CITIZEN REPORTS FEED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h4 className="text-sm font-bold text-[#182027] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#285C7A]" />
            <span>FILED PUBLIC REPORTS ({reportsList.length})</span>
          </h4>
          <span className="text-xs text-[#667078]">ORDERED BY RECENT SUBMISSION</span>
        </div>

        {reportsList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#E4E7E1] text-center space-y-2 font-mono text-xs text-[#667078]">
            <Info className="w-6 h-6 text-[#285C7A] mx-auto opacity-60" />
            <p>No public reports filed for this project yet. Be the first citizen to file ground observations!</p>
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {reportsList.map((item: any) => (
              <div
                key={item.report_id}
                className="p-6 rounded-3xl bg-white border border-[#E4E7E1] shadow-xs space-y-4 transition hover:border-[#285C7A]/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E1] pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#285C7A]" />
                    <span className="font-bold text-[#182027]">{item.user_name}</span>
                    <span className="text-[#667078]">({item.user_email})</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        item.ai_urgency === 'HIGH'
                          ? 'bg-[#C45145]/10 text-[#C45145] border border-[#C45145]/20'
                          : 'bg-[#C88A25]/10 text-[#C88A25] border border-[#C88A25]/20'
                      }`}
                    >
                      URGENCY: {item.ai_urgency}
                    </span>
                    <span className="text-[#667078] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <p className="text-[#182027] bg-[#FAFAF7] p-3.5 rounded-2xl border border-[#E4E7E1] leading-relaxed">
                    "{item.complaint_text}"
                  </p>
                </div>

                {item.ai_critical_points && item.ai_critical_points.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#F0F4F8] border border-[#285C7A]/20 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 font-bold text-[#285C7A] text-[11px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#C88A25]" />
                      <span>AI Synthesized Critical Intelligence (Sent to Officers):</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-[#182027]">
                      {item.ai_critical_points.map((pt: string, idx: number) => (
                        <li key={idx} className="leading-snug">{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
