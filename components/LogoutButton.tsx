'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiLoader from '@/components/ApiLoader';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      await supabase.auth.signOut();
      router.refresh();
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {loading ? <ApiLoader label="Logging out" /> : 'Logout'}
    </button>
  );
}
