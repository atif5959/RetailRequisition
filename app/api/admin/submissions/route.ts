import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

const PAGE_SIZE = 10;
const searchFieldKeys = ['RouteCode', 'EmpCode', 'Location', 'Origin'];
const pakistanTimeZoneOffset = '+05:00';

type SubmissionRow = {
  id: string;
  status: string;
  region: string | null;
  created_at: string;
  routeCode?: string;
  empCode?: string;
  location?: string;
  origin?: string;
};

function normalize(value: unknown) {
  return String(value || '').toLowerCase();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatPakistanDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function pakistanDayStart(date: string) {
  return new Date(`${date}T00:00:00.000${pakistanTimeZoneOffset}`).toISOString();
}

function pakistanDayEnd(date: string) {
  return new Date(`${date}T23:59:59.999${pakistanTimeZoneOffset}`).toISOString();
}

function getDateRange(searchParams: URLSearchParams) {
  const timeFilter = String(searchParams.get('timeFilter') || 'all');
  const today = formatPakistanDate(new Date());

  if (timeFilter === 'today') {
    return { from: pakistanDayStart(today), to: pakistanDayEnd(today) };
  }

  if (timeFilter === 'yesterday') {
    const yesterday = formatPakistanDate(addDays(new Date(), -1));
    return { from: pakistanDayStart(yesterday), to: pakistanDayEnd(yesterday) };
  }

  if (timeFilter === 'last7') {
    const start = formatPakistanDate(addDays(new Date(), -6));
    return { from: pakistanDayStart(start), to: pakistanDayEnd(today) };
  }

  if (timeFilter === 'last30') {
    const start = formatPakistanDate(addDays(new Date(), -29));
    return { from: pakistanDayStart(start), to: pakistanDayEnd(today) };
  }

  if (timeFilter === 'custom') {
    const fromDate = String(searchParams.get('from') || '').trim();
    const toDate = String(searchParams.get('to') || '').trim();
    return {
      from: fromDate ? pakistanDayStart(fromDate) : null,
      to: toDate ? pakistanDayEnd(toDate) : null,
    };
  }

  return { from: null, to: null };
}

async function withHeaderValues(rows: any[]) {
  if (rows.length === 0) return [];

  const supabase = supabaseAdmin();
  const ids = rows.map((row) => row.id);
  const { data: values } = await supabase
    .from('form_submission_values')
    .select('submission_id, field_key, value')
    .in('submission_id', ids)
    .in('field_key', searchFieldKeys);

  const valueMap = new Map<string, Record<string, string>>();
  for (const value of values || []) {
    const current = valueMap.get(value.submission_id) || {};
    current[value.field_key] = value.value || '';
    valueMap.set(value.submission_id, current);
  }

  return rows.map((row): SubmissionRow => {
    const headers = valueMap.get(row.id) || {};
    return {
      id: row.id,
      status: row.status,
      region: row.region,
      created_at: row.created_at,
      routeCode: headers.RouteCode || '',
      empCode: headers.EmpCode || '',
      location: headers.Location || '',
      origin: headers.Origin || '',
    };
  });
}

export async function DELETE(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (profile.role !== 'super_admin' && profile.role !== 'head') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  if (profile.role === 'head') {
    const { data: subs } = await supabase
      .from('form_submissions')
      .select('id, region')
      .in('id', ids);
    if (subs?.some((s) => s.region !== profile.region)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await supabase.from('form_submissions').delete().in('id', ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, deleted: ids.length });
}

export async function GET(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0);
  const limit = PAGE_SIZE;
  const search = String(searchParams.get('search') || '').trim().toLowerCase();
  const dateRange = getDateRange(searchParams);
  const supabase = supabaseAdmin();

  let query = supabase.from('form_submissions').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (dateRange.from) query = query.gte('created_at', dateRange.from);
  if (dateRange.to) query = query.lte('created_at', dateRange.to);

  if (profile.role !== 'super_admin') {
    if (!profile.region) {
      return NextResponse.json({ rows: [], total: 0 });
    }
    query = query.eq('region', profile.region);
  } else {
    const regionParam = String(searchParams.get('region') || '').trim();
    const regions = regionParam ? regionParam.split(',').map(r => r.trim()).filter(Boolean) : [];
    if (regions.length > 0) query = query.in('region', regions);
  }

  if (!search) {
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = await withHeaderValues(data || []);
    return NextResponse.json({ rows, total: count ?? 0 });
  }

  const { data, error } = await query.limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hydratedRows = await withHeaderValues(data || []);
  const filteredRows = hydratedRows.filter((row) => {
    return [row.location, row.origin, row.routeCode].some((value) => normalize(value).includes(search));
  });
  const rows = filteredRows.slice(offset, offset + limit);

  return NextResponse.json({ rows, total: filteredRows.length });
}
