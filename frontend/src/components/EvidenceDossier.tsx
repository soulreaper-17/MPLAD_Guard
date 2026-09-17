'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/lib/api';
import { FileText, Shield, MapPin, Building, BookOpen, Tag } from 'lucide-react';

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
        return 'bg-[#C88A25]/10 text-[#C88A25] border-[#C88A25]/30';
      case 'AGENCY_LOG':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'GUIDELINE_REF':
        return 'bg-[#285C7A]/10 text-[#285C7A] border-[#285C7A]/30';
      case 'FINANCIAL':
        return 'bg-[#398265]/10 text-[#398265] border-[#398265]/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const types = ['ALL', ...Array.from(new Set(evidenceItems.map((e) => e.evidence_type)))];

  const filteredItems =
    selectedType === 'ALL'
      ? evidenceItems
      : evidenceItems.filter((e) => e.evidence_type === selectedType);

  return (
    <div className="space-y-6 font-mono">
      {/* Evidence Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#E4E7E1]">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`tactile-light-switch px-4 py-2 rounded-full text-xs font-mono font-bold transition ${
              selectedType === t
                ? 'tactile-light-switch-active text-white'
                : 'text-[#667078] hover:text-[#182027]'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Forensic Evidence Paper Sheet Stack */}
      <div className="space-y-4">
        {filteredItems.map((ev) => {
          const Icon = getEvidenceIcon(ev.evidence_type);
          return (
            <div
              key={ev.evidence_id}
              className="light-dossier-sheet p-6 space-y-4 shadow-[0_12px_32px_rgba(40,50,55,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-[#FAFAF7] border border-[#E4E7E1] text-[#285C7A] mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#285C7A]">[{ev.evidence_id}]</span>
                      <span
                        className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBadgeStyle(
                          ev.evidence_type
                        )}`}
                      >
                        {ev.evidence_type}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#182027] font-sans mt-1">{ev.title}</h4>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-extrabold text-[#C45145] bg-[#C45145]/10 px-3 py-1 rounded-full border border-[#C45145]/30 uppercase tracking-wider">
                  {ev.relevance} RELEVANCE
                </span>
              </div>

              {/* Evidence Text Content */}
              <div className="recessed-light-display p-4 text-xs text-[#182027] font-sans leading-relaxed">
                {ev.content}
              </div>

              {/* Source Authority Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#667078] pt-3 border-t border-[#E4E7E1]">
                <span>
                  <strong className="text-[#182027]">SOURCE AUTHORITY:</strong> {ev.source}
                </span>
                <span className="text-[#398265] font-bold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>VERIFIED EVIDENCE RECORD</span>
                </span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="recessed-light-display p-10 text-center text-[#667078] text-xs font-mono">
            NO EVIDENCE ARTIFACTS FOUND FOR THIS CATEGORY FILTER.
          </div>
        )}
      </div>
    </div>
  );
}
