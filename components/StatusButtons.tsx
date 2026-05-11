'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiLoader from '@/components/ApiLoader';

export default function StatusButtons({ id }: { id: string }) {
  const router = useRouter();
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  async function update(status: string) {
    setSavingStatus(status);
    try {
      await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setSavingStatus(null);
    }
  }

  const busy = Boolean(savingStatus);

  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <button
        disabled={busy}
        onClick={() => update('approved')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {savingStatus === 'approved' ? (
          <ApiLoader label="Approving" />
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </>
        )}
      </button>

      <button
        disabled={busy}
        onClick={() => update('rejected')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {savingStatus === 'rejected' ? (
          <ApiLoader label="Rejecting" />
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </>
        )}
      </button>

      <button
        disabled={busy}
        onClick={() => update('pending')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-300 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {savingStatus === 'pending' ? (
          <ApiLoader label="Saving" />
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark Pending
          </>
        )}
      </button>
    </div>
  );
}
