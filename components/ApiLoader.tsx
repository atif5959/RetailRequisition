'use client';

type ApiLoaderProps = {
  label?: string;
  tone?: 'light' | 'dark';
};

export default function ApiLoader({ label = 'Loading', tone = 'light' }: ApiLoaderProps) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <svg
        className="animate-spin"
        style={{ width: '1em', height: '1em', flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{label}</span>
    </span>
  );
}
