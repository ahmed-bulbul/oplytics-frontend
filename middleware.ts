import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — lightweight pass-through.
 *
 * Full auth enforcement is handled client-side in AppShell (see
 * components/app/AppShell.tsx) because the JWT is stored in
 * localStorage which is not accessible server-side.
 *
 * This middleware only handles trivial bypasses (static assets, API
 * proxy routes) so Next.js doesn't bother processing them unnecessarily.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and all static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
