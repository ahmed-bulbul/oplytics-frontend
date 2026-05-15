import { apiClient } from './client';

const DEFAULT_CHANNEL_KEY = 'shopify';

function withChannelKey(path: string, channelKey = DEFAULT_CHANNEL_KEY): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}channelKey=${encodeURIComponent(channelKey)}`;
}

// ─── Response types matching backend DTOs ─────────────────────────────────────

export interface TopProduct {
  product_id: string;
  title: string;
  vendor: string | null;
  revenue: number;
  units_sold: number;
  orders_count: number;
  avg_price: number;
}

export interface CohortRetentionPoint {
  month: number;                    // 0 = acquisition month, 1 = M1, …
  retention_rate: number;           // fraction 0–1 (M0 is always 1.0)
  net_sales: number;
  cumulative_net_sales: number;
}

export interface CohortEntry {
  cohort_month: string;             // "YYYY-MM-DD" (first day of the month)
  cohort_size: number;              // M0 customer count
  avg_ltv: number;                  // cumulative net sales / cohort_size
  retention: CohortRetentionPoint[];
}

export interface DashboardCohortResponse {
  cohorts: CohortEntry[];
  max_months: number;               // highest month index present (drives column count)
  meta: {
    from: string;
    to: string;
    currency: string;
  };
}

export interface DashboardTopProductsResponse {
  products: TopProduct[];
  meta: {
    from: string;       // "YYYY-MM-DD"
    to: string;         // "YYYY-MM-DD"
    total: number;
    currency: string;
  };
}

export interface SubscriptionRetentionPoint {
  /** Number of customers in the cohort that started in [from, to]. */
  cohortSize: number;
  /** How many are still ACTIVE right now. */
  retained: number;
  /** Retention rate expressed as a percentage (0–100). */
  retentionRate: number;
}

export interface SubscriptionMetricsResponse {
  /** Monthly Recurring Revenue — sum of monthly_price for ACTIVE contracts. */
  mrr: number;
  /** Distinct customers with ≥1 ACTIVE contract. */
  activeSubscribers: number;
  /** Total ACTIVE contracts (one customer may have many). */
  activeSubscriptions: number;
  /** New unique subscribers created in [from, to]. */
  newSubscribers: number;
  /** New contracts (not customers) created in [from, to]. */
  newSubscriptions: number;
  /** Cancellation rate for the period as a percentage (0–100). */
  cancellationRate: number;
  /** Retention of cohort that started in [from, to]. */
  retention: SubscriptionRetentionPoint;
  /** ISO-4217 currency code, e.g. "USD". */
  currency: string;
}

export interface DashboardKpisResponse {
  organizationId: number;
  period: string;
  currency: string;
  kpis: {
    /** Gross revenue (sum of order totals before discounts / refunds) */
    totalRevenue: number;
    /** Net sales = gross revenue − discounts − refunds */
    netSales: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    activeUsers: number;
    newCustomers: number;
    returningCustomers: number;
    /** Total ad spend across connected ad platforms (0 when none connected) */
    adSpend: number;
    /** Marketing Efficiency Ratio = totalRevenue / adSpend (0 when adSpend is 0) */
    mer: number;
  };
  growth: {
    revenueGrowth: number;   // fraction: 0.124 = +12.4%
    orderGrowth: number;
    customerGrowth: number;
  };
  lastUpdated: string | null;
}

export interface TimeSeriesPoint {
  date: string;   // "2024-01-01"
  value: number;
}

export interface DashboardGrowthResponse {
  data: {
    period: { from: string; to: string; granularity: string };
    summary: {
      revenue_growth_rate: number;
      orders_growth_rate: number;
      customers_growth_rate: number;
    };
    timeseries: {
      revenue: TimeSeriesPoint[];
      orders: TimeSeriesPoint[];
      new_customers: TimeSeriesPoint[];
    };
    comparison: {
      previous_period: { revenue: number; orders: number; customers: number };
      current_period: { revenue: number; orders: number; customers: number };
    };
  };
  meta: { currency: string; generated_at: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a Date as "YYYY-MM-DD" for API query params */
export function toApiDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Format an ISO date string "2024-01-05" → "Jan 5" */
export function formatAxisDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${MONTHS[m - 1]} ${d}`;
}

