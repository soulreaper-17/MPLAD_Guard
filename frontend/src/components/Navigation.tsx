'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  Building2,
  MapPin,
  Bot,
  FileText,
  BookOpen,
  LogOut,
  Home,
  ShieldCheck,
  Compass,
  User,
  ChevronDown,
} from 'lucide-react';
import ConstituencySelector from '@/components/ConstituencySelector';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; agency: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check localStorage auth
    const savedUser = localStorage.getItem('mplad_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mplad_user');
    router.push('/login');
  };

  // Skip nav wrapper on login page or landing page
  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/queue', label: 'Investigation Queue', icon: ShieldAlert, badge: '0-100' },
    { href: '/agencies', label: 'Agency Directory', icon: Building2 },
    { href: '/map', label: 'GIS Spatial Map', icon: MapPin },
    { href: '/assistant', label: 'AI Assistant', icon: Bot, badge: 'RAG' },
    { href: '/reports', label: 'Reports & Export', icon: FileText },
    { href: '/guidelines', label: 'Norms & Library', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen architectural-env flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans text-slate-800">
      
      {/* FLOATING ARCHITECTURAL COMMAND STRIP (HEADER) */}
      <header className="sticky top-0 z-50 bg-[#F5F6F3]/90 backdrop-blur-xl border-b border-[#E4E7E1]/80">
        <div className="max-w-[1650px] mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
          
          {/* Left branding & institutional identity with Ambient Indian Glow */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3.5 group indian-ambient-glow-wrapper">
              {/* Ambient Soft Saffron (Left) & Soft Green (Right) Light Glow */}
              <div className="indian-ambient-glow-bg" />

              <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <img 
                    src="/images/sevarth_main_logo.png" 
                    alt="Sevaarth AI" 
                    className="h-11 sm:h-12 w-auto mix-blend-multiply object-contain filter contrast-125" 
                  />
                  <span className="bg-[#285C7A]/10 text-[#285C7A] text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">
                    INTELLIGENCE
                  </span>
                </div>
                <p className="text-[10px] text-[#285C7A] font-mono tracking-wide uppercase emerge-text-hover font-semibold -mt-0.5">
                  PUBLIC EXPENDITURE INTELLIGENCE
                </p>
              </div>
            </Link>

            {/* Jurisdiction Selector Console */}
            <div className="hidden lg:flex items-center pl-6 border-l border-[#E4E7E1]">
              <ConstituencySelector variant="header" />
            </div>
          </div>

          {/* Right User Profile Console or Sign In Button */}
          {user ? (
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="tactile-light-switch flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-[#D2D7CE] bg-white shadow-xs hover:border-[#285C7A] transition group"
              >
                {/* Avatar Icon */}
                <div className="w-8 h-8 rounded-full bg-[#285C7A] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4 text-white" />
                </div>

                <div className="text-left font-mono hidden sm:block">
                  <div className="text-xs font-bold text-[#182027] leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-[#285C7A] font-medium leading-tight">
                    {user.role}
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-[#667078] transition-transform duration-200 ${profileOpen ? 'rotate-180 text-[#285C7A]' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border-2 border-[#D2D7CE] rounded-2xl shadow-2xl p-3 z-[999] font-mono animate-fadeIn">
                  <div className="p-3 bg-[#FAFAF7] rounded-xl border border-[#E4E7E1] space-y-1 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#182027]">
                      <ShieldCheck className="w-4 h-4 text-[#285C7A]" />
                      <span>{user.name}</span>
                    </div>
                    <div className="text-[10px] text-[#667078] font-sans">
                      {user.agency || 'Public expenditure intelligence portal'}
                    </div>
                    <div className="text-[9px] text-[#398265] font-mono font-bold uppercase pt-0.5">
                      {user.role}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#C45145] hover:bg-[#C45145]/10 flex items-center justify-between transition border border-transparent hover:border-[#C45145]/20"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-[#C45145]" />
                      <span>SIGN OUT OF WORKSPACE</span>
                    </span>
                    <span>&rarr;</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="tactile-light-switch-active px-5 py-2 rounded-full text-xs font-mono font-bold text-white bg-[#182027] hover:bg-[#285C7A] transition flex items-center gap-2 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-[#C88A25]" />
              <span>SIGN IN</span>
            </Link>
          )}

        </div>
      </header>

      {/* CLEAN PHYSICAL WARNING PANEL */}
      <div className="bg-[#ECEFEA] border-b border-[#E4E7E1] px-6 py-2.5">
        <div className="max-w-[1650px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2.5 text-[#C88A25]">
            <span className="w-2 h-2 rounded-full bg-[#398265] pulse-indicator" />
            <span className="font-bold uppercase tracking-wider text-[11px]">MPLADS INTELLIGENCE:</span>
            <span className="text-[#182027] text-[11px]">18th Lok Sabha Parliamentary Expenditure Dataset</span>
          </div>
          <div className="text-[#667078] text-[11px] flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C88A25] shrink-0" />
            <span>AI Priority Signal &rarr; Grounded Evidence &rarr; Mandatory Officer Physical Audit</span>
          </div>
        </div>
      </div>

      {/* MAIN SPATIAL WORKSPACE CONTAINER */}
      <div className="flex-1 flex max-w-[1650px] w-full mx-auto px-6 sm:px-8 py-8 gap-8 min-h-0">
        
        {/* SLIM FLOATING NAVIGATION RAIL (SIDEBAR) */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-28 space-y-6">
            
            {/* Floating Navigation Rail Frame */}
            <div className="floating-nav-rail p-3 space-y-1.5">
              <div className="px-3.5 py-2.5 flex items-center justify-between text-[10px] font-mono font-bold text-[#667078] uppercase tracking-widest border-b border-[#E4E7E1] mb-2">
                <span className="flex items-center gap-2 text-[#285C7A]">
                  <Compass className="w-4 h-4" />
                  <span>NAVIGATION</span>
                </span>
                <span className="text-[#9AA3AB]">v2.5</span>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'tactile-light-switch-active shadow-[0_8px_20px_rgba(23,63,88,0.2)] font-bold translate-x-1'
                        : 'text-[#667078] hover:text-[#182027] hover:bg-[#F5F6F3]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#9AA3AB] group-hover:text-[#285C7A]'}`} />
                      <span className="tracking-tight text-[12px]">{link.label}</span>
                    </div>

                    {link.badge && (
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-[#ECEFEA] text-[#667078] border border-[#E4E7E1]'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Methodological Reference Plaque */}
            <div className="recessed-light-display p-4 text-[11px] font-mono space-y-2">
              <div className="flex items-center gap-2 text-[#285C7A] font-bold text-[10px] tracking-wider uppercase">
                <span>PARADIGM PROTOCOL</span>
              </div>
              <p className="text-[#667078] text-[10px] leading-relaxed border-t border-[#E4E7E1] pt-2 font-sans">
                COMPARE &bull; PROFILE &bull; CONNECT &bull; EXPLAIN &bull; VERIFY
              </p>
            </div>

          </div>
        </aside>

        {/* PRIMARY SPATIAL WORKSPACE */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
