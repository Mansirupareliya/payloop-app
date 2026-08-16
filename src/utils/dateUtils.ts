import {
  format,
  isToday,
  isTomorrow,
  isPast,
  differenceInDays,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { PaymentFrequency } from '../types';

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM');
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatMonthShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function currentMonthLabel(): string {
  return format(new Date(), 'MMMM yyyy');
}

export function toISODateString(date: Date): string {
  return date.toISOString();
}

export function nowISO(): string {
  return new Date().toISOString();
}

// ─── Due Date Labels ─────────────────────────────────────────────────────────

export function getDueDateLabel(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Due Today';
    if (isTomorrow(date)) return 'Due Tomorrow';
    if (isPast(date)) return 'Overdue';
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `Due in ${days} day${days === 1 ? '' : 's'}`;
    return `Due ${format(date, 'd MMM')}`;
  } catch {
    return 'Unknown';
  }
}

export function isOverdue(dateStr: string, isPaid: boolean): boolean {
  if (isPaid) return false;
  try {
    const date = parseISO(dateStr);
    return isPast(date) && !isToday(date);
  } catch {
    return false;
  }
}

export function isDueToday(dateStr: string): boolean {
  try {
    return isToday(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function isDueSoon(dateStr: string, days = 7): boolean {
  try {
    const date = parseISO(dateStr);
    const diff = differenceInDays(date, new Date());
    return diff >= 0 && diff <= days;
  } catch {
    return false;
  }
}

export function daysUntilDue(dateStr: string): number {
  try {
    return differenceInDays(parseISO(dateStr), new Date());
  } catch {
    return 0;
  }
}

// ─── Recurrence ──────────────────────────────────────────────────────────────

export function getNextDueDate(dateStr: string, frequency: PaymentFrequency): string {
  try {
    const date = parseISO(dateStr);
    switch (frequency) {
      case 'Daily':       return addDays(date, 1).toISOString();
      case 'Weekly':      return addWeeks(date, 1).toISOString();
      case 'Monthly':     return addMonths(date, 1).toISOString();
      case 'Quarterly':   return addQuarters(date, 1).toISOString();
      case 'Half-yearly': return addMonths(date, 6).toISOString();
      case 'Yearly':      return addYears(date, 1).toISOString();
      default:            return date.toISOString();
    }
  } catch {
    return dateStr;
  }
}

// ─── Calendar Helpers ────────────────────────────────────────────────────────

export function getBillsForDate(bills: { dueDate: string }[], dateStr: string): { dueDate: string }[] {
  try {
    const target = parseISO(dateStr);
    return bills.filter(b => isSameDay(parseISO(b.dueDate), target));
  } catch {
    return [];
  }
}

export function getMonthBounds(year: number, month: number) {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

// ─── Greeting ────────────────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export function calculateStreak(payments: { paidDate: string; billId: string }[]): number {
  if (payments.length === 0) return 0;
  // Count consecutive months with at least one on-time payment
  const monthsWithPayments = new Set(
    payments.map(p => format(parseISO(p.paidDate), 'yyyy-MM'))
  );
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const key = format(addMonths(now, -i), 'yyyy-MM');
    if (monthsWithPayments.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function isSameDayStr(a: string, b: string): boolean {
  try {
    return isSameDay(parseISO(a), parseISO(b));
  } catch {
    return false;
  }
}

export function formatCalendarHeader(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy');
}
