import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import FieldManager from '@/components/FieldManager';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function FormFieldsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  if (profile.role !== 'super_admin') redirect('/dashboard/requisitions');

  const supabase = supabaseAdmin();
  const { data: fields } = await supabase.from('form_fields').select('*').order('sort_order', { ascending: true });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Form Fields</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Manage requisition form fields
          </div>
        </header>
        <main className="flex-1 p-8">
          <FieldManager fields={fields || []} />
        </main>
      </div>
    </div>
  );
}
