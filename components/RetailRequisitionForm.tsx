'use client';

import { useMemo, useState } from 'react';
import ApiLoader from '@/components/ApiLoader';
import AppSelect from '@/components/AppSelect';
import FieldError from '@/components/FieldError';
import { getInHandStockKey, retailHeaderFields } from '@/lib/retailRequisitionFields';
import type { RetailItem } from '@/lib/retailRequisitionFields';
import { pakistanRegions } from '@/lib/regions';

type CurrentUser = { id: string; email: string; role: string; region?: string | null };
type HeaderValues = Record<(typeof retailHeaderFields)[number]['key'], string>;
type QuantityValues = Record<string, string>;
type StockValues    = Record<string, string>;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toQuantity(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatAmount(value: number) {
  return currencyFormatter.format(value);
}

const inputClass =
  'w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition';

const inputReadonlyClass =
  'w-full rounded-xl border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed select-none';

const numInputClass =
  'w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition placeholder:text-slate-300';

export default function RetailRequisitionForm({
  items,
  currentUser,
}: {
  items: RetailItem[];
  currentUser: CurrentUser;
}) {
  const isEmployee   = currentUser.role === 'employee';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const empCode      = isEmployee ? currentUser.email : '';
  const userRegion   = !isSuperAdmin ? (currentUser.region ?? '') : '';

  const [headerValues, setHeaderValues] = useState<HeaderValues>({
    Region: userRegion, RouteCode: 'X', EmpCode: empCode, Location: '', Origin: '',
  });
  const [stocks, setStocks]         = useState<StockValues>({});
  const [quantities, setQuantities] = useState<QuantityValues>({});
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const itemTotals = useMemo(() =>
    items.reduce<Record<string, number>>((acc, item) => {
      acc[item.totalKey] = toQuantity(quantities[item.key] || '') * item.price;
      return acc;
    }, {}),
  [quantities]);

  const grandTotal = useMemo(() =>
    Object.values(itemTotals).reduce((sum, v) => sum + v, 0),
  [itemTotals]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errs: Record<string, string> = {};
    if (isSuperAdmin && !headerValues.Region) errs.Region = 'Region is required';
    if (!headerValues.RouteCode || headerValues.RouteCode === 'X') errs.RouteCode = 'Enter a valid route code (e.g. X101)';
    if (!isEmployee && !headerValues.EmpCode.trim()) errs.EmpCode = 'Emp Code is required';
    if (!headerValues.Location.trim()) errs.Location = 'Location is required';
    if (!headerValues.Origin.trim()) errs.Origin = 'Origin is required';
    else if (headerValues.Origin.length < 3) errs.Origin = 'Origin must be exactly 3 letters';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    setError('');
    const values: Record<string, string> = { ...headerValues };
    items.forEach((item) => {
      const stockKey = getInHandStockKey(item.key);
      values[stockKey]      = stocks[stockKey] || '';
      values[item.key]      = quantities[item.key] || '';
      values[item.priceKey] = formatAmount(item.price);
      values[item.totalKey] = formatAmount(itemTotals[item.totalKey] || 0);
    });
    values.GrandTotal = formatAmount(grandTotal);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values,
          submittedBy: { id: currentUser.id, email: currentUser.email, role: currentUser.role },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setHeaderValues({ Region: userRegion, RouteCode: 'X', EmpCode: empCode, Location: '', Origin: '' });
        setStocks({});
        setQuantities({});
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  /* ── Thank-you screen ── */
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center space-y-6 anim-section-1">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center anim-pop-in">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Submitted Successfully!</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Your requisition has been recorded and is now pending review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-red-700 transition shadow"
        >
          ← Submit Another
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <>
    <style>{`
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes rowSlideIn {
        from { opacity: 0; transform: translateX(-12px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes popIn {
        0%   { opacity: 0; transform: scale(0.75); }
        60%  { transform: scale(1.06); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes totalPop {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-7px); }
        40%     { transform: translateX(7px); }
        60%     { transform: translateX(-4px); }
        80%     { transform: translateX(4px); }
      }
      @keyframes grandTotalGlow {
        0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        50%     { box-shadow: 0 0 0 8px rgba(220,38,38,0.18); }
      }
      .anim-section-1 { animation: fadeSlideUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
      .anim-section-2 { animation: fadeSlideUp 0.45s cubic-bezier(.22,.68,0,1.2) 0.12s both; }
      .anim-section-3 { animation: fadeSlideUp 0.45s cubic-bezier(.22,.68,0,1.2) 0.22s both; }
      .anim-pop-in    { animation: popIn 0.5s cubic-bezier(.22,.68,0,1.2) both; }
      .anim-shake     { animation: shake 0.4s ease both; }
      .anim-total-pop { animation: totalPop 0.3s ease both; }
      .anim-grand-glow{ animation: grandTotalGlow 1.6s ease-in-out infinite; }
      .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(220,38,38,0.35); }
      .btn-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
      .btn-submit { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .row-enter { animation: rowSlideIn 0.3s ease both; }
      input[type="number"]:focus { transform: scale(1.02); }
      input[type="number"] { transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
    `}</style>
    <form onSubmit={onSubmit} noValidate className="space-y-6">

      {/* ── REQUESTER DETAILS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden anim-section-1">
        {/* Section header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">Requester Details</h2>
        </div>

        <div className="p-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {retailHeaderFields.map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                {field.label}
                {field.key === 'EmpCode' && isEmployee && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    Auto-filled
                  </span>
                )}
                {field.key === 'Region' && !isSuperAdmin && userRegion && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    Auto-filled
                  </span>
                )}
              </span>

              {field.key === 'Region' ? (
                isSuperAdmin ? (
                  <AppSelect
                    value={headerValues[field.key]}
                    onChange={(v) => { setHeaderValues((c) => ({ ...c, [field.key]: v })); setFieldErrors((fe) => ({ ...fe, Region: '' })); }}
                    options={pakistanRegions.map((r) => ({ value: r, label: r }))}
                    placeholder="Select region"
                  />
                ) : (
                  <input value={userRegion} readOnly disabled className={inputReadonlyClass} />
                )
              ) : field.key === 'RouteCode' ? (
                <input
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val.startsWith('X')) { setHeaderValues((c) => ({ ...c, RouteCode: 'X' })); return; }
                    const suffix = val.slice(1);
                    if (suffix !== '' && !/^\d+$/.test(suffix)) return;
                    setHeaderValues((c) => ({ ...c, RouteCode: val }));
                    setFieldErrors((fe) => ({ ...fe, RouteCode: '' }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && headerValues[field.key] === 'X') e.preventDefault();
                  }}
                  className={`${inputClass} ${fieldErrors.RouteCode ? 'input-error' : ''}`}
                />
              ) : field.key === 'EmpCode' ? (
                isEmployee ? (
                  <input name={field.key} value={headerValues[field.key]} readOnly disabled className={inputReadonlyClass} />
                ) : (
                  <input
                    name={field.key}
                    value={headerValues[field.key]}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setHeaderValues((c) => ({ ...c, EmpCode: val }));
                      setFieldErrors((fe) => ({ ...fe, EmpCode: '' }));
                    }}
                    inputMode="numeric"
                    className={`${inputClass} ${fieldErrors.EmpCode ? 'input-error' : ''}`}
                  />
                )
              ) : field.key === 'Location' ? (
                <input
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(e) => {
                    setHeaderValues((c) => ({ ...c, Location: e.target.value.toUpperCase() }));
                    setFieldErrors((fe) => ({ ...fe, Location: '' }));
                  }}
                  className={`${inputClass} ${fieldErrors.Location ? 'input-error' : ''}`}
                />
              ) : field.key === 'Origin' ? (
                <input
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
                    setHeaderValues((c) => ({ ...c, Origin: val }));
                    setFieldErrors((fe) => ({ ...fe, Origin: '' }));
                  }}
                  maxLength={3}
                  className={`${inputClass} ${fieldErrors.Origin ? 'input-error' : ''}`}
                />
              ) : null}
              <FieldError msg={fieldErrors[field.key]} />
            </label>
          ))}
        </div>
      </div>

      {/* ── STOCK ITEMS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden anim-section-2">
        {/* Section header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">Stock Items</h2>
          </div>
          <span className="text-xs font-bold text-slate-400">{items.length} items</span>
        </div>

        {/* ── Mobile card layout ── */}
        <div className="md:hidden divide-y divide-slate-100">
          {items.map((item) => {
            const stockKey = getInHandStockKey(item.key);
            const total = itemTotals[item.totalKey] || 0;
            return (
              <div key={item.key} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-800 leading-snug flex-1">{item.label}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1 flex-shrink-0">
                    PKR {formatAmount(item.price)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">In Hand Stock</label>
                    <input
                      name={stockKey}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={stocks[stockKey] || ''}
                      onChange={(e) => setStocks((c) => ({ ...c, [stockKey]: e.target.value }))}
                      className={numInputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Quantity</label>
                    <input
                      name={item.key}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={quantities[item.key] || ''}
                      onChange={(e) => setQuantities((c) => ({ ...c, [item.key]: e.target.value }))}
                      className={numInputClass}
                    />
                  </div>
                </div>
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 border-2 ${total > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total</span>
                  <span className={`text-sm font-black ${total > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {formatAmount(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop table layout ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200">
                <th className="px-5 py-3.5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-600">Item</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-600 w-[16%]">In Hand Stock</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-600 w-[16%]">Quantity</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-600 w-[14%]">Price</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-widest text-red-600 w-[14%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const stockKey = getInHandStockKey(item.key);
                const total    = itemTotals[item.totalKey] || 0;
                return (
                  <tr
                    key={item.key}
                    className={`border-b border-slate-100 transition-colors row-enter ${index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-red-50/40`}
                    style={{ animationDelay: `${0.22 + index * 0.03}s` }}
                  >
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-800">{item.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name={stockKey}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={stocks[stockKey] || ''}
                        onChange={(e) => setStocks((c) => ({ ...c, [stockKey]: e.target.value }))}
                        className={numInputClass}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name={item.key}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={quantities[item.key] || ''}
                        onChange={(e) => setQuantities((c) => ({ ...c, [item.key]: e.target.value }))}
                        className={numInputClass}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-center px-3 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
                        {formatAmount(item.price)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        key={total > 0 ? 'active' : 'zero'}
                        className={`text-center px-3 py-2 text-sm font-black rounded-lg border-2 transition-colors
                          ${total > 0
                            ? 'bg-red-50 border-red-200 text-red-600 anim-total-pop'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                      >
                        {formatAmount(total)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total bar */}
        <div className="border-t-2 border-slate-200 px-5 py-5 flex items-center justify-between bg-slate-900">
          <span className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Grand Total</span>
          <div
            key={grandTotal > 0 ? 'gt-active' : 'gt-zero'}
            className={`rounded-xl px-8 py-3 text-xl font-black shadow-sm min-w-[180px] text-center transition-colors
              ${grandTotal > 0
                ? 'bg-red-600 text-white anim-total-pop anim-grand-glow'
                : 'bg-slate-700 text-slate-400'
              }`}
          >
            PKR {formatAmount(grandTotal)}
          </div>
        </div>
      </div>

      {/* ── SUBMIT ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 anim-section-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-submit inline-flex items-center justify-center gap-2 bg-red-600 text-white font-extrabold px-10 py-4 rounded-xl hover:bg-red-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide w-full sm:w-auto"
        >
          {loading ? <ApiLoader label="Submitting" /> : 'Submit Requisition →'}
        </button>
        {error && (
          <div key={error} className="anim-shake flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>

    </form>
    </>
  );
}
