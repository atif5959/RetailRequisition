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
  return <div className="md:flex min-h-screen -m-6"><DashboardNav role={profile.role} /><main className="flex-1 p-6"><h1 className="text-2xl font-bold mb-6">Manage Form Fields</h1><FieldManager fields={fields || []} /></main></div>;
}