/**
 * Format a growth fraction as a signed percentage string.
 * 0.124 → "+12.4%", -0.05 → "-5.0%"
 */
export function formatGrowthPct(rate: number): string {
  const pct = (rate * 100).toFixed(1);
  return rate >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Derive a changeType ("positive" | "negative" | "neutral") from a growth rate.
 * For "lower-is-better" metrics (e.g. CPA, CAC) pass lowerIsBetter = true.
 */
export function growthChangeType(
  rate: number,
  lowerIsBetter = false,
): 'positive' | 'negative' | 'neutral' {
  if (Math.abs(rate) < 0.001) return 'neutral';
  const improving = lowerIsBetter ? rate < 0 : rate > 0;
  return improving ? 'positive' : 'negative';
}

function safeCurrency(currency?: string): string {
  return currency && currency.trim() ? currency.trim().toUpperCase() : "USD";
}

export function formatMoney(
  value: number,
  currency?: string,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency(currency),
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatCompactMoney(value: number, currency?: string): string {
  const normalizedCurrency = safeCurrency(currency);
  const abs = Math.abs(value);
  const maximumFractionDigits = abs >= 1_000_000 ? 2 : abs >= 1_000 ? 1 : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    notation: abs >= 1_000 ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * KPI totals + growth rates for the given period vs the previous equal-length period.
   * GET /api/v1/organizations/{orgId}/dashboard/kpis?from=&to=
   */
  getKpis: (orgId: string, from: Date, to: Date) =>
    apiClient.get<DashboardKpisResponse>(
      withChannelKey(
        `/api/v1/organizations/${orgId}/dashboard/kpis?from=${toApiDate(from)}&to=${toApiDate(to)}`,
      ),
    ),

  /**
   * Daily time-series (revenue, orders, new_customers) + growth summary.
   * GET /api/v1/organizations/{orgId}/dashboard/growth?from=&to=
   */
  getGrowth: (orgId: string, from: Date, to: Date) =>
    apiClient.get<DashboardGrowthResponse>(
      withChannelKey(
        `/api/v1/organizations/${orgId}/dashboard/growth?from=${toApiDate(from)}&to=${toApiDate(to)}`,
      ),
    ),

  /**
   * Top products by gross revenue for the period.
   * GET /api/v1/organizations/{orgId}/dashboard/top-products?from=&to=&limit=
   */
  getTopProducts: (orgId: string, from: Date, to: Date, limit = 20) =>
    apiClient.get<DashboardTopProductsResponse>(
      withChannelKey(
        `/api/v1/organizations/${orgId}/dashboard/top-products?from=${toApiDate(from)}&to=${toApiDate(to)}&limit=${limit}`,
      ),
    ),

  /**
   * Pivoted customer cohort retention data.
   * GET /api/v1/organizations/{orgId}/dashboard/cohorts?from=&to=
   */
  getCohorts: (orgId: string, from: Date, to: Date) =>
    apiClient.get<DashboardCohortResponse>(
      withChannelKey(
        `/api/v1/organizations/${orgId}/dashboard/cohorts?from=${toApiDate(from)}&to=${toApiDate(to)}`,
      ),
    ),

  /**
   * Subscription KPIs: MRR, active subscribers, new subscribers, cancellation rate, retention.
   * GET /api/v1/organizations/{orgId}/dashboard/subscriptions?from=&to=
   */
  getSubscriptionMetrics: (orgId: string, from: Date, to: Date) =>
    apiClient.get<SubscriptionMetricsResponse>(
      withChannelKey(
        `/api/v1/organizations/${orgId}/dashboard/subscriptions?from=${toApiDate(from)}&to=${toApiDate(to)}`,
      ),
    ),
};
