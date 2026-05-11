import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 space-y-5">
        <h1 className="text-3xl font-bold">Retail Requisition</h1>
        <p className="text-slate-600">Submit a requisition or access the dashboard.</p>
        <div className="flex gap-3">
          <Link className="px-4 py-2 rounded-lg bg-slate-900 text-white" href="/form/retail-requisition">Open Form</Link>
          <Link className="px-4 py-2 rounded-lg border" href="/dashboard/login">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
