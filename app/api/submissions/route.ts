import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { requiredRetailFieldKeys } from '@/lib/retailRequisitionFields';

export async function POST(req: Request) {
  const body = await req.json();
  const values = body.values || {};
  const supabase = supabaseAdmin();

  for (const fieldKey of requiredRetailFieldKeys) {
    if (values[fieldKey] === undefined || values[fieldKey] === '') {
      return NextResponse.json({ error: `${fieldKey} is required.` }, { status: 400 });
    }
  }

  const { data: submission, error } = await supabase
    .from('form_submissions')
    .insert({ status: 'pending' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = Object.entries(values).map(([field_key, value]) => ({
    submission_id: submission.id,
    field_key,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));

  const { error: valueError } = await supabase.from('form_submission_values').insert(rows);
  if (valueError) return NextResponse.json({ error: valueError.message }, { status: 500 });

  return NextResponse.json({ success: true, id: submission.id });
}
