'use client';

import { useState } from 'react';
import ApiLoader from '@/components/ApiLoader';
import type { RetailItemRow } from '@/lib/getRetailItems';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cellInput =
  'w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition';

const addInput =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';

export default function FieldManager({ items: initial }: { items: RetailItemRow[] }) {
  const [items, setItems]         = useState<RetailItemRow[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVals, setEditVals]   = useState({ label: '', price: '' });
  const [savingId, setSavingId]   = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addForm, setAddForm]     = useState({ label: '', price: '' });
  const [adding, setAdding]       = useState(false);
  const [addError, setAddError]   = useState('');

  function startEdit(item: RetailItemRow) {
    setEditingId(item.id);
    setEditVals({ label: item.label, price: String(item.price) });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/retail-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editVals.label, price: parseFloat(editVals.price) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Save failed'); return; }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, label: editVals.label, price: parseFloat(editVals.price) || 0 }
            : item,
        ),
      );
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  }

  async function removeItem(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/retail-items/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'Delete failed'); return; }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    const price = parseFloat(addForm.price);
    if (isNaN(price) || price < 0) { setAddError('Enter a valid price'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/retail-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: addForm.label.trim(), price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setAddError(data.error || 'Failed to add item'); return; }
      setItems((prev) => [...prev, data.item]);
      setAddForm({ label: '', price: '' });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Requisition Form Items</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} — changes take effect on new submissions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300 w-10">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">Item Name</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-300 w-44">Unit Price (PKR)</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-300 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No items yet. Add one below.
                  </td>
                </tr>
              )}
              {items.map((item, i) => (
                <tr key={item.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{i + 1}</td>

                  <td className="px-5 py-3">
                    {editingId === item.id ? (
                      <input
                        value={editVals.label}
                        onChange={(e) => setEditVals((v) => ({ ...v, label: e.target.value }))}
                        className={cellInput}
                      />
                    ) : (
                      <span className="font-semibold text-slate-800">{item.label}</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editVals.price}
                        onChange={(e) => setEditVals((v) => ({ ...v, price: e.target.value }))}
                        className={`${cellInput} text-right`}
                      />
                    ) : (
                      <p className="text-right font-semibold text-slate-700">{fmt.format(item.price)}</p>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={!!savingId}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {savingId === item.id ? <ApiLoader label="Saving" /> : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <ApiLoader label="..." />
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add new item */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Add New Item</h2>
            <p className="text-xs text-slate-500">Appears on all future form submissions.</p>
          </div>
        </div>
        <form onSubmit={addItem} className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Item Name</label>
              <input
                placeholder="e.g. Bubble Wrap Roll"
                value={addForm.label}
                onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                required
                className={addInput}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Unit Price (PKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={addForm.price}
                onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                required
                className={addInput}
              />
            </div>
          </div>
          {addError && (
            <p className="mt-3 text-sm font-semibold text-red-600">{addError}</p>
          )}
          <div className="mt-5">
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-700 transition shadow disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {adding ? <ApiLoader label="Adding" /> : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
