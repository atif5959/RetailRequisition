import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { isPakistanRegion } from '@/lib/regions';
import { supabaseAdmin } from '@/lib/supabaseClient';

const superAdminValidRoles = new Set(['admin', 'head', 'employee', 'super_admin']);
const headValidRoles       = new Set(['admin', 'employee']);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'head')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = supabaseAdmin();
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('role, region')
    .eq('id', id)
    .single();

  if (existingProfileError) {
    return NextResponse.json({ error: existingProfileError.message }, { status: 404 });
  }

  if (existingProfile?.role === 'super_admin') {
    return NextResponse.json({ error: 'Super admin users cannot be edited from the UI.' }, { status: 403 });
  }

  if (profile.role === 'head') {
    if (!headValidRoles.has(existingProfile?.role)) {
      return NextResponse.json({ error: 'You can only edit Admin or Employee users.' }, { status: 403 });
    }
    if (existingProfile?.region !== profile.region) {
      return NextResponse.json({ error: 'You can only edit users within your own region.' }, { status: 403 });
    }
  }

  const body     = await req.json().catch(() => null);
  const role     = String(body?.role     || 'admin');
  const region   = String(body?.region   || '').trim() || null;
  const password = String(body?.password || '');

  if (profile.role === 'head') {
    if (!headValidRoles.has(role)) {
      return NextResponse.json({ error: 'You can only assign Admin or Employee roles.' }, { status: 403 });
    }
    if (region !== profile.region) {
      return NextResponse.json({ error: 'You cannot change a user\'s region.' }, { status: 403 });
    }
  } else {
    if (!superAdminValidRoles.has(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }
    if (role === 'super_admin') {
      return NextResponse.json({ error: 'Users cannot be promoted to super admin from the UI.' }, { status: 403 });
    }
    if (!isPakistanRegion(region)) {
      return NextResponse.json({ error: 'Please select a valid region.' }, { status: 400 });
    }
  }

  if (password && password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  /* ── Employee: empCode required (digits only); generate system auth email ── */
  const isEmployee = role === 'employee';
  let authEmail: string;
  let displayEmail: string;

  if (isEmployee) {
    const raw     = String(body?.email || '').trim();
    const empCode = raw.replace(/\D/g, '');
    if (!empCode) {
      return NextResponse.json({ error: 'Emp Code is required for Employee role.' }, { status: 400 });
    }
    if (empCode !== raw) {
      return NextResponse.json(
        { error: 'Employee role requires a numeric Emp Code only — letters and special characters are not allowed.' },
        { status: 400 },
      );
    }
    authEmail    = `emp${empCode}@emp.internal`;
    displayEmail = empCode;
  } else {
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    authEmail    = email;
    displayEmail = email;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(id, {
    email: authEmail,
    ...(password ? { password } : {}),
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email: displayEmail, role, region })
    .eq('id', id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
