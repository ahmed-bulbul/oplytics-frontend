'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, BadgeCheck, CreditCard, ExternalLink, Loader2, ReceiptText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { type BillingInterval, type BillingInvoiceRow, type BillingSummaryResponse, billingApi } from '@/lib/api/billing';
import { PricingTable } from '@/components/billing/PricingTable';
import { BILLING_PLANS, getPlanDefinition } from '@/components/billing/plan-catalog';
import { cn } from '@/lib/utils';

function canManageBilling(role?: string) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function formatMoney(amount: number, currency: string | null) {
  const normalized = typeof amount === 'number' ? amount : Number(amount ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(normalized);
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not scheduled';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatInterval(interval: BillingInterval | null) {
  if (interval === 'YEAR') return 'Annual';
  if (interval === 'MONTH') return 'Monthly';
  return 'Not set';
}

function statusTone(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'TRIALING':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'GRACE_PERIOD':
    case 'PAST_DUE':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CANCELED':
    case 'UNPAID':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function InvoiceRow({ invoice }: { invoice: BillingInvoiceRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{formatMoney(invoice.amountPaid || invoice.amountDue, invoice.currency)}</p>
          <Badge variant="outline" className={cn('rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em]', statusTone(invoice.status))}>
            {invoice.status.replaceAll('_', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(invoice.periodStart)} to {formatDate(invoice.periodEnd)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {invoice.hostedInvoiceUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
              View invoice
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
        {invoice.invoicePdfUrl && (
          <Button variant="ghost" size="sm" asChild>
            <a href={invoice.invoicePdfUrl} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function BillingSettingsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<BillingSummaryResponse | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const userCanManage = canManageBilling(user?.role);
  const orgUuid = user?.orgUuid ?? null;

  useEffect(() => {
    if (!orgUuid) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      billingApi.getSummary(orgUuid),
      billingApi.listInvoices(orgUuid),
    ])
      .then(([nextSummary, nextInvoices]) => {
        if (!active) return;
        setSummary(nextSummary);
        setInvoices(nextInvoices.items);
      })
      .catch((nextError) => {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : 'Unable to load billing details right now.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orgUuid]);

  const plan = useMemo(() => getPlanDefinition(summary?.planCode), [summary?.planCode]);
  const recommendedUpgrade = useMemo(() => {
    if (!summary || summary.planCode === 'PRO' || summary.planCode === 'ENTERPRISE') return null;
    return BILLING_PLANS.find((candidate) => candidate.code === 'PRO') ?? null;
  }, [summary]);

  async function handleOpenPortal() {
    if (!orgUuid) return;
    if (!userCanManage) {
      toast({
        title: 'Billing access is limited',
        description: 'Only organization admins can open the billing portal.',
      });
      return;
    }

    setPortalLoading(true);
    try {
      const response = await billingApi.createPortalSession(orgUuid);
      window.location.href = response.portalUrl;
    } catch (nextError) {
      toast({
        title: 'Portal could not open',
        description: nextError instanceof Error ? nextError.message : 'Unable to open the Stripe Billing Portal.',
        variant: 'destructive',
      });
      setPortalLoading(false);
    }
  }

  if (!orgUuid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing will appear after workspace setup</CardTitle>
          <CardDescription>
            Create your organization first so Stripe billing can be attached to the right account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/setup/organization">
              Finish workspace setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            Billing details could not load
          </CardTitle>
          <CardDescription className="text-rose-700/80">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-white/10">
                Billing overview
              </Badge>
              <div>
                <CardTitle className="text-2xl text-white">
                  {plan?.name ?? summary?.planCode ?? 'Plan not set'}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-slate-300">
                  {plan?.description ?? 'Your organization billing state is synced from Stripe and used to unlock workspace access safely.'}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className={cn('rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white', summary ? statusTone(summary.status) : '')}>
                {summary?.status?.replaceAll('_', ' ') ?? 'Unknown'}
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                {formatInterval(summary?.billingInterval ?? null)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Renewal</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatDate(summary?.currentPeriodEnd ?? null)}</p>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Billing email</p>
              <p className="mt-2 text-sm font-medium text-foreground">{summary?.billingEmail || user?.email || 'Not set'}</p>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stripe customer</p>
              <p className="mt-2 text-sm font-medium text-foreground">{summary?.stripeCustomerId || 'Pending'}</p>
            </div>
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cancellation</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {summary?.cancelAtPeriodEnd ? 'Scheduled at period end' : 'Auto-renewing'}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5 rounded-3xl border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Enabled capabilities
              </div>
              <div className="flex flex-wrap gap-2">
                {(summary?.features ?? []).map((feature) => (
                  <Badge key={feature} variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                    {feature.replaceAll('_', ' ')}
                  </Badge>
                ))}
                {!summary?.features?.length && (
                  <p className="text-sm text-muted-foreground">
                    The default feature set will appear here once billing is attached to the organization.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border bg-muted/20 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="h-4 w-4 text-cyan-600" />
                Billing actions
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Stripe remains the payment source of truth. This workspace reads from synced billing state so access keeps working even if Stripe is temporarily slow.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => void handleOpenPortal()}
                  disabled={portalLoading || !userCanManage}
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Open billing portal
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    Compare plans
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {!userCanManage && (
                  <p className="text-xs text-muted-foreground">
                    Only organization admins can open Stripe or change billing.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {recommendedUpgrade && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <BadgeCheck className="h-5 w-5" />
              Ready for a stronger plan?
            </CardTitle>
            <CardDescription className="text-emerald-900/80">
              {recommendedUpgrade.name} adds the feature depth most teams need once billing becomes operational instead of purely informational.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-cyan-600" />
                Invoice history
              </CardTitle>
              <CardDescription>Recent Stripe invoices attached to this organization.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
              {invoices.length} records
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length > 0 ? (
            invoices.map((invoice) => <InvoiceRow key={invoice.invoiceId} invoice={invoice} />)
          ) : (
            <div className="rounded-2xl border border-dashed px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No invoices yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Once Stripe starts charging this organization, invoices will appear here automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <PricingTable source="settings" />
    </div>
  );
}
