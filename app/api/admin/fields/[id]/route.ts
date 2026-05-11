import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseAdmin();
  const { error } = await supabase.from('form_fields').update({ is_active: false }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
