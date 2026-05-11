'use client';
import { useRouter } from 'next/navigation';

export default function StatusButtons({ id }: { id: string }) {
  const router = useRouter();
  async function update(status: string) {
    await fetch(`/api/admin/submissions/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    router.refresh();
  }
  return <div className="flex gap-2"><button onClick={() => update('approved')} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button><button onClick={() => update('rejected')} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button><button onClick={() => update('pending')} className="px-3 py-2 border rounded">Mark Pending</button></div>;
}
