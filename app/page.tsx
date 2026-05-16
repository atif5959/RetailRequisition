import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from '@/components/DarkModeToggle';

export const metadata: Metadata = {
  title: 'TCS Retail Requisition — Submit & Track Stock Requests',
  description:
    'Submit retail stock requisitions online, track approval status in real time, and manage fulfilment across all regions. Fast, paperless, and secure.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'TCS Retail Requisition — Submit & Track Stock Requests',
    description: 'Submit retail stock requisitions online, track approval status in real time, and manage fulfilment across all regions.',
    url: '/',
  },
};

const LOGO = 'https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Image src={LOGO} alt="TCS Logo" width={140} height={36} className="h-9 w-auto dark:brightness-0 dark:invert dark:opacity-80" priority />
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hidden md:inline hover:text-red-600 dark:hover:text-red-400 transition">How It Works</a>
            <a href="#features"     className="hidden md:inline hover:text-red-600 dark:hover:text-red-400 transition">Features</a>
            <a href="#roles"        className="hidden md:inline hover:text-red-600 dark:hover:text-red-400 transition">Roles</a>
            <DarkModeToggle />
            <Link
              href="/dashboard/requisitions"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition shadow-sm"
            >
              Admin Login →
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-20 sm:py-32 px-6">
        {/* Light mode: rich layered gradient */}
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-rose-50/50" />
        <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_top_right,rgba(220,38,38,0.18),transparent)]" />
        <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_bottom_left,rgba(239,68,68,0.10),transparent)]" />
        {/* Dark mode: vivid red glows */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.25),transparent_60%)]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(220,38,38,0.12),transparent_55%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 dark:via-red-600/50 to-transparent" />

        <div className="relative mx-auto max-w-5xl text-center space-y-8">
          <span className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            TCS Retail Operations Platform
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.08] tracking-tight">
            Stock Requisitions,<br />
            <span className="text-red-500">Simplified.</span>
          </h1>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed text-center">
              A complete digital platform for TCS retail teams to submit stock requests, track approvals in real time, and manage fulfilment across all regions — paperless and instant.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/form/retail-requisition"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-base px-8 py-4 rounded-2xl transition shadow-lg shadow-red-900/40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Submit a Requisition
            </Link>
            <Link
              href="/dashboard/requisitions"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white font-bold text-base px-8 py-4 rounded-2xl transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              View Dashboard
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-200 dark:border-white/10">
            {[
              { val: '3 Roles', sub: 'Head · Admin · Employee' },
              { val: 'Real-Time', sub: 'Status updates' },
              { val: 'All Regions', sub: 'Pakistan-wide' },
              { val: 'Mobile Ready', sub: 'Any device' },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-6 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">Step by Step</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">How It Works</h2>
            <div className="max-w-xl mx-auto mt-3">
              <p className="text-slate-600 dark:text-slate-500 text-lg text-center">From login to approval in four simple steps</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 border border-slate-100 dark:border-slate-600 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600 rounded-l-2xl" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-red-600 uppercase tracking-widest">Step 01</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Login with Your Credentials</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
                    Employees log in using their <strong className="text-slate-700 dark:text-slate-200">Emp Code</strong> (e.g. 1111) or email address. Admins and heads use their email. Your region and emp code are automatically detected.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Emp Code login', 'Email login', 'Auto region detection'].map((t) => (
                      <span key={t} className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 border border-slate-100 dark:border-slate-600 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 rounded-l-2xl" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Step 02</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Fill the Requester Details</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
                    Your <strong className="text-slate-700 dark:text-slate-200">Region is auto-filled</strong> and locked. Enter your <strong className="text-slate-700 dark:text-slate-200">Route Code</strong> (X followed by numbers), Location, and 3-letter Origin code.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Auto-filled Region', 'Route Code (X101)', 'Location & Origin'].map((t) => (
                      <span key={t} className="text-xs font-semibold bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 border border-slate-100 dark:border-slate-600 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-l-2xl" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Step 03</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Enter Stock Quantities</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
                    For each item (36 stock items), enter your <strong className="text-slate-700 dark:text-slate-200">In Hand Stock</strong> and <strong className="text-slate-700 dark:text-slate-200">Quantity Requested</strong>. Prices and totals calculate automatically. Grand total updates live.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['36 stock items', 'Auto price calc', 'Live grand total'].map((t) => (
                      <span key={t} className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 border border-slate-100 dark:border-slate-600 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded-l-2xl" />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-green-600 uppercase tracking-widest">Step 04</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Submit & Get Approved</h3>
                  <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed">
                    Hit <strong className="text-slate-700 dark:text-slate-200">Submit Requisition</strong>. It instantly appears in the admin dashboard as <strong className="text-amber-600">Pending</strong>. Admins review and mark it <strong className="text-green-600">Approved</strong> or <strong className="text-red-600">Rejected</strong>.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Instant submission', 'Pending → Approved', 'Rejection with reason'].map((t) => (
                      <span key={t} className="text-xs font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 sm:py-28 px-6 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Everything Built In</h2>
            <div className="max-w-xl mx-auto mt-3">
              <p className="text-slate-600 dark:text-slate-500 text-lg text-center">Every tool your retail operations team needs, in one place</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {[
              {
                color: 'red',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Smart Requisition Form',
                desc: '36 stock items with automatic price lookup, in-hand stock tracking, per-item totals, and a live grand total. Prices managed centrally by admins.',
                tags: ['36 items', 'Auto pricing', 'Live total'],
              },
              {
                color: 'amber',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Approval Workflow',
                desc: 'Every submission starts as Pending. Admins can Approve, Reject, or revert back to Pending. Status is visible in real time on the dashboard.',
                tags: ['Pending', 'Approved', 'Rejected'],
              },
              {
                color: 'blue',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ),
                title: 'Admin Dashboard',
                desc: 'View all requisitions in a paginated table. Filter by status. Click any submission to see full details including requester info and item breakdown.',
                tags: ['Pagination', 'Status filter', 'Full detail view'],
              },
              {
                color: 'purple',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Region-Based Access',
                desc: "Each admin and head only sees submissions from their own region. Super Admins see everything. Employees' region is auto-filled and locked on the form.",
                tags: ['Region locked', 'Scoped access', 'Auto-fill'],
              },
              {
                color: 'green',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'User Management',
                desc: 'Super Admins manage all users. Head users create and update Admin and Employee accounts within their own region. Employees log in with their Emp Code.',
                tags: ['4 roles', 'Region-scoped', 'Emp Code auth'],
              },
              {
                color: 'slate',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: 'Form Items & Pricing',
                desc: 'Super Admins can add, edit, or remove items from the requisition form and update their unit prices. Changes take effect on all future submissions.',
                tags: ['Add items', 'Edit prices', 'Remove items'],
              },
              {
                color: 'red',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure Authentication',
                desc: 'Powered by Supabase Auth. Employees authenticate with numeric Emp Codes mapped to internal emails. All routes are protected — no access without login.',
                tags: ['Supabase Auth', 'Role guards', 'Protected routes'],
              },
              {
                color: 'blue',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Fully Mobile Responsive',
                desc: 'The form, dashboard, and all management pages are fully optimised for mobile. Items show as cards on small screens. Dropdowns work with touch.',
                tags: ['Mobile form', 'Touch dropdowns', 'Card layout'],
              },
              {
                color: 'green',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Submitter Tracking',
                desc: 'Every submission records who submitted it — their ID, email, and role. This is stored alongside the form data for full audit trail and accountability.',
                tags: ['Audit trail', 'Submitter ID', 'Role recorded'],
              },
            ].map((f) => {
              const palette: Record<string, { bg: string; icon: string; tag: string }> = {
                red:    { bg: 'bg-red-50',    icon: 'text-red-600',    tag: 'bg-red-100 text-red-700' },
                amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  tag: 'bg-amber-100 text-amber-700' },
                blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   tag: 'bg-blue-100 text-blue-700' },
                purple: { bg: 'bg-purple-50', icon: 'text-purple-600', tag: 'bg-purple-100 text-purple-700' },
                green:  { bg: 'bg-green-50',  icon: 'text-green-600',  tag: 'bg-green-100 text-green-700' },
                slate:  { bg: 'bg-slate-100', icon: 'text-slate-600',  tag: 'bg-slate-200 text-slate-700' },
              };
              const p = palette[f.color];
              return (
                <div key={f.title} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className={`w-12 h-12 rounded-xl ${p.bg} ${p.icon} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span key={t} className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.tag}`}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-20 sm:py-28 px-6 bg-slate-100 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 dark:text-red-500">Access Control</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Three User Roles</h2>
            <div className="max-w-xl mx-auto mt-3">
              <p className="text-slate-600 dark:text-slate-400 text-lg text-center">Each role has a specific scope and set of permissions in the system</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                role: 'Employee',
                badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                headerBg: 'bg-blue-600',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                access: 'Form only',
                perms: ['Submit requisition form', 'Emp Code auto-filled', 'Region auto-filled', 'Login with Emp Code', 'No dashboard access'],
                restricted: [4],
              },
              {
                role: 'Admin',
                badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                headerBg: 'bg-amber-600',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                access: 'Regional dashboard',
                perms: ['View own-region requisitions', 'Approve / Reject submissions', 'Edit submission quantities', 'Submit requisition form', 'View Dashboard'],
                restricted: [],
              },
              {
                role: 'Head',
                badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                headerBg: 'bg-purple-600',
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                access: 'Regional management',
                perms: ['All Admin permissions', 'Create Admin users', 'Create Employee users', 'Manage users in own region', 'View User Management'],
                restricted: [],
              },
            ].map((r) => (
              <div key={r.role} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-md transition">
                <div className={`${r.headerBg} px-5 py-5 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {r.icon}
                  </div>
                  <div>
                    <p className="font-extrabold text-white">{r.role}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${r.badge}`}>
                      {r.access}
                    </span>
                  </div>
                </div>
                <ul className="p-5 space-y-2.5">
                  {r.perms.map((p, i) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm">
                      {r.restricted.includes(i) ? (
                        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span className={r.restricted.includes(i) ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-20 px-6">
        {/* Light mode: rich layered gradient */}
        <div className="block dark:hidden absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-rose-50/50" />
        <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_top_right,rgba(220,38,38,0.18),transparent)]" />
        <div className="block dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_bottom_left,rgba(239,68,68,0.10),transparent)]" />
        {/* Dark mode decorations */}
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.25),transparent_60%)]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(220,38,38,0.12),transparent_55%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 dark:via-red-600/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/30 dark:via-red-600/30 to-transparent" />

        <div className="relative mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Ready to get started?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Employees can submit requisitions instantly. Admins can review and approve from the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/form/retail-requisition"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-red-200 dark:shadow-red-900/40 transition"
            >
              Submit a Requisition →
            </Link>
            <Link
              href="/dashboard/requisitions"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm px-8 py-4 rounded-2xl transition"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src={LOGO} alt="TCS Logo" width={120} height={30} className="h-7 w-auto opacity-60 dark:opacity-30" />
          <p className="text-xs text-slate-500 dark:text-slate-600">© {new Date().getFullYear()} TCS Retail Requisition System. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/form/retail-requisition" className="hover:text-slate-900 dark:hover:text-white transition">Submit Form</Link>
            <Link href="/dashboard/requisitions" className="hover:text-slate-900 dark:hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
