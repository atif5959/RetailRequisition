import Link from 'next/link';
import RetailRequisitionForm from '@/components/RetailRequisitionForm';

export const dynamic = 'force-dynamic';

export default async function RetailFormPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="Logo"
              className="h-10 w-auto"
            />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight hidden sm:inline">RetailReq</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Submit</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Retail Requisition</h1>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 py-6 sm:py-8 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <RetailRequisitionForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-center text-xs">
        © 2025 Retail Requisition System. All rights reserved.
      </footer>
    </div>
  );
}
