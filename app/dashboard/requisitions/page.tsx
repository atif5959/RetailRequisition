import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import RequisitionsTable from '@/components/RequisitionsTable';
import { getCurrentProfile } from '@/lib/auth';
import { getRetailItems } from '@/lib/getRetailItems';

export const dynamic = 'force-dynamic';

export default async function RequisitionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');

  const items = await getRetailItems();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Requisitions</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All submitted requisitions
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <RequisitionsTable role={profile.role} items={items} />
        </main>
      </div>
    </div>
  );
}
