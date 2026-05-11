import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  if (!['pending', 'approved', 'rejected'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data: submission } = await supabase.from('form_submissions').select('id, region').eq('id', id).single();
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (profile.role !== 'super_admin' && submission.region !== profile.region) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('form_submissions').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
