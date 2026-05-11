import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { isPakistanRegion } from '@/lib/regions';
import { supabaseAdmin } from '@/lib/supabaseClient';

const validRoles = new Set(['admin', 'head']);

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can create users.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  const role = String(body?.role || 'admin');
  const region = String(body?.region || '').trim() || null;

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  if (!validRoles.has(role)) return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  if (!isPakistanRegion(region)) return NextResponse.json({ error: 'Please select a valid region.' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Unable to create auth user.' }, { status: 500 });
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email,
    role,
    region,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: authData.user.id });
}
