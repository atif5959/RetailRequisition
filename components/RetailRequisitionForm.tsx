'use client';

import { useMemo, useState } from 'react';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import { getInHandStockKey, retailHeaderFields, retailItems } from '@/lib/retailRequisitionFields';
import { pakistanRegions } from '@/lib/regions';

type HeaderValues = Record<(typeof retailHeaderFields)[number]['key'], string>;
type QuantityValues = Record<string, string>;
type StockValues = Record<string, string>;

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

export default function RetailRequisitionForm() {
  const [headerValues, setHeaderValues] = useState<HeaderValues>({
    Region: '',
    RouteCode: '',
    EmpCode: '',
    Location: '',
    Origin: '',
  });
  const [stocks, setStocks] = useState<StockValues>({});
  const [quantities, setQuantities] = useState<QuantityValues>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const itemTotals = useMemo(() => {
    return retailItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.totalKey] = toQuantity(quantities[item.key] || '') * item.price;
      return acc;
    }, {});
  }, [quantities]);

  const grandTotal = useMemo(() => {
    return Object.values(itemTotals).reduce((sum, value) => sum + value, 0);
  }, [itemTotals]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const values: Record<string, string> = { ...headerValues };
    retailItems.forEach((item) => {
      const stockKey = getInHandStockKey(item.key);
      const quantity = quantities[item.key] || '';
      const total = itemTotals[item.totalKey] || 0;
      values[stockKey] = stocks[stockKey] || '';
      values[item.key] = quantity;
      values[item.priceKey] = formatAmount(item.price);
      values[item.totalKey] = formatAmount(total);
    });
    values.GrandTotal = formatAmount(grandTotal);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });

      if (res.ok) {
        setMessage('Thank you for filling out the form. Your response has been recorded.');
        setHeaderValues({ Region: '', RouteCode: '', EmpCode: '', Location: '', Origin: '' });
        setStocks({});
        setQuantities({});
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="retail-form-shell overflow-hidden">
      <div className="retail-form-header px-4 py-7 text-center sm:px-8">
        <img
          src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
          alt=""
          className="retail-logo mx-auto mb-3 h-16 w-auto"
        />
        <h1 className="text-3xl font-bold text-[#ec0c0c]">Retail Requisition</h1>
      </div>

      <div className="space-y-6 p-4 sm:p-8">
        <div className="retail-section grid gap-4 md:grid-cols-2">
          {retailHeaderFields.map((field) => (
            <label key={field.key} className="retail-field-label space-y-2 text-sm font-bold text-black">
              <span>{field.label}</span>
              {field.key === 'Region' ? (
                <select
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(event) => setHeaderValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  required
                  className="retail-input app-select"
                >
                  <option value="">Select region</option>
                  {pakistanRegions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              ) : (
                <input
                  name={field.key}
                  value={headerValues[field.key]}
                  onChange={(event) => setHeaderValues((current) => ({ ...current, [field.key]: event.target.value }))}
                  required
                  className="retail-input w-full rounded-lg border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-white/70 transition duration-200 placeholder:text-slate-400 hover:border-red-200 hover:shadow-md focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              )}
            </label>
          ))}
        </div>

        <div className="retail-table-wrap overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="retail-table-head text-left">
              <tr>
                <th className="w-[44%] px-3 py-3">Item</th>
                <th className="w-[14%] px-3 py-3">In Hand Stock</th>
                <th className="w-[14%] px-3 py-3">Quantity</th>
                <th className="w-[14%] px-3 py-3">Price</th>
                <th className="w-[14%] px-3 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {retailItems.map((item, index) => {
                const stockKey = getInHandStockKey(item.key);
                return (
                  <tr key={item.key} className="retail-item-row" style={{ animationDelay: `${Math.min(index * 18, 420)}ms` }}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{item.label}</td>
                    <td className="px-3 py-2">
                      <input
                        name={stockKey}
                        type="number"
                        min="0"
                        step="1"
                        value={stocks[stockKey] || ''}
                        onChange={(event) => setStocks((current) => ({ ...current, [stockKey]: event.target.value }))}
                        className="retail-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:border-red-200 hover:shadow-md focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={item.key}
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[item.key] || ''}
                        onChange={(event) => setQuantities((current) => ({ ...current, [item.key]: event.target.value }))}
                        className="retail-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:border-red-200 hover:shadow-md focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input value={formatAmount(item.price)} readOnly className="retail-readonly-input w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-right text-sm font-semibold text-slate-600 shadow-inner" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={formatAmount(itemTotals[item.totalKey] || 0)} readOnly className="retail-total-input w-full rounded-lg border border-red-100 bg-red-50/60 px-3 py-2.5 text-right text-sm font-bold text-slate-950 shadow-inner" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="retail-grand-row">
                <td className="px-3 py-3 text-right font-bold" colSpan={4}>Grand Total</td>
                <td className="px-3 py-3">
                  <input value={formatAmount(grandTotal)} readOnly className="retail-grand-total w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-right text-lg font-black text-red-700 shadow-md ring-4 ring-red-100/70" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <AppButton disabled={loading} type="submit" className="px-8 py-3">
          {loading ? <ApiLoader label="Submitting" /> : 'Submit'}
        </AppButton>

        {message && <p className="retail-message px-4 py-3 text-sm font-semibold text-slate-800">{message}</p>}
      </div>
    </form>
  );
}
