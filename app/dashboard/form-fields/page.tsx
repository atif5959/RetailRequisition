import { redirect } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import DashboardNav from '@/components/DashboardNav';
import FieldManager from '@/components/FieldManager';
import { getCurrentProfile } from '@/lib/auth';
import { getRetailItemRows } from '@/lib/getRetailItems';

export const dynamic = 'force-dynamic';

export default async function FormFieldsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return <LoginModal />;
  if (profile.role !== 'super_admin') redirect('/dashboard/requisitions');

  const items = await getRetailItemRows();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Form Items</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Manage items and prices on the requisition form
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <FieldManager items={items} />
        </main>
      </div>
    </div>
  );
}
