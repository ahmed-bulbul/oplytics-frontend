'use client';

import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  LineChart,
  Layers,
  RefreshCw,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'How it works', href: '#how-it-works' },
];

const STATS = [
  { value: '2M+', label: 'Orders analysed' },
  { value: '$480M+', label: 'Revenue tracked' },
  { value: '50+', label: 'Brands active' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const FEATURES = [
  {
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    title: 'True Contribution Margin',
    description:
      'See real profitability after COGS, ad spend, fees, and refunds — not just top-line revenue that hides the full picture.',
  },
  {
    icon: Target,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Blended ROAS & MER',
    description:
      'Cross-channel marketing efficiency ratio that shows how every ad dollar actually performs across Meta, Google, TikTok, and beyond.',
  },
  {
    icon: Users,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    title: 'LTV & Cohort Analysis',
    description:
      'Understand customer lifetime value by acquisition cohort. Know which channels bring buyers who actually come back.',
  },
  {
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'Real-Time Sync',
    description:
      'Data refreshes every few minutes from all connected channels — no more stale dashboards from last night\'s export.',
  },
  {
    icon: LineChart,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    title: 'Multi-Touch Attribution',
    description:
      'Move beyond last-click. See how channels work together across the customer journey with customisable attribution windows.',
  },
  {
    icon: Shield,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    title: 'One Source of Truth',
    description:
      'Finance, marketing, and ops all see the same numbers. No more spreadsheet arguments — every team aligned on reality.',
  },
];

const INTEGRATIONS = [
  {
    name: 'Shopify',
    bg: 'bg-[#7AB55C]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M15.337 3.415c-.03-.19-.19-.29-.32-.29-.13 0-2.56-.19-2.56-.19s-1.7-1.67-1.89-1.86c-.19-.19-.56-.13-.7-.1l-.96.26c-.58-1.66-1.6-3.19-3.39-3.19h-.16C5.017-2.375 4.557-2.565 4.137-2.565c-4.19 0-6.2 5.23-6.83 7.89l-2.94.91c-.91.29-1 .32-1.06 1.18-.06.67-2.46 18.94-2.46 18.94l18.48 3.18 10.01-2.46s-4.35-23.32-4.38-23.51z" />
      </svg>
    ),
  },
  {
    name: 'Meta Ads',
    bg: 'bg-[#0668E1]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.78-3.92 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
      </svg>
    ),
  },
  {
    name: 'Google Ads',
    bg: 'bg-[#4285F4]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    bg: 'bg-[#111]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'Amazon',
    bg: 'bg-[#232F3E]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FF9900]" fill="currentColor">
        <path d="M14.464 14.83c-1.232 1.62-3.05 2.486-4.628 2.486-2.18 0-4.13-1.218-4.13-3.708 0-1.943 1.063-3.27 2.572-3.918 1.31-.575 3.137-.679 4.535-.84v-.16c0-.575.045-1.252-.296-1.748-.298-.444-.864-.628-1.366-.628-.929 0-1.756.479-1.957 1.466-.04.22-.2.435-.42.445L6.65 7.95c-.183-.04-.385-.187-.334-.467.526-2.781 3.04-3.62 5.29-3.62 1.151 0 2.656.307 3.563 1.18 1.151 1.077 1.04 2.515 1.04 4.08v3.694c0 1.111.461 1.598.894 2.197.152.213.186.469-.008.628-.484.405-1.346 1.156-1.819 1.578a.524.524 0 0 1-.6.057z" />
      </svg>
    ),
  },
  {
    name: 'Google Analytics',
    bg: 'bg-white border border-gray-200',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M22.84 2.998v17.999a2.983 2.983 0 0 1-3.04 3.001c-1.661 0-2.96-1.273-2.96-3V3.12c0-1.711 1.276-3.119 2.96-3.119A2.983 2.983 0 0 1 22.84 3z" fill="#F9AB00" />
        <path d="M12 9.001a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-9 6A3 3 0 1 0 3 21a3 3 0 0 0 0-5.999z" fill="#E37400" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn Ads',
    bg: 'bg-[#0A66C2]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Reddit Ads',
    bg: 'bg-[#FF4500]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z" />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Layers,
    title: 'Connect your channels',
    description:
      'Link Shopify, Meta, Google, and every other platform in minutes. OAuth-based — no developer required.',
  },
  {
    step: '02',
    icon: RefreshCw,
    title: 'Data syncs automatically',
    description:
      'Orders, ad spend, customers, and products stream in every few minutes. Historical backfill runs in the background.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Make decisions with confidence',
    description:
      'Contribution margin, real ROAS, LTV cohorts — all in one place. Stop guessing, start scaling.',
  },
];

const METRICS_PREVIEW = [
  { label: 'Revenue', value: '$128,430', change: '+12.4%', positive: true },
  { label: 'CM%', value: '59.2%', change: '+0.6pt', positive: true },
  { label: 'MER', value: '3.75×', change: '+4.2%', positive: true },
  { label: 'CAC', value: '$31.10', change: '+1.4%', positive: false },
  { label: 'LTV', value: '$284.50', change: '+2.1%', positive: true },
  { label: 'ROAS', value: '4.21×', change: '+6.8%', positive: true },
];

