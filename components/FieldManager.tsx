'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import type { FormField, FieldType } from '@/lib/types';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';

export default function FieldManager({ fields }: { fields: FormField[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    label: '', field_key: '', field_type: 'text' as FieldType,
    required: false, options: '', sort_order: 0,
  });
  const [creating, setCreating]   = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createField(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await fetch('/api/admin/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, options: form.options ? form.options.split(',').map((x) => x.trim()) : null }),
      });
      setForm({ label: '', field_key: '', field_type: 'text', required: false, options: '', sort_order: 0 });
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function deleteField(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/fields/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Add field form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Add Form Field</h2>
            <p className="text-xs text-slate-500">New fields appear on the requisition form.</p>
          </div>
        </div>
        <form onSubmit={createField} className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Label</label>
              <input placeholder="e.g. Employee Name" value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Field Key</label>
              <input placeholder="e.g. employee_name" value={form.field_key}
                onChange={(e) => setForm({ ...form, field_key: e.target.value })}
                required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</label>
              <select value={form.field_type}
                onChange={(e) => setForm({ ...form, field_type: e.target.value as FieldType })}
                className="app-select">
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Options (comma separated)</label>
              <input placeholder="Option A, Option B" value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort Order</label>
              <input type="number" placeholder="0" value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className={inputClass} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="required-check" checked={form.required}
                onChange={(e) => setForm({ ...form, required: e.target.checked })}
                className="w-4 h-4 accent-red-600" />
              <label htmlFor="required-check" className="text-sm font-semibold text-slate-700">Required field</label>
            </div>
          </div>
          <div className="mt-5">
            <AppButton disabled={creating} type="submit" designKey="danger" className="px-6 py-2.5">
              {creating ? <ApiLoader label="Adding" /> : 'Add Field'}
            </AppButton>
          </div>
        </form>
      </div>

      {/* Fields table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Existing Fields</h2>
          <p className="text-xs text-slate-500 mt-0.5">{fields.length} field{fields.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                {['Label', 'Key', 'Type', 'Required', 'Order', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">No fields yet.</td>
                </tr>
              )}
              {fields.map((field, i) => (
                <tr key={field.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{field.label}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{field.field_key}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full capitalize">{field.field_type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${field.required ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                      {field.required ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{field.sort_order}</td>
                  <td className="px-5 py-3.5">
                    <AppButton
                      disabled={deletingId === field.id}
                      onClick={() => deleteField(field.id)}
                      designKey="danger"
                      className="px-4 py-2 text-xs"
                    >
                      {deletingId === field.id ? <ApiLoader label="Deleting" /> : 'Delete'}
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
