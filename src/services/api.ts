import { Bill, Payment, PaymentMethod } from '../types';
import { useAuthStore } from '../store/authStore';

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.29.112:4000/api';

// ─── Generic fetch helper ────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // Get token from authStore directly
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers: { ...headers, ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
      // Auto logout on unauthorized (except login/me)
      useAuthStore.getState().logout();
    }
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials: any) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  signup: (details: any) => request<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(details),
  }),
  me: () => request<any>('/auth/me'),
};

// ─── Bills API ───────────────────────────────────────────────────────────────

export const billsApi = {
  getAll: () => request<Bill[]>('/bills'),
  create: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'isPaid'>) =>
    request<Bill>('/bills', { method: 'POST', body: JSON.stringify(bill) }),
  update: (id: string, updates: Partial<Bill>) =>
    request<Bill>(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/bills/${id}`, { method: 'DELETE' }),
  markAsPaid: (id: string, details: any) =>
    request<any>(`/bills/${id}/pay`, { method: 'POST', body: JSON.stringify(details) }),
};

// ─── Payments API ────────────────────────────────────────────────────────────

export const paymentsApi = {
  getAll: () => request<Payment[]>('/payments'),
};
