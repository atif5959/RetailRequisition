'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ApiLoader from '@/components/ApiLoader';

type RequisitionRow = {
  id: string;
  status: string;
  region: string | null;
  routeCode: string;
  location: string;
  origin: string;
  created_at: string;
};

type TimeFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

const statusBadge: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100  text-red-700',
};

export default function RequisitionsTable() {
  const [rows, setRows]             = useState<RequisitionRow[]>([]);
  const [search, setSearch]         = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [fromDate, setFromDate]     = useState('');
  const [toDate, setToDate]         = useState('');
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState('');
  const requestIdRef                = useRef(0);

  async function loadRows(offset: number, term: string, filter: TimeFilter, reset = false) {
    if (loading && !reset) return;
    setLoading(true);
    setMessage('');
    const requestId = ++requestIdRef.current;

    try {
      const params = new URLSearchParams({ offset: String(offset) });
      if (term.trim()) params.set('search', term.trim());
      params.set('timeFilter', filter);
      if (filter === 'custom') {
        if (fromDate) params.set('from', fromDate);
        if (toDate)   params.set('to', toDate);
      }

      const res  = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (requestId !== requestIdRef.current) return;

      if (!res.ok) { setMessage(data.error || 'Unable to load requisitions.'); return; }
      setRows((c) => reset ? data.rows || [] : [...c, ...(data.rows || [])]);
      setNextOffset(data.nextOffset);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      setRows([]);
      setNextOffset(0);
      loadRows(0, search, timeFilter, true);
    }, 280);
    return () => window.clearTimeout(t);
  }, [search, timeFilter, fromDate, toDate]);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80 && nextOffset !== null && !loading) {
      loadRows(nextOffset, search, timeFilter);
    }
  }

  return (
    <div className="space-y-5">

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_160px_160px]">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location, origin or route code…"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none"
            />
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="app-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">From</span>
            <input type="date" value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setTimeFilter('custom'); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">To</span>
            <input type="date" value={toDate}
              onChange={(e) => { setToDate(e.target.value); setTimeFilter('custom'); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div onScroll={onScroll} className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr>
                {['Region', 'Route Code', 'Location', 'Origin', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`border-t border-slate-100 hover:bg-red-50/40 transition ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{row.region || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.routeCode || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.location || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.origin || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/dashboard/requisitions/${row.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
                    >
                      View
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm font-medium">
                    No requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center items-center gap-2 border-t border-slate-100 p-5 text-sm font-semibold text-slate-500">
              <ApiLoader label="Loading records" tone="dark" />
            </div>
          )}

          {!loading && nextOffset === null && rows.length > 0 && (
            <div className="border-t border-slate-100 p-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
              End of records
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}
    </div>
  );
}
