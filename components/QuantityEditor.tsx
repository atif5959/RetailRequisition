'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInHandStockKey } from '@/lib/retailRequisitionFields';
import type { RetailItem } from '@/lib/retailRequisitionFields';
import ApiLoader from '@/components/ApiLoader';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatAmount = (n: number) => fmt.format(n);

const numInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-900 focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none transition';

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Submitted Items</h2>
        <span className="text-lg font-extrabold text-red-600">
          Grand Total:{' '}
          {isPending
            ? formatAmount(grandTotal ?? 0)
            : (valueMap.GrandTotal || '0.00')}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
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
              <tr key={item.key} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}>
                <td className="px-5 py-3 font-semibold text-slate-800">{item.label}</td>
                <td className="px-5 py-3 text-right text-slate-600">
                  {valueMap[getInHandStockKey(item.key)] || '0'}
                </td>
                <td className="px-5 py-3">
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
                    <span className="block text-right text-slate-600">
                      {valueMap[item.key] || '0'}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-slate-600">
                  {valueMap[item.priceKey] || '0.00'}
                </td>
                <td className="px-5 py-3 text-right font-bold text-slate-900">
                  {isPending
                    ? formatAmount(getTotal(item))
                    : (valueMap[item.totalKey] || '0.00')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save bar — only shown when pending */}
      {isPending && (
        <div className="border-t border-slate-200 px-6 py-4 flex items-center gap-4 bg-slate-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-red-700 transition shadow disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {saving ? <ApiLoader label="Saving" /> : 'Save Changes'}
          </button>
          {savedMsg && <span className="text-sm font-semibold text-green-600">{savedMsg}</span>}
          {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}
