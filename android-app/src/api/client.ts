import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Standard Android Emulator loopback IP to host machine port 4000
 * Can be switched to local IP for physical devices.
 */
export const API_BASE_URL = 'http://127.0.0.1:4000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string }; message?: string };
    if (data?.error?.message) return data.error.message;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
