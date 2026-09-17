'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ChevronDown, Check, Globe, Search, X, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import { ALL_543_CONSTITUENCIES, Constituency } from '@/lib/constituenciesData';

interface ConstituencySelectorProps {
  variant?: 'header' | 'hero';
}

const ALL_INDIA_OPTION: Constituency = {
  id: 'all_india',
  code: 'IND-543',
  name: 'All India (All 543 Constituencies)',
  shortName: 'Pan-India National View',
  state: 'National Overview',
  active: true,
  count: '543 Seats (Pan-India)',
  sanctionedAmount: 124500000000,
  riskScoreAvg: 58.2,
  mpName: '18th Lok Sabha Assembly',
  mpParty: '543 MPs',
  latitude: 20.5937,
  longitude: 78.9629,
};

// Major Indian States & UTs with Seat Counts for 3D Keycap Filter
const STATE_FILTERS = [
  { code: 'ALL', label: 'ALL INDIA', count: 543 },
  { code: 'Uttar Pradesh', label: 'UP', count: 80 },
  { code: 'Maharashtra', label: 'MH', count: 48 },
  { code: 'West Bengal', label: 'WB', count: 42 },
  { code: 'Bihar', label: 'BR', count: 40 },
  { code: 'Tamil Nadu', label: 'TN', count: 39 },
  { code: 'Madhya Pradesh', label: 'MP', count: 29 },
  { code: 'Karnataka', label: 'KA', count: 28 },
  { code: 'Gujarat', label: 'GJ', count: 26 },
  { code: 'Andhra Pradesh', label: 'AP', count: 25 },
  { code: 'Rajasthan', label: 'RJ', count: 25 },
  { code: 'Odisha', label: 'OD', count: 21 },
  { code: 'Kerala', label: 'KL', count: 20 },
  { code: 'Telangana', label: 'TS', count: 17 },
  { code: 'Jharkhand', label: 'JH', count: 14 },
  { code: 'Punjab', label: 'PB', count: 13 },
  { code: 'Chhattisgarh', label: 'CG', count: 11 },
  { code: 'Haryana', label: 'HR', count: 10 },
  { code: 'Delhi', label: 'DL', count: 7 },
  { code: 'Assam', label: 'AS', count: 14 },
  { code: 'Uttarakhand', label: 'UK', count: 5 },
  { code: 'Jammu and Kashmir', label: 'JK', count: 5 },
  { code: 'Himachal Pradesh', label: 'HP', count: 4 },
];

