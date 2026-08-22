import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Bill } from '../types';
import { isOverdue } from './dateUtils';
import { formatCurrency } from './currencyUtils';
import { smsApi } from '../services/api';

const SENT_LOG_KEY = 'payloop_sms_sent_log';

async function getSentLog(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(SENT_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function markSent(key: string): Promise<void> {
  try {
    const log = await getSentLog();
    log[key] = format(new Date(), 'yyyy-MM-dd');
    await AsyncStorage.setItem(SENT_LOG_KEY, JSON.stringify(log));
  } catch { /* silent */ }
}

async function alreadySentToday(key: string): Promise<boolean> {
  const log = await getSentLog();
  return log[key] === format(new Date(), 'yyyy-MM-dd');
}

// ── Message builders ──────────────────────────────────────────────────────────

export function buildPaidSms(billName: string, amount: number, method: string): string {
  return (
    `✅ PayLoop: Payment confirmed!\n` +
    `Bill: ${billName}\n` +
    `Amount: ${formatCurrency(amount)}\n` +
    `Method: ${method}\n` +
    `Date: ${format(new Date(), 'd MMM yyyy')}`
  );
}

function buildReminderSms(billName: string, amount: number, daysUntil: number, dueDate: Date): string {
  const dueLabel = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
  return (
    `⏰ PayLoop Reminder: "${billName}" is due ${dueLabel} ` +
    `(${format(dueDate, 'd MMM yyyy')}). Amount: ${formatCurrency(amount)}.`
  );
}

function buildOverdueSms(billName: string, amount: number, dueDate: Date): string {
  return (
    `🔴 PayLoop Alert: "${billName}" is OVERDUE since ${format(dueDate, 'd MMM yyyy')}. ` +
    `Amount: ${formatCurrency(amount)}. Please pay immediately!`
  );
}

// ── Main check function (call on app open) ────────────────────────────────────

export async function checkAndSendBillReminders(
  bills: Bill[],
  phone: string,
): Promise<void> {
  if (!phone) return;

  const today = format(new Date(), 'yyyy-MM-dd');

  for (const bill of bills) {
    if (bill.isPaid) continue;

    const dueDate = parseISO(bill.dueDate);
    const daysUntil = differenceInDays(dueDate, new Date());

    // ── Overdue ───────────────────────────────────────────────────────────────
    if (isOverdue(bill.dueDate, bill.isPaid)) {
      const key = `${bill.id}:overdue:${today}`;
      if (await alreadySentToday(key)) continue;

      try {
        await smsApi.send(phone, buildOverdueSms(bill.name, bill.amount, dueDate));
        await markSent(key);
      } catch (e) {
        console.warn('SMS overdue send failed:', e);
      }
      continue; // skip reminder for overdue bills
    }

    // ── Due-date reminders ────────────────────────────────────────────────────
    for (const reminder of bill.reminders ?? []) {
      let triggerDays = -1;
      if (reminder === '7 days before') triggerDays = 7;
      else if (reminder === '3 days before') triggerDays = 3;
      else if (reminder === '1 day before') triggerDays = 1;
      else if (reminder === 'On due date') triggerDays = 0;

      if (triggerDays < 0 || daysUntil !== triggerDays) continue;

      const key = `${bill.id}:reminder:${today}`;
      if (await alreadySentToday(key)) continue;

      try {
        await smsApi.send(phone, buildReminderSms(bill.name, bill.amount, daysUntil, dueDate));
        await markSent(key);
      } catch (e) {
        console.warn('SMS reminder send failed:', e);
      }
    }
  }
}
