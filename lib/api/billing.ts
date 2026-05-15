import { apiClient } from './client';

export type BillingPlanCode = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type BillingInterval = 'MONTH' | 'YEAR';

export interface BillingSummaryResponse {
  organizationId: string;
  planCode: BillingPlanCode;
  status: string;
  billingInterval: BillingInterval | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  billingEmail: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  features: string[];
}

export interface BillingInvoiceRow {
  invoiceId: string;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface BillingInvoicesResponse {
  items: BillingInvoiceRow[];
  limit: number;
  offset: number;
}

export interface CreateCheckoutSessionRequest {
  planCode: Exclude<BillingPlanCode, 'FREE'>;
  billingInterval: Exclude<BillingInterval, null>;
}

export interface CreateCheckoutSessionResponse {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface CreatePortalSessionResponse {
  portalUrl: string;
}

export const billingApi = {
  getSummary: (orgUuid: string) =>
    apiClient.get<BillingSummaryResponse>(`/api/v1/organizations/${orgUuid}/billing`),

  listInvoices: (orgUuid: string, limit = 12, offset = 0) =>
    apiClient.get<BillingInvoicesResponse>(
      `/api/v1/organizations/${orgUuid}/billing/invoices?limit=${limit}&offset=${offset}`,
    ),

  createCheckoutSession: (orgUuid: string, data: CreateCheckoutSessionRequest) =>
    apiClient.post<CreateCheckoutSessionResponse>(
      `/api/v1/organizations/${orgUuid}/billing/checkout-session`,
      data,
    ),

  createPortalSession: (orgUuid: string) =>
    apiClient.post<CreatePortalSessionResponse>(
      `/api/v1/organizations/${orgUuid}/billing/portal-session`,
    ),
};
