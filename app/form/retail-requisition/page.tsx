import type { Metadata } from 'next';
import Link from 'next/link';
import RetailRequisitionForm from '@/components/RetailRequisitionForm';
import FormLogoutButton from '@/components/FormLogoutButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import LoginModal from '@/components/LoginModal';
import { getRetailItems } from '@/lib/getRetailItems';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Submit a Retail Requisition',
  description:
    'Fill in your route code, employee details, and stock quantities to submit a retail requisition request for approval.',
  alternates: { canonical: '/form/retail-requisition' },
  openGraph: {
    title: 'Submit a Retail Requisition',
    description: 'Fill in your details and stock quantities to submit a retail requisition.',
    url: '/form/retail-requisition',
  },
};

export default async function RetailFormPage() {
  const profile = await getCurrentProfile();
  const items   = await getRetailItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">

      {/* Login modal — shown as overlay when not authenticated */}
      {!profile && <LoginModal />}

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="Logo"
              className="h-11 w-auto dark:brightness-0 dark:invert dark:opacity-80"
            />
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
          {profile && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {profile.email}
              </span>
              {profile.role !== 'employee' && (
                <Link
                  href="/dashboard/requisitions"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
              <FormLogoutButton />
            </div>
          )}
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Submit</p>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Retail Requisition</h1>
        </div>
      </div>

      {/* Form — only rendered when authenticated */}
      {profile && (
        <main className="flex-1 py-6 sm:py-8 px-3 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <RetailRequisitionForm
              items={items}
              currentUser={{ id: profile.id, email: profile.email, role: profile.role, region: profile.region ?? null }}
            />
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-center text-xs">
        © 2025 Retail Requisition System. All rights reserved.
      </footer>
    </div>
  );
}
