import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import StatusButtons from '@/components/StatusButtons';
import { getCurrentProfile } from '@/lib/auth';
import { getInHandStockKey, retailHeaderFields, retailItems } from '@/lib/retailRequisitionFields';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100  text-red-700'   },
};

export default async function RequisitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');

  const supabase = supabaseAdmin();
  const { data: submission } = await supabase.from('form_submissions').select('*').eq('id', id).single();
  if (!submission) notFound();
  if (profile.role !== 'super_admin' && submission.region !== profile.region) notFound();

  const { data: values } = await supabase.from('form_submission_values').select('*').eq('submission_id', id);
  const valueMap = Object.fromEntries((values || []).map((v: any) => [v.field_key, v.value || '']));

  const status = submission.status as string;
  const badge = statusConfig[status] ?? { label: status, classes: 'bg-slate-100 text-slate-600' };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNav role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
            <Link href="/dashboard/requisitions" className="hover:text-red-600 transition">Requisitions</Link>
            <span>/</span>
            <span className="text-slate-600">Detail</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Requisition Detail</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.classes}`}>{badge.label}</span>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-6">

          {/* Meta + Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted</p>
              <p className="text-sm font-semibold text-slate-800">
                {submission.created_at && new Date(submission.created_at).toLocaleString()}
              </p>
            </div>
            <StatusButtons id={id} />
          </div>

          {/* Requester Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Requester Details</h2>
            </div>
            <div className="p-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {retailHeaderFields.map((field) => (
                <div key={field.key} className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{field.label}</p>
                  <p className="font-semibold text-slate-900">{valueMap[field.key] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Submitted Items</h2>
              <span className="text-lg font-extrabold text-red-600">
                Grand Total: {valueMap.GrandTotal || '0.00'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-slate-900 text-left">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Item</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">In Hand Stock</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Quantity</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Price</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {retailItems.map((item, i) => (
                    <tr key={item.key} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}>
                      <td className="px-5 py-3 font-semibold text-slate-800">{item.label}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{valueMap[getInHandStockKey(item.key)] || '0'}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{valueMap[item.key] || '0'}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{valueMap[item.priceKey] || '0.00'}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">{valueMap[item.totalKey] || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
