'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function doLogin() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else if (!data.user) setError('Login failed. Please check your email and password.');
      else {
        router.refresh();
        router.push('/dashboard/requisitions');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void doLogin();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ── NAV ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="Logo"
              className="h-11 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

            {/* Card header strip */}
            <div className="bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_50%,#ef4444_100%)] px-8 py-8 text-center">
              <img
                src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
                alt="Logo"
                className="h-12 w-auto mx-auto mb-4 brightness-0 invert"
              />
              <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
              <p className="text-red-100 text-sm mt-1">Sign in to manage requisitions</p>
            </div>

            {/* Form body */}
            <form onSubmit={(e) => { e.preventDefault(); void doLogin(); }} className="px-8 py-8 space-y-5">

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? (
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

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <AppButton
                disabled={loading}
                type="submit"
                designKey="danger"
                className="w-full py-3 text-base mt-1"
              >
                {loading ? <ApiLoader label="Signing in" /> : 'Sign In →'}
              </AppButton>

              <p className="text-center text-xs text-slate-400 pt-1">
                For access, contact your system administrator.
              </p>
            </form>
          </div>

          {/* Below card note */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Not an admin?{' '}
            <Link href="/form/retail-requisition" className="text-red-600 font-semibold hover:underline">
              Submit a requisition →
            </Link>
          </p>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-center text-xs">
        © 2025 Retail Requisition System. All rights reserved.
      </footer>

    </div>
  );
}
