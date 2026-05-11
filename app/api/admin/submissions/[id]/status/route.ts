import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  if (!['pending', 'approved', 'rejected'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const supabase = supabaseAdmin();
  const { error } = await supabase.from('form_submissions').update({ status }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
