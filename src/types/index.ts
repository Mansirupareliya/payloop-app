// ─── Core Types ──────────────────────────────────────────────────────────────

export type PaymentFrequency =
  | 'One time'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Half-yearly'
  | 'Yearly'
  | 'Custom';

export type ReminderOption =
  | '7 days before'
  | '3 days before'
  | '1 day before'
  | 'On due date';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Other';

export type BillStatus = 'upcoming' | 'overdue' | 'paid' | 'due_today';

// ─── Bill ────────────────────────────────────────────────────────────────────

export interface Bill {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string;          // ISO date string
  frequency: PaymentFrequency;
  autoRepeat: boolean;
  reminders: ReminderOption[];
  paymentMethod?: PaymentMethod;
  notes?: string;
  isPaid: boolean;
  paidDate?: string;        // ISO date string
  transactionId?: string;
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

// ─── Payment (History Record) ─────────────────────────────────────────────────

export interface Payment {
  id: string;
  billId: string;
  billName: string;
  categoryId: string;
  amount: number;
  paidDate: string;         // ISO date string
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface Budget {
  monthly: number;
  categories: Record<string, number>; // categoryId → limit amount
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  userName: string;
  budget: Budget;
  notificationsEnabled: boolean;
  reminderChannels: {
    push: boolean;
    inApp: boolean;
  };
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface MonthlySpending {
  month: string;            // e.g. "Aug 2026"
  total: number;
  paid: number;
  pending: number;
}

export interface CategorySpending {
  categoryId: string;
  total: number;
  percentage: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Congratulations: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddBill: { billId?: string };
  BillDetail: { billId: string };
  History: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Bills: undefined;
  Calendar: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Analytics: undefined;
  History: undefined;
  Subscriptions: undefined;
  Settings: undefined;
  Terms: undefined;
};
