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
  const tier = getPriorityTier(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
  };

  const Icon = score >= 75 ? ShieldAlert : score >= 45 ? AlertCircle : ShieldCheck;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-lg font-mono font-semibold border shadow-xs ${tier.colorClass} ${sizeClasses[size]}`}
      >
        <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{score.toFixed(1)}</span>
        <span className="text-[10px] opacity-70 font-sans">/100</span>
      </span>
      {showLabel && (
        <span className={`text-[11px] font-bold tracking-wide uppercase ${tier.textColor}`}>
          {tier.label}
        </span>
      )}
      {isAnomaly && (
        <span className="bg-purple-100 text-purple-800 text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-300 font-semibold">
          ML OUTLIER
        </span>
      )}
    </div>
  );
}
