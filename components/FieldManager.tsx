'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import ApiLoader from '@/components/ApiLoader';
import FieldError from '@/components/FieldError';
import type { RetailItemRow } from '@/lib/getRetailItems';

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PAGE_SIZE = 10;

const cellInput =
  'w-full rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition';

const modalInput =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';

export default function FieldManager({ items: initial }: { items: RetailItemRow[] }) {
  const [items, setItems]           = useState<RetailItemRow[]>(initial);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editVals, setEditVals]     = useState({ label: '', price: '' });
  const [savingId, setSavingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & pagination
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [addForm, setAddForm]       = useState({ label: '', price: '' });
  const [adding, setAdding]         = useState(false);
  const [addErrors, setAddErrors]   = useState<{ label?: string; price?: string }>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  function openModal() {
    setAddForm({ label: '', price: '' });
    setAddErrors({});
    setModalOpen(true);
  }
  function closeModal() { setAddErrors({}); setModalOpen(false); }

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
    const errs: { label?: string; price?: string } = {};
    if (addForm.label.trim() === '') errs.label = 'Item name is required';
    if (addForm.price === '') {
      errs.price = 'Price is required';
    } else {
      const price = parseFloat(addForm.price);
      if (isNaN(price) || price < 0) errs.price = 'Enter a valid price (0 or above)';
    }
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    setAddErrors({});
    const price = parseFloat(addForm.price);
    setAdding(true);
    try {
      const res = await fetch('/api/admin/retail-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: addForm.label.trim(), price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setAddErrors({ label: data.error || 'Failed to add item' }); return; }
      setItems((prev) => [...prev, data.item]);
      closeModal();
    } finally {
      setAdding(false);
    }
  }

  const modal = modalOpen ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="absolute inset-0" onClick={closeModal} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Close */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_50%,#ef4444_100%)] px-8 py-7">
          <h2 className="text-xl font-extrabold text-white">Add New Item</h2>
          <p className="text-red-100 text-sm mt-1">Appears on all future form submissions.</p>
        </div>

        {/* Form */}
        <form onSubmit={addItem} noValidate className="px-8 py-7 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Item Name
            </label>
            <input
              placeholder="e.g. Bubble Wrap Roll"
              value={addForm.label}
              onChange={(e) => { setAddErrors((ev) => ({ ...ev, label: undefined })); setAddForm((f) => ({ ...f, label: e.target.value })); }}
              autoFocus
              className={`${modalInput} ${addErrors.label ? 'input-error' : ''}`}
            />
            <FieldError msg={addErrors.label} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Unit Price (PKR)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={addForm.price}
              onChange={(e) => { setAddErrors((ev) => ({ ...ev, price: undefined })); setAddForm((f) => ({ ...f, price: e.target.value })); }}
              className={`${modalInput} ${addErrors.price ? 'input-error' : ''}`}
            />
            <FieldError msg={addErrors.price} />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={adding}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {adding ? <ApiLoader label="Adding" /> : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {/* Items table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="px-4 sm:px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Requisition Form Items</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {items.length} item{items.length !== 1 ? 's' : ''} — changes take effect on new submissions
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition"
              />
            </div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow text-sm flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
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
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">
                    {search ? `No items match "${search}"` : 'No items yet. Click "Add Item" to create one.'}
                  </td>
                </tr>
              )}
              {pageItems.map((item, i) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
                return (
                <tr key={item.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{globalIndex + 1}</td>

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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition
                    ${p === currentPage
                      ? 'bg-red-600 text-white shadow'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
