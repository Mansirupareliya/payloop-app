import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';
import { Bill, Payment } from '../types';
import { getCategoryById } from '../constants/categories';
import { isOverdue, isDueToday } from './dateUtils';

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(...cells: (string | number)[]): string {
  return cells.map(escapeCsv).join(',');
}

export async function exportMonthlyCSV(
  bills: Bill[],
  payments: Payment[],
  monthDate: Date,
): Promise<void> {
  const monthKey = format(monthDate, 'yyyy-MM');
  const monthLabel = format(monthDate, 'MMMM yyyy');
  const generatedAt = format(new Date(), 'd MMM yyyy hh:mm a');

  const monthBills = bills.filter(b => b.dueDate.startsWith(monthKey));
  const paidBills = monthBills.filter(b => b.isPaid);
  const overdueBills = monthBills.filter(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid));
  const remainingBills = monthBills.filter(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid));

  const totalCost = monthBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paidBills.reduce((s, b) => s + b.amount, 0);
  const totalOverdue = overdueBills.reduce((s, b) => s + b.amount, 0);
  const totalRemaining = remainingBills.reduce((s, b) => s + b.amount, 0);

  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────────────
  lines.push(row('PayLoop Monthly Report'));
  lines.push(row('Month', monthLabel));
  lines.push(row('Generated', generatedAt));
  lines.push('');

  // ── Summary ──────────────────────────────────────────────────────────────────
  lines.push(row('SUMMARY'));
  lines.push(row('Total Bills', monthBills.length));
  lines.push(row('Total Cost (INR)', totalCost));
  lines.push(row('Paid', totalPaid, `${paidBills.length} bill(s)`));
  lines.push(row('Remaining / Upcoming', totalRemaining, `${remainingBills.length} bill(s)`));
  lines.push(row('Overdue', totalOverdue, `${overdueBills.length} bill(s)`));
  lines.push('');

  // ── All Bills with Status ────────────────────────────────────────────────────
  lines.push(row('ALL BILLS'));
  lines.push(row(
    'Bill Name', 'Category', 'Amount (INR)', 'Due Date',
    'Status', 'Paid Date', 'Payment Method', 'Transaction ID', 'Notes',
  ));

  const sortedBills = [...monthBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  for (const b of sortedBills) {
    const cat = getCategoryById(b.categoryId);
    let status: string;
    if (b.isPaid) {
      status = 'Paid';
    } else if (isOverdue(b.dueDate, b.isPaid)) {
      status = 'Overdue';
    } else if (isDueToday(b.dueDate)) {
      status = 'Due Today';
    } else {
      status = 'Upcoming';
    }

    lines.push(row(
      b.name,
      cat.name,
      b.amount,
      format(parseISO(b.dueDate), 'd MMM yyyy'),
      status,
      b.paidDate ? format(parseISO(b.paidDate), 'd MMM yyyy') : '',
      b.paymentMethod ?? '',
      b.transactionId ?? '',
      b.notes ?? '',
    ));
  }

  lines.push('');

  // ── Payment History (confirmed payments) ─────────────────────────────────────
  const monthPayments = payments.filter(p => {
    try { return format(parseISO(p.paidDate), 'yyyy-MM') === monthKey; }
    catch { return false; }
  });

  if (monthPayments.length > 0) {
    lines.push(row('PAYMENT HISTORY'));
    lines.push(row(
      'Bill Name', 'Category', 'Amount (INR)', 'Paid Date',
      'Payment Method', 'Transaction ID', 'Notes',
    ));
    for (const p of monthPayments) {
      const cat = getCategoryById(p.categoryId);
      lines.push(row(
        p.billName,
        cat.name,
        p.amount,
        format(parseISO(p.paidDate), 'd MMM yyyy'),
        p.paymentMethod,
        p.transactionId ?? '',
        p.notes ?? '',
      ));
    }
  }

  const csv = lines.join('\n');
  const fileName = `payloop-${format(monthDate, 'yyyy-MM')}.csv`;
  const file = new File(Paths.cache, fileName);
  file.write(csv);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) throw new Error('Sharing is not available on this device');

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: `PayLoop Report — ${monthLabel}`,
    UTI: 'public.comma-separated-values-text',
  });
}
