import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import RequisitionsTable from '@/components/RequisitionsTable';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function RequisitionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/dashboard/login');

  return (
    <div className="md:flex min-h-screen -m-6">
      <DashboardNav role={profile.role} />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Requisitions</h1>
        </div>
        <RequisitionsTable />
      </main>
    </div>
  );
}
