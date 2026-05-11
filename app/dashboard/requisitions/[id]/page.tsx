import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import StatusButtons from '@/components/StatusButtons';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function RequisitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  const supabase = supabaseAdmin();
  const { data: submission } = await supabase.from('form_submissions').select('*').eq('id', id).single();
  const { data: values } = await supabase.from('form_submission_values').select('*').eq('submission_id', id);

  return <div className="md:flex min-h-screen -m-6"><DashboardNav role={profile.role} /><main className="flex-1 p-6 space-y-6"><h1 className="text-2xl font-bold">Requisition Detail</h1><div className="bg-white rounded-2xl shadow p-5 space-y-3"><p><b>Status:</b> {submission?.status}</p><p><b>Created:</b> {submission?.created_at && new Date(submission.created_at).toLocaleString()}</p><StatusButtons id={id} /></div><div className="bg-white rounded-2xl shadow p-5"><h2 className="font-semibold mb-4">Submitted Values</h2>{(values || []).map((v: any) => <div key={v.id} className="border-b py-2"><b>{v.field_key}</b><p>{v.value}</p></div>)}</div></main></div>;
}
