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
    <div className="md:flex min-h-screen -m-6">
      <DashboardNav role={profile.role} />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-2xl font-bold">Users</h1>
        <UsersManager users={users || []} />
      </main>
    </div>
  );
}
