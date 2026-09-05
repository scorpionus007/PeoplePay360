import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';

const STORAGE_KEY = 'pp360.auth';

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_id?: string;
};

export function readStoredAuth(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function writeStoredAuth(tokens: AuthTokens | null) {
  try {
    if (tokens) localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = readStoredAuth();
  if (auth?.access_token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${auth.access_token}`;
  }
  return config;
});

let refreshingPromise: Promise<AuthTokens | null> | null = null;

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const auth = readStoredAuth();
  if (!auth?.refresh_token) return null;

  if (!refreshingPromise) {
    refreshingPromise = axios
      .post(`${BASE_URL}/auth/refresh`, { refresh_token: auth.refresh_token })
      .then((res) => {
        const next = res.data?.data?.tokens as AuthTokens;
        if (next) writeStoredAuth(next);
        return next ?? null;
      })
      .catch(() => {
        writeStoredAuth(null);
        return null;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }
  return refreshingPromise;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    if (status === 401 && !original._retried) {
      original._retried = true;
      const refreshed = await refreshAccessToken();
      if (refreshed?.access_token) {
        original.headers.Authorization = `Bearer ${refreshed.access_token}`;
        return api(original);
      }
      writeStoredAuth(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function extractApiError(err: unknown): string {
  const e = err as AxiosError<{ error?: { message?: string; code?: string; details?: any } }>;
  return (
    e.response?.data?.error?.message ||
    e.message ||
    'Something went wrong'
  );
}
