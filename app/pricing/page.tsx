'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PricingTable } from '@/components/billing/PricingTable';

const FAQS = [
  {
    question: 'Is billing attached to users or organizations?',
    answer:
      'Billing is organization-wide. One workspace owns the Stripe customer and subscription, while admins manage plan changes for everyone inside that organization.',
  },
  {
    question: 'What happens if Stripe is temporarily unavailable?',
    answer:
      'Workspace access continues to rely on synced billing state in Oplytics. Webhooks and reconciliation keep Stripe and product access aligned without forcing live Stripe reads on every screen load.',
  },
  {
    question: 'Can the software owner see billing across organizations?',
    answer:
      'Yes. A single platform-level super admin can inspect billing health across organizations, while normal org admins only see their own workspace billing.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(180deg,_rgba(15,23,42,0.05),_transparent)]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Pricing and Billing
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Built for organization-wide billing, not per-user chaos.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Choose a plan once, keep billing centralized for the workspace, and let Stripe handle payment details while Oplytics keeps product access stable and resilient.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/settings?tab=billing"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Manage existing billing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
        <PricingTable />

        <section className="mt-16 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Why this billing model holds up
            </div>
            <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                Oplytics treats Stripe as the payment system of record, but your workspace relies on synced local billing state for feature access. That makes upgrades, retries, and invoice history dependable without putting every screen behind a live Stripe dependency.
              </p>
              <p>
                The result is cleaner org-level ownership, safer webhook recovery, and a simpler mental model for teams that need billing to behave like infrastructure rather than a fragile UI bolt-on.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-muted/20 p-6">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <div className="mt-5 space-y-5">
              {FAQS.map((item) => (
                <div key={item.question} className="rounded-2xl border bg-background px-4 py-4">
                  <h3 className="text-sm font-medium text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
