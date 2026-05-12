'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  {
    href: '/dashboard/requisitions',
    label: 'Requisitions',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: ['admin', 'head', 'super_admin'],
  },
  {
    href: '/dashboard/form-fields',
    label: 'Form Fields',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    roles: ['super_admin'],
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ['super_admin'],
  },
];

const LOGO = 'https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t';

export default function DashboardNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const filteredItems = navItems.filter((item) => item.roles.includes(role || ''));

  const navLinks = (onNav?: () => void) =>
    filteredItems.map((item) => {
      const active = pathname === item.href || pathname.startsWith(item.href + '/');
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNav}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            active
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {item.icon}
          {item.label}
          {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
        </Link>
      );
    });

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-72 flex-shrink-0 bg-slate-900 min-h-screen flex-col">
        <div className="px-6 py-6 border-b border-slate-700/60">
          <Link href="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Logo" className="h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>
        <div className="px-6 pt-6 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Navigation</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">{navLinks()}</nav>
        <div className="px-3 pb-6 pt-4 border-t border-slate-700/60 mt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-700/60">
        <Link href="/" className="flex items-center gap-2">
          <img src={LOGO} alt="Logo" className="h-9 w-auto brightness-0 invert opacity-90" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-slate-300 hover:text-white transition"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Drawer panel */}
          <div className="w-72 max-w-[85vw] bg-slate-900 flex flex-col shadow-2xl">
            <div className="px-4 py-4 border-b border-slate-700/60 flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <img src={LOGO} alt="Logo" className="h-9 w-auto brightness-0 invert opacity-90" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 pt-5 pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Navigation</span>
            </div>
            <nav className="flex-1 px-3 space-y-1">{navLinks(() => setOpen(false))}</nav>
            <div className="px-3 pb-6 pt-4 border-t border-slate-700/60 mt-4">
              <LogoutButton />
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
