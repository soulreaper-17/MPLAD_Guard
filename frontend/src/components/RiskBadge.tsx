'use client';

import React from 'react';
import { getPriorityTier } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isAnomaly?: boolean;
}

export default function RiskBadge({
  score,
  showLabel = true,
  size = 'md',
  isAnomaly = false,
}: RiskBadgeProps) {
  const isHigh = score >= 75;
  const isMedium = score >= 45 && score < 75;

  const getStyle = () => {
    if (isHigh) {
      return {
        bg: 'bg-[#C45145]/10 text-[#C45145] border-[#C45145]/30 shadow-[0_4px_12px_rgba(196,81,69,0.12)]',
        labelColor: 'text-[#C45145]',
        label: 'HIGH PRIORITY',
        Icon: ShieldAlert,
      };
    }
    if (isMedium) {
      return {
        bg: 'bg-[#C88A25]/10 text-[#C88A25] border-[#C88A25]/30 shadow-[0_4px_12px_rgba(200,138,37,0.12)]',
        labelColor: 'text-[#C88A25]',
        label: 'MEDIUM PRIORITY',
        Icon: AlertCircle,
      };
    }
    return {
      bg: 'bg-[#398265]/10 text-[#398265] border-[#398265]/30 shadow-[0_4px_12px_rgba(57,130,101,0.12)]',
      labelColor: 'text-[#398265]',
      label: 'LOW PRIORITY',
      Icon: ShieldCheck,
    };
  };

  const style = getStyle();
  const Icon = style.Icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-mono',
    md: 'text-sm px-3 py-1.5 gap-2 font-mono',
    lg: 'text-base px-4 py-2 gap-2.5 font-mono font-bold',
  };

  return (
    <div className="inline-flex items-center gap-2.5">
      <span
        className={`inline-flex items-center rounded-full font-bold border ${style.bg} ${sizeClasses[size]}`}
      >
        <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{score.toFixed(1)}</span>
        <span className="text-[10px] opacity-60 font-sans">/100</span>
      </span>
      {showLabel && (
        <span className={`text-[10px] font-mono font-extrabold tracking-wider uppercase ${style.labelColor}`}>
          {style.label}
        </span>
      )}
      {isAnomaly && (
        <span className="bg-purple-50 text-purple-700 text-[9px] font-mono px-2 py-0.5 rounded-full border border-purple-200 font-bold uppercase tracking-wider shadow-xs">
          ML OUTLIER
        </span>
      )}
    </div>
  );
}
