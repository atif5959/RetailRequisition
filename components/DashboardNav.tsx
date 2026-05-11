import Link from 'next/link';

export default function DashboardNav({ role }: { role?: string }) {
  return (
    <aside className="w-full md:w-64 bg-white border-r min-h-screen p-5 space-y-4">
      <h2 className="font-bold text-xl">Dashboard</h2>
      <nav className="space-y-2 text-sm">
        <Link className="block p-2 rounded hover:bg-slate-100" href="/dashboard/requisitions">Requisitions</Link>
        {role === 'super_admin' && <Link className="block p-2 rounded hover:bg-slate-100" href="/dashboard/form-fields">Form Fields</Link>}
        {role === 'super_admin' && <Link className="block p-2 rounded hover:bg-slate-100" href="/dashboard/users">Users</Link>}
      </nav>
    </aside>
  );
}
