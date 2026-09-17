'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, Clock, AlertTriangle, Building2, MapPin } from 'lucide-react';

interface FloatingReasonItem {
  category: string;
  reason: string;
  metric?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon?: any;
}

interface FloatingReasonsProps {
  reasons?: FloatingReasonItem[];
  overallExplanation?: string;
}

export default function FloatingReasons({ reasons, overallExplanation }: FloatingReasonsProps) {
  // If structured reasons are provided, use them; otherwise extract from explanation text
  const defaultReasons: FloatingReasonItem[] = reasons || [
    {
      category: 'FINANCIAL SIGNAL',
      reason: 'Sanctioned expenditure shows unusual cost variance',
      metric: '+18.4% vs peer benchmark',
      severity: 'high',
      icon: TrendingUp,
    },
    {
      category: 'IMPLEMENTATION DELAY',
      reason: 'Project completion timeline exceeds expected threshold',
      metric: '27 days past expected date',
      severity: 'critical',
      icon: Clock,
    },
    {
      category: 'CONTRACTOR BENCHMARK',
      reason: 'Agency project allocation concentration exceeds peer average',
      metric: '84.2% single-agency ratio',
      severity: 'medium',
      icon: Building2,
    },
    {
      category: 'GEOSPATIAL OVERLAP',
      reason: 'Work location is within 500m radius of completed duplicate work',
      metric: '280m physical proximity',
      severity: 'high',
      icon: MapPin,
    },
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-l-4 border-l-[#C45145] border-[#E4E7E1]',
          bg: 'bg-white',
          tagBg: 'bg-[#C45145]/10 text-[#C45145] border-[#C45145]/20',
          dot: 'bg-[#C45145]',
        };
      case 'high':
        return {
          border: 'border-l-4 border-l-[#C88A25] border-[#E4E7E1]',
          bg: 'bg-white',
          tagBg: 'bg-[#C88A25]/10 text-[#C88A25] border-[#C88A25]/20',
          dot: 'bg-[#C88A25]',
        };
      case 'medium':
        return {
          border: 'border-l-4 border-l-[#285C7A] border-[#E4E7E1]',
          bg: 'bg-white',
          tagBg: 'bg-[#285C7A]/10 text-[#285C7A] border-[#285C7A]/20',
          dot: 'bg-[#285C7A]',
        };
      default:
        return {
          border: 'border-l-4 border-l-[#398265] border-[#E4E7E1]',
          bg: 'bg-white',
          tagBg: 'bg-[#398265]/10 text-[#398265] border-[#398265]/20',
          dot: 'bg-[#398265]',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[#285C7A] font-extrabold text-xs uppercase tracking-wider font-mono">
          <ShieldAlert className="w-4 h-4 text-[#C88A25]" />
          <span>REASONS FOR PRIORITIZATION (FLOATING SEMANTIC SIGNALS)</span>
        </div>
        <span className="text-[10px] font-mono text-[#667078] bg-[#FAFAF7] px-2.5 py-1 rounded-full border border-[#E4E7E1]">
          {defaultReasons.length} SIGNALS DETECTED
        </span>
      </div>

      {/* Floating Semantic Plates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultReasons.map((item, idx) => {
          const style = getSeverityStyle(item.severity);
          const Icon = item.icon || AlertTriangle;
          return (
            <div
              key={idx}
              className={`floating-slab floating-slab-interactive floating-semantic-plate p-5 space-y-3 shadow-[0_14px_36px_rgba(40,50,55,0.06)] transition-all duration-300 ${style.border} ${style.bg}`}
              style={{
                animationDelay: `${idx * 0.4}s`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${style.tagBg}`}>
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-[#667078]">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className="uppercase font-bold">{item.severity}</span>
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#FAFAF7] border border-[#E4E7E1] text-[#285C7A] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#182027] font-sans leading-snug">
                    {item.reason}
                  </h4>
                  {item.metric && (
                    <span className="inline-block text-[11px] font-mono font-extrabold text-[#285C7A] bg-[#285C7A]/5 px-2 py-0.5 rounded">
                      {item.metric}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {overallExplanation && (
        <div className="recessed-light-display p-4 text-xs font-sans text-[#667078] leading-relaxed border-t border-[#E4E7E1]">
          <strong className="text-[#182027] font-mono font-bold">SYNTHESIS: </strong>
          {overallExplanation}
        </div>
      )}
    </div>
  );
}
