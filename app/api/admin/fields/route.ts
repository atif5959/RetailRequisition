import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = supabaseAdmin();
  const { error } = await supabase.from('form_fields').insert({ ...body, is_active: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
