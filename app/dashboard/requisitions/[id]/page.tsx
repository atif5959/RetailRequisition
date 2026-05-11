import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import StatusButtons from '@/components/StatusButtons';
import { getCurrentProfile } from '@/lib/auth';
import { retailFieldLabels, retailHeaderFields, retailItems } from '@/lib/retailRequisitionFields';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function RequisitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');
  const supabase = supabaseAdmin();
  const { data: submission } = await supabase.from('form_submissions').select('*').eq('id', id).single();
  const { data: values } = await supabase.from('form_submission_values').select('*').eq('submission_id', id);
  const valueMap = Object.fromEntries((values || []).map((value: any) => [value.field_key, value.value || '']));

  return (
    <div className="md:flex min-h-screen -m-6">
      <DashboardNav role={profile.role} />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">Requisition Detail</h1>
        <div className="bg-white rounded-2xl shadow p-5 space-y-3">
          <p><b>Status:</b> {submission?.status}</p>
          <p><b>Created:</b> {submission?.created_at && new Date(submission.created_at).toLocaleString()}</p>
          <StatusButtons id={id} />
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold mb-4">Requester Details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {retailHeaderFields.map((field) => (
              <div key={field.key} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">{field.label}</p>
                <p className="mt-1 font-medium text-slate-900">{valueMap[field.key] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
            <h2 className="font-semibold">Submitted Items</h2>
            <p className="text-lg font-bold text-red-700">Grand Total: {valueMap.GrandTotal || '0.00'}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {retailItems.map((item) => (
                  <tr key={item.key} className="border-t">
                    <td className="p-3 font-medium">{item.label}</td>
                    <td className="p-3 text-right">{valueMap[item.key] || '0'}</td>
                    <td className="p-3 text-right">{valueMap[item.priceKey] || '0.00'}</td>
                    <td className="p-3 text-right font-semibold">{valueMap[item.totalKey] || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold mb-4">Raw Saved Values</h2>
          {(values || []).map((v: any) => (
            <div key={v.id} className="border-b py-2">
              <b>{retailFieldLabels[v.field_key] || v.field_key}</b>
              <p>{v.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
