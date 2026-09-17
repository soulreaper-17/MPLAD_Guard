'use client';

import React from 'react';
import { X, ShieldCheck, Scale, Calculator, Info, ArrowRight, Zap } from 'lucide-react';

interface MethodologySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologySheet({ isOpen, onClose }: MethodologySheetProps) {
  if (!isOpen) return null;

  const weights = [
    { label: 'FINANCIAL SIGNAL', weight: '30%', desc: 'Expenditure variance & sanction-to-cost deviation', color: 'bg-[#285C7A]', barWidth: 'w-[30%]' },
    { label: 'IMPLEMENTATION SIGNAL', weight: '25%', desc: 'Timeline extensions & start-delay ratio', color: 'bg-[#C88A25]', barWidth: 'w-[25%]' },
    { label: 'PEER DEVIATION', weight: '20%', desc: 'Statistical Z-score distance from historical block benchmarks', color: 'bg-[#398265]', barWidth: 'w-[20%]' },
    { label: 'AGENCY PATTERNS', weight: '15%', desc: 'Contractor concentration & concurrent project load', color: 'bg-[#173F58]', barWidth: 'w-[15%]' },
    { label: 'GEOSPATIAL PROXIMITY', weight: '10%', desc: 'Physical 500m proximity & duplicate work type overlap', color: 'bg-[#C45145]', barWidth: 'w-[10%]' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b131e]/75 backdrop-blur-2xl animate-fadeIn"
      onClick={onClose}
    >
      {/* 3D Glassmorphic Container with Ambient Specular Glow */}
      <div
        className="max-w-xl w-full relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-2 border-white/80 dark:border-white/10 shadow-[0_35px_100px_rgba(15,23,42,0.35),0_15px_35px_rgba(15,23,42,0.2),inset_0_2px_1px_rgba(255,255,255,1)] rounded-3xl p-6 sm:p-7 space-y-5 overflow-hidden transition-all duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gloss Specular Highlight Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#285C7A] via-[#C88A25] to-[#398265] opacity-80" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#667078] hover:text-[#182027] hover:bg-[#ECEFEA] transition border border-transparent hover:border-[#E4E7E1]"
          title="Close Modal (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-[#E4E7E1]/80 pb-4 pr-8">
          <div className="flex items-center gap-2 text-[#285C7A] font-mono text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#C88A25]" />
            <span>5-SIGNAL RISK COMPOSITE &bull; EXPLAINABLE AI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#182027] tracking-tight font-sans">
            How Sevaarth AI Calculates Risk
          </h2>
          <p className="text-xs text-[#667078] leading-relaxed font-sans">
            Deterministic scoring engine combining statistical anomaly detection, geospatial proximity, and MoSPI guideline compliance rules.
          </p>
        </div>

        {/* Weights Breakdown Cards */}
        <div className="space-y-2.5 font-mono">
          {weights.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-white to-[#FAFAF7] border border-[#E4E7E1] space-y-2 transition-all duration-200 hover:border-[#285C7A]/40 hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#182027] flex items-center gap-2 font-sans">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-xs`} />
                  <span>{item.label}</span>
                </span>
                <span className="font-extrabold text-[#182027] text-xs bg-[#182027]/5 px-2.5 py-0.5 rounded-full border border-[#182027]/10 group-hover:bg-[#182027] group-hover:text-white transition-colors duration-200">
                  {item.weight}
                </span>
              </div>

              {/* Visual Weight Bar */}
              <div className="w-full h-1.5 bg-[#E4E7E1] rounded-full overflow-hidden">
                <div className={`h-full ${item.color} ${item.barWidth} rounded-full transition-all duration-500`} />
              </div>

              <p className="text-[11px] text-[#667078] font-sans leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 rounded-2xl bg-[#285C7A]/5 border border-[#285C7A]/15 flex items-start gap-2.5 text-xs text-[#667078] font-sans">
          <Info className="w-4 h-4 text-[#285C7A] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#182027]">
            Every output score (0–100) is 100% deterministic and decomposed into verifiable line-items for physical audit verification.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center justify-between border-t border-[#E4E7E1]/80">
          <span className="text-[10px] font-mono text-[#667078]">
            Sevaarth AI &bull; Standard Risk Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#182027] text-white hover:bg-[#285C7A] text-xs font-bold font-mono inline-flex items-center gap-2 shadow-md transition-all duration-200"
          >
            <span>UNDERSTOOD</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C88A25]" />
          </button>
        </div>

      </div>
    </div>
  );
}

