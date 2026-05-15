'use client';

/**
 * AppShell — client-side layout wrapper.
 *
 * - On public routes (/login, /register) → renders children only (no chrome).
 * - While auth is loading → shows a minimal spinner (avoids flicker).
 * - When unauthenticated on a protected route → redirects to /login.
 * - When authenticated → renders full sidebar + topbar layout.
 */

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/top-bar';
import { useAuth } from '@/contexts/AuthContext';

// Routes that render without the sidebar/topbar chrome.
// / is the public landing page — no auth needed.
// /shopify/callback is semi-public: Shopify redirects here before we can
// check auth, so it renders its own full-page UI.
// /billing/success and /billing/cancel are Stripe redirect targets — render
// chromeless (no sidebar) and must NOT redirect authenticated users away.
const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/register', '/shopify/callback'];
const CHROMELESS_AUTH_ROUTES = ['/billing/success', '/billing/cancel'];
const SETUP_ROUTES = ['/setup/organization'];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((r) =>
    // Exact match for '/' to avoid prefixing every route; startsWith for others
    r === '/' ? pathname === '/' : pathname.startsWith(r),
  );
}

function isSetupRoute(pathname: string) {
  return SETUP_ROUTES.some((r) => pathname.startsWith(r));
}

function isChromelessAuthRoute(pathname: string) {
  return CHROMELESS_AUTH_ROUTES.some((r) => pathname.startsWith(r));
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = isPublicRoute(pathname);
  const isChromeless = isChromelessAuthRoute(pathname);
  const isSetup = isSetupRoute(pathname);
  const hasOrganization = !!user?.orgUuid;

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isPublic, router]);

  // Redirect unauthenticated users away from chromeless auth routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isChromeless) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isChromeless, router]);

  // Redirect already-authenticated users away from auth pages,
  // but still allow the public marketing pages.
  useEffect(() => {
    if (!isLoading && isAuthenticated && isPublic && pathname !== '/' && pathname !== '/pricing') {
      router.replace(hasOrganization ? '/dashboard' : '/setup/organization');
    }
  }, [hasOrganization, isLoading, isAuthenticated, isPublic, pathname, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!hasOrganization && !isSetup) {
      router.replace('/setup/organization');
      return;
    }
    if (hasOrganization && isSetup) {
      router.replace('/integrations');
    }
  }, [hasOrganization, isAuthenticated, isLoading, isSetup, router]);

  // ── Public routes (no chrome) ──────────────────────────────────────────────
  if (isPublic || (isSetup && isAuthenticated)) {
    return <>{children}</>;
  }

  // ── Billing outcome pages — chromeless but requires auth ───────────────────
  if (isChromeless) {
    if (isLoading || !isAuthenticated) {
      // Show spinner while loading; useEffect above will redirect if not authed
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // ── Auth loading / unauthenticated (guard) ─────────────────────────────────
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Authenticated: full dashboard chrome ───────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
