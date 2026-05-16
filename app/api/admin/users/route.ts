import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { isPakistanRegion } from '@/lib/regions';
import { supabaseAdmin } from '@/lib/supabaseClient';

const superAdminRoles = new Set(['admin', 'head', 'employee']);
const headRoles       = new Set(['admin', 'employee']);

export async function POST(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'head')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const body     = await req.json().catch(() => null);
  const role     = String(body?.role     || 'admin');
  const region   = String(body?.region   || '').trim() || null;
  const password = String(body?.password || '');

  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

  /* For employees: empCode is the identifier; generate a system auth email */
  const isEmployee = role === 'employee';
  const empCode    = isEmployee ? String(body?.empCode || '').replace(/\D/g, '') : '';
  const email      = isEmployee
    ? `emp${empCode}@emp.internal`
    : String(body?.email || '').trim().toLowerCase();
  const displayEmail = isEmployee ? empCode : email;

  if (isEmployee && !empCode) return NextResponse.json({ error: 'Emp Code is required.' }, { status: 400 });
  if (!isEmployee && !email)  return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

  if (profile.role === 'head') {
    if (!headRoles.has(role)) {
      return NextResponse.json({ error: 'You can only create Admin or Employee users.' }, { status: 403 });
    }
    if (region !== profile.region) {
      return NextResponse.json({ error: 'You can only create users within your own region.' }, { status: 403 });
    }
  } else {
    if (!superAdminRoles.has(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }
    if (!isPakistanRegion(region)) {
      return NextResponse.json({ error: 'Please select a valid region.' }, { status: 400 });
    }
  }

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
    id:    authData.user.id,
    email: displayEmail,
    role,
    region,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: authData.user.id });
}
