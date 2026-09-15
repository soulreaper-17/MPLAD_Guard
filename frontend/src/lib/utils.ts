import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountLakhs: number): string {
  if (amountLakhs === undefined || amountLakhs === null) return '₹0.00 L';
  return `₹${amountLakhs.toFixed(2)} Lakhs`;
}

export function getPriorityTier(score: number): {
  label: string;
  colorClass: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
} {
  if (score >= 75) {
    return {
      label: 'HIGH PRIORITY',
      colorClass: 'text-red-700 bg-red-50 border-red-300',
      badgeBg: 'bg-red-600',
      textColor: 'text-red-700',
      borderColor: 'border-red-500',
    };
  } else if (score >= 45) {
    return {
      label: 'MEDIUM PRIORITY',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      badgeBg: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-500',
    };
  } else {
    return {
      label: 'LOW PRIORITY',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      badgeBg: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-500',
    };
  }
}

export function getStatusBadge(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-200', text: 'Completed' };
    case 'ONGOING':
      return { bg: 'bg-blue-100 text-blue-800 border border-blue-200', text: 'Ongoing' };
    case 'DELAYED':
      return { bg: 'bg-rose-100 text-rose-800 border border-rose-200', text: 'Delayed' };
    case 'SANCTIONED':
      return { bg: 'bg-purple-100 text-purple-800 border border-purple-200', text: 'Sanctioned' };
    default:
      return { bg: 'bg-slate-100 text-slate-800 border border-slate-200', text: status || 'Unknown' };
  }
}

export function getInvestigationStatusBadge(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case 'NEW':
      return { bg: 'bg-slate-100 text-slate-700 border border-slate-300', text: 'NEW' };
    case 'UNDER REVIEW':
      return { bg: 'bg-amber-100 text-amber-800 border border-amber-300', text: 'UNDER REVIEW' };
    case 'VERIFIED':
      return { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300', text: 'VERIFIED' };
    case 'DISMISSED':
      return { bg: 'bg-gray-100 text-gray-700 border border-gray-300', text: 'DISMISSED' };
    case 'ESCALATED':
      return { bg: 'bg-red-100 text-red-800 border border-red-300', text: 'ESCALATED' };
    default:
      return { bg: 'bg-slate-100 text-slate-700 border border-slate-300', text: status || 'NEW' };
  }
}
