import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getCurrentProfile } from '@/lib/auth';
import { getInHandStockKey, requiredRetailFieldKeys, retailFieldLabels, retailHeaderFields, retailItems, retailSubmissionFieldOrder } from '@/lib/retailRequisitionFields';
import { isPakistanRegion } from '@/lib/regions';

function formatAmount(value: number) {
  return value.toFixed(2);
}

function normalizeQuantity(value: unknown) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: 'You must be logged in to submit a requisition.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const values = body.values || {};
  if (!values || typeof values !== 'object') {
    return NextResponse.json({ error: 'Invalid form values.' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const normalizedValues: Record<string, string> = {};

  for (const fieldKey of requiredRetailFieldKeys) {
    const value = String(values[fieldKey] ?? '').trim();
    if (!value) {
      return NextResponse.json({ error: `${retailFieldLabels[fieldKey]} is required.` }, { status: 400 });
    }
    normalizedValues[fieldKey] = value;
  }

  for (const field of retailHeaderFields) {
    normalizedValues[field.key] = String(values[field.key] ?? '').trim();
  }

  if (!isPakistanRegion(normalizedValues.Region)) {
    return NextResponse.json({ error: 'Please select a valid region.' }, { status: 400 });
  }

  let grandTotal = 0;
  for (const item of retailItems) {
    const stockKey = getInHandStockKey(item.key);
    const stock = normalizeQuantity(values[stockKey]);
    const quantity = normalizeQuantity(values[item.key]);
    if (stock === null) {
      return NextResponse.json({ error: `${item.label} in hand stock must be zero or greater.` }, { status: 400 });
    }
    if (quantity === null) {
      return NextResponse.json({ error: `${item.label} quantity must be zero or greater.` }, { status: 400 });
    }

    const total = quantity * item.price;
    grandTotal += total;
    normalizedValues[stockKey] = String(stock);
    normalizedValues[item.key] = String(quantity);
    normalizedValues[item.priceKey] = formatAmount(item.price);
    normalizedValues[item.totalKey] = formatAmount(total);
  }
  normalizedValues.GrandTotal = formatAmount(grandTotal);

  const { data: submission, error } = await supabase
    .from('form_submissions')
    .insert({ status: 'pending', region: normalizedValues.Region })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = [
    ...retailSubmissionFieldOrder.map((field_key) => ({
      submission_id: submission.id,
      field_key,
      value: normalizedValues[field_key] ?? '',
    })),
    { submission_id: submission.id, field_key: 'SubmittedById',    value: profile.id },
    { submission_id: submission.id, field_key: 'SubmittedByEmail', value: profile.email },
    { submission_id: submission.id, field_key: 'SubmittedByRole',  value: profile.role },
  ];

  const { error: valueError } = await supabase.from('form_submission_values').insert(rows);
  if (valueError) {
    await supabase.from('form_submissions').delete().eq('id', submission.id);
    return NextResponse.json({ error: valueError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: submission.id });
}
