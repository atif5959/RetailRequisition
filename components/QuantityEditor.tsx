'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInHandStockKey } from '@/lib/retailRequisitionFields';
import type { RetailItem } from '@/lib/retailRequisitionFields';
import ApiLoader from '@/components/ApiLoader';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatAmount = (n: number) => fmt.format(n);

const numInputClass =
  'w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-right text-sm font-semibold text-slate-900 dark:text-white focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30 focus:outline-none transition';

export default function QuantityEditor({
  submissionId,
  isPending,
  valueMap,
  items,
}: {
  submissionId: string;
  isPending: boolean;
  valueMap: Record<string, string>;
  items: RetailItem[];
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, string>>(
    () => Object.fromEntries(items.map((item) => [item.key, valueMap[item.key] || ''])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  function getTotal(item: (typeof items)[number]) {
    const qty = Number(quantities[item.key]) || 0;
    return qty * item.price;
  }

  const grandTotal = isPending
    ? items.reduce((sum, item) => sum + getTotal(item), 0)
    : null;

  async function handleSave() {
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/values`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantities }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Failed to save.'); return; }
      setSavedMsg('Changes saved.');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const grandTotalValue = isPending
    ? formatAmount(grandTotal ?? 0)
    : (valueMap.GrandTotal || '0.00');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-900 dark:text-white">Submitted Items</h2>
        <span className="text-base sm:text-lg font-extrabold text-red-600 dark:text-red-400 whitespace-nowrap">
          Grand Total: {grandTotalValue}
        </span>
      </div>

      {/* ── DESKTOP TABLE (sm and up) ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-900 text-left">
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300">Item</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">In Hand Stock</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Quantity</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Price</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.key} className={`border-t border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-700/30' : ''}`}>
                <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{item.label}</td>
                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                  {valueMap[getInHandStockKey(item.key)] || '0'}
                </td>
                <td className="px-5 py-3 w-32">
                  {isPending ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quantities[item.key]}
                      onChange={(e) =>
                        setQuantities((q) => ({ ...q, [item.key]: e.target.value }))
                      }
                      className={numInputClass}
                    />
                  ) : (
                    <span className="block text-right text-slate-600 dark:text-slate-300">
                      {valueMap[item.key] || '0'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">
                  {valueMap[item.priceKey] || '0.00'}
                </td>
                <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">
                  {isPending
                    ? formatAmount(getTotal(item))
                    : (valueMap[item.totalKey] || '0.00')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS (below sm) ── */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
        {items.map((item) => {
          const inHand = valueMap[getInHandStockKey(item.key)] || '0';
          const total  = isPending
            ? formatAmount(getTotal(item))
            : (valueMap[item.totalKey] || '0.00');
          const price  = valueMap[item.priceKey] || '0.00';
          const qty    = valueMap[item.key] || '0';

          return (
            <div key={item.key} className="px-4 py-4 space-y-3">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2">
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-0.5">In Hand</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{inHand}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2">
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Price</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{price}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2">
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide mb-1">Quantity</p>
                  {isPending ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={quantities[item.key]}
                      onChange={(e) =>
                        setQuantities((q) => ({ ...q, [item.key]: e.target.value }))
                      }
                      className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 px-2 py-1 text-right text-sm font-semibold text-slate-900 dark:text-white focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none transition"
                    />
                  ) : (
                    <p className="font-bold text-slate-700 dark:text-slate-200">{qty}</p>
                  )}
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 font-semibold uppercase tracking-wide mb-0.5">Total</p>
                  <p className="font-bold text-red-700 dark:text-red-400">{total}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save bar — only shown when pending */}
      {isPending && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-red-700 transition shadow disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {saving ? <ApiLoader label="Saving" /> : 'Save Changes'}
          </button>
          {savedMsg && <span className="text-sm font-semibold text-green-600 dark:text-green-400">{savedMsg}</span>}
          {error && <span className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</span>}
        </div>
      )}
    </div>
  );
}
