'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormField, FieldType } from '@/lib/types';

export default function FieldManager({ fields }: { fields: FormField[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ label: '', field_key: '', field_type: 'text' as FieldType, required: false, options: '', sort_order: 0 });

  async function createField(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/admin/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, options: form.options ? form.options.split(',').map(x => x.trim()) : null }) });
    setForm({ label: '', field_key: '', field_type: 'text', required: false, options: '', sort_order: 0 });
    router.refresh();
  }

  async function deleteField(id: string) {
    await fetch(`/api/admin/fields/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return <div className="space-y-6"><form onSubmit={createField} className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-2 gap-3"><input className="border rounded p-3" placeholder="Label" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required /><input className="border rounded p-3" placeholder="Field key e.g employee_name" value={form.field_key} onChange={e => setForm({ ...form, field_key: e.target.value })} required /><select className="border rounded p-3" value={form.field_type} onChange={e => setForm({ ...form, field_type: e.target.value as FieldType })}><option value="text">Text</option><option value="textarea">Textarea</option><option value="number">Number</option><option value="date">Date</option><option value="select">Select</option><option value="checkbox">Checkbox</option></select><input className="border rounded p-3" placeholder="Options comma separated" value={form.options} onChange={e => setForm({ ...form, options: e.target.value })} /><label className="flex items-center gap-2"><input type="checkbox" checked={form.required} onChange={e => setForm({ ...form, required: e.target.checked })} /> Required</label><input className="border rounded p-3" type="number" placeholder="Sort order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /><button className="md:col-span-2 bg-slate-900 text-white rounded p-3">Add Field</button></form><div className="bg-white rounded-2xl shadow overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-100 text-left"><tr><th className="p-3">Label</th><th>Key</th><th>Type</th><th>Required</th><th></th></tr></thead><tbody>{fields.map(field => <tr key={field.id} className="border-t"><td className="p-3">{field.label}</td><td>{field.field_key}</td><td>{field.field_type}</td><td>{field.required ? 'Yes' : 'No'}</td><td><button className="text-red-600" onClick={() => deleteField(field.id)}>Delete</button></td></tr>)}</tbody></table></div></div>;
}
