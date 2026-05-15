'use client';

/**
 * /billing/success
 *
 * Stripe redirects here after a successful checkout session.
 * Fetches the current billing summary to show the plan name and features,
 * then auto-redirects to the dashboard after a short delay.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart2,
  Users,
  Globe,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { billingApi, BillingSummaryResponse, BillingPlanCode } from '@/lib/api/billing';

// ─── Plan metadata ────────────────────────────────────────────────────────────

const PLAN_META: Record<
  BillingPlanCode,
  { label: string; color: string; bg: string; features: string[] }
> = {
  FREE: {
    label: 'Free',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    features: ['Basic analytics', 'Shopify integration', 'Up to 1 channel'],
  },
  STARTER: {
    label: 'Starter',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    features: [
      'Full dashboard analytics',
      'Shopify + Meta integrations',
      'Revenue & cohort reports',
      'Email support',
    ],
  },
  PRO: {
    label: 'Pro',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    features: [
      'Everything in Starter',
      'All channel integrations',
      'AI-powered insights',
      'Custom date ranges',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    label: 'Enterprise',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'SSO & advanced security',
    ],
  },
};

const FEATURE_ICONS = [Zap, BarChart2, Users, Globe, ShieldCheck, Sparkles];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingSuccessPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [billing, setBilling] = useState<BillingSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(8);

  const fetchBilling = useCallback(async () => {
    if (!user?.orgUuid) return;
    try {
      const data = await billingApi.getSummary(user.orgUuid);
      setBilling(data);
    } catch {
      // Non-fatal — page still renders without billing detail
    } finally {
      setLoading(false);
    }
  }, [user?.orgUuid]);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  // Auto-redirect countdown
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push('/dashboard');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, router]);

  const planCode = billing?.planCode ?? 'STARTER';
  const meta = PLAN_META[planCode];
  const features = meta.features;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
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

        {/* Success icon */}
        {loading ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500/20 bg-emerald-500/10">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Ripple rings */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-10" />
            <span className="absolute inline-flex h-[88px] w-[88px] rounded-full bg-emerald-400 opacity-10" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/30">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={1.75} />
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Payment successful!
          </h1>
          <p className="text-base text-muted-foreground">
            Your workspace is now on the{' '}
            <span className={`font-semibold ${meta.color}`}>{meta.label} plan</span>.
            Everything is active and ready to use.
          </p>
        </div>

        {/* Plan card */}
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
          {/* Plan badge */}
          <div className="mb-5 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
            >
              <Sparkles className="h-3 w-3" />
              {meta.label} Plan — Active
            </span>
            {billing?.billingInterval && (
              <span className="text-xs text-muted-foreground capitalize">
                {billing.billingInterval.toLowerCase()}ly billing
              </span>
            )}
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Icon className="h-3 w-3 text-emerald-600" />
                  </span>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              );
            })}
          </ul>

          {/* Period info */}
          {billing?.currentPeriodEnd && (
            <div className="mt-5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              Next renewal:{' '}
              <span className="font-medium text-foreground">
                {new Date(billing.currentPeriodEnd).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/settings?tab=billing"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            Manage Billing
          </Link>
        </div>

        {/* Auto-redirect notice */}
        {!loading && (
          <p className="text-xs text-muted-foreground">
            Redirecting to your dashboard in{' '}
            <span className="tabular-nums font-medium text-foreground">{countdown}s</span>
            {' '}—{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              go now
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
