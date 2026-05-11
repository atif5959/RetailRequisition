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

  async function login(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ── NAV ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="Logo"
              className="h-10 w-auto"
            />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight hidden sm:inline">RetailReq</span>
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
            <form onSubmit={login} className="px-8 py-8 space-y-5">

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100 focus:outline-none transition"
                />
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
