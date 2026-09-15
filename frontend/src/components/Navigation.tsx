'use client';

import React, { useState, useEffect } from 'react';
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
  User,
  AlertTriangle,
  Layers,
  Home,
  ChevronRight,
} from 'lucide-react';
import { LANDING_IMAGES } from '@/lib/landingAssets';
import ConstituencySelector from '@/components/ConstituencySelector';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; agency: string } | null>(null);

  useEffect(() => {
    // Check localStorage auth
    const savedUser = localStorage.getItem('mplad_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Fallback demo user
        setUser({
          name: 'R. K. Verma',
          role: 'Senior Vigilance Officer',
          agency: 'District Vigilance & Anti-Corruption Bureau',
        });
      }
    } else {
      setUser({
        name: 'R. K. Verma',
        role: 'Senior Vigilance Officer',
        agency: 'District Vigilance & Anti-Corruption Bureau',
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mplad_user');
    router.push('/login');
  };

  // Skip nav wrapper on login page or landing page (landing has its custom header)
  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/queue', label: 'Investigation Queue', icon: ShieldAlert, badge: '0-100 Score' },
    { href: '/agencies', label: 'Agency Directory', icon: Building2 },
    { href: '/map', label: 'GIS Spatial Map', icon: MapPin },
    { href: '/assistant', label: 'AI Investigation Assistant', icon: Bot, badge: 'RAG' },
    { href: '/reports', label: 'Reports & Export', icon: FileText },
    { href: '/guidelines', label: 'MoSPI Norms & Library', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Main Header */}
      <header className="bg-gov-900 text-white border-b border-gov-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400 shadow-lg shrink-0">
                <img src={LANDING_IMAGES.logoShield} alt="3D Shield Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white">MPLAD-GUARD AI</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                    LIVE MVP
                  </span>
                </div>
                <p className="text-[11px] text-gov-300 tracking-wide">
                  Explainable Investigation Intelligence for MPLADS
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-gov-800">
              <ConstituencySelector variant="header" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gov-200 hover:text-white hover:bg-gov-800 transition-colors border border-gov-700"
              title="Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Main Website</span>
            </Link>
            {user && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user.name}</span>
                <span className="text-[10px] text-gov-300">{user.role}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gov-200 hover:text-white hover:bg-gov-800 transition-colors border border-gov-700"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* App Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3 space-y-1 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Investigation Modules
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gov-900 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-gov-800 text-gov-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-gov-900 font-bold text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-gov-600" />
                  <span>5-STEP PARADIGM</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono leading-tight">
                  COMPARE &rarr; PROFILE &rarr; CONNECT &rarr; EXPLAIN &rarr; VERIFY
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
