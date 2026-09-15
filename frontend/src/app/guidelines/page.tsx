'use client';

import React from 'react';
import { BookOpen, ShieldCheck, FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gov-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              MoSPI Scheme Guidelines & Evidence Library
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official statutory rules and compliance benchmarks governing Member of Parliament Local Area Development Scheme.
          </p>
        </div>

        <span className="bg-gov-100 text-gov-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-gov-200">
          MoSPI Guidelines 2023 Edition
        </span>
      </div>

      {/* Guidelines Cards Grid */}
      <div className="space-y-4">
        {guidelines.map((g, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="bg-gov-900 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded">
                  {g.para}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{g.title}</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                {g.category}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
              &ldquo;{g.text}&rdquo;
            </div>

            <div className="flex items-center gap-2 text-xs text-gov-800 font-medium">
              <Scale className="w-4 h-4 text-gov-600 shrink-0" />
              <span>
                <strong>System Analytical Mapping:</strong> {g.implication}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
