'use client';

import { useState } from 'react';
import type { FormField } from '@/lib/types';

export default function FormRenderer({ fields }: { fields: FormField[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage('');
    const values: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.field_type === 'checkbox') values[field.field_key] = formData.get(field.field_key) === 'on';
      else values[field.field_key] = formData.get(field.field_key)?.toString() || '';
    });

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });

    setLoading(false);
    if (res.ok) {
      setMessage('Request submitted successfully.');
      (document.getElementById('retail-form') as HTMLFormElement)?.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || 'Something went wrong.');
    }
  }

  return (
    <form id="retail-form" action={onSubmit} className="space-y-5 bg-white rounded-2xl shadow p-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="font-medium">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.field_type === 'textarea' ? (
            <textarea name={field.field_key} required={field.required} className="w-full border rounded-lg p-3 min-h-28" />
          ) : field.field_type === 'select' ? (
            <select name={field.field_key} required={field.required} className="w-full border rounded-lg p-3 bg-white">
              <option value="">Select</option>
              {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : field.field_type === 'checkbox' ? (
            <input name={field.field_key} type="checkbox" className="h-5 w-5" />
          ) : (
            <input name={field.field_key} type={field.field_type} required={field.required} className="w-full border rounded-lg p-3" />
          )}
        </div>
      ))}
      <button disabled={loading} className="w-full rounded-lg bg-slate-900 text-white py-3 disabled:opacity-60">
        {loading ? 'Submitting...' : 'Submit Requisition'}
      </button>
      {message && <p className="text-center text-sm text-slate-700">{message}</p>}
    </form>
  );
}
