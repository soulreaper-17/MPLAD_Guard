'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/lib/api';
import { FileText, Shield, MapPin, Building, BookOpen, AlertCircle, ExternalLink } from 'lucide-react';

interface EvidenceDossierProps {
  evidenceItems: EvidenceItem[];
  projectId: string;
}

export default function EvidenceDossier({ evidenceItems, projectId }: EvidenceDossierProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return FileText;
      case 'TIMELINE':
        return Shield;
      case 'SPATIAL':
        return MapPin;
      case 'AGENCY_LOG':
        return Building;
      case 'GUIDELINE_REF':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'SPATIAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'AGENCY_LOG':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'GUIDELINE_REF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FINANCIAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const types = ['ALL', ...Array.from(new Set(evidenceItems.map((e) => e.evidence_type)))];

  const filteredItems =
    selectedType === 'ALL'
      ? evidenceItems
      : evidenceItems.filter((e) => e.evidence_type === selectedType);

  return (
    <div className="space-y-4">
      {/* Evidence Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              selectedType === t
                ? 'bg-gov-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Evidence Cards */}
      <div className="space-y-3">
        {filteredItems.map((ev) => {
          const Icon = getEvidenceIcon(ev.evidence_type);
          return (
            <div
              key={ev.evidence_id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{ev.evidence_id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${getBadgeStyle(
                          ev.evidence_type
                        )}`}
                      >
                        {ev.evidence_type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ev.title}</h4>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {ev.relevance} RELEVANCE
                </span>
              </div>

              {/* Content Body */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
                {ev.content}
              </div>

              {/* Provenance footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>
                  <strong>Source Authority:</strong> {ev.source}
                </span>
                <span className="text-[10px] font-mono">Verified Evidence Record</span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No evidence records found for this category filter.
          </div>
        )}
      </div>
    </div>
  );
}
