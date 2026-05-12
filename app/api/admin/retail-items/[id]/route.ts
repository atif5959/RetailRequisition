import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as Partial<{ label: string; price: number }>;
  const update: Record<string, unknown> = {};
  if (body.label !== undefined) update.label = String(body.label).trim();
  if (body.price !== undefined) update.price = Number(body.price);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('retail_items').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from('retail_items')
    .update({ is_active: false })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
