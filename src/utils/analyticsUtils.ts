import { format, parseISO, subMonths } from 'date-fns';
import { Bill, Payment, CategorySpending, MonthlySpending } from '../types';
import { isOverdue, isDueSoon, isDueToday } from './dateUtils';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function getDashboardStats(bills: Bill[], payments: Payment[]) {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');

  const currentMonthBills = bills.filter(b =>
    b.dueDate.startsWith(currentMonth)
  );

  const upcomingBills  = bills.filter(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid));
  const overdueBills   = bills.filter(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid));
  const todayBills     = bills.filter(b => !b.isPaid && isDueToday(b.dueDate));
  const dueSoonBills   = bills.filter(b => !b.isPaid && isDueSoon(b.dueDate, 7))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const paidThisMonth  = currentMonthBills.filter(b => b.isPaid);
  const pendingThisMonth = currentMonthBills.filter(b => !b.isPaid);

  const totalUpcoming  = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue   = overdueBills.reduce((sum, b) => sum + b.amount, 0);
  const totalToday     = todayBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid      = paidThisMonth.reduce((sum, b) => sum + b.amount, 0);
  const totalPending   = pendingThisMonth.reduce((sum, b) => sum + b.amount, 0);

  return {
    totalUpcoming,
    totalOverdue,
    totalToday,
    totalPaid,
    totalPending,
    upcomingCount: upcomingBills.length,
    overdueCount:  overdueBills.length,
    dueSoonBills,
  };
}

// ─── Monthly Spending ─────────────────────────────────────────────────────────

export function getMonthlySpending(bills: Bill[], months = 6): MonthlySpending[] {
  const result: MonthlySpending[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const key = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM');

    const monthBills = bills.filter(b => b.dueDate.startsWith(key));
    const paid    = monthBills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
    const pending = monthBills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);

    result.push({
      month: monthLabel,
      total: paid + pending,
      paid,
      pending,
    });
  }
  return result;
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

export function getCategorySpending(bills: Bill[]): CategorySpending[] {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const monthBills = bills.filter(b => b.dueDate.startsWith(currentMonth));

  const byCategory: Record<string, number> = {};
  for (const b of monthBills) {
    byCategory[b.categoryId] = (byCategory[b.categoryId] ?? 0) + b.amount;
  }

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);

  return Object.entries(byCategory)
    .map(([categoryId, amount]) => ({
      categoryId,
      total: amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── Budget Usage ────────────────────────────────────────────────────────────

export function getBudgetUsage(bills: Bill[], budget: number): { spent: number; remaining: number; percent: number } {
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const spent = bills
    .filter(b => b.dueDate.startsWith(currentMonth))
    .reduce((s, b) => s + b.amount, 0);

  return {
    spent,
    remaining: Math.max(0, budget - spent),
    percent: budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0,
  };
}

// ─── Subscription totals ──────────────────────────────────────────────────────

export function getSubscriptionTotals(bills: Bill[]) {
  const monthly = bills
    .filter(b => b.frequency === 'Monthly' && !b.isPaid)
    .reduce((s, b) => s + b.amount, 0);
  return {
    monthly,
    yearly: monthly * 12,
  };
}