// Map political party to brand color accent dot
function getPartyBadgeStyle(partyName?: string) {
  if (!partyName) return { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  const p = partyName.toUpperCase();
  if (p.includes('BJP')) return { dot: 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
  if (p.includes('INC') || p.includes('CONGRESS')) return { dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]', badge: 'bg-sky-50 text-sky-800 border-sky-200' };
  if (p.includes('TDP')) return { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]', badge: 'bg-amber-50 text-amber-900 border-amber-300' };
  if (p.includes('DMK')) return { dot: 'bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.8)]', badge: 'bg-red-50 text-red-800 border-red-200' };
  if (p.includes('SP')) return { dot: 'bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.8)]', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (p.includes('AITC') || p.includes('TMC')) return { dot: 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.8)]', badge: 'bg-teal-50 text-teal-800 border-teal-200' };
  if (p.includes('AAP')) return { dot: 'bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.8)]', badge: 'bg-blue-50 text-blue-800 border-blue-200' };
  if (p.includes('JDU')) return { dot: 'bg-green-600 shadow-[0_0_6px_rgba(22,163,74,0.8)]', badge: 'bg-green-50 text-green-800 border-green-200' };
  if (p.includes('SS') || p.includes('SHIV SENA')) return { dot: 'bg-orange-600 shadow-[0_0_6px_rgba(234,88,12,0.8)]', badge: 'bg-orange-50 text-orange-900 border-orange-300' };
  if (p.includes('YSR')) return { dot: 'bg-indigo-600 shadow-[0_0_6px_rgba(79,70,229,0.8)]', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
  return { dot: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export default function ConstituencySelector({ variant = 'header' }: ConstituencySelectorProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [selected, setSelected] = useState<Constituency>(ALL_543_CONSTITUENCIES[28]); // Default to Nalanda
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStateTab, setActiveStateTab] = useState<string>('ALL');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('selected_constituency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          if (parsed.id === 'all_india') {
            setSelected(ALL_INDIA_OPTION);
          } else {
            const found = ALL_543_CONSTITUENCIES.find((c) => c.id === parsed.id);
            if (found) setSelected(found);
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Global hotkey '/' to open jurisdiction console search bar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // High-performance tokenized multi-keyword fuzzy search algorithm with strict word-boundary matching & scoring
  const filteredConstituencies = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();

    // If query is empty, respect activeStateTab filter
    if (!rawQuery) {
      let pool = ALL_543_CONSTITUENCIES;
      if (activeStateTab !== 'ALL') {
        pool = pool.filter((c) => c.state.toLowerCase() === activeStateTab.toLowerCase());
      }
      return activeStateTab === 'ALL' ? [ALL_INDIA_OPTION, ...pool] : pool;
    }

    // IF KEYBOARD HAS TYPED A QUERY:
    // Search across ALL 543 Constituencies dynamically with strict word-boundary matching!
    const tokens = rawQuery.split(/\s+/).filter(Boolean);
    const scoredItems: { item: Constituency; score: number; wordBoundaryMatched: boolean }[] = [];

    for (const c of ALL_543_CONSTITUENCIES) {
      const cShort = c.shortName.toLowerCase();
      const cName = c.name.toLowerCase();
      const cState = c.state.toLowerCase();
      const cCode = c.code.toLowerCase();
      const mpName = (c.mpName || '').toLowerCase();
      const mpParty = (c.mpParty || '').toLowerCase();

      let matchesAllTokens = true;
      let score = 0;
      let wordBoundaryMatched = false;

      for (const token of tokens) {
        const escToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp('(^|\\s|\\-|\\(|\\/)' + escToken, 'i');

        const inShortWB = wordBoundaryRegex.test(cShort);
        const inNameWB = wordBoundaryRegex.test(cName);
        const inStateWB = wordBoundaryRegex.test(cState);
        const inMpWB = wordBoundaryRegex.test(mpName);
        const inCodeWB = wordBoundaryRegex.test(cCode);
        const inPartyWB = wordBoundaryRegex.test(mpParty);

        const inShortSub = cShort.includes(token);
        const inNameSub = cName.includes(token);
        const inStateSub = cState.includes(token);
        const inMpSub = mpName.includes(token);
        const inCodeSub = cCode.includes(token);
        const inPartySub = mpParty.includes(token);

        const matchedAny = inShortWB || inNameWB || inStateWB || inMpWB || inCodeWB || inPartyWB ||
                           inShortSub || inNameSub || inStateSub || inMpSub || inCodeSub || inPartySub;

        if (!matchedAny) {
          matchesAllTokens = false;
          break;
        }

        if (inShortWB || inNameWB || inStateWB || inMpWB || inCodeWB || inPartyWB) {
          wordBoundaryMatched = true;
        }

        // Exact full string matches (highest priority)
        if (cShort === rawQuery || cName === rawQuery) score += 100000;
        if (cState === rawQuery) score += 80000;
        if (mpName === rawQuery) score += 60000;
        if (cCode === rawQuery) score += 50000;

        // Word boundary matches (high priority)
        if (inShortWB) score += 30000;
        if (inStateWB) score += 25000;
        if (inNameWB) score += 20000;
        if (inMpWB) score += 15000;
        if (inCodeWB) score += 10000;
        if (inPartyWB) score += 8000;

        // Substring fallback matches (very low priority)
        if (inShortSub) score += 100;
        if (inNameSub) score += 50;
        if (inMpSub) score += 30;
        if (inStateSub) score += 20;

        // Active state tab boost if selected
        if (activeStateTab !== 'ALL' && cState === activeStateTab.toLowerCase()) {
          score += 500;
        }
      }

      if (matchesAllTokens && score > 0) {
        scoredItems.push({ item: c, score, wordBoundaryMatched });
      }
    }

    // Filter out pure embedded substring matches (like Visakhapatnam for "patna") if word-boundary matches exist
    const hasWordBoundaryMatches = scoredItems.some((si) => si.wordBoundaryMatched);
    const filteredScoredItems = hasWordBoundaryMatches
      ? scoredItems.filter((si) => si.wordBoundaryMatched)
      : scoredItems;

    // Sort by score descending, then state, then shortName
    filteredScoredItems.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.state !== b.item.state) return a.item.state.localeCompare(b.item.state);
      return a.item.shortName.localeCompare(b.item.shortName);
    });

    const results = filteredScoredItems.map((si) => si.item);

    // Also include All India option if query matches pan-national terms
    if (tokens.some((t) => 'all india pan national 543 overview'.includes(t))) {
      return [ALL_INDIA_OPTION, ...results];
    }

    return results;
  }, [searchQuery, activeStateTab]);

  // Reset highlight index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredConstituencies.length, searchQuery, activeStateTab]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (c: Constituency) => {
    setSelected(c);
    localStorage.setItem('selected_constituency', JSON.stringify(c));
    setIsOpen(false);
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('constituency-changed', { detail: c }));
    }
    router.push('/dashboard');
  };

  // Keyboard navigation handler for search bar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredConstituencies.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredConstituencies.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredConstituencies[highlightedIndex]) {
        handleSelect(filteredConstituencies[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const partyStyle = getPartyBadgeStyle(selected.mpParty);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left font-mono z-50">
      {/* 3D TACTILE TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative inline-flex items-center gap-3 rounded-2xl px-4 py-2 text-xs transition-all duration-300 select-none
          bg-gradient-to-b from-[#FFFFFF] via-[#F6F8F4] to-[#ECEFEA]
          border border-[#C5CBC0]
          shadow-[0_4px_16px_rgba(24,32,39,0.08),inset_0_1.5px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.04)]
          hover:shadow-[0_8px_24px_rgba(40,92,122,0.2),inset_0_1.5px_0_rgba(255,255,255,1)]
          hover:border-[#285C7A]/70 hover:-translate-y-0.5
          active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.14)] active:border-[#285C7A]
          ${isOpen ? 'ring-4 ring-[#285C7A]/30 border-[#285C7A] shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]' : ''}`}
      >
        {/* Glowing Status Indicator Dot */}
        <div className="relative flex items-center justify-center">
          <MapPin className="w-4 h-4 text-[#285C7A] drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#398265] shadow-[0_0_8px_#398265] animate-pulse" />
        </div>

        {/* Selected Jurisdiction Specs */}
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="block text-[8px] uppercase tracking-widest text-[#667078] font-bold">
              JURISDICTION CONSOLE
            </span>
            {selected.mpName && (
              <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-mono font-extrabold border shadow-sm ${partyStyle.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${partyStyle.dot}`} />
                <span className="truncate max-w-[130px]">{selected.mpName}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#182027] text-[12px] tracking-tight truncate max-w-[210px] group-hover:text-[#285C7A] transition-colors">
              {selected.shortName}
            </span>
            <span className="text-[10px] text-[#667078] font-semibold">({selected.state})</span>
          </div>
        </div>

        {/* 3D Tactile Arrow Keycap */}
        <div className="ml-1 px-1.5 py-1 rounded-lg bg-gradient-to-b from-[#FFFFFF] to-[#DDE3D7] border border-[#BAC1B3] shadow-[0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:bg-[#285C7A] group-hover:text-white group-hover:border-[#173F58] transition-all flex items-center gap-1">
          <kbd className="text-[9px] font-bold text-[#667078] group-hover:text-white/90">/[ key ]</kbd>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* DEEP 3D FLOATING SPATIAL SLAB MODAL */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-3 w-[92vw] sm:w-[500px] md:w-[560px] rounded-3xl bg-[#F8FAF6] border-2 border-[#B4BEAF] shadow-[0_35px_100px_rgba(15,23,42,0.38),0_15px_35px_rgba(15,23,42,0.22),inset_0_1.5px_1px_rgba(255,255,255,0.95)] z-50 overflow-hidden backdrop-blur-2xl animate-fadeIn transform transition-all">
          
          {/* 3D METALLIC BEVEL HEADER BAR */}
          <div className="p-4 bg-gradient-to-b from-[#FFFFFF] via-[#F2F5ED] to-[#E3E8DD] border-b-2 border-[#C0C8BA] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs font-bold text-[#182027]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-b from-[#285C7A] to-[#173F58] text-white shadow-[0_4px_12px_rgba(40,92,122,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] border border-[#102B3C]">
                  <Globe className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <span className="font-extrabold text-[#182027] text-sm tracking-tight block">
                    18TH LOK SABHA JURISDICTION SEARCH
                  </span>
                  <span className="text-[10px] text-[#667078] font-mono font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#398265] animate-ping" />
                    <span>543 PARLIAMENTARY SEATS DIRECTORY</span>
                  </span>
                </div>
              </div>

              {/* 3D Live Match Telemetry Badge */}
              <div className="bg-gradient-to-b from-white to-[#EAEFE6] border border-[#BFC8B9] shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] text-[#285C7A] text-[10px] font-mono px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#C88A25]" />
                <span>{filteredConstituencies.length} MATCHES</span>
              </div>
            </div>

            {/* ULTRA-TACTILE 3D RECESSED SEARCH TRENCH */}
            <div className="mt-3.5 relative group">
              <div className="absolute left-3.5 top-3 flex items-center gap-1.5 text-[#285C7A] transition-transform group-focus-within:scale-110">
                <Search className="w-4 h-4 text-[#285C7A] drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type constituency, MP (Modi, Rahul), party (BJP, TDP), or state..."
                className="w-full pl-10 pr-24 py-3 text-xs bg-gradient-to-b from-[#FAFBF8] to-[#EEF2EA] border-2 border-[#B8C2B3] rounded-2xl text-[#182027] placeholder-[#78828A] font-sans shadow-[inset_0_3px_6px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(0,0,0,0.06)] focus:outline-none focus:bg-white focus:border-[#285C7A] focus:ring-4 focus:ring-[#285C7A]/25 transition-all duration-200"
                autoFocus
              />

              {/* 3D Action & Telemetry Controls Inside Search Bar */}
              <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1.5 rounded-xl bg-gradient-to-b from-[#FFFFFF] to-[#E2E7DC] hover:from-[#E2E7DC] hover:to-[#D4DBD0] border border-[#BAC1B3] text-[#4A525A] shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:translate-y-0.5 transition flex items-center gap-1"
                    title="Clear search (ESC)"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono font-bold hidden sm:inline">ESC</span>
                  </button>
                ) : (
                  <div className="px-2 py-1 rounded-lg bg-[#E2E7DC]/80 border border-[#CBD3C5] text-[9px] font-mono font-bold text-[#667078] flex items-center gap-1 shadow-inner">
                    <span>Use ↑↓ to navigate</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3D STATE QUICK-FILTER KEYCAPS (HORIZONTAL TACTILE BAR) */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-[#C5CBC0] scrollbar-track-transparent select-none">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#667078] font-bold shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-[#285C7A]" /> STATE:
              </span>
              {STATE_FILTERS.map((st) => {
                const isActive = activeStateTab.toLowerCase() === st.code.toLowerCase() || (st.code === 'ALL' && activeStateTab === 'ALL');
                return (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => {
                      setActiveStateTab(st.code === 'ALL' ? 'ALL' : st.code);
                      setSearchQuery('');
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all duration-200 select-none flex items-center gap-1 ${
                      isActive
                        ? 'bg-gradient-to-b from-[#173F58] to-[#285C7A] text-white shadow-[0_4px_10px_rgba(23,63,88,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] border border-[#102B3C] -translate-y-0.5 ring-2 ring-[#285C7A]/20'
                        : 'bg-gradient-to-b from-white via-[#FAFBF8] to-[#E5EADF] text-[#4A525A] border border-[#C5CBC0] shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-[#F0F4EC] hover:text-[#182027] hover:-translate-y-0.5 active:translate-y-0.5'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-white/25 text-white' : 'bg-[#DCE2D7] text-[#556068]'}`}>
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D CARDS SCROLLABLE CONTAINER */}
          <div
            ref={listContainerRef}
            className="p-3 max-h-[390px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#C5CBC0] scrollbar-track-transparent bg-[#F2F5EE]"
          >
            {filteredConstituencies.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#667078] font-sans text-xs bg-gradient-to-b from-white to-[#F8FAF6] rounded-3xl border-2 border-[#DCE2D6] shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] space-y-3">
                <ShieldAlert className="w-9 h-9 text-[#C88A25] mx-auto opacity-80 animate-bounce" />
                <p className="font-extrabold text-[#182027] text-sm">No constituency or MP matching &quot;{searchQuery}&quot;</p>
                <p className="text-[11px] text-[#667078] max-w-sm mx-auto">
                  Try typing by MP name (e.g., &quot;Modi&quot;, &quot;Rahul&quot;, &quot;Tejasvi&quot;), State (&quot;UP&quot;, &quot;Bihar&quot;), or party name.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveStateTab('ALL'); inputRef.current?.focus(); }}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-b from-[#285C7A] to-[#173F58] text-white font-mono text-[11px] font-bold shadow-[0_4px_12px_rgba(40,92,122,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110 active:translate-y-0.5 transition"
                >
                  RESET FILTERS &amp; SEARCH
                </button>
              </div>
            ) : (
              filteredConstituencies.map((c, index) => {
                const isSelected = c.id === selected.id;
                const isHighlighted = index === highlightedIndex;
                const pStyle = getPartyBadgeStyle(c.mpParty);
                const sanctionedCr = (c.sanctionedAmount / 10000000).toFixed(1);

                return (
                  <button
                    key={c.code}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 select-none group relative ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-white via-[#F0F6FA] to-white border-2 border-[#285C7A] shadow-[0_12px_28px_rgba(40,92,122,0.22),inset_0_1px_0_rgba(255,255,255,1)] -translate-y-0.5 scale-[1.008]'
                        : isSelected
                        ? 'bg-gradient-to-r from-[#285C7A]/12 via-[#285C7A]/5 to-white border-l-4 border-l-[#285C7A] border-y border-r border-[#285C7A]/30 shadow-[0_8px_20px_rgba(40,92,122,0.14)]'
                        : 'bg-gradient-to-r from-white via-[#FAFCF8] to-[#F2F6ED] border border-[#DCE2D6] shadow-[0_3px_8px_rgba(24,32,39,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_8px_22px_rgba(24,32,39,0.12)] hover:border-[#285C7A]/60 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title & MP Badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-extrabold text-sm tracking-tight ${isHighlighted || isSelected ? 'text-[#285C7A]' : 'text-[#182027] group-hover:text-[#285C7A]'} transition-colors`}>
                            {c.shortName}
                          </span>
                          <span className="text-[10px] font-mono text-[#667078] font-semibold">
                            {c.state}
                          </span>

                          {c.mpName && (
                            <span className={`inline-flex items-center gap-1.5 text-[9.5px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border shadow-sm ${pStyle.badge}`}>
                              <span className={`w-2 h-2 rounded-full ${pStyle.dot}`} />
                              <span>MP: {c.mpName}</span>
                              {c.mpParty && <span className="opacity-75 font-normal">({c.mpParty})</span>}
                            </span>
                          )}
                        </div>

                        {/* Metadata specs */}
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#667078] mt-1.5">
                          <span className="bg-gradient-to-b from-[#EAEFE6] to-[#DDE4D8] text-[#285C7A] font-extrabold px-2 py-0.5 rounded-md border border-[#CBD3C5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            {c.code}
                          </span>
                          <span>&bull;</span>
                          <span className="font-semibold text-[#182027]">{c.count}</span>
                          <span>&bull;</span>
                          <span className="text-[#398265] font-extrabold">₹{sanctionedCr} Cr Sanctioned</span>
                        </div>
                      </div>

                      {/* Right Indicator & 3D Tactile Selection Key */}
                      <div className="flex flex-col items-end justify-between shrink-0 h-full self-center">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-b from-[#285C7A] to-[#173F58] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(40,92,122,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className={`text-[10px] font-mono px-2.5 py-1 rounded-xl font-bold transition-all duration-200 border flex items-center gap-1 ${
                            isHighlighted
                              ? 'bg-gradient-to-b from-[#285C7A] to-[#173F58] text-white border-[#102B3C] shadow-[0_3px_8px_rgba(40,92,122,0.3)] scale-105'
                              : 'bg-gradient-to-b from-[#F2F6ED] to-[#E2E8DC] text-[#4A525A] border border-[#C5CBC0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] group-hover:bg-[#285C7A] group-hover:text-white group-hover:border-[#173F58]'
                          }`}>
                            <span>SELECT</span>
                            <span className="text-[9px] opacity-80">↵</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* 3D FOOTER STATUS BAR WITH KEYBOARD INSTRUCTIONS */}
          <div className="px-4 py-2.5 bg-gradient-to-b from-[#EAEFE6] via-[#E2E8DC] to-[#D8DFD1] border-t-2 border-[#C0C8BA] flex items-center justify-between text-[10px] font-mono text-[#667078] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#398265] animate-pulse shadow-[0_0_6px_#398265]" />
              <span className="font-extrabold text-[#182027]">18TH LOK SABHA INTELLIGENCE PIPELINE</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[#667078]">
                <kbd className="bg-white border border-[#BFC8B9] px-1 py-0.5 rounded text-[8px] font-bold shadow-xs">↑↓</kbd> navigate &bull; <kbd className="bg-white border border-[#BFC8B9] px-1 py-0.5 rounded text-[8px] font-bold shadow-xs">↵</kbd> select
              </span>
              <span>
                Showing <span className="font-extrabold text-[#285C7A] text-xs">{filteredConstituencies.length}</span> / 543 Seats
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}


