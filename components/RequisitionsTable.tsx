'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ApiLoader from '@/components/ApiLoader';
import type { RetailItem } from '@/lib/retailRequisitionFields';
import { pakistanRegions } from '@/lib/regions';

type RequisitionRow = {
  id: string;
  status: string;
  region: string | null;
  routeCode: string;
  empCode: string;
  location: string;
  origin: string;
  created_at: string;
};

type TimeFilter = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

const PAGE_SIZE = 10;

const statusBadge: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100  text-red-700',
};

type PrintSubmission = {
  id: string;
  region: string | null;
  created_at: string;
  values: Record<string, string>;
};

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PRINT_COLS_PER_PAGE = 12;

/* ── Excel export helpers ── */
function getEmpCategory(empCode: string): string {
  if (empCode.startsWith('6')) return 'SIS';
  if (empCode.startsWith('8')) return 'Agent';
  if (empCode.startsWith('9')) return 'Franchise';
  return 'COCO';
}

const EMP_SHEET_ORDER = ['SIS', 'Agent', 'Franchise', 'COCO'] as const;

function buildSheetRows(subs: PrintSubmission[], retailItems: RetailItem[]): (string | number)[][] {
  const infoRows = [
    { label: 'Route Code', key: 'RouteCode' },
    { label: 'Emp Code',   key: 'EmpCode'   },
    { label: 'Location',   key: 'Location'  },
    { label: 'Origin',     key: 'Origin'    },
  ];

  const infoLines = infoRows.map((row) => [
    row.label,
    ...subs.map((s) => s.values[row.key] || '-'),
  ]);

  const itemLines = retailItems.map((item) => [
    item.label,
    ...subs.map((s) => {
      const qty = s.values[item.key] || '';
      if (!qty || qty === '0') return '-';
      const n = Number(qty);
      return Number.isFinite(n) ? n : qty;
    }),
  ]);

  const totalLine: (string | number)[] = [
    'Grand Total',
    ...subs.map((s) => s.values['GrandTotal'] || '-'),
  ];

  return [...infoLines, ...itemLines, totalLine];
}

