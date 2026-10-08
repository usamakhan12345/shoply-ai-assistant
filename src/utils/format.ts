import { API_ORIGIN } from '@/services/http';

export const money = (n: number): string => `Rs. ${Math.round(n).toLocaleString('en-US')}`;

export const dateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const dateOnly = (iso: string): string => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23eef0f6'/><text x='50%' y='50%' font-family='sans-serif' font-size='28' fill='%239aa3b8' text-anchor='middle' dominant-baseline='middle'>No image</text></svg>";

/** Uploaded images come back as '/uploads/x.png' (served by the API); seed images are absolute URLs. */
export const imgUrl = (url: string | null | undefined): string => {
  if (!url) return PLACEHOLDER_IMG;
  return url.startsWith('/uploads') ? `${API_ORIGIN}${url}` : url;
};

/** Only allow same-site redirect targets after login (blocks open-redirect tricks like //evil.com). */
export const safeRedirect = (to: string | null | undefined, fallback = '/'): string =>
  to && to.startsWith('/') && !to.startsWith('//') ? to : fallback;

export const csv = (s: string): string[] =>
  s.split(',').map((x) => x.trim()).filter(Boolean);
