/**
 * StrayLink API client — the **only** module that talks to the backend.
 *
 * The frontend never calls Supabase directly and never contains any keys.
 */

import type { AuthResponse, Profile, Report } from '../types';

const BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';

// Re-export for convenience
export type { AuthResponse, Profile, Report };

// ── 401 callback ────────────────────────────────────────────────────
let _onSessionExpired: (() => void) | null = null;

export function onSessionExpired(cb: () => void): void {
  _onSessionExpired = cb;
}

// ── Token storage helpers ───────────────────────────────────────────
const TOKEN_KEY = 'straylink_access_token';
const REFRESH_KEY = 'straylink_refresh_token';
const USER_KEY = 'straylink_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): Profile | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export function storeAuth(data: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Low-level fetch wrapper ─────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    _onSessionExpired?.();
    throw new Error('Your session has expired');
  }

  if (!res.ok) {
    const message =
      (body as Record<string, string>).detail ?? 'Something went wrong';
    throw new Error(message);
  }

  return body as T;
}

// ── Auth API ────────────────────────────────────────────────────────
export async function apiSignup(
  email: string,
  password: string,
  full_name: string,
  role: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role }),
  });
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Reports API ─────────────────────────────────────────────────────
export async function apiCreateReport(data: {
  animal_type: string;
  condition: string;
  description: string;
  location_label: string;
  latitude: number | null;
  longitude: number | null;
}): Promise<Report> {
  return apiFetch<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetReports(): Promise<Report[]> {
  return apiFetch<Report[]>('/reports', { method: 'GET' });
}

export async function apiUpdateReportStatus(
  id: string,
  status: string,
): Promise<Report> {
  return apiFetch<Report>(`/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiRateReport(
  id: string,
  rating: number,
): Promise<Report> {
  return apiFetch<Report>(`/reports/${id}/rating`, {
    method: 'PATCH',
    body: JSON.stringify({ rating }),
  });
}