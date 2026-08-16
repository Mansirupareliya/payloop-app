export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
}

export function parseCurrency(str: string): number {
  const cleaned = str.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyInput(str: string): string {
  const cleaned = str.replace(/[^0-9.]/g, '');
  return cleaned;
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}
