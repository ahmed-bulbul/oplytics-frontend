'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
  type UpdateProfileRequest,
  type UserProfileResponse,
} from '@/lib/api/auth';
import { isApiError, tokenStore } from '@/lib/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  email: string;
  orgUuid: string | null;
  userUuid?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while we're still reading from localStorage on first mount */
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  setOrganization: (orgUuid: string) => void;
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem('user');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
}

function mergeProfileDefaults(user: AuthUser): AuthUser {
  const emailPrefix = user.email.split('@')[0] ?? '';
  const [emailFirst = '', emailLast = ''] = emailPrefix
    .split(/[._-]/)
    .filter(Boolean);

  return {
    ...user,
    firstName: user.firstName ?? (emailFirst ? emailFirst[0].toUpperCase() + emailFirst.slice(1) : ''),
    lastName: user.lastName ?? (emailLast ? emailLast[0].toUpperCase() + emailLast.slice(1) : ''),
    phone: user.phone ?? '',
    timezone: user.timezone ?? 'Asia/Dhaka',
    currency: user.currency ?? 'USD',
    language: user.language ?? 'en',
    dateFormat: user.dateFormat ?? 'dd/mm/yyyy',
    avatarUrl: user.avatarUrl ?? null,
  };
}

function mapProfileResponse(profile: UserProfileResponse): AuthUser {
  return mergeProfileDefaults({
    email: profile.email,
    orgUuid: profile.orgUuid,
    userUuid: profile.userUuid,
    role: profile.role,
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    phone: profile.phone ?? undefined,
    timezone: profile.timezone ?? undefined,
    currency: profile.currency ?? undefined,
    language: profile.language ?? undefined,
    dateFormat: profile.dateFormat ?? undefined,
    avatarUrl: profile.avatarUrl,
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on first client render
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const storedUser = readStoredUser();
    if (storedUser) {
      setUser(mergeProfileDefaults(storedUser));
    }

    authApi.me()
      .then((profile) => {
        const nextUser = mapProfileResponse(profile);
        persistUser(nextUser);
        setUser(nextUser);
      })
      .catch((error) => {
        // Only clear the session when the backend explicitly rejected auth.
        // Transient network/server errors should not log the user out.
        if (isApiError(error) && error.status === 401) {
          tokenStore.clear();
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Listen for session expiry signalled by the API client (avoids hard page reload)
  useEffect(() => {
    const handler = () => {
      tokenStore.clear();
      setUser(null);
      router.push('/login');
    };
    window.addEventListener('oplytics:session-expired', handler);
    return () => window.removeEventListener('oplytics:session-expired', handler);
  }, [router]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await authApi.login(data);
      tokenStore.setAccess(res.token);
      const profile = await authApi.me();
      const userInfo = mapProfileResponse(profile);
      persistUser(userInfo);
      setUser(userInfo);
      router.push(res.orgUuid ? '/dashboard' : '/setup/organization');
    },
    [router],
  );

  // ── Register ───────────────────────────────────────────────────────────────

  const register = useCallback(
    async (data: RegisterRequest) => {
      await authApi.register(data);
      // Auto-login so the user lands in the app immediately
      const loginRes = await authApi.login({
        email: data.email,
        password: data.password,
      });
      tokenStore.setAccess(loginRes.token);
      const profile = await authApi.me();
      const nextUser = mapProfileResponse(profile);
      persistUser(nextUser);
      setUser(nextUser);
      router.push(loginRes.orgUuid ? '/integrations' : '/setup/organization');
    },
    [router],
  );

  const setOrganization = useCallback((orgUuid: string) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextUser = { ...currentUser, orgUuid };
      persistUser(nextUser);
      return nextUser;
    });
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    const profile = await authApi.updateProfile(updates);
    const nextUser = mapProfileResponse(profile);
    persistUser(nextUser);
    setUser(nextUser);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — clear local state regardless
    }
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        setOrganization,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
