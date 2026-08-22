import { Alert } from 'react-native';
import { Bill } from '../types';
import { isOverdue, isDueToday } from './dateUtils';
import { formatCurrency } from './currencyUtils';
import { format, parseISO, differenceInDays } from 'date-fns';

// ── Payment confirmation ───────────────────────────────────────────────────────

export function notifyPaymentConfirmed(_billName: string, _amount: number, _method: string): void {
  // no-op: success banner in BillDetailScreen handles this
}

// ── Bill reminder / overdue alerts (call on app open) ─────────────────────────

export async function checkAndNotifyBillReminders(_bills: Bill[]): Promise<void> {
  // no-op: notifications disabled
}
