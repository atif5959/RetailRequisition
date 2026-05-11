import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  if (profile.role !== 'super_admin') redirect('/dashboard/requisitions');
  const supabase = supabaseAdmin();
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return <div className="md:flex min-h-screen -m-6"><DashboardNav role={profile.role} /><main className="flex-1 p-6"><h1 className="text-2xl font-bold mb-6">Dashboard Users</h1><div className="bg-white rounded-2xl shadow p-5"><p className="text-slate-600 mb-4">Create users from Supabase Authentication, then add/update their role in the profiles table.</p><table className="w-full text-sm"><thead className="text-left bg-slate-100"><tr><th className="p-3">Email</th><th>Role</th><th>Created</th></tr></thead><tbody>{(users || []).map((u: any) => <tr key={u.id} className="border-t"><td className="p-3">{u.email}</td><td>{u.role}</td><td>{u.created_at && new Date(u.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></main></div>;
}
