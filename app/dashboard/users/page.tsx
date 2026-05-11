import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import UsersManager from '@/components/UsersManager';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  if (profile.role !== 'super_admin') redirect('/dashboard/requisitions');

  const supabase = supabaseAdmin();
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'head'])
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Users</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage dashboard users
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <UsersManager users={users || []} />
        </main>
      </div>
    </div>
  );
}