function buildPrintHtml(subs: PrintSubmission[], retailItems: RetailItem[]): string {
  const infoRows = [
    { label: 'Route Code', key: 'RouteCode' },
    { label: 'Emp Code',   key: 'EmpCode'   },
    { label: 'Location',   key: 'Location'  },
    { label: 'Origin',     key: 'Origin'    },
  ];

  /* Split submissions into chunks so each fits on one landscape page */
  const chunks: PrintSubmission[][] = [];
  for (let i = 0; i < subs.length; i += PRINT_COLS_PER_PAGE) {
    chunks.push(subs.slice(i, i + PRINT_COLS_PER_PAGE));
  }

  function renderTable(chunk: PrintSubmission[]): string {
    const cols = chunk.map((s) => esc(s.values['RouteCode'] || s.id.slice(0, 8)));

    const infoHtml = infoRows.map((row) => `
      <tr>
        <td class="label-cell info-cell">${esc(row.label)}</td>
        ${chunk.map((s) => `<td class="info-cell">${esc(s.values[row.key] || '-')}</td>`).join('')}
      </tr>`).join('');

    const itemsHtml = retailItems.map((item, i) => {
      const alt = i % 2 !== 0 ? ' alt' : '';
      return `<tr class="item-row${alt}">
        <td class="label-cell">${esc(item.label)}</td>
        ${chunk.map((s) => {
          const qty = s.values[item.key] || '';
          const show = qty && qty !== '0' ? esc(qty) : '<span class="dash">-</span>';
          return `<td class="val-cell">${show}</td>`;
        }).join('')}
      </tr>`;
    }).join('');

    const totalHtml = `<tr class="total-row">
      <td class="label-cell">Grand Total</td>
      ${chunk.map((s) => `<td class="val-cell">${esc(s.values['GrandTotal'] || '-')}</td>`).join('')}
    </tr>`;

    return `<table>
      <thead><tr>
        <th class="label-cell">Item</th>
        ${cols.map((h) => `<th>${h}</th>`).join('')}
      </tr></thead>
      <tbody>${infoHtml}${itemsHtml}${totalHtml}</tbody>
    </table>`;
  }

  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  /* Each chunk gets its own .wrap div; .page-break between them */
  const tablesHtml = chunks.map((chunk, idx) => `
    ${idx > 0 ? '<div class="page-break"></div>' : ''}
    <div class="wrap">${renderTable(chunk)}</div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Retail Requisitions ${date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif}
  body{background:#f8fafc;padding:16px;font-size:11px}
  .toolbar{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin-bottom:14px}
  .toolbar h1{font-size:15px;font-weight:800;color:#0f172a}
  .toolbar p{font-size:11px;color:#94a3b8;margin-top:2px}
  .print-btn{background:#dc2626;color:#fff;border:none;padding:8px 22px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer}
  .print-btn:hover{background:#b91c1c}
  .wrap{overflow-x:auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px}
  table{border-collapse:collapse;min-width:100%}
  thead th{background:#1e293b;color:#e2e8f0;padding:6px 8px;white-space:nowrap;text-align:center;font-size:10px;font-weight:700;border:1px solid #334155}
  thead th.label-cell{text-align:left;min-width:190px;position:sticky;left:0;z-index:2;background:#1e293b}
  td{border:1px solid #e2e8f0;padding:4px 8px;white-space:nowrap;vertical-align:middle}
  .label-cell{font-weight:600;color:#1e293b;min-width:190px;position:sticky;left:0;background:#fff;z-index:1}
  .info-cell{background:#f1f5f9;color:#334155;text-align:center;font-weight:600}
  .label-cell.info-cell{font-weight:700;color:#1e293b;background:#e2e8f0;text-align:left}
  .item-row.alt .label-cell,.item-row.alt .val-cell{background:#f8fafc}
  .val-cell{text-align:center;color:#1e293b;min-width:56px}
  .dash{color:#cbd5e1}
  .total-row td{background:#fef2f2;color:#dc2626;font-weight:800;font-size:12px;text-align:center}
  .total-row .label-cell{background:#fee2e2;text-align:left}
  /* screen separator between chunks */
  .page-break{border-top:2px dashed #cbd5e1;margin:8px 0 20px}
  @page{size:landscape;margin:0.5cm}
  @media print{
    body{background:#fff;padding:0}
    .toolbar{display:none}
    .wrap{overflow:visible;border:none;border-radius:0;margin-bottom:0}
    table{width:100%}
    /* remove sticky so columns print correctly */
    thead th.label-cell,.label-cell{position:static}
    /* first column styling in print */
    .label-cell{border-right:2px solid #334155}
    /* force page break between chunks */
    .page-break{break-before:page;page-break-before:always;border:none;margin:0}
  }
</style>
</head>
<body>
<div class="toolbar">
  <div>
    <h1>Retail Requisition Summary</h1>
    <p>${subs.length} submission${subs.length !== 1 ? 's' : ''}&ensp;&middot;&ensp;${chunks.length > 1 ? `${chunks.length} pages&ensp;&middot;&ensp;` : ''}${date}</p>
  </div>
  <button class="print-btn" onclick="window.print()">&#128438;&ensp;Print / Save PDF</button>
</div>
${tablesHtml}
</body>
</html>`;
}

/* ── Calendar helpers ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function sameDay(a: Date, b: Date)         { return a.toDateString() === b.toDateString(); }
function toStr(d: Date)                    { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fmtShort(d: Date)                 { return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const yy  = String(d.getFullYear()).slice(2);
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
}

function addMonths(y: number, m: number, delta: number) {
  let nm = m + delta;
  let ny = y;
  if (nm > 11) { ny += Math.floor(nm / 12); nm = nm % 12; }
  if (nm < 0)  { const abs = Math.abs(nm); ny -= Math.ceil(abs / 12); nm = 12 - (abs % 12 || 12); }
  return { year: ny, month: nm };
}

type CalGridProps = {
  year: number; month: number;
  start: Date | null; end: Date | null; hover: Date | null;
  onDay: (d: Date) => void;
  onHover: (d: Date | null) => void;
  onPrev: () => void; onNext: () => void;
};

function CalGrid({ year, month, start, end, hover, onDay, onHover, onPrev, onNext }: CalGridProps) {
  const total = daysInMonth(year, month);
  const gap   = firstDay(year, month);
  const prevTotal = daysInMonth(...Object.values(addMonths(year, month, -1)) as [number, number]);

  type Cell = { n: number; own: boolean; d: Date };
  const cells: Cell[] = [];
  const pm = addMonths(year, month, -1);
  const nm = addMonths(year, month,  1);
  for (let i = gap - 1; i >= 0; i--)    cells.push({ n: prevTotal - i, own: false, d: new Date(pm.year, pm.month, prevTotal - i) });
  for (let n = 1; n <= total; n++)       cells.push({ n, own: true,  d: new Date(year, month, n) });
  const tail = cells.length % 7 ? 7 - (cells.length % 7) : 0;
  for (let n = 1; n <= tail; n++)        cells.push({ n, own: false, d: new Date(nm.year, nm.month, n) });

  function cls(cell: Cell) {
    const d = cell.d;
    if (!cell.own) return 'text-slate-300 pointer-events-none';
    let rs = start, re = end;
    if (start && !end && hover) {
      if (hover < start) { rs = hover; re = start; }
      else               { rs = start; re = hover; }
    }
    const isEdge = (start && sameDay(d, start)) || (end && sameDay(d, end)) ||
                   (start && !end && hover && sameDay(d, hover));
    const inRange = rs && re && d > rs && d < re;
    if (isEdge)   return 'bg-red-600 text-white font-bold rounded-full cursor-pointer hover:bg-red-700';
    if (inRange)  return 'bg-red-50 text-red-700 cursor-pointer text-sm';
    return 'text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full cursor-pointer transition';
  }

  return (
    <div className="flex-1 min-w-[240px]">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{MONTHS[month]} {year}</span>
        <button type="button" onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADS.map(h => <div key={h} className="text-center text-xs font-bold text-slate-400 py-1">{h}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <div key={i}
            className={`text-center text-sm py-1.5 select-none ${cls(cell)}`}
            onClick={() => cell.own && onDay(cell.d)}
            onMouseEnter={() => cell.own && onHover(cell.d)}
            onMouseLeave={() => onHover(null)}
          >
            {cell.n}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pagination helpers ── */
function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  if (current > 3) out.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p);
  if (current < total - 2) out.push('…');
  out.push(total);
  return out;
}

