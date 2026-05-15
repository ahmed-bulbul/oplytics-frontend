'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Check,
  Loader2,
  ArrowRight,
  Shield,
  AlertCircle,
  RefreshCw,
  Key,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { shopifyApi, type SyncStatusResponse } from '@/lib/api/shopify';
import { ApiError } from '@/lib/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when connection + initial backfill is successfully triggered */
  onConnected?: () => void;
}

type Step = 'credentials' | 'permissions' | 'connecting' | 'redirecting' | 'success' | 'error';

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  checked: boolean;
}

// Shopify API scopes that map to each permission
const SCOPE_MAP: Record<string, string> = {
  orders: 'read_orders,read_all_orders',
  products: 'read_products,read_inventory',
  customers: 'read_customers',
  analytics: 'read_analytics',
  financials: 'read_finances',
};

const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: 'orders',
    label: 'Orders',
    description: 'Read order history and fulfillment status',
    icon: <ShoppingCart className="h-5 w-5" />,
    required: true,
    checked: true,
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Access product catalog and inventory levels',
    icon: <Package className="h-5 w-5" />,
    required: true,
    checked: true,
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Read customer data and purchase history',
    icon: <Users className="h-5 w-5" />,
    required: false,
    checked: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Access store analytics and reports',
    icon: <BarChart3 className="h-5 w-5" />,
    required: false,
    checked: true,
  },
  {
    id: 'financials',
    label: 'Financials',
    description: 'Read revenue, refunds, and payouts',
    icon: <DollarSign className="h-5 w-5" />,
    required: false,
    checked: false,
  },
];

function buildScopes(permissions: Permission[]): string {
  return permissions
    .filter((p) => p.checked)
    .map((p) => SCOPE_MAP[p.id] ?? '')
    .filter(Boolean)
    .join(',');
}

// Normalise input → "mystore.myshopify.com"
function normaliseStoreDomain(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.endsWith('.myshopify.com')) return s;
  if (s.includes('.myshopify.com')) return s.split('.myshopify.com')[0] + '.myshopify.com';
  return `${s}.myshopify.com`;
}

