import TruckLoader from '@/components/TruckLoader';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-red-50">
      <div className="rounded-2xl bg-white/80 p-8 shadow-xl">
        <TruckLoader />
      </div>
    </main>
  );
}
