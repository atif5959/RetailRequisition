import { AppButtonLink } from '@/components/AppButton';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow p-8 space-y-5">
        <h1 className="text-3xl font-bold">Retail Requisition</h1>
        <p className="text-slate-600">Submit a requisition or access the dashboard.</p>
        <div className="flex gap-3">
          <AppButtonLink href="/form/retail-requisition">Open Form</AppButtonLink>
          <AppButtonLink href="/dashboard/login">Dashboard</AppButtonLink>
        </div>
      </div>
    </main>
  );
}
