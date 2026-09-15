'use client';

import React from 'react';
import { DollarSign, Clock, Building2, MapPin, Copy } from 'lucide-react';
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
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Timeline Risk',
      score: risk.timeline_risk,
      weight: '25% Weight',
      icon: Clock,
      explanation: risk.timeline_explanation,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Agency Risk',
      score: risk.agency_risk,
      weight: '20% Weight',
      icon: Building2,
      explanation: risk.agency_explanation,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Geographic Risk',
      score: risk.geographic_risk,
      weight: '15% Weight',
      icon: MapPin,
      explanation: risk.geographic_explanation,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      name: 'Similarity Risk',
      score: risk.similarity_risk,
      weight: '15% Weight',
      icon: Copy,
      explanation: risk.similarity_explanation,
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
    },
  ];

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 45) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getBadgeClass = (score: number) => {
    if (score >= 75) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 45) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          return (
            <div
              key={dim.name}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${dim.bgColor}`}>
                    <Icon className={`w-4 h-4 ${dim.textColor}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{dim.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{dim.weight}</span>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${getBadgeClass(dim.score)}`}>
                  {dim.score.toFixed(1)} / 100
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(dim.score)}`}
                  style={{ width: `${Math.min(100, Math.max(5, dim.score))}%` }}
                />
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {dim.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
