import { create } from 'zustand';
import { Bill, Payment, PaymentMethod } from '../types';
import { billsApi, paymentsApi } from '../services/api';

interface BillState {
  bills: Bill[];
  payments: Payment[];
  loading: boolean;
  error: string | null;

  // Data loading
  fetchBills: () => Promise<void>;
  fetchPayments: () => Promise<void>;

  // CRUD actions (all talk to the backend)
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'isPaid'>) => Promise<string>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markAsPaid: (id: string, details: {
    paymentMethod: PaymentMethod;
    paidDate?: string;
    transactionId?: string;
    notes?: string;
  }) => Promise<void>;

  // Local computed helpers (no API call)
  getBillById: (id: string) => Bill | undefined;
  getUpcomingBills: () => Bill[];
  getOverdueBills: () => Bill[];
  getPaidBills: () => Bill[];
}

function isOverdue(dueDate: string, isPaid: boolean): boolean {
  if (isPaid) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export const useBillStore = create<BillState>()((set, get) => ({
  bills: [],
  payments: [],
  loading: false,
  error: null,

  // ─── Fetch all bills from the API ──────────────────────────────────────────
  fetchBills: async () => {
    set({ loading: true, error: null });
    try {
      const bills = await billsApi.getAll();
      set({ bills, loading: false });
    } catch (err: any) {
      console.error('fetchBills error:', err);
      set({ error: err.message ?? 'Failed to load bills', loading: false });
    }
  },

  // ─── Fetch all payments from the API ──────────────────────────────────────
  fetchPayments: async () => {
    try {
      const payments = await paymentsApi.getAll();
      set({ payments });
    } catch (err: any) {
      console.error('fetchPayments error:', err);
    }
  },

  // ─── Add a new bill ────────────────────────────────────────────────────────
  addBill: async (bill) => {
    set({ loading: true, error: null });
    try {
      const created = await billsApi.create(bill);
      set(s => ({ bills: [created, ...s.bills], loading: false }));
      return created.id;
    } catch (err: any) {
      console.error('addBill error:', err);
      set({ error: err.message ?? 'Failed to add bill', loading: false });
      throw err;
    }
  },

  // ─── Update an existing bill ───────────────────────────────────────────────
  updateBill: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await billsApi.update(id, updates);
      set(s => ({
        bills: s.bills.map(b => (b.id === id ? updated : b)),
        loading: false,
      }));
    } catch (err: any) {
      console.error('updateBill error:', err);
      set({ error: err.message ?? 'Failed to update bill', loading: false });
      throw err;
    }
  },

  // ─── Delete a bill ────────────────────────────────────────────────────────
  deleteBill: async (id) => {
    set({ loading: true, error: null });
    try {
      await billsApi.delete(id);
      set(s => ({ bills: s.bills.filter(b => b.id !== id), loading: false }));
    } catch (err: any) {
      console.error('deleteBill error:', err);
      set({ error: err.message ?? 'Failed to delete bill', loading: false });
      throw err;
    }
  },

  // ─── Mark a bill as paid ───────────────────────────────────────────────────
  markAsPaid: async (id, details) => {
    set({ loading: true, error: null });
    try {
      const { bill: updatedBill, payment } = await billsApi.markAsPaid(id, details);

      set(s => ({
        bills: s.bills.map(b => (b.id === id ? updatedBill : b)),
        payments: [payment, ...s.payments],
        loading: false,
      }));
    } catch (err: any) {
      console.error('markAsPaid error:', err);
      set({ error: err.message ?? 'Failed to mark as paid', loading: false });
      throw err;
    }
  },

  // ─── Local computed helpers ────────────────────────────────────────────────
  getBillById: (id) => get().bills.find(b => b.id === id),

  getUpcomingBills: () =>
    get().bills.filter(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid)),

  getOverdueBills: () =>
    get().bills.filter(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid)),

  getPaidBills: () =>
    get().bills.filter(b => b.isPaid),
}));
