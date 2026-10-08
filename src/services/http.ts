import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types';

export const API_ORIGIN: string = import.meta.env.VITE_API_URL ?? '';
export const TOKEN_KEY = 'shop.token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: user simply has to log in again */
  }
};

export const http = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 30000 });

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid token on a request that carried one => tell the app to log the user out.
http.interceptors.response.use(
  (r) => r,
  (err: AxiosError<ApiErrorBody>) => {
    if (err.response?.status === 401 && getToken() && !err.config?.url?.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  },
);

/** Turn any error into a message that is safe to show a user. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return 'Cannot reach the server. Check your connection and try again.';
    const e = err.response.data?.error;
    if (e?.details?.length) return e.details.map((d) => `${d.field}: ${d.message}`).join('\n');
    if (e?.message) return e.message;
  }
  return fallback;
}

export function errorCode(err: unknown): string | undefined {
  return axios.isAxiosError<ApiErrorBody>(err) ? err.response?.data?.error?.code : undefined;
}
