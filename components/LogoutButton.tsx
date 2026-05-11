'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
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
    <AppButton
      designKey="danger"
      onClick={logout}
      disabled={loading}
      className="w-full"
    >
      {loading ? <ApiLoader label="Logging out" tone="dark" /> : 'Logout'}
    </AppButton>
  );
}
