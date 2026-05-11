'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  {
    href: '/dashboard/requisitions',
    label: 'Requisitions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: ['admin', 'head', 'super_admin'],
  },
  {
    href: '/dashboard/form-fields',
    label: 'Form Fields',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    roles: ['super_admin'],
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ['super_admin'],
  },
];

export default function DashboardNav({ role }: { role?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/60">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
            alt="Logo"
            className="h-9 w-auto brightness-0 invert opacity-90"
          />
          <span className="font-extrabold text-lg text-white tracking-tight">RetailReq</span>
        </Link>
      </div>

      {/* Nav label */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Navigation</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems
          .filter((item) => item.roles.includes(role || ''))
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* Divider + Logout */}
      <div className="px-3 pb-6 pt-4 border-t border-slate-700/60 mt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
