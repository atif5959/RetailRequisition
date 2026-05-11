import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const values = body.values || {};
  const supabase = supabaseAdmin();

  const { data: fields, error: fieldError } = await supabase.from('form_fields').select('*').eq('is_active', true);
  if (fieldError) return NextResponse.json({ error: fieldError.message }, { status: 500 });

  for (const field of fields || []) {
    if (field.required && (values[field.field_key] === undefined || values[field.field_key] === '')) {
      return NextResponse.json({ error: `${field.label} is required.` }, { status: 400 });
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
