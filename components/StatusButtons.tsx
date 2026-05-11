'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton } from '@/components/AppButton';
import ApiLoader from '@/components/ApiLoader';

export default function StatusButtons({ id }: { id: string }) {
  const router = useRouter();
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  async function update(status: string) {
    setSavingStatus(status);
    try {
      await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
      });
      router.refresh();
    } finally {
      setSavingStatus(null);
    }
  }

  return <div className="flex gap-2"><AppButton disabled={Boolean(savingStatus)} onClick={() => update('approved')}>{savingStatus === 'approved' ? <ApiLoader label="Approving" /> : 'Approve'}</AppButton><AppButton disabled={Boolean(savingStatus)} onClick={() => update('rejected')}>{savingStatus === 'rejected' ? <ApiLoader label="Rejecting" /> : 'Reject'}</AppButton><AppButton disabled={Boolean(savingStatus)} onClick={() => update('pending')}>{savingStatus === 'pending' ? <ApiLoader label="Saving" tone="dark" /> : 'Mark Pending'}</AppButton></div>;
}
