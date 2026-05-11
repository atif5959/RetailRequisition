import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function RequisitionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  const supabase = supabaseAdmin();
  const { data } = await supabase.from('form_submissions').select('*').order('created_at', { ascending: false });

  return (
    <div className="md:flex min-h-screen -m-6">
      <DashboardNav role={profile.role} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Requisitions</h1>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr><th className="p-3">ID</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {(data || []).map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.id.slice(0, 8)}</td>
                  <td className="capitalize">{row.status}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td><Link className="text-blue-600" href={`/dashboard/requisitions/${row.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
