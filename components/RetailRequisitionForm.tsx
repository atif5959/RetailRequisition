'use client';

import { useMemo, useState } from 'react';
import ApiLoader from '@/components/ApiLoader';
import { getInHandStockKey, retailHeaderFields, retailItems } from '@/lib/retailRequisitionFields';
import { pakistanRegions } from '@/lib/regions';

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
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none transition';

const numInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-semibold text-slate-900 focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none transition';

export default function RetailRequisitionForm() {
  const [headerValues, setHeaderValues] = useState<HeaderValues>({
    Region: '', RouteCode: '', EmpCode: '', Location: '', Origin: '',
  });
  const [stocks, setStocks]       = useState<StockValues>({});
  const [quantities, setQuantities] = useState<QuantityValues>({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const itemTotals = useMemo(() =>
    retailItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.totalKey] = toQuantity(quantities[item.key] || '') * item.price;
      return acc;
    }, {}),
  [quantities]);

  const grandTotal = useMemo(() =>
    Object.values(itemTotals).reduce((sum, v) => sum + v, 0),
  [itemTotals]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const values: Record<string, string> = { ...headerValues };
    retailItems.forEach((item) => {
      const stockKey = getInHandStockKey(item.key);
      values[stockKey]    = stocks[stockKey] || '';
      values[item.key]    = quantities[item.key] || '';
      values[item.priceKey] = formatAmount(item.price);
      values[item.totalKey] = formatAmount(itemTotals[item.totalKey] || 0);
    });
    values.GrandTotal = formatAmount(grandTotal);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });

      if (res.ok) {
        setSubmitted(true);
        setHeaderValues({ Region: '', RouteCode: '', EmpCode: '', Location: '', Origin: '' });
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
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
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Requester Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Requester Details</h2>
        </div>
        <div className="p-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {retailHeaderFields.map((field) => (
            <label key={field.key} className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{field.label}</span>
              {field.key === 'Region' ? (
                <select
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(e) => setHeaderValues((c) => ({ ...c, [field.key]: e.target.value }))}
                  required
                  className="app-select"
                >
                  <option value="">Select region</option>
                  {pakistanRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : (
                <input
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(e) => setHeaderValues((c) => ({ ...c, [field.key]: e.target.value }))}
                  required
                  className={inputClass}
                />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Stock Items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-[40%]">Item</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-[15%]">In Hand Stock</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-[15%]">Quantity</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-[15%]">Price</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 w-[15%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {retailItems.map((item, index) => {
                const stockKey = getInHandStockKey(item.key);
                return (
                  <tr
                    key={item.key}
                    className={`border-t border-slate-100 hover:bg-red-50/30 transition ${index % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.label}</td>
                    <td className="px-5 py-3">
                      <input
                        name={stockKey}
                        type="number"
                        min="0"
                        step="1"
                        value={stocks[stockKey] || ''}
                        onChange={(e) => setStocks((c) => ({ ...c, [stockKey]: e.target.value }))}
                        className={numInputClass}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        name={item.key}
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[item.key] || ''}
                        onChange={(e) => setQuantities((c) => ({ ...c, [item.key]: e.target.value }))}
                        className={numInputClass}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-right px-3 py-2.5 text-sm font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                        {formatAmount(item.price)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-right px-3 py-2.5 text-sm font-bold text-slate-900 bg-red-50 rounded-lg border border-red-100">
                        {formatAmount(itemTotals[item.totalKey] || 0)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="border-t border-slate-200 px-5 py-4 flex items-center justify-end gap-4 bg-slate-50">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Grand Total</span>
          <div className="bg-white border-2 border-red-200 rounded-xl px-6 py-2.5 text-xl font-black text-red-600 shadow-sm min-w-[160px] text-right">
            {formatAmount(grandTotal)}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-10 py-3.5 rounded-full hover:bg-red-700 transition shadow disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {loading ? <ApiLoader label="Submitting" /> : 'Submit Requisition →'}
        </button>
        {error && (
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>

    </form>
  );
}
