import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getRetailItems } from '@/lib/getRetailItems';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatAmount = (n: number) => fmt.format(n);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = supabaseAdmin();
  const { data: submission } = await supabase
    .from('form_submissions')
    .select('id, status, region')
    .eq('id', id)
    .single();

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (submission.status !== 'pending')
    return NextResponse.json({ error: 'Only pending submissions can be edited' }, { status: 400 });
  if (profile.role !== 'super_admin' && submission.region !== profile.region)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { quantities } = (await req.json()) as { quantities: Record<string, string> };

  const items = await getRetailItems();
  let grandTotal = 0;
  const updates: { field_key: string; value: string }[] = [];

  for (const item of items) {
    const qty = Math.max(0, Number(quantities[item.key]) || 0);
    const total = qty * item.price;
    grandTotal += total;
    updates.push({ field_key: item.key,      value: qty > 0 ? String(qty) : '' });
    updates.push({ field_key: item.totalKey, value: formatAmount(total) });
  }
  updates.push({ field_key: 'GrandTotal', value: formatAmount(grandTotal) });

  await Promise.all(
    updates.map(({ field_key, value }) =>
      supabase
        .from('form_submission_values')
        .update({ value })
        .eq('submission_id', id)
        .eq('field_key', field_key),
    ),
  );

  return NextResponse.json({ success: true, grandTotal: formatAmount(grandTotal) });
}