/* ── Main component ── */
export default function RequisitionsTable({ role, items: retailItems }: { role: string; items: RetailItem[] }) {
  const isSuperAdmin = role === 'super_admin';

  const [rows, setRows]         = useState<RequisitionRow[]>([]);
  const [search, setSearch]     = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState('');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [regionOpen,  setRegionOpen]  = useState(false);
  const [printLoading,      setPrintLoading]      = useState(false);
  const [csvLoading,        setCsvLoading]        = useState(false);
  const [deductionLoading,  setDeductionLoading]  = useState(false);
  const [selectedIds,       setSelectedIds]       = useState<Set<string>>(new Set());
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const requestIdRef   = useRef(0);
  const filterDropRef  = useRef<HTMLDivElement>(null);
  const regionDropRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterDropRef.current && !filterDropRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (regionDropRef.current && !regionDropRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Calendar state */
  const [calOpen, setCalOpen]   = useState(false);
  const [calStart, setCalStart] = useState<Date | null>(null);
  const [calEnd, setCalEnd]     = useState<Date | null>(null);
  const [hover, setHover]       = useState<Date | null>(null);
  const today = new Date();
  const [leftYM,  setLeftYM]  = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [rightYM, setRightYM] = useState(() => addMonths(today.getFullYear(), today.getMonth(), 1));

  async function loadRows(offset: number, term: string, filter: TimeFilter, region: string[]) {
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
      if (region.length > 0) params.set('region', region.join(','));
      const res  = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (requestId !== requestIdRef.current) return;
      if (!res.ok) { setMessage(data.error || 'Unable to load requisitions.'); return; }
      setRows(data.rows || []);
      setTotal(data.total ?? 0);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  /* Reset to page 1 and clear selection when filters change */
  useEffect(() => { setPage(1); setSelectedIds(new Set()); }, [search, timeFilter, fromDate, toDate, regionFilter]);
  useEffect(() => { setSelectedIds(new Set()); }, [page]);

  /* Load data */
  useEffect(() => {
    if (timeFilter === 'custom' && !fromDate && !toDate) return;
    const offset = (page - 1) * PAGE_SIZE;
    const t = window.setTimeout(() => loadRows(offset, search, timeFilter, regionFilter), 280);
    return () => window.clearTimeout(t);
  }, [page, search, timeFilter, fromDate, toDate, regionFilter]);

  function handleFilterChange(val: TimeFilter) {
    if (val === 'custom') { setTimeFilter('custom'); setCalOpen(true); }
    else { setTimeFilter(val); setFromDate(''); setToDate(''); }
  }

  function handleDayClick(d: Date) {
    if (!calStart || calEnd) { setCalStart(d); setCalEnd(null); }
    else {
      if (sameDay(d, calStart)) return;
      if (d < calStart) { setCalEnd(calStart); setCalStart(d); }
      else              { setCalEnd(d); }
    }
  }

  function handleApply() {
    if (!calStart) return;
    setFromDate(toStr(calStart));
    setToDate(toStr(calEnd || calStart));
    setCalOpen(false);
  }

  function handleClose() {
    setCalOpen(false);
    if (!fromDate && !toDate) setTimeFilter('all');
  }

  async function handlePrint() {
    setPrintLoading(true);
    try {
      const params = new URLSearchParams({ timeFilter });
      if (timeFilter === 'custom') {
        if (fromDate) params.set('from', fromDate);
        if (toDate)   params.set('to', toDate);
      }
      if (regionFilter.length > 0) params.set('region', regionFilter.join(','));
      if (search.trim()) params.set('search', search.trim());
      const res  = await fetch(`/api/admin/submissions/print?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Failed to load print data.'); return; }
      const subs: PrintSubmission[] = data.submissions || [];
      if (subs.length === 0) { alert('No submissions match the current filter.'); return; }
      const win = window.open('', '_blank');
      if (!win) { alert('Please allow popups to use the print feature.'); return; }
      win.document.write(buildPrintHtml(subs, retailItems));
      win.document.close();
    } finally {
      setPrintLoading(false);
    }
  }

  async function handleCsv() {
    setCsvLoading(true);
    try {
      const params = new URLSearchParams({ timeFilter });
      if (timeFilter === 'custom') {
        if (fromDate) params.set('from', fromDate);
        if (toDate)   params.set('to', toDate);
      }
      if (regionFilter.length > 0) params.set('region', regionFilter.join(','));
      if (search.trim()) params.set('search', search.trim());

      const res  = await fetch(`/api/admin/submissions/print?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Failed to load data.'); return; }
      const subs: PrintSubmission[] = data.submissions || [];
      if (subs.length === 0) { alert('No submissions match the current filter.'); return; }

      /* Group submissions by EMP category */
      const groups: Record<string, PrintSubmission[]> = {
        'SIS': [], 'Agent': [], 'Franchise': [], 'COCO': [],
      };
      for (const sub of subs) {
        groups[getEmpCategory(sub.values['EmpCode'] || '')].push(sub);
      }

      /* Build workbook — one sheet per non-empty category */
      const XLSX = await import('xlsx');
      const wb   = XLSX.utils.book_new();
      for (const sheetName of EMP_SHEET_ORDER) {
        const catSubs = groups[sheetName];
        if (catSubs.length === 0) continue;
        const ws = XLSX.utils.aoa_to_sheet(buildSheetRows(catSubs, retailItems));
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      if (wb.SheetNames.length === 0) { alert('No submissions to export.'); return; }

      const date = new Date().toLocaleDateString('en-CA');
      XLSX.writeFile(wb, `requisitions-${date}.xlsx`);
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleDeduction() {
    setDeductionLoading(true);
    try {
      const params = new URLSearchParams({ timeFilter, status: 'approved' });
      if (timeFilter === 'custom') {
        if (fromDate) params.set('from', fromDate);
        if (toDate)   params.set('to', toDate);
      }
      if (regionFilter.length > 0) params.set('region', regionFilter.join(','));
      if (search.trim()) params.set('search', search.trim());

      const res  = await fetch(`/api/admin/submissions/print?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Failed to load data.'); return; }
      const subs: PrintSubmission[] = data.submissions || [];
      if (subs.length === 0) { alert('No approved submissions match the current filter.'); return; }

      const csvEsc = (v: string) => {
        const s = String(v || '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      };

      const lines: string[] = ['Route Code,EMP Code,Location,Grand Total'];
      for (const sub of subs) {
        lines.push([
          csvEsc(sub.values['RouteCode']  || ''),
          csvEsc(sub.values['EmpCode']    || ''),
          csvEsc(sub.values['Location']   || ''),
          csvEsc(sub.values['GrandTotal'] || ''),
        ].join(','));
      }

      const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `deduction-${new Date().toLocaleDateString('en-CA')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDeductionLoading(false);
    }
  }

  async function handleDelete() {
    const ids = Array.from(selectedIds);
    setDeleteLoading(true);
    try {
      const res  = await fetch('/api/admin/submissions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Delete failed.'); return; }
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      const offset = (page - 1) * PAGE_SIZE;
      loadRows(offset, search, timeFilter, regionFilter);
    } finally {
      setDeleteLoading(false);
    }
  }

  function navLeft(dir: -1 | 1) {
    const n = addMonths(leftYM.year, leftYM.month, dir);
    setLeftYM(n);
    setRightYM(addMonths(n.year, n.month, 1));
  }

  function navRight(dir: -1 | 1) {
    const n = addMonths(rightYM.year, rightYM.month, dir);
    setRightYM(n);
    setLeftYM(addMonths(n.year, n.month, -1));
  }

  const canDelete        = role === 'super_admin' || role === 'head';
  const colCount         = canDelete ? 9 : 8;
  const allPageSelected  = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const somePageSelected = rows.some((r) => selectedIds.has(r.id));
  const selectedRows     = rows.filter((r) => selectedIds.has(r.id));
  const hasApprovedSelected = selectedRows.some((r) => r.status === 'approved');

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart  = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd    = Math.min(page * PAGE_SIZE, total);
  const customLabel = fromDate && toDate
    ? `${fmtShort(new Date(fromDate + 'T00:00'))} – ${fmtShort(new Date(toDate + 'T00:00'))}`
    : null;

  return (
    <div className="space-y-5">

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location, origin or route code…"
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 pl-10 pr-9 text-sm font-medium transition focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="hidden sm:block w-px bg-slate-200 self-stretch" />

          {/* Time filter – custom dropdown (native <select> can't be styled) */}
          {(() => {
            const options: { value: TimeFilter; label: string }[] = [
              { value: 'all',       label: 'All Time' },
              { value: 'today',     label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'last7',     label: 'Last 7 Days' },
              { value: 'last30',    label: 'Last 30 Days' },
              { value: 'custom',    label: 'Custom Range' },
            ];
            const selected = options.find(o => o.value === timeFilter) ?? options[0];
            return (
              <div ref={filterDropRef} className="relative sm:min-w-[150px]">
                <button
                  type="button"
                  onClick={() => setFilterOpen(o => !o)}
                  className="w-full h-11 flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none"
                >
                  <span>{selected.label}</span>
                  <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg z-20 py-1 overflow-hidden">
                    {options.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setFilterOpen(false); handleFilterChange(opt.value); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                          timeFilter === opt.value
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {timeFilter === opt.value && (
                          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className={timeFilter === opt.value ? '' : 'ml-5'}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Region filter – super admin only, multi-select */}
          {isSuperAdmin && (() => {
            const count = regionFilter.length;
            const btnLabel = count === 0 ? 'All Regions' : count === 1 ? regionFilter[0] : `${count} Regions`;
            const active   = count > 0;
            function toggleRegion(r: string) {
              setRegionFilter(prev =>
                prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
              );
            }
            return (
              <div ref={regionDropRef} className="relative sm:min-w-[155px]">
                <button
                  type="button"
                  onClick={() => setRegionOpen(o => !o)}
                  className={`w-full h-11 flex items-center justify-between gap-2 rounded-xl border px-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-red-100 ${active ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-300'}`}
                >
                  <span className="truncate">{btnLabel}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {active && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold leading-none">
                        {count}
                      </span>
                    )}
                    <svg className={`w-4 h-4 transition-transform ${regionOpen ? 'rotate-180' : ''} ${active ? 'text-red-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {regionOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-lg z-20 overflow-hidden">
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {pakistanRegions.map((r) => {
                        const checked = regionFilter.includes(r);
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => toggleRegion(r)}
                            className={`w-full text-left px-3 py-2.5 text-sm font-medium transition flex items-center gap-3 ${checked ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {/* Custom checkbox */}
                            <span className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition ${checked ? 'bg-red-600 border-red-600' : 'border-slate-300 bg-white'}`}>
                              {checked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            {r}
                          </button>
                        );
                      })}
                    </div>
                    {active && (
                      <div className="border-t border-slate-100 dark:border-slate-700 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setRegionFilter([])}
                          className="w-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition text-center py-1"
                        >
                          Clear selection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={printLoading}
            className="h-11 flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {printLoading ? (
              <ApiLoader label="Loading" />
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </>
            )}
          </button>

          {/* Excel download button */}
          <button
            type="button"
            onClick={handleCsv}
            disabled={csvLoading}
            className="h-11 flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-green-700 dark:text-green-400 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {csvLoading ? (
              <ApiLoader label="Loading" />
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Excel
              </>
            )}
          </button>

          {/* Deduction CSV button */}
          <button
            type="button"
            onClick={handleDeduction}
            disabled={deductionLoading}
            className="h-11 flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-700 px-4 text-sm font-semibold text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {deductionLoading ? (
              <ApiLoader label="Loading" />
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Deduction
              </>
            )}
          </button>

          {timeFilter === 'custom' && customLabel && (
            <button type="button" onClick={() => setCalOpen(true)}
              className="h-11 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100 transition flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate max-w-[220px]">{customLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete toolbar — shown when rows are selected */}
      {canDelete && selectedIds.size > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {selectedIds.size} record{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          {hasApprovedSelected && (
            <span className="text-sm font-bold text-red-600">
              Warning: you are deleting approved record{selectedRows.filter(r => r.status === 'approved').length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="ml-auto inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-900">
              <tr>
                {canDelete && (
                  <th className="px-3 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-500 bg-slate-700 accent-red-600 cursor-pointer"
                    />
                  </th>
                )}
                {['Region', 'Route Code', 'Emp Code', 'Location', 'Origin', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && rows.map((row, i) => (
                <tr key={row.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''} ${selectedIds.has(row.id) ? 'bg-red-50/60 dark:bg-red-900/20' : ''}`}>
                  {canDelete && (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-4 h-4 rounded border-slate-300 accent-red-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-3 py-3 font-semibold text-slate-800 dark:text-slate-100">{row.region || '—'}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.routeCode || '—'}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.empCode || '—'}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.location || '—'}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{row.origin || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[row.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{fmtDateTime(row.created_at)}</td>
                  <td className="px-3 py-3">
                    <Link href={`/dashboard/requisitions/${row.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition">
                      View
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}

              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={i} className={`border-t border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                  {Array.from({ length: colCount }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded animate-pulse" style={{ width: j === colCount - 2 ? '2.5rem' : '80%' }} />
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-3 py-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                    No requisitions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 order-2 sm:order-1">
            {total === 0
              ? 'No results'
              : `Showing ${rangeStart}–${rangeEnd} of ${total} record${total !== 1 ? 's' : ''}`}
          </span>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            {/* Page numbers */}
            {pageList(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  disabled={loading}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                    p === page
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200'
                  } disabled:cursor-not-allowed`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
            <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Confirm Delete</h3>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You are about to permanently delete{' '}
                <span className="font-bold text-slate-900 dark:text-white">{selectedIds.size} record{selectedIds.size !== 1 ? 's' : ''}</span>.
                This cannot be undone.
              </p>
              {hasApprovedSelected && (
                <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  You are deleting {selectedRows.filter(r => r.status === 'approved').length} approved record{selectedRows.filter(r => r.status === 'approved').length !== 1 ? 's' : ''}. All associated data will be permanently removed.
                </p>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="h-10 px-6 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
              >
                {deleteLoading ? <ApiLoader label="Deleting" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar modal ── */}
      {calOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-[680px] overflow-hidden">

            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Select Custom Date Range</h3>
              </div>
              <button type="button" onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Start date</span>
                <span className={`text-sm font-semibold ${calStart ? 'text-red-600 dark:text-red-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {calStart ? fmtShort(calStart) : 'Not selected'}
                </span>
              </div>
              <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">End date</span>
                <span className={`text-sm font-semibold ${calEnd ? 'text-red-600 dark:text-red-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {calEnd ? fmtShort(calEnd) : 'Not selected'}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <CalGrid year={leftYM.year} month={leftYM.month}
                start={calStart} end={calEnd} hover={hover}
                onDay={handleDayClick} onHover={setHover}
                onPrev={() => navLeft(-1)} onNext={() => navLeft(1)} />
              <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
              <CalGrid year={rightYM.year} month={rightYM.month}
                start={calStart} end={calEnd} hover={hover}
                onDay={handleDayClick} onHover={setHover}
                onPrev={() => navRight(-1)} onNext={() => navRight(1)} />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <button type="button"
                onClick={() => { setCalStart(null); setCalEnd(null); }}
                className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                Clear
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleClose}
                  className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleApply} disabled={!calStart}
                  className="h-10 px-6 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
