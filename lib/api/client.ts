/**
 * Base API client with JWT authentication and auto-refresh.
 * Reads NEXT_PUBLIC_API_URL from env (defaults to http://localhost:8080).
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ─── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// ─── Token helpers (localStorage, client-only) ────────────────────────────────

export const tokenStore = {
  getAccess: () =>
    typeof window !== 'undefined'
      ? (localStorage.getItem('access_token') ?? null)
      : null,
  setAccess: (t: string) => localStorage.setItem('access_token', t),
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

/**
 * Dispatches 'oplytics:session-expired' so AuthContext can call router.push('/login')
 * via React instead of a hard page reload.  Never call window.location.href here —
 * that would tear down the React tree mid-request and cause the "redirected to login
 * after connecting Shopify" bug.
 */
function signalSessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('oplytics:session-expired'));
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(currentToken: string): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken }),
      });

      if (!refreshRes.ok) {
        return null;
      }

      const body = await refreshRes.json();
      const newToken: string | null = body.token ?? body.accessToken ?? null;
      if (newToken) {
        tokenStore.setAccess(newToken);
      }
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return (
      body?.message ??
      body?.error ??
      `Request failed with status ${res.status}`
    );
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

// ─── Core request function ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = tokenStore.getAccess();
  const headers = buildHeaders(token);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });
  } catch (networkErr) {
    // Network-level failure (backend down, CORS pre-flight blocked, etc.)
    // Never redirect here — throw so callers can show a friendly error.
    throw new ApiError(0, 'Network error — please check your connection and try again.');
  }

  // Happy path
  if (res.ok) {
    if (res.status === 204) return null as unknown as T;
    return res.json() as Promise<T>;
  }

  // ── 401 Unauthorised: try a silent token refresh once ────────────────────
  if (res.status === 401 && retry) {
    const currentToken = tokenStore.getAccess();
    if (currentToken) {
      try {
        const newToken = await refreshAccessToken(currentToken);
        if (newToken) {
          // Retry original call with fresh token (retry=false to avoid loops)
          return request<T>(path, options, false);
        }
      } catch {
        // Refresh network error — fall through to signal expiry
      }
    }

    // Token is genuinely expired / invalid — signal React, do NOT hard-navigate.
    // AuthContext listens to 'oplytics:session-expired' and calls router.push('/login').
    tokenStore.clear();
    signalSessionExpired();
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  // ── All other errors ─────────────────────────────────────────────────────
  const message = await parseError(res);
  throw new ApiError(res.status, message);
}

// ─── Public API object ───────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'GET', ...init }),

  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    }),

  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...init }),
};
