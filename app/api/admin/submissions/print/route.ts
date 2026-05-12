import { NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { getRetailItems } from '@/lib/getRetailItems';

const pakistanTimeZoneOffset = '+05:00';

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
    return { from: pakistanDayStart(formatPakistanDate(addDays(new Date(), -6))), to: pakistanDayEnd(today) };
  }
  if (timeFilter === 'last30') {
    return { from: pakistanDayStart(formatPakistanDate(addDays(new Date(), -29))), to: pakistanDayEnd(today) };
  }
  if (timeFilter === 'custom') {
    const fromDate = String(searchParams.get('from') || '').trim();
    const toDate   = String(searchParams.get('to')   || '').trim();
    return {
      from: fromDate ? pakistanDayStart(fromDate) : null,
      to:   toDate   ? pakistanDayEnd(toDate)     : null,
    };
  }
  return { from: null, to: null };
}

const SEARCH_FIELDS = ['RouteCode', 'Location', 'Origin'];
const HEADER_FIELDS = ['RouteCode', 'EmpCode', 'Location', 'Origin', 'GrandTotal'];
const BATCH_SIZE    = 20;

async function fetchValuesBatched(
  supabase: SupabaseClient,
  ids: string[],
  fieldKeys?: string[],
) {
  const rows: { submission_id: string; field_key: string; value: string }[] = [];
  const batches: Promise<void>[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const rowsPerSubmission = fieldKeys ? fieldKeys.length : 200;
    batches.push(
      (async () => {
        let q = supabase
          .from('form_submission_values')
          .select('submission_id, field_key, value')
          .in('submission_id', batch)
          .limit(batch.length * rowsPerSubmission + 10);
        if (fieldKeys) q = q.in('field_key', fieldKeys);
        const { data } = await q;
        if (data) rows.push(...data);
      })(),
    );
  }

  await Promise.all(batches);
  return rows;
}

export async function GET(req: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateRange = getDateRange(searchParams);
  const search    = String(searchParams.get('search') || '').trim().toLowerCase();
  const supabase  = supabaseAdmin();

  const retailItems  = await getRetailItems();
  const NEEDED_FIELDS = [...HEADER_FIELDS, ...retailItems.map((item) => item.key)];

  const statusParam = String(searchParams.get('status') || '').trim();

  /* status-filtered queries (e.g. deduction) need all matching rows */
  const rowLimit = statusParam ? 10000 : (search ? 5000 : 300);

  let query = supabase
    .from('form_submissions')
    .select('id, region, created_at')
    .order('created_at', { ascending: false })
    .limit(rowLimit);

  if (statusParam) query = query.eq('status', statusParam);
  if (dateRange.from) query = query.gte('created_at', dateRange.from);
  if (dateRange.to)   query = query.lte('created_at', dateRange.to);

  if (profile.role !== 'super_admin') {
    if (!profile.region) return NextResponse.json({ submissions: [] });
    query = query.eq('region', profile.region);
  } else {
    const regionParam = String(searchParams.get('region') || '').trim();
    const regions = regionParam ? regionParam.split(',').map(r => r.trim()).filter(Boolean) : [];
    if (regions.length > 0) query = query.in('region', regions);
  }

  const { data: submissions, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!submissions || submissions.length === 0) return NextResponse.json({ submissions: [] });

  const allIds = submissions.map((s) => s.id);

  /* ── When searching: first narrow down to matching IDs using only the
     three search fields (3 rows per submission, stays well under row limits).
     Then fetch full values only for the matches. ── */
  let matchingIds: string[];

  if (search) {
    const { data: searchVals } = await supabase
      .from('form_submission_values')
      .select('submission_id, field_key, value')
      .in('submission_id', allIds)
      .in('field_key', SEARCH_FIELDS)
      .limit(allIds.length * SEARCH_FIELDS.length + 50);

    const searchMap = new Map<string, Record<string, string>>();
    for (const v of searchVals || []) {
      const cur = searchMap.get(v.submission_id) || {};
      cur[v.field_key] = v.value || '';
      searchMap.set(v.submission_id, cur);
    }

    matchingIds = allIds.filter((id) => {
      const fields = searchMap.get(id) || {};
      return SEARCH_FIELDS.some((key) => normalize(fields[key]).includes(search));
    });
  } else {
    matchingIds = allIds;
  }

  if (matchingIds.length === 0) return NextResponse.json({ submissions: [] });

  /* ── Fetch exactly the fields needed (headers + item qty keys = 41 fields).
     Batches of 20 IDs × 41 fields = 820 rows — always under Supabase's 1000-row cap. ── */
  const neededVals = await fetchValuesBatched(supabase, matchingIds, NEEDED_FIELDS);
  const valueMap = new Map<string, Record<string, string>>();
  for (const v of neededVals) {
    const cur = valueMap.get(v.submission_id) || {};
    cur[v.field_key] = v.value || '';
    valueMap.set(v.submission_id, cur);
  }

  const matchingSet = new Set(matchingIds);
  const result = submissions
    .filter((s) => matchingSet.has(s.id))
    .map((s) => ({
      id: s.id,
      region: s.region,
      created_at: s.created_at,
      values: valueMap.get(s.id) || {},
    }));

  return NextResponse.json({ submissions: result });
}
