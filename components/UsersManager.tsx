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

export default function UsersManager({ users }: { users: DashboardUser[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'admin' as DashboardUser['role'],
    region: '',
  });
  const [edits, setEdits] = useState<Record<string, Pick<DashboardUser, 'email' | 'role' | 'region'> & { password: string }>>(
    Object.fromEntries(users.map((user) => [user.id, { email: user.email, role: user.role, region: user.region || '', password: '' }]))
  );

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error || 'Unable to create user.');
        return;
      }

      setForm({ email: '', password: '', role: 'admin', region: '' });
      setMessage('User created successfully.');
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(userId: string) {
    setSavingUserId(userId);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits[userId]),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error || 'Unable to update user.');
        return;
      }

      setMessage('User updated successfully.');
      router.refresh();
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createUser} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Create User</h2>
          <p className="text-sm text-slate-500">Only super admins can create dashboard users.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            minLength={6}
            required
          />
          <select
            className="app-select"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as DashboardUser['role'] }))}
          >
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select
            className="app-select"
            value={form.region}
            onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
            required
          >
            <option value="">Select region</option>
            {pakistanRegions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
        </div>
        <AppButton disabled={creating} type="submit" className="mt-4">
          {creating ? <ApiLoader label="Creating" /> : 'Create User'}
        </AppButton>
      </form>

      {message && <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">{message}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold">Dashboard Users</h2>
          <p className="text-sm text-slate-500">Update role and region assignments here.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Region</th>
                <th className="p-3">Password</th>
                <th className="p-3">Created</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const edit = edits[user.id] || { email: user.email, role: user.role, region: user.region || '', password: '' };
                return (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                        type="email"
                        value={edit.email}
                        onChange={(event) => setEdits((current) => ({ ...current, [user.id]: { ...edit, email: event.target.value } }))}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="app-select"
                        value={edit.role}
                        onChange={(event) => setEdits((current) => ({ ...current, [user.id]: { ...edit, role: event.target.value as DashboardUser['role'] } }))}
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        className="app-select"
                        value={edit.region || ''}
                        onChange={(event) => setEdits((current) => ({ ...current, [user.id]: { ...edit, region: event.target.value } }))}
                      >
                        <option value="">Select region</option>
                        {pakistanRegions.map((region) => <option key={region} value={region}>{region}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                        placeholder="New password"
                        type="password"
                        value={edit.password}
                        onChange={(event) => setEdits((current) => ({ ...current, [user.id]: { ...edit, password: event.target.value } }))}
                      />
                    </td>
                    <td className="p-3 text-slate-600">{user.created_at && new Date(user.created_at).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <AppButton
                        onClick={() => updateUser(user.id)}
                        disabled={savingUserId === user.id}
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
