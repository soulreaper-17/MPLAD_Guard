'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Check, Globe } from 'lucide-react';

interface ConstituencySelectorProps {
  variant?: 'header' | 'hero';
}

const CONSTITUENCIES = [
  { id: 'nalanda', name: 'Nalanda Lok Sabha Constituency', state: 'Bihar', active: true, count: '104 Works' },
  { id: 'bangalore_south', name: 'Bangalore South Lok Sabha Constituency', state: 'Karnataka', active: false, count: 'Active Workspace' },
  { id: 'bangalore_central', name: 'Bangalore Central Lok Sabha Constituency', state: 'Karnataka', active: false, count: 'Active Workspace' },
  { id: 'bangalore_north', name: 'Bangalore North Lok Sabha Constituency', state: 'Karnataka', active: false, count: 'Active Workspace' },
  { id: 'patna_sahib', name: 'Patna Sahib Lok Sabha Constituency', state: 'Bihar', active: false, count: 'Coming Soon' },
  { id: 'varanasi', name: 'Varanasi Lok Sabha Constituency', state: 'Uttar Pradesh', active: false, count: 'Coming Soon' },
  { id: 'south_delhi', name: 'South Delhi Lok Sabha Constituency', state: 'Delhi', active: false, count: 'Coming Soon' },
  { id: 'all_india', name: 'All India (All 543 Constituencies)', state: 'National Overview', active: false, count: 'Coverage Mode' },
];

export default function ConstituencySelector({ variant = 'header' }: ConstituencySelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(CONSTITUENCIES[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (c: typeof CONSTITUENCIES[0]) => {
    setSelected(c);
    setIsOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-xl text-xs font-semibold transition shadow-sm ${
          variant === 'header'
            ? 'bg-gov-950/90 text-white border border-gov-700/80 px-3.5 py-1.5 hover:bg-gov-800'
            : 'bg-white/10 text-white border border-white/20 px-4 py-2.5 hover:bg-white/20'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="text-left">
          <span className="block text-[9px] uppercase font-mono tracking-wider text-[#94c0e6]">
            Constituency Selector
          </span>
          <span className="font-bold">{selected.name}, {selected.state}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0f294a] border border-[#1d4674] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-3 border-b border-white/10 bg-[#0a1a30]">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Lok Sabha Constituency</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono">ALL-INDIA</span>
            </div>
            <p className="text-[10px] text-[#94c0e6] mt-0.5">
              Select constituency to switch dataset &amp; spatial mapping.
            </p>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto text-xs">
            {CONSTITUENCIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition border-b border-white/5 last:border-none ${
                  c.id === selected.id
                    ? 'bg-amber-400/15 text-amber-300 font-bold'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.state} &bull; <span className="font-mono text-amber-400/90">{c.count}</span></div>
                </div>
                {c.id === selected.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
