'use client';

import { useEffect, useRef, useState } from 'react';
import { AppButtonLink } from '@/components/AppButton';
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

export default function RequisitionsTable() {
  const [rows, setRows] = useState<RequisitionRow[]>([]);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const requestIdRef = useRef(0);

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
        if (toDate) params.set('to', toDate);
      }

      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        setMessage(data.error || 'Unable to load requisitions.');
        return;
      }

      setRows((current) => reset ? data.rows || [] : [...current, ...(data.rows || [])]);
      setNextOffset(data.nextOffset);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRows([]);
      setNextOffset(0);
      loadRows(0, search, timeFilter, true);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [search, timeFilter, fromDate, toDate]);

  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 80;
    if (nearBottom && nextOffset !== null && !loading) {
      loadRows(nextOffset, search, timeFilter);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_170px_170px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by location, origin, or route code"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
        />
        <select
          value={timeFilter}
          onChange={(event) => setTimeFilter(event.target.value as TimeFilter)}
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
          <span className="text-xs font-semibold uppercase text-slate-500">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
              setTimeFilter('custom');
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
              setTimeFilter('custom');
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <div onScroll={onScroll} className="max-h-[680px] overflow-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-left">
              <tr>
                <th className="p-3">Region</th>
                <th className="p-3">Route Code</th>
                <th className="p-3">Location</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.region || '-'}</td>
                  <td className="p-3">{row.routeCode || '-'}</td>
                  <td className="p-3">{row.location || '-'}</td>
                  <td className="p-3">{row.origin || '-'}</td>
                  <td className="p-3 capitalize">{row.status}</td>
                  <td className="p-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <AppButtonLink href={`/dashboard/requisitions/${row.id}`}>View</AppButtonLink>
                  </td>
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={7}>
                    No requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="flex justify-center border-t border-slate-100 p-4 text-sm font-semibold text-slate-600">
              <ApiLoader label="Loading records" tone="dark" />
            </div>
          )}

          {!loading && nextOffset === null && rows.length > 0 && (
            <div className="border-t border-slate-100 p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              End of records
            </div>
          )}
        </div>
      </div>

      {message && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p>}
    </div>
  );
}
