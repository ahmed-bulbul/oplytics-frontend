import type { BillingInterval, BillingPlanCode } from '@/lib/api/billing';

export interface BillingPlanFeature {
  label: string;
  emphasis?: boolean;
}

export interface BillingPlanDefinition {
  code: Exclude<BillingPlanCode, 'FREE'>;
  name: string;
  badge: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyLabel: string;
  cta: string;
  highlight?: boolean;
  features: BillingPlanFeature[];
}

export const BILLING_PLANS: BillingPlanDefinition[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    badge: 'Built for smaller teams',
    description: 'A clean billing entry point for brands that need shared dashboards and exports without extra operational overhead.',
    monthlyPrice: 79,
    yearlyPrice: 63,
    yearlyLabel: 'billed annually',
    cta: 'Start with Starter',
    features: [
      { label: 'Unified Shopify and ad-channel dashboards' },
      { label: 'CSV exports and weekly summaries', emphasis: true },
      { label: 'Up to 3 team members' },
      { label: 'Email support' },
    ],
  },
  {
    code: 'PRO',
    name: 'Pro',
    badge: 'Best for growth-stage operators',
    description: 'The default operating system for teams that need contribution margin, cohort visibility, and multi-channel decision-making in one place.',
    monthlyPrice: 199,
    yearlyPrice: 159,
    yearlyLabel: 'billed annually',
    cta: 'Upgrade to Pro',
    highlight: true,
    features: [
      { label: 'Advanced analytics and cohort views', emphasis: true },
      { label: 'Multi-channel reporting and subscription analytics', emphasis: true },
      { label: 'More teammates and shared planning workflows' },
      { label: 'Priority support during business hours' },
    ],
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    badge: 'For complex, multi-entity teams',
    description: 'Stronger governance, API access, and hands-on support for larger operators that need billing and analytics to stay dependable at scale.',
    monthlyPrice: 499,
    yearlyPrice: 399,
    yearlyLabel: 'billed annually',
    cta: 'Talk to Sales',
    features: [
      { label: 'API access and admin-grade visibility', emphasis: true },
      { label: 'Custom rollout support and priority escalation', emphasis: true },
      { label: 'Higher operational limits for teams and data' },
      { label: 'Ideal for sophisticated org structures' },
    ],
  },
];

export function getPlanDefinition(planCode: BillingPlanCode | null | undefined) {
  return BILLING_PLANS.find((plan) => plan.code === planCode) ?? null;
}

export function formatPlanPrice(plan: BillingPlanDefinition, interval: BillingInterval) {
  const amount = interval === 'YEAR' ? plan.yearlyPrice : plan.monthlyPrice;
  return `$${amount}`;
}

export function formatPlanInterval(interval: BillingInterval) {
  return interval === 'YEAR' ? 'yearly' : 'monthly';
}
