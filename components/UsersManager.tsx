'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import { pakistanRegions } from '@/lib/regions';

type DashboardUser = {
  id: string;
  email: string;
  role: 'admin' | 'head' | 'super_admin';
  region: string | null;
  created_at: string | null;
};

const roles = ['admin', 'head'] as const;

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';
const selectClass = 'app-select';

export default function UsersManager({ users }: { users: DashboardUser[] }) {
  const router = useRouter();
  const [creating, setCreating]         = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [message, setMessage]           = useState<{ text: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' as DashboardUser['role'], region: '' });
  const [edits, setEdits] = useState<Record<string, Pick<DashboardUser, 'email' | 'role' | 'region'> & { password: string }>>(
    Object.fromEntries(users.map((u) => [u.id, { email: u.email, role: u.role, region: u.region || '', password: '' }]))
  );

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res  = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage({ text: data.error || 'Unable to create user.', ok: false }); return; }
      setForm({ email: '', password: '', role: 'admin', region: '' });
      setMessage({ text: 'User created successfully.', ok: true });
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(userId: string) {
    setSavingUserId(userId);
    setMessage(null);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edits[userId]) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage({ text: data.error || 'Unable to update user.', ok: false }); return; }
      setMessage({ text: 'User updated successfully.', ok: true });
      router.refresh();
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Create user form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Create User</h2>
            <p className="text-xs text-slate-500">Only super admins can create dashboard users.</p>
          </div>
        </div>
        <form onSubmit={createUser} className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
              <input type="email" placeholder="admin@example.com" value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                minLength={6} required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</label>
              <select value={form.role} onChange={(e) => setForm((c) => ({ ...c, role: e.target.value as DashboardUser['role'] }))} className={selectClass}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Region</label>
              <select value={form.region} onChange={(e) => setForm((c) => ({ ...c, region: e.target.value }))} required className={selectClass}>
                <option value="">Select region</option>
                {pakistanRegions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5">
            <AppButton disabled={creating} type="submit" designKey="danger" className="px-6 py-2.5">
              {creating ? <ApiLoader label="Creating" /> : 'Create User'}
            </AppButton>
          </div>
        </form>
      </div>

      {message && (
        <div className={`rounded-xl border px-5 py-3.5 text-sm font-semibold ${message.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Dashboard Users</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update role and region assignments below.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-900">
              <tr>
                {['Email', 'Role', 'Region', 'New Password', 'Created', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const edit = edits[user.id] ?? { email: user.email, role: user.role, region: user.region || '', password: '' };
                return (
                  <tr key={user.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-5 py-3">
                      <input type="email" value={edit.email}
                        onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, email: e.target.value } }))}
                        className={inputClass} />
                    </td>
                    <td className="px-5 py-3">
                      <select value={edit.role}
                        onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, role: e.target.value as DashboardUser['role'] } }))}
                        className={selectClass}>
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <select value={edit.region || ''}
                        onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, region: e.target.value } }))}
                        className={selectClass}>
                        <option value="">Select region</option>
                        {pakistanRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <input type="password" placeholder="Leave blank to keep" value={edit.password}
                        onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, password: e.target.value } }))}
                        className={inputClass} />
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <AppButton
                        onClick={() => updateUser(user.id)}
                        disabled={savingUserId === user.id}
                        designKey="danger"
                        className="px-4 py-2 text-xs"
                      >
                        {savingUserId === user.id ? <ApiLoader label="Saving" /> : 'Save'}
                      </AppButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
