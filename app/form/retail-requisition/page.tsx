import RetailRequisitionForm from '@/components/RetailRequisitionForm';

export const dynamic = 'force-dynamic';

export default async function RetailFormPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_32%),linear-gradient(135deg,#fca5a5_0%,#ef4444_46%,#fee2e2_100%)] bg-cover bg-center p-4 sm:p-8">
      <div className="mx-auto max-w-[1220px]">
        <RetailRequisitionForm />
      </div>
    </main>
  );
}
