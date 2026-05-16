import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import LoginModal from '@/components/LoginModal';
import DashboardNav from '@/components/DashboardNav';
import StatusButtons from '@/components/StatusButtons';
import QuantityEditor from '@/components/QuantityEditor';
import { getCurrentProfile } from '@/lib/auth';
import { retailHeaderFields } from '@/lib/retailRequisitionFields';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getRetailItems } from '@/lib/getRetailItems';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100  text-red-700'   },
};

export default async function RequisitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return <LoginModal />;
  if (profile.role === 'employee') redirect('/form/retail-requisition');

  const supabase = supabaseAdmin();
  const { data: submission } = await supabase.from('form_submissions').select('*').eq('id', id).single();
  if (!submission) notFound();
  if (profile.role !== 'super_admin' && submission.region !== profile.region) notFound();

  const { data: values } = await supabase.from('form_submission_values').select('*').eq('submission_id', id);
  const valueMap = Object.fromEntries((values || []).map((v: any) => [v.field_key, v.value || '']));

  const items = await getRetailItems();

  const status = submission.status as string;
  const badge = statusConfig[status] ?? { label: status, classes: 'bg-slate-100 text-slate-600' };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-semibold mb-1">
            <Link href="/dashboard/requisitions" className="hover:text-red-600 transition">Requisitions</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-400">Detail</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Requisition Detail</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.classes}`}>{badge.label}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-4 sm:space-y-6">

          {/* Meta + Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Submitted</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {submission.created_at && new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
            <StatusButtons id={id} />
          </div>

          {/* Requester Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-slate-900 dark:text-white">Requester Details</h2>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {retailHeaderFields.map((field) => (
                <div key={field.key} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{field.label}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{valueMap[field.key] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <QuantityEditor
            submissionId={id}
            isPending={status === 'pending'}
            valueMap={valueMap}
            items={items}
          />

        </main>
      </div>
    </div>
  );
}
