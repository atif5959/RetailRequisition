import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { AppButtonLink } from '@/components/AppButton';

export const metadata: Metadata = {
  title: 'TCS Retail Requisition — Submit & Track Stock Requests',
  description:
    'Submit retail stock requisitions online, track approval status in real time, and manage fulfilment across all regions. Fast, paperless, and secure.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'TCS Retail Requisition — Submit & Track Stock Requests',
    description:
      'Submit retail stock requisitions online, track approval status in real time, and manage fulfilment across all regions.',
    url: '/',
  },
};

const stats = [
  { value: 'Instant', label: 'Form Submission' },
  { value: 'Real-Time', label: 'Status Updates' },
  { value: 'Secure', label: 'Data Handling' },
  { value: '24/7', label: 'Access Anytime' },
];

const features = [
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Retail Requisition Form',
    desc: 'Submit itemised stock requests with automatic quantity totals and grand total calculation.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Approval Workflow',
    desc: 'Streamlined review process with Pending, Approved, and Rejected status tracking.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Region & Route Aware',
    desc: 'Region and route-code based submissions for accurate fulfilment routing across all zones.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Admin Dashboard',
    desc: 'View all submissions at a glance, filter by status, and action requests in seconds.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'User Management',
    desc: 'Super admins manage users and roles, controlling who can submit, review, and approve.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Access',
    desc: 'Role-based authentication ensures only authorised personnel can access sensitive data.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Fill the Form',
    desc: 'Enter your region, route code, employee details, and the stock quantities you need.',
  },
  {
    num: '02',
    title: 'Submit Request',
    desc: 'Your requisition is instantly recorded and queued in the admin dashboard for review.',
  },
  {
    num: '03',
    title: 'Get Approved',
    desc: 'Admins approve or reject your request — the decision is recorded and visible immediately.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="TCS Logo"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="#how-it-works" className="hidden md:inline hover:text-red-600 transition">How It Works</Link>
            <Link href="#features" className="hidden md:inline hover:text-red-600 transition">Features</Link>
            <AppButtonLink href="/dashboard/requisitions" designKey="danger" className="text-sm px-5 py-2">
              Admin Login
            </AppButtonLink>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[radial-gradient(ellipse_at_top_right,rgba(252,165,165,0.35),transparent_55%),linear-gradient(160deg,#fff5f5_0%,#ffffff_55%)] py-16 sm:py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex justify-center">
          <div className="space-y-6 text-center max-w-2xl">
<span className="inline-block bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Retail Operations Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900">
              Requisition.<br />
              <span className="text-red-600">Simplified.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              Submit, track, and manage retail stock requisitions in one place. Fast approvals, real-time visibility, and full control for your team.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 pt-1">
              <AppButtonLink href="/form/retail-requisition" designKey="danger" className="text-base px-7 py-3">
                Submit Requisition →
              </AppButtonLink>
              <AppButtonLink
                href="/dashboard/requisitions"
                className="text-base px-7 py-3"
                style={{ backgroundColor: '#0f172a', borderRadius: '9999px', color: '#fff', fontWeight: 700 }}
              >
                View Dashboard
              </AppButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-slate-900 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((s) => (
            <div key={s.value}>
              <div className="text-3xl font-black text-red-400">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-14 sm:py-24 px-4 sm:px-6 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-3 text-lg">Three simple steps to get your requisition processed</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-7xl font-black text-red-50 absolute top-4 right-5 select-none leading-none">
                  {step.num}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-14 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Everything You Need</h2>
            <p className="text-slate-500 mt-3 text-lg">Built for retail operations teams that need speed and clarity</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 group-hover:bg-red-100 transition">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_45%,#ef4444_100%)] py-14 sm:py-20 px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Ready to submit your requisition?
          </h2>
          <p className="text-red-100 text-lg max-w-xl">
            Get your stock request in front of the right people instantly — no paperwork, no delays.
          </p>
          <Link
            href="/form/retail-requisition"
            className="mt-4 inline-block bg-white text-red-600 font-extrabold text-base px-10 py-4 rounded-full shadow-lg hover:bg-red-50 hover:shadow-xl transition"
          >
            Open Form →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Image
              src="https://www.cognitoforms.com/file/YlX_ys5JvAugKr0_J7gDB_8tKeqbjCkjA41iDR7EEgPx2m2Fpmmbl9fVpkvn8r2t"
              alt="TCS Logo"
              width={128}
              height={32}
              className="h-8 w-auto opacity-60"
            />
          </div>
          <p className="text-xs text-slate-500">© 2025 Retail Requisition System. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/form/retail-requisition" className="hover:text-white transition">Submit Form</Link>
            <Link href="/dashboard/requisitions" className="hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