// ─── Components ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      <p
        className={`mt-1 text-xs font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}
      >
        {positive ? '↑' : '↓'} {change}
      </p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  color,
  bg,
  title,
  description,
}: (typeof FEATURES)[number]) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Activity className="h-4 w-4 text-background" />
            </div>
            <span className="text-lg font-bold tracking-tight">Oplytics</span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Get started
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'oklch(0.13 0 0)' }}
      >
        {/* Subtle gradient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, oklch(0.4 0.15 160 / 0.25), transparent)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-32">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Real-time analytics · No spreadsheets required
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            The analytics platform built for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              serious e-commerce brands
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Unify Shopify, Meta, Google, TikTok, and more. See real contribution margin, true
            blended ROAS, and LTV cohorts — not the vanity metrics your ad platforms want you to
            believe.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/40"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-8 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              See pricing
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-8 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Live metrics preview */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {METRICS_PREVIEW.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          {/* Dashboard mock border glow */}
          <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-[11px] font-medium text-white/30">
                oplytics.app · Profit Command Center
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/5 bg-white/[0.03] sm:grid-cols-5">
              {['Revenue', 'Ad Spend', 'CM%', 'ROAS', 'LTV'].map((label, i) => (
                <div key={label} className="px-4 py-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{label}</p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {['$128K', '$34K', '59.2%', '4.21×', '$284'][i]}
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-400">
                    {['+12.4%', '−2.5%', '+0.6pt', '+6.8%', '+2.1%'][i]}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-40 bg-gradient-to-b from-white/[0.03] to-transparent px-4 pt-4">
              {/* Fake chart bars */}
              <div className="flex h-full items-end gap-1.5">
                {[45, 60, 52, 72, 65, 80, 74, 88, 82, 95, 90, 100, 88, 96].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 13
                          ? 'oklch(0.72 0.2 160)'
                          : 'oklch(0.72 0.2 160 / 0.25)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ───────────────────────────────────────────────────── */}
      <section id="integrations" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Integrations
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Every channel. One dashboard.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Connect your store and ad platforms in minutes with OAuth — no CSV exports,
              no manual imports, no engineering required.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${integration.bg}`}
                >
                  {integration.icon}
                </div>
                <span className="text-sm font-medium text-foreground">{integration.name}</span>
              </div>
            ))}

            {/* Coming soon */}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <span className="text-xs text-muted-foreground">+</span>
              </div>
              <span className="text-sm text-muted-foreground">More coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Stop flying blind. Start scaling profitably.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Ad platforms optimise for their metrics. Oplytics optimises for yours — profit,
              retention, and sustainable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in under 10 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-[calc(50%+3rem)] top-8 hidden h-px w-[calc(100%-6rem)] border-t border-dashed border-border md:block" />
                )}
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                  <step.icon className="h-6 w-6 text-foreground" />
                </div>
                <p className="mb-1 text-xs font-bold tracking-widest text-muted-foreground">
                  STEP {step.step}
                </p>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's included ────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Everything included
              </p>
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                No hidden add-ons. No data limits.
              </h2>
              <p className="mb-8 text-muted-foreground">
                Every plan includes unlimited historical data, all integrations, and every
                analytics feature. Pay for seats — not for access to your own data.
              </p>
              <ul className="space-y-3">
                {[
                  'Unlimited historical backfill',
                  'Real-time incremental sync (every few minutes)',
                  'All channel integrations included',
                  'Contribution margin & LTV analytics',
                  'Multi-touch attribution modelling',
                  'Cohort analysis & retention curves',
                  'Custom KPI targets & alerts',
                  'Team workspaces & role-based access',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics showcase panel */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Profit Command Center</p>
                  <p className="text-xs text-muted-foreground">Last 30 days · All channels</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Net Revenue', value: '$128,430', sub: '+12.4% vs last period', pos: true },
                  { label: 'Contribution Margin', value: '$75,950', sub: '59.2% margin', pos: true },
                  { label: 'Total Ad Spend', value: '$34,200', sub: '−2.5% vs last period', pos: false },
                  { label: 'Blended ROAS', value: '4.21×', sub: '+6.8% vs last period', pos: true },
                  { label: 'New Customers', value: '912', sub: '+14.6% vs last period', pos: true },
                  { label: 'Avg. LTV', value: '$284.50', sub: '+2.1% vs last period', pos: true },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-border bg-background p-3.5"
                  >
                    <p className="text-[11px] text-muted-foreground">{m.label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{m.value}</p>
                    <p
                      className={`mt-0.5 text-[11px] font-medium ${
                        m.pos ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {m.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fake mini chart */}
              <div className="mt-4 rounded-xl border border-border bg-background p-3">
                <p className="mb-3 text-[11px] font-medium text-muted-foreground">
                  Revenue vs. Target · Daily
                </p>
                <div className="flex h-16 items-end gap-1">
                  {[40, 55, 48, 65, 60, 72, 68, 80, 76, 88, 82, 92, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 13
                            ? 'oklch(0.65 0.2 160)'
                            : 'oklch(0.65 0.2 160 / 0.3)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 sm:py-32"
        style={{ background: 'oklch(0.13 0 0)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.45 0.18 160 / 0.2), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to see your real numbers?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/60">
            Connect your first channel in minutes. No credit card required. Your data,
            your metrics — finally in one place.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-8 text-sm font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/30">
            No credit card required · Setup in under 10 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
                  <Activity className="h-3.5 w-3.5 text-background" />
                </div>
                <span className="text-base font-bold">Oplytics</span>
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">
                Profit-first analytics for e-commerce brands.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/login" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
              <Link href="/register" className="transition-colors hover:text-foreground">
                Get started
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border pt-8 md:flex-row md:items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Oplytics. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for Shopify brands who care about actual profit.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