function isValidDomain(raw: string): boolean {
  const normalized = normaliseStoreDomain(raw);
  return /^(?:[a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.myshopify\.com$/.test(normalized);
}

function latestSyncStatus(statuses: SyncStatusResponse[] | null): SyncStatusResponse | null {
  if (!statuses || statuses.length === 0) return null;
  return [...statuses].sort((left, right) => {
    const leftTime = new Date(left.updatedAt ?? left.backfillThrough ?? 0).getTime();
    const rightTime = new Date(right.updatedAt ?? right.backfillThrough ?? 0).getTime();
    return rightTime - leftTime;
  })[0] ?? null;
}

// Friendly labels for sync status
function statusLabel(status: string | null | undefined): string {
  switch (status?.toUpperCase()) {
    case 'RUNNING':   return 'Syncing data…';
    case 'PENDING':   return 'Queued';
    case 'QUEUED':    return 'Queued';
    case 'COMPLETED': return 'Sync complete';
    case 'FAILED':    return 'Sync failed';
    default:          return 'Starting sync…';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShopifyConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: ShopifyConnectDialogProps) {
  const { user } = useAuth();

  // Form state
  const [storeInput, setStoreInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);

  // Flow state
  const [step, setStep] = useState<Step>('credentials');
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusResponse | null>(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);

  const storeDomain = normaliseStoreDomain(storeInput || '');
  const canContinue =
    isValidDomain(storeInput) && clientId.trim().length > 3 && apiSecret.trim().length > 3;

  const togglePermission = (id: string) =>
    setPermissions((prev) =>
      prev.map((p) => (p.id === id && !p.required ? { ...p, checked: !p.checked } : p)),
    );

  // ── Fetch sync status (polled after backfill triggered) ───────────────────

  const fetchSyncStatus = useCallback(async () => {
    if (!user?.orgUuid) return;
    setIsFetchingStatus(true);
    try {
      const statuses = await shopifyApi.getSyncStatus(user.orgUuid, 'shopify');
      setSyncStatus(latestSyncStatus(statuses));
    } catch {
      // Non-fatal — status might not exist yet right after connection
    } finally {
      setIsFetchingStatus(false);
    }
  }, [user?.orgUuid]);

  // Poll sync status on success screen
  useEffect(() => {
    if (step !== 'success') return;
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 5000);
    return () => clearInterval(interval);
  }, [step, fetchSyncStatus]);

  // ── Connection flow ────────────────────────────────────────────────────────

  const handleConnect = async () => {
    if (!user?.orgUuid) {
      setError('You must be logged in to connect a store.');
      setStep('error');
      return;
    }

    setStep('connecting');
    setError(null);

    try {
      // Initiate Shopify OAuth (authorization_code flow).
      // Backend returns a redirectUrl pointing to Shopify's OAuth consent screen.
      const response = await shopifyApi.grantAccess(user.orgUuid, {
        grantType: 'authorization_code',
        clientId: clientId.trim(),
        apiSecret: apiSecret.trim(),
        externalAccountId: storeDomain,
        embedded: false,
        scopes: buildScopes(permissions),
        redirectUri: `${window.location.origin}/shopify/callback`,
      });

      if (response.redirectUrl) {
        // User needs to authorize on Shopify — intentional external navigation.
        // Store context so the callback page can recover even if auth hydration is slow.
        sessionStorage.setItem('shopify_connecting_domain', storeDomain);
        sessionStorage.setItem('shopify_connecting_org', user.orgUuid);
        setStep('redirecting');
        // Short delay so the user sees the "Redirecting…" message before leaving.
        setTimeout(() => {
          window.location.href = response.redirectUrl!;
        }, 600);
      } else {
        // client_credentials path (should not happen here but handle gracefully)
        try {
          await shopifyApi.enableSync(user.orgUuid, 'shopify');
        } catch {
          // Best-effort
        }
        try {
          await shopifyApi.triggerFullBackfill(user.orgUuid, 'shopify');
        } catch {
          // Best-effort
        }
        setStep('success');
        onConnected?.();
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to connect. Please check your credentials and try again.';
      setError(message);
      setStep('error');
    }
  };

  // ── Reset & close ──────────────────────────────────────────────────────────

  const resetState = () => {
    setStep('credentials');
    setStoreInput('');
    setClientId('');
    setApiSecret('');
    setShowSecret(false);
    setPermissions(DEFAULT_PERMISSIONS);
    setError(null);
    setSyncStatus(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetState, 300);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#96BF48]">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">Connect Shopify</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {step === 'credentials' && 'Enter your store credentials to get started'}
                {step === 'permissions' && 'Review the data access permissions'}
                {step === 'connecting' && 'Connecting to your store…'}
                {step === 'redirecting' && 'Taking you to Shopify to approve access'}
                {step === 'success' && 'Your store is now connected'}
                {step === 'error' && 'Connection failed'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">

          {/* ── Step 1: Credentials ──────────────────────────────────────── */}
          {step === 'credentials' && (
            <div className="space-y-5">
              {/* Store URL */}
              <div className="space-y-2">
                <Label htmlFor="store-url" className="text-sm font-medium">
                  Store domain
                </Label>
                <div className="relative">
                  <Input
                    id="store-url"
                    placeholder="your-store"
                    value={storeInput}
                    onChange={(e) => setStoreInput(e.target.value)}
                    className="pr-32"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                    .myshopify.com
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found in Shopify Admin → Settings → Domains
                </p>
              </div>

              {/* API Key (Client ID) */}
              <div className="space-y-2">
                <Label htmlFor="client-id" className="flex items-center gap-1.5 text-sm font-medium">
                  <Key className="h-3.5 w-3.5" />
                  API key (Client ID)
                </Label>
                <Input
                  id="client-id"
                  placeholder="shppa_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  From your Shopify Partner Dashboard → Apps → API credentials
                </p>
              </div>

              {/* API Secret */}
              <div className="space-y-2">
                <Label htmlFor="api-secret" className="text-sm font-medium">
                  API secret key
                </Label>
                <div className="relative">
                  <Input
                    id="api-secret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="shpss_xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    autoComplete="new-password"
                    className="pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Security note */}
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-xs text-muted-foreground">
                    Your credentials are encrypted at rest with AES-256. We only request
                    read-only Shopify scopes and never store your admin password.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  className="flex-1 bg-[#96BF48] hover:bg-[#7a9c3a] text-white"
                  onClick={() => setStep('permissions')}
                  disabled={!canContinue}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Permissions ──────────────────────────────────────── */}
          {step === 'permissions' && (
            <div className="space-y-5">
              {/* Store badge */}
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                <Store className="h-4 w-4 text-[#96BF48]" />
                <span className="text-sm font-medium">{storeDomain}</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Data access permissions
                </p>
                <div className="space-y-2">
                  {permissions.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        p.required
                          ? 'cursor-default bg-muted/20'
                          : 'cursor-pointer hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{p.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{p.label}</span>
                            {p.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={p.checked}
                        onCheckedChange={() => togglePermission(p.id)}
                        disabled={p.required}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  className="flex-1 bg-[#96BF48] hover:bg-[#7a9c3a] text-white"
                  onClick={handleConnect}
                >
                  Connect store
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setStep('credentials')}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Connecting ───────────────────────────────────────── */}
          {step === 'connecting' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#96BF48]/10">
                <Loader2 className="h-8 w-8 animate-spin text-[#96BF48]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Connecting to Shopify</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifying your credentials and building the OAuth URL…
              </p>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <p>✓ Encrypting API credentials</p>
                <p className="animate-pulse">⏳ Preparing Shopify authorisation…</p>
              </div>
            </div>
          )}

          {/* ── Step 3b: Redirecting to Shopify ─────────────────────────── */}
          {step === 'redirecting' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#96BF48]/10">
                <ArrowRight className="h-8 w-8 text-[#96BF48]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Redirecting to Shopify</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You&apos;ll be taken to Shopify to approve the connection. Come right back
                — we&apos;ll finish setup automatically.
              </p>
              <p className="mt-4 text-xs text-muted-foreground animate-pulse">
                Opening Shopify OAuth…
              </p>
            </div>
          )}

          {/* ── Step 4: Success ──────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Successfully Connected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Oplytics is now syncing your Shopify data.
                </p>
              </div>

              {/* Store + sync info */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Store</span>
                  <span className="font-medium">{storeDomain}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sync status</span>
                  <div className="flex items-center gap-2">
                    {isFetchingStatus ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : null}
                    <Badge
                      className={
                        syncStatus?.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : syncStatus?.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }
                    >
                      {statusLabel(syncStatus?.status)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Permissions granted</span>
                  <span className="font-medium">
                    {permissions.filter((p) => p.checked).length} scopes
                  </span>
                </div>
                {syncStatus?.currentType && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Syncing</span>
                    <span className="font-medium capitalize">
                      {syncStatus.currentType.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Historical data backfill runs in the background. Dashboard metrics will
                appear as data is processed.
              </p>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          )}

          {/* ── Step 5: Error ─────────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Connection Failed</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                  {error ?? 'Something went wrong. Please check your credentials and try again.'}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-[#96BF48] hover:bg-[#7a9c3a] text-white"
                  onClick={() => setStep('credentials')}
                >
                  Try again
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
