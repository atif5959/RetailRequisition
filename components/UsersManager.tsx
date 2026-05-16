'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import FieldError from '@/components/FieldError';
import { pakistanRegions } from '@/lib/regions';
import AppSelect from '@/components/AppSelect';

type DashboardUser = {
  id: string;
  email: string;
  role: 'admin' | 'head' | 'super_admin' | 'employee';
  region: string | null;
  created_at: string | null;
};

type CurrentProfile = { role: string; region: string | null };

const superAdminCreateRoleOptions = [
  { value: 'admin',    label: 'Admin' },
  { value: 'head',     label: 'Head' },
  { value: 'employee', label: 'Employee' },
];
const headCreateRoleOptions = [
  { value: 'admin',    label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];
const superAdminEditRoleOptions = [
  { value: 'admin',    label: 'Admin' },
  { value: 'head',     label: 'Head' },
  { value: 'employee', label: 'Employee' },
];
const headEditRoleOptions = [
  { value: 'admin',    label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];
const regionOptions = pakistanRegions.map((r) => ({ value: r, label: r }));

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition';

const PAGE_SIZE = 10;

export default function UsersManager({
  users,
  currentProfile,
}: {
  users: DashboardUser[];
  currentProfile: CurrentProfile;
}) {
  const router  = useRouter();
  const isHead  = currentProfile.role === 'head';

  /* ── create modal ── */
  const [showModal, setShowModal]       = useState(false);
  const [creating, setCreating]         = useState(false);
  const [createMsg, setCreateMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [createErrors, setCreateErrors] = useState<{ identifier?: string; password?: string; region?: string }>({});
  const [form, setForm] = useState({
    email:   '',
    empCode: '',
    password: '',
    role: 'admin' as DashboardUser['role'],
    region: isHead ? (currentProfile.region ?? '') : '',
  });

  const isEmployeeRole = form.role === 'employee';

  /* ── table state ── */
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [tableMsg, setTableMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [showPwIds, setShowPwIds]     = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<
    Record<string, Pick<DashboardUser, 'email' | 'role' | 'region'> & { password: string }>
  >(
    Object.fromEntries(
      users.map((u) => [u.id, { email: u.email, role: u.role, region: u.region || '', password: '' }])
    )
  );

  const createRoleOptions = isHead ? headCreateRoleOptions : superAdminCreateRoleOptions;
  const editRoleOptions   = isHead ? headEditRoleOptions   : superAdminEditRoleOptions;

  /* reset page when search changes */
  useEffect(() => { setPage(1); }, [search]);

  /* close modal on Escape */
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showModal]);

  /* lock body scroll when modal open */
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  /* ── filtered + paginated ── */
  const filtered    = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── handlers ── */
  const blankForm = { email: '', empCode: '', password: '', role: 'admin' as DashboardUser['role'], region: isHead ? (currentProfile.region ?? '') : '' };
  function openCreateModal() { setCreateMsg(null); setCreateErrors({}); setForm(blankForm); setShowModal(true); }

  async function createUser(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs: typeof createErrors = {};
    if (isEmployeeRole) {
      if (!form.empCode.trim()) errs.identifier = 'Emp Code is required';
    } else {
      if (!form.email.trim()) errs.identifier = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.identifier = 'Enter a valid email address';
    }
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!isHead && !form.region) errs.region = 'Region is required';
    if (Object.keys(errs).length) { setCreateErrors(errs); return; }
    setCreateErrors({});
    setCreating(true);
    setCreateMsg(null);
    const payload = isEmployeeRole
      ? { empCode: form.empCode, password: form.password, role: form.role, region: form.region }
      : { email: form.email,    password: form.password, role: form.role, region: form.region };
    try {
      const res  = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setCreateMsg({ text: data.error || 'Unable to create user.', ok: false }); return; }
      setForm(blankForm);
      setCreateMsg({ text: 'User created successfully.', ok: true });
      router.refresh();
      setTimeout(() => { setShowModal(false); setCreateMsg(null); }, 1200);
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(userId: string) {
    setSavingUserId(userId);
    setTableMsg(null);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edits[userId]),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setTableMsg({ text: data.error || 'Unable to update user.', ok: false }); return; }
      setTableMsg({ text: 'User updated successfully.', ok: true });
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

  /* ── create modal markup ── */
  const modal = showModal ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Create User</h2>
              <p className="text-xs text-slate-500">
                {isHead ? 'Create Admin or Employee in your region.' : 'Create a new dashboard user.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={createUser} noValidate className="p-6 space-y-4">
          {/* Email or EmpCode — switches based on role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isEmployeeRole ? 'Emp Code' : 'Email'}
            </label>
            {isEmployeeRole ? (
              <input
                key="empCode"
                type="text"
                inputMode="numeric"
                placeholder="Enter employee code (numbers only)"
                value={form.empCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm((c) => ({ ...c, empCode: val }));
                  setCreateErrors((ce) => ({ ...ce, identifier: undefined }));
                }}
                className={`${inputClass} ${createErrors.identifier ? 'input-error' : ''}`}
              />
            ) : (
              <input
                key="email"
                type="text"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm((c) => ({ ...c, email: e.target.value }));
                  setCreateErrors((ce) => ({ ...ce, identifier: undefined }));
                }}
                className={`${inputClass} ${createErrors.identifier ? 'input-error' : ''}`}
              />
            )}
            <FieldError msg={createErrors.identifier} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showCreatePw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => {
                  setForm((c) => ({ ...c, password: e.target.value }));
                  setCreateErrors((ce) => ({ ...ce, password: undefined }));
                }}
                className={`${inputClass} pr-11 ${createErrors.password ? 'input-error' : ''}`}
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
            <FieldError msg={createErrors.password} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</label>
              <AppSelect
                value={form.role}
                onChange={(v) => setForm((c) => ({
                  ...c,
                  role: v as DashboardUser['role'],
                  email: '',
                  empCode: '',
                }))}
                options={createRoleOptions}
                placeholder="Select role"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Region</label>
              {isHead ? (
                <input
                  value={currentProfile.region ?? ''}
                  readOnly
                  disabled
                  className={inputClass + ' opacity-60 cursor-not-allowed'}
                />
              ) : (
                <AppSelect
                  value={form.region}
                  onChange={(v) => {
                    setForm((c) => ({ ...c, region: v }));
                    setCreateErrors((ce) => ({ ...ce, region: undefined }));
                  }}
                  options={regionOptions}
                  placeholder="Select region"
                />
              )}
              <FieldError msg={createErrors.region} />
            </div>
          </div>

          {createMsg && (
            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${createMsg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {createMsg.text}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <AppButton disabled={creating} type="submit" designKey="danger" className="px-6 py-2.5 flex-1">
              {creating ? <ApiLoader label="Creating" /> : 'Create User'}
            </AppButton>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  /* ── render ── */
  return (
    <div className="space-y-5">

      {/* Toolbar: search + create button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 focus:outline-none transition"
          />
        </div>

        {/* Create button */}
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      {tableMsg && (
        <div className={`rounded-xl border px-5 py-3.5 text-sm font-semibold ${tableMsg.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {tableMsg.text}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Dashboard Users</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHead ? 'Admin and Employee users in your region.' : 'Update role and region assignments below.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-900">
                <tr>
                  {['Email / Emp Code', 'Role', 'Region', 'New Password', 'Created', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, i) => {
                  const edit        = edits[user.id] ?? { email: user.email, role: user.role, region: user.region || '', password: '' };
                  const showPw      = showPwIds.has(user.id);
                  const rowIsEmp    = edit.role === 'employee';
                  return (
                    <tr key={user.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <td className="px-5 py-3">
                        {rowIsEmp ? (
                          <input
                            key={`${user.id}-emp`}
                            type="text"
                            inputMode="numeric"
                            placeholder="Emp Code (numbers only)"
                            value={edit.email}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEdits((c) => ({ ...c, [user.id]: { ...edit, email: val } }));
                            }}
                            className={inputClass}
                          />
                        ) : (
                          <input
                            key={`${user.id}-email`}
                            type="email"
                            placeholder="user@example.com"
                            value={edit.email}
                            onChange={(e) => setEdits((c) => ({ ...c, [user.id]: { ...edit, email: e.target.value } }))}
                            className={inputClass}
                          />
                        )}
                      </td>
                      <td className="px-5 py-3 min-w-[160px]">
                        <AppSelect
                          value={edit.role}
                          onChange={(v) => setEdits((c) => ({
                            ...c,
                            [user.id]: { ...edit, role: v as DashboardUser['role'] },
                          }))}
                          options={editRoleOptions}
                          placeholder="Select role"
                        />
                      </td>
                      <td className="px-5 py-3 min-w-[180px]">
                        {isHead ? (
                          <input
                            value={edit.region || ''}
                            readOnly
                            disabled
                            className={inputClass + ' opacity-60 cursor-not-allowed'}
                          />
                        ) : (
                          <AppSelect
                            value={edit.region || ''}
                            onChange={(v) => setEdits((c) => ({ ...c, [user.id]: { ...edit, region: v } }))}
                            options={regionOptions}
                            placeholder="Select region"
                          />
                        )}
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
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <AppButton
                          onClick={() => updateUser(user.id)}
                          disabled={savingUserId === user.id}
                          designKey="danger"
                          className="px-4 py-2 text-xs whitespace-nowrap"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Page {page} of {totalPages} &mdash; {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="First page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Previous"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e${idx}`} className="px-2 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition ${
                        page === item
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Last page"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create user modal via portal */}
      {typeof document !== 'undefined' && modal
        ? createPortal(modal, document.body)
        : null}
    </div>
  );
}
