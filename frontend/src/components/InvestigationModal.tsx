'use client';

import React, { useState } from 'react';
import { api, InvestigationDetail } from '@/lib/api';
import { ShieldCheck, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InvestigationModalProps {
  projectId: string;
  currentStatus: string;
  currentNotes: string;
  onUpdate: (updated: InvestigationDetail) => void;
}

export default function InvestigationModal({
  projectId,
  currentStatus,
  currentNotes,
  onUpdate,
}: InvestigationModalProps) {
  const [status, setStatus] = useState<string>(currentStatus || 'NEW');
  const [notes, setNotes] = useState<string>(currentNotes || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const statuses = [
    { value: 'NEW', label: 'NEW (Triage Pending)', color: 'border-slate-300' },
    { value: 'UNDER REVIEW', label: 'UNDER REVIEW (Active Inquiry)', color: 'border-amber-400' },
    { value: 'VERIFIED', label: 'VERIFIED (Physical Audit Clear)', color: 'border-emerald-500' },
    { value: 'DISMISSED', label: 'DISMISSED (Benign Variation)', color: 'border-gray-400' },
    { value: 'ESCALATED', label: 'ESCALATED (Vigilance Bureau Referral)', color: 'border-red-500' },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.updateInvestigation(projectId, {
        status,
        notes,
      });
      onUpdate(res);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error updating investigation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gov-700" />
          <h3 className="font-bold text-slate-900 text-sm">Investigator Decision & Action Log</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Human-in-the-Loop Protocol</span>
      </div>

      {/* Status selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">Investigation Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-gov-600 focus:outline-hidden"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Investigator Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">
          Investigator Findings / Notes
        </label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record audit observations, field verification findings, Measurement Book cross-checks, or escalation reasons..."
          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:ring-2 focus:ring-gov-600 focus:outline-hidden font-sans"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        {success ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Investigation record updated successfully!</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500">
            Changes are persisted with investigator timestamp and audit trail.
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gov-900 hover:bg-gov-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Decision'}</span>
        </button>
      </div>
    </div>
  );
}
