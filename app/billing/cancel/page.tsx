'use client';

/**
 * /billing/cancel
 *
 * Stripe redirects here when the user closes the Checkout modal
 * without completing payment. No charge has been made.
 */

import Link from 'next/link';
import { BarChart3, ArrowLeft, CreditCard, HelpCircle, ShieldCheck } from 'lucide-react';

const REASSURANCES = [
  {
    icon: ShieldCheck,
    title: 'No charge made',
    body: 'You have not been billed. Your current plan remains unchanged.',
  },
  {
    icon: CreditCard,
    title: 'Ready when you are',
    body: 'Your checkout link is still valid. Pick up where you left off any time.',
  },
  {
    icon: HelpCircle,
    title: 'Questions about pricing?',
    body: 'Compare features on the pricing page or reach out to our support team.',
  },
];

export default function BillingCancelPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Background glow — subdued amber to signal "paused, not failed" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-amber-500/8 blur-[120px]" />
      </div>

      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 text-center">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Oplytics</span>
        </Link>

        {/* Icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted ring-4 ring-border">
          <CreditCard className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Payment cancelled
          </h1>
          <p className="text-base text-muted-foreground">
            No worries — you haven&apos;t been charged. Your workspace is still on its current plan.
          </p>
        </div>

        {/* Reassurance cards */}
        <div className="w-full space-y-3">
          {REASSURANCES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            View Plans
            <CreditCard className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            Back to Dashboard
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help choosing a plan?{' '}
          <Link
            href="/pricing"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Compare all features
          </Link>
        </p>
      </div>
    </div>
  );
}
