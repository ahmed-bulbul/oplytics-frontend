import { apiClient } from './client';

// ─── Request / Response types (mirror backend DTOs) ──────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

/** Backend: LoginResponse — field is "token" not "accessToken" */
export interface LoginResponse {
  /** The JWT (backend DTO field name is "token") */
  token: string;
  orgUuid: string | null;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
  /** Optional: join an existing org instead of creating a new one */
  orgUuid?: string;
}

/** Backend: RegisterResponse */
export interface RegisterResponse {
  userUuid: string;
  email: string;
  role: string;
  orgUuid: string | null;
}

/** Backend: RefreshResponse — note field is "token" not "accessToken" */
export interface RefreshResponse {
  /** The new JWT (field name in backend DTO is "token") */
  token: string;
  orgUuid: string | null;
  email: string;
}

export interface UserProfileResponse {
  userUuid: string;
  email: string;
  role: string;
  orgUuid: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  timezone: string | null;
  currency: string | null;
  language: string | null;
  dateFormat: string | null;
  avatarUrl: string | null;
}

export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  avatarUrl?: string | null;
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/api/v1/auth/register', data),

  /**
   * Exchange the current token for a fresh one.
   * Backend expects: { "token": "<current_jwt>" }
   * Backend returns: { "token": "<new_jwt>", "orgUuid": "...", "email": "..." }
   */
  refresh: (currentToken: string) =>
    apiClient.post<RefreshResponse>('/api/v1/auth/refresh', { token: currentToken }),

  me: () =>
    apiClient.get<UserProfileResponse>('/api/v1/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<UserProfileResponse>('/api/v1/auth/me', data),

  logout: () =>
    apiClient.post<void>('/api/v1/auth/logout'),
};
