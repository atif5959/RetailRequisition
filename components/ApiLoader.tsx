'use client';

import TruckLoader from '@/components/TruckLoader';

type ApiLoaderProps = {
  label?: string;
  tone?: 'light' | 'dark';
};

export default function ApiLoader({ label = 'Loading', tone = 'light' }: ApiLoaderProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <TruckLoader compact />
      <span>{label}</span>
    </span>
  );
}
