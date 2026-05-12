'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import { pakistanRegions } from '@/lib/regions';
import AppSelect from '@/components/AppSelect';

type DashboardUser = {
  id: string;
  email: string;
  role: 'admin' | 'head' | 'super_admin';
  region: string | null;
  created_at: string | null;
};

const createRoleOptions = [
  { value: 'admin',       label: 'Admin' },
  { value: 'head',        label: 'Head' },
];
const editRoleOptions = [
  { value: 'admin',       label: 'Admin' },
  { value: 'head',        label: 'Head' },
];
const regionOptions = [
  ...pakistanRegions.map((r) => ({ value: r, label: r })),
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';

export default function UsersManager({ users }: { users: DashboardUser[] }) {
  const router = useRouter();
  const [creating, setCreating]         = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [message, setMessage]           = useState<{ text: string; ok: boolean } | null>(null);
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [showPwIds, setShowPwIds]       = useState<Set<string>>(new Set());
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

  function toggleShowPw(id: string) {
    setShowPwIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
              <div className="relative">
                <input
                  type={showCreatePw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  minLength={6}
                  required
                  className={inputClass + ' pr-11'}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCreatePw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                >
                  {showCreatePw ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</label>
              <AppSelect
                value={form.role}
                onChange={(v) => setForm((c) => ({ ...c, role: v as DashboardUser['role'] }))}
                options={createRoleOptions}
                placeholder="Select role"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Region</label>
              <AppSelect
                value={form.region}
                onChange={(v) => setForm((c) => ({ ...c, region: v }))}
                options={regionOptions}
                placeholder="Select region"
              />
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
                const showPw = showPwIds.has(user.id);
                return (
                  <tr key={user.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-5 py-3">
                      <input type="email" value={edit.email}
                        onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, email: e.target.value } }))}
                        className={inputClass} />
                    </td>
                    <td className="px-5 py-3 min-w-[160px]">
                      <AppSelect
                        value={edit.role}
                        onChange={(v) => setEdits((c) => ({ ...c, [user.id]: { ...edit, role: v as DashboardUser['role'] } }))}
                        options={editRoleOptions}
                        placeholder="Select role"
                      />
                    </td>
                    <td className="px-5 py-3 min-w-[180px]">
                      <AppSelect
                        value={edit.region || ''}
                        onChange={(v) => setEdits((c) => ({ ...c, [user.id]: { ...edit, region: v } }))}
                        options={regionOptions}
                        placeholder="Select region"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          placeholder="Leave blank to keep"
                          value={edit.password}
                          onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, password: e.target.value } }))}
                          className={inputClass + ' pr-11'}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => toggleShowPw(user.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                        >
                          {showPw ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
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
