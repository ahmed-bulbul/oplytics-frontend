'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  type BillingInterval,
  type BillingPlanCode,
  type BillingSummaryResponse,
  billingApi,
} from '@/lib/api/billing';
import { BILLING_PLANS, formatPlanPrice } from './plan-catalog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_RANK: Record<BillingPlanCode, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

function canManageBilling(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingTable({
  className,
  source = 'public',
}: {
  className?: string;
  source?: 'public' | 'settings';
}) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [interval, setInterval] = useState<BillingInterval>('MONTH');
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [summary, setSummary] = useState<BillingSummaryResponse | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const userCanManage = canManageBilling(user?.role);
  const currentPlanCode = summary?.planCode ?? null;
  const currentInterval = summary?.billingInterval ?? null;
  const isActivePlan = summary?.status === 'ACTIVE' || summary?.status === 'TRIALING';

  // Fetch billing summary when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.orgUuid) return;
    let active = true;
    setBillingLoading(true);
    billingApi
      .getSummary(user.orgUuid)
      .then((data) => { if (active) setSummary(data); })
      .catch(() => { /* non-fatal */ })
      .finally(() => { if (active) setBillingLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated, user?.orgUuid]);

  // Default the interval toggle to whatever the user is currently billed on
  useEffect(() => {
    if (currentInterval) setInterval(currentInterval);
  }, [currentInterval]);

  const pricingIntro = useMemo(() => {
    if (!isAuthenticated)
      return "Choose the plan that matches your team stage, then connect billing when you create your workspace.";
    if (!userCanManage)
      return "Your organization already has access, but only admins can change billing or open Stripe checkout.";
    if (currentPlanCode && currentPlanCode !== 'FREE' && isActivePlan)
      return "You're on an active plan. Upgrade or switch plans anytime — Stripe handles proration automatically.";
    return "Pick the plan that matches your organization and we'll hand off to Stripe Checkout securely.";
  }, [isAuthenticated, userCanManage, currentPlanCode, isActivePlan]);

  async function handleSelectPlan(planCode: 'STARTER' | 'PRO' | 'ENTERPRISE') {
    if (!isAuthenticated) { window.location.href = '/register'; return; }
    if (!user?.orgUuid) { window.location.href = '/setup/organization'; return; }
    if (!userCanManage) {
      toast({
        title: 'Billing access is limited',
        description: 'Only organization admins can start checkout or change the billing plan.',
      });
      return;
    }
    setSubmittingPlan(planCode);
    try {
      const response = await billingApi.createCheckoutSession(user.orgUuid, {
        planCode,
        billingInterval: interval,
      });
      window.location.href = response.checkoutUrl;
    } catch (error) {
      toast({
        title: 'Checkout could not start',
        description: error instanceof Error ? error.message : 'Unable to start Stripe Checkout right now.',
        variant: 'destructive',
      });
      setSubmittingPlan(null);
    }
  }

  async function handleOpenPortal() {
    if (!user?.orgUuid || !userCanManage) return;
    setSubmittingPlan('__portal__');
    try {
      const { portalUrl } = await billingApi.createPortalSession(user.orgUuid);
      window.location.href = portalUrl;
    } catch (error) {
      toast({
        title: 'Portal could not open',
        description: error instanceof Error ? error.message : 'Unable to open the Stripe Billing Portal.',
        variant: 'destructive',
      });
      setSubmittingPlan(null);
    }
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]"
          >
            Pricing
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Organization billing that stays simple for operators and dependable for finance.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">{pricingIntro}</p>
        </div>

        {/* Interval toggle */}
        <div className="inline-flex items-center rounded-full border border-border bg-background p-1 shadow-sm">
          {(['MONTH', 'YEAR'] as BillingInterval[]).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                interval === iv
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {iv === 'MONTH' ? 'Monthly' : 'Yearly'}
              {iv === 'YEAR' && (
                <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Save 20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-5 xl:grid-cols-3">
        {BILLING_PLANS.map((plan) => {
          const isCurrent =
            isAuthenticated &&
            isActivePlan &&
            currentPlanCode === plan.code;

          const currentRank = PLAN_RANK[currentPlanCode ?? 'FREE'];
          const planRank = PLAN_RANK[plan.code];
          const isUpgrade = isAuthenticated && isActivePlan && planRank > currentRank;
          const isDowngrade = isAuthenticated && isActivePlan && planRank < currentRank && planRank > 0;

          const isLoading = submittingPlan === plan.code;
          const renewalDate = isCurrent ? formatDate(summary?.currentPeriodEnd) : null;

          return (
            <Card
              key={plan.code}
              className={cn(
                'relative flex flex-col overflow-hidden border-border/80 bg-card/95 shadow-sm transition-shadow',
                plan.highlight && !isCurrent && 'border-emerald-500/50 shadow-lg shadow-emerald-900/10',
                isCurrent && 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg',
              )}
            >
              {/* Top accent bar */}
              {isCurrent && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500" />
              )}
              {!isCurrent && plan.highlight && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
              )}

              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Current Plan
                      </span>
                    ) : (
                      <Badge
                        variant={plan.highlight ? 'default' : 'outline'}
                        className={cn(
                          'rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]',
                          plan.highlight && 'bg-emerald-600 text-white',
                        )}
                      >
                        {plan.badge}
                      </Badge>
                    )}
                    <CardTitle className="mt-4 text-2xl">{plan.name}</CardTitle>
                  </div>

                  {isCurrent && (
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                  )}
                  {!isCurrent && plan.highlight && (
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <CardDescription className="min-h-16 text-sm leading-6">
                  {plan.description}
                </CardDescription>

                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {formatPlanPrice(plan, interval)}
                    </span>
                    <span className="pb-1 text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {interval === 'YEAR'
                      ? `${plan.yearlyLabel} · save on annual billing`
                      : 'billed monthly'}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col space-y-6">
                {/* Features */}
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                    >
                      <BadgeCheck
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          feature.emphasis ? 'text-emerald-600' : 'text-cyan-600',
                        )}
                      />
                      <span className={feature.emphasis ? 'font-medium text-foreground' : ''}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Renewal info for current plan */}
                {isCurrent && renewalDate && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
                    <p className="text-xs text-emerald-700">
                      <span className="font-medium">
                        {summary?.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}
                      </span>{' '}
                      on {renewalDate}
                      {currentInterval && (
                        <span className="ml-1 text-emerald-600/70">
                          · {currentInterval === 'YEAR' ? 'Annual' : 'Monthly'} billing
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* CTA area */}
                <div className="space-y-3">
                  {isCurrent ? (
                    <>
                      {/* Current plan — manage via portal */}
                      <Button
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => void handleOpenPortal()}
                        disabled={
                          !userCanManage ||
                          billingLoading ||
                          submittingPlan === '__portal__'
                        }
                      >
                        {submittingPlan === '__portal__' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Opening Portal…
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            Manage in Billing Portal
                          </>
                        )}
                      </Button>
                      {!userCanManage && (
                        <p className="text-center text-xs text-muted-foreground">
                          Only admins can manage billing.
                        </p>
                      )}
                    </>
                  ) : isUpgrade ? (
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlight && 'bg-emerald-600 text-white hover:bg-emerald-700',
                      )}
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => void handleSelectPlan(plan.code)}
                      disabled={isLoading || billingLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting to Stripe
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          Upgrade to {plan.name}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline"
                      className="w-full text-muted-foreground"
                      onClick={() => void handleSelectPlan(plan.code)}
                      disabled={isLoading || billingLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting to Stripe
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4" />
                          Switch to {plan.name}
                        </>
                      )}
                    </Button>
                  ) : (
                    /* No active plan — normal checkout */
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlight && 'bg-emerald-600 text-white hover:bg-emerald-700',
                      )}
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => void handleSelectPlan(plan.code)}
                      disabled={isLoading || billingLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting to Stripe
                        </>
                      ) : (
                        <>
                          {source === 'public' ? plan.cta : `Choose ${plan.name}`}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-center text-xs text-muted-foreground">
                      You'll create your workspace before payment starts.
                    </p>
                  )}
                  {isAuthenticated && !userCanManage && !isCurrent && (
                    <p className="text-center text-xs text-muted-foreground">
                      Billing changes are restricted to organization admins.
                    </p>
                  )}
                  {source === 'public' && plan.code === 'ENTERPRISE' && !isCurrent && (
                    <p className="text-center text-xs text-muted-foreground">
                      Need a guided rollout first?{' '}
                      <Link
                        href="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Talk from inside your workspace
                      </Link>
                      .
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer trust bar */}
      <div className="rounded-3xl border border-border bg-muted/25 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Stripe handles payment details and card management
            </div>
            <p className="text-sm text-muted-foreground">
              Oplytics keeps billing state and access rules in sync through webhooks, so your
              workspace does not depend on live Stripe calls to stay usable.
            </p>
          </div>
          <Link
            href={isAuthenticated ? '/settings?tab=billing' : '/register'}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {isAuthenticated ? 'Manage billing in settings' : 'Create your workspace'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
