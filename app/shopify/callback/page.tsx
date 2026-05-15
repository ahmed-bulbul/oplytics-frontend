'use client';

/**
 * Shopify OAuth Callback Page
 *
 * Shopify redirects here after the merchant approves (or denies) access:
 *   http://localhost:3001/shopify/callback?code=XXX&state=YYY&shop=ZZZ.myshopify.com
 *
 * This page:
 * 1. Reads code / state / shop from the URL query string.
 * 2. Reads the user's orgUuid from AuthContext.
 * 3. Calls the backend callback endpoint to exchange the code for an access token.
 * 4. Triggers a full backfill (best-effort).
 * 5. Redirects to /integrations on success, or shows an error with a retry link.
 *
 * The inner component uses useSearchParams() which requires a Suspense boundary
 * in Next.js App Router (required to avoid build errors).
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { shopifyApi } from '@/lib/api/shopify';
import { ApiError } from '@/lib/api/client';
import { Loader2, CheckCircle2, AlertCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'error' | 'missing_params';

// ─── Inner component (needs Suspense because of useSearchParams) ──────────────

function ShopifyCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeDomain, setStoreDomain] = useState<string | null>(null);

  useEffect(() => {
    // Wait until auth is hydrated from localStorage
    if (authLoading) return;

    const code  = searchParams.get('code');
    const state = searchParams.get('state');
    const shop  = searchParams.get('shop');

    // Retrieve the store domain for display (set by the dialog before redirecting)
    const displayDomain =
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('shopify_connecting_domain')
        : null) ?? shop;
    setStoreDomain(displayDomain);

    if (!code || !state || !shop) {
      setStatus('missing_params');
      return;
    }

    const orgUuid = user?.orgUuid;
    const storedOrgUuid =
      typeof window !== 'undefined' ? sessionStorage.getItem('shopify_connecting_org') : null;
    const resolvedOrgUuid = orgUuid ?? storedOrgUuid;
    if (!resolvedOrgUuid) {
      setErrorMessage('Finish workspace setup before completing the Shopify connection.');
      setStatus('error');
      return;
    }

    (async () => {
      try {
        // Exchange the OAuth code for a Shopify access token
        await shopifyApi.channelCallback(resolvedOrgUuid, code, state, shop);

        // Turn on recurring incremental sync for launch readiness.
        try {
          await shopifyApi.enableSync(resolvedOrgUuid, 'shopify');
        } catch {
          // Non-blocking
        }

        // Trigger full historical backfill (best-effort — non-blocking)
        try {
          await shopifyApi.triggerFullBackfill(resolvedOrgUuid, 'shopify');
        } catch {
          // Backfill failure should not block the success screen
        }

        // Clean up sessionStorage flag
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('shopify_connecting_domain');
          sessionStorage.removeItem('shopify_connecting_org');
        }

        setStatus('success');

        // Auto-redirect to integrations after a short moment
        setTimeout(() => router.push('/integrations'), 2000);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : 'Something went wrong while completing the Shopify connection.';
        setErrorMessage(msg);
        setStatus('error');
      }
    })();
  }, [authLoading, user, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm text-center space-y-6">
        {/* Shopify brand icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#96BF48]">
            <Store className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#96BF48]" />
            <div>
              <h1 className="text-xl font-semibold">Completing Shopify connection</h1>
              {storeDomain && (
                <p className="mt-1 text-sm text-muted-foreground">{storeDomain}</p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">
                Exchanging your authorisation code and setting up data sync…
              </p>
            </div>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <div>
              <h1 className="text-xl font-semibold">Shopify connected!</h1>
              {storeDomain && (
                <p className="mt-1 text-sm text-muted-foreground">{storeDomain}</p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">
                Your store is connected. Historical data backfill is running in the
                background. Taking you to Integrations…
              </p>
            </div>
          </>
        )}

        {/* Missing params */}
        {status === 'missing_params' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <div>
              <h1 className="text-xl font-semibold">Invalid callback</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This link is missing required parameters. Please try connecting your
                store again from the Integrations page.
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/integrations')}>
              Back to Integrations
            </Button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <div>
              <h1 className="text-xl font-semibold">Connection failed</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {errorMessage ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-[#96BF48] hover:bg-[#7a9c3a] text-white"
                onClick={() => router.push('/integrations')}
              >
                Try again
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
                Go to dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page export (Suspense wrapper required for useSearchParams) ──────────────

export default function ShopifyCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ShopifyCallbackInner />
    </Suspense>
  );
}
