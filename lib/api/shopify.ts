import { apiClient } from './client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a large number compactly: 1_400_000 → "1.4M", 38_000 → "38K", 500 → "500" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

// ─── Request / Response types ─────────────────────────────────────────────────

/**
 * Maps to backend GrantAccessRequest.
 * grantType = "client_credentials" for API-key/secret flow.
 */
export interface GrantAccessRequest {
  grantType: 'client_credentials' | 'authorization_code';
  clientId: string;
  apiSecret: string;
  /** The Shopify store domain, e.g. "mystore.myshopify.com" */
  externalAccountId: string;
  embedded?: boolean;
  scopes?: string;
  redirectUri?: string;
}

/** Backend: GrantAccessResponse record */
export interface GrantAccessResponse {
  userUuid: string;
  orgUuid: string;
  channelKey: string;
  /** "granted" for client_credentials, "not_connected" for authorization_code */
  status: string;
  /** Populated only for authorization_code flow — the Shopify OAuth URL to redirect to */
  redirectUrl: string | null;
}

/** Backend: ChannelCallbackResponse */
export interface ChannelCallbackResponse {
  connected: boolean;
  connectionState: string;
  redirectUri: string | null;
}

/** Backend: SyncStatusResponse */
export interface SyncStatusResponse {
  shopUuid: string | null;
  status: string;
  currentType: string | null;
  operationId: string | null;
  failureSource: string | null;
  backfillThrough: string | null;
  updatedAt: string | null;
  lastIncrementalSyncAt: string | null;
}

/** Backend: ChannelDataStatsResponse — real imported record counts */
export interface ChannelDataStatsResponse {
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  lastIncrementalSyncAt: string | null;
  backfillThrough: string | null;
}

/** Connected channel account info stored in org_channel_accounts */
export interface ChannelAccount {
  channelKey: string;
  externalAccountId: string;
  accountName: string;
  accountUrl: string;
}

// ─── Shopify API calls ────────────────────────────────────────────────────────

export const shopifyApi = {
  /**
   * Authenticate a Shopify store using API key + secret (client-credentials flow).
   * POST /api/v1/organizations/{orgId}/channels/{channelKey}/grant-access
   */
  grantAccess: (orgId: string, data: GrantAccessRequest, channelKey = 'shopify') =>
    apiClient.post<GrantAccessResponse>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/grant-access`,
      data,
    ),

  /**
   * Get current sync / backfill status.
   * GET /api/v1/organizations/{orgId}/channels/{channelKey}/sync/status
   */
  getSyncStatus: (orgId: string, channelKey = 'shopify') =>
    apiClient.get<SyncStatusResponse[]>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/sync/status`,
    ),

  /**
   * Trigger a full backfill (orders + customers + products).
   * POST /api/v1/organizations/{orgId}/channels/{channelKey}/back-fill/resync
   */
  triggerFullBackfill: (orgId: string, channelKey = 'shopify') =>
    apiClient.post<void>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/back-fill/resync`,
    ),

  /**
   * Exchange OAuth code for access token after Shopify redirects back.
   * GET /api/v1/organizations/{orgId}/channels/{channelKey}/callback?code=&state=&shop=
   */
  channelCallback: (
    orgId: string,
    code: string,
    state: string,
    shop: string,
    channelKey = 'shopify',
  ) => {
    const qs = new URLSearchParams({ code, state, shop }).toString();
    return apiClient.get<ChannelCallbackResponse>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/callback?${qs}`,
    );
  },

  /**
   * Get imported data counts (orders, customers, products) for a connected channel.
   * GET /api/v1/organizations/{orgId}/channels/{channelKey}/sync/data-stats
   */
  getDataStats: (orgId: string, channelKey = 'shopify') =>
    apiClient.get<ChannelDataStatsResponse>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/sync/data-stats`,
    ),

  /**
   * Trigger an immediate on-demand incremental sync (last 24 h).
   * POST /api/v1/organizations/{orgId}/channels/{channelKey}/fill/sync/trigger
   */
  triggerSync: (orgId: string, channelKey = 'shopify') =>
    apiClient.post<{ status: string; lastIncrementalSyncAt: string }>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/fill/sync/trigger`,
    ),

  /**
   * Enable recurring incremental sync for the channel.
   * POST /api/v1/organizations/{orgId}/channels/{channelKey}/fill/sync/enable
   */
  enableSync: (orgId: string, channelKey = 'shopify') =>
    apiClient.post<{ status: string }>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/fill/sync/enable`,
    ),

  /**
   * List connected channel account info (store name, ad account name, etc.)
   * GET /api/v1/organizations/{orgId}/channel-accounts
   */
  getChannelAccounts: (orgId: string) =>
    apiClient.get<ChannelAccount[]>(`/api/v1/organizations/${orgId}/channel-accounts`),

  /**
   * Start incremental fill for orders.
   * GET /api/v1/organizations/{orgId}/channels/{channelKey}/back-fill/orders
   */
  backfillOrders: (
    orgId: string,
    channelKey = 'shopify',
    params?: { from?: string; to?: string; apiType?: string },
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiClient.get<void>(
      `/api/v1/organizations/${orgId}/channels/${channelKey}/back-fill/orders${qs ? `?${qs}` : ''}`,
    );
  },
};
