'use client';

import React from 'react';
import { DollarSign, Clock, Building2, MapPin, Copy, Activity } from 'lucide-react';
import { RiskDetail } from '@/lib/api';

interface RiskRadarProps {
  risk: RiskDetail;
}

export default function RiskRadar({ risk }: RiskRadarProps) {
  const dimensions = [
    {
      name: 'Financial Risk',
      score: risk.financial_risk,
      weight: '25% Weight',
      icon: DollarSign,
      explanation: risk.financial_explanation,
      color: 'bg-[#398265]',
      textColor: 'text-[#398265]',
      bgColor: 'bg-[#398265]/10',
    },
    {
      name: 'Timeline Risk',
      score: risk.timeline_risk,
      weight: '25% Weight',
      icon: Clock,
      explanation: risk.timeline_explanation,
      color: 'bg-[#285C7A]',
      textColor: 'text-[#285C7A]',
      bgColor: 'bg-[#285C7A]/10',
    },
    {
      name: 'Agency Risk',
      score: risk.agency_risk,
      weight: '20% Weight',
      icon: Building2,
      explanation: risk.agency_explanation,
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Geographic Risk',
      score: risk.geographic_risk,
      weight: '15% Weight',
      icon: MapPin,
      explanation: risk.geographic_explanation,
      color: 'bg-[#C88A25]',
      textColor: 'text-[#C88A25]',
      bgColor: 'bg-[#C88A25]/10',
    },
    {
      name: 'Similarity Risk',
      score: risk.similarity_risk,
      weight: '15% Weight',
      icon: Copy,
      explanation: risk.similarity_explanation,
      color: 'bg-[#C45145]',
      textColor: 'text-[#C45145]',
      bgColor: 'bg-[#C45145]/10',
    },
  ];

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-[#C45145]';
    if (score >= 45) return 'bg-[#C88A25]';
    return 'bg-[#398265]';
  };

  const getBadgeClass = (score: number) => {
    if (score >= 75) return 'bg-[#C45145]/10 text-[#C45145] border-[#C45145]/30';
    if (score >= 45) return 'bg-[#C88A25]/10 text-[#C88A25] border-[#C88A25]/30';
    return 'bg-[#398265]/10 text-[#398265] border-[#398265]/30';
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#E4E7E1] pb-3 text-xs font-mono">
        <span className="flex items-center gap-2 text-[#285C7A] font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>5-DIMENSIONAL RISK MATRIX ANALYSIS</span>
        </span>
        <span className="text-[#667078] text-[10px]">WEIGHTED AGGREGATE MODEL</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div
              key={dim.name}
              className="floating-slab floating-slab-interactive p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${dim.bgColor} border border-transparent`}>
                    <Icon className={`w-4 h-4 ${dim.textColor}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-[#182027] uppercase tracking-wider">{dim.name}</h4>
                    <span className="text-[10px] font-mono text-[#667078]">{dim.weight}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getBadgeClass(dim.score)}`}>
                  {dim.score.toFixed(1)} / 100
                </div>
              </div>

              {/* Progress bar gauge */}
              <div className="recessed-light-display h-2.5 p-0.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(dim.score)}`}
                  style={{ width: `${Math.min(100, Math.max(5, dim.score))}%` }}
                />
              </div>

              {/* Explanation Readout */}
              <p className="text-xs text-[#182027] leading-relaxed font-sans bg-[#FAFAF7] p-3 rounded-xl border border-[#E4E7E1]">
                {dim.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
