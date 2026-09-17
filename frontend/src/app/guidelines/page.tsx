'use client';

import React from 'react';
import { BookOpen, Scale } from 'lucide-react';

export default function GuidelinesLibraryPage() {
  const guidelines = [
    {
      para: 'Para 4.12',
      title: 'Prohibition on Duplication of Works & Asset Creation',
      category: 'Scheme Eligibility & Verification',
      text: 'No funds under MPLADS shall be sanctioned for a work in a location where a similar durable asset has been created under any Central or State Scheme within the last 5 years, unless certified as fully dilapidated or non-functional by the District Authority.',
      implication: 'Spatial proximity checks and semantic duplicate detection are mandatory before second tranche release.',
    },
    {
      para: 'Para 3.4',
      title: 'Technical Estimates & Standard Schedule of Rates (SOR)',
      category: 'Financial Governance',
      text: 'All estimates for MPLADS works must strictly conform to the current State Schedule of Rates (SOR) of the Public Works Department / Rural Works Department. Implementing agencies must not inflate contingency or overhead rates.',
      implication: 'Cost-per-unit and peer median cost deviations exceeding +40% flag an immediate desk audit trigger.',
    },
    {
      para: 'Para 5.2',
      title: 'Stipulated Timeframe for Work Execution & Delays',
      category: 'Timeline Compliance',
      text: 'Executing agencies are bound to commence work within 45 days of administrative sanction and complete works within 6 to 12 months as per the sanctioned structural schedule. Unexplained delays beyond 90 days attract review by the District Collector.',
      implication: 'Delay tracking and agency historical delay rate calculation are monitored systematically.',
    },
    {
      para: 'Para 6.1',
      title: 'Measurement Book (MB) Recording & Fund Tranches',
      category: 'Inspection & Release Protocol',
      text: 'Funds shall be released in tranches linked to verified physical milestones. Release of the final installment is contingent on entry in the official Measurement Book (MB), a Completion Certificate, and a formal Asset Utilization Certificate (UC).',
      implication: 'All tranche claims must be matched against physical milestone evidence and geo-tagged site imagery.',
    },
    {
      para: 'Para 2.8',
      title: 'Core System Guardrail: AI is an Intelligence Layer for Priority Scoring',
      category: 'System Operating Guardrail',
      text: 'Risk scores and anomaly detection algorithms highlight investigation priorities. Automated models assist human vigilance officers in evidence discovery; all findings must be physically verified by designated government investigators before administrative or legal actions.',
      implication: 'No AI system component shall issue administrative orders without on-ground human verification.',
    },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="floating-slab p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#285C7A]" />
            <h1 className="text-lg font-black text-[#182027] tracking-wider uppercase">
              DIGITAL ARCHIVE &bull; MoSPI SCHEME GUIDELINES &amp; NORMS
            </h1>
          </div>
          <p className="text-xs text-[#667078] font-sans mt-1">
            Official statutory rules and compliance benchmarks governing Member of Parliament Local Area Development Scheme.
          </p>
        </div>

        <span className="bg-[#FAFAF7] text-[#285C7A] text-xs font-mono font-bold px-4 py-2 rounded-full border border-[#E4E7E1]">
          MoSPI GUIDELINES 2023 EDITION
        </span>
      </div>

      {/* Indexed Document Panels Stack */}
      <div className="space-y-5">
        {guidelines.map((g, idx) => (
          <div
            key={idx}
            className="floating-slab p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E4E7E1] pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-[#285C7A]/10 text-[#285C7A] font-mono text-xs font-extrabold px-3 py-1 rounded-full border border-[#285C7A]/20">
                  {g.para}
                </span>
                <h3 className="font-bold text-[#182027] text-base font-sans">{g.title}</h3>
              </div>
              <span className="text-[10px] font-mono text-[#667078] bg-[#FAFAF7] px-3 py-1 rounded-full border border-[#E4E7E1] font-bold uppercase">
                {g.category}
              </span>
            </div>

            <div className="recessed-light-display p-4 text-xs text-[#182027] font-sans leading-relaxed">
              &ldquo;{g.text}&rdquo;
            </div>

            <div className="flex items-center gap-2 text-xs text-[#182027] font-mono pt-1">
              <Scale className="w-4 h-4 text-[#C88A25] shrink-0" />
              <span>
                <strong className="text-[#C88A25]">SYSTEM ANALYTICAL MAPPING:</strong> <span className="font-sans text-[#667078]">{g.implication}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
