import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { isPakistanRegion } from '@/lib/regions';
import { supabaseAdmin } from '@/lib/supabaseClient';

const validRoles = new Set(['admin', 'head', 'super_admin']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can update users.' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = supabaseAdmin();
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (existingProfileError) {
    return NextResponse.json({ error: existingProfileError.message }, { status: 404 });
  }

  if (existingProfile?.role === 'super_admin') {
    return NextResponse.json({ error: 'Super admin users cannot be edited from the UI.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const role = String(body?.role || 'admin');
  const region = String(body?.region || '').trim() || null;
  const password = String(body?.password || '');

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  if (!validRoles.has(role)) return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  if (password && password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }
  if (role === 'super_admin') {
    return NextResponse.json({ error: 'Users cannot be promoted to super admin from the UI.' }, { status: 403 });
  }
  if (!isPakistanRegion(region)) return NextResponse.json({ error: 'Please select a valid region.' }, { status: 400 });

  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    email,
    ...(password ? { password } : {}),
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email, role, region })
    .eq('id', id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
