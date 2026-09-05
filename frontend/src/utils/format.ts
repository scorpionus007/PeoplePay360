import dayjs from 'dayjs';

export function formatMoney(amount: number | string | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || amount === '') return '';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return String(amount);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatNumber(value: number | string | null | undefined, digits = 0): string {
  if (value === null || value === undefined || value === '') return '';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDate(input?: string | null, fmt = 'MMM D, YYYY'): string {
  if (!input) return '';
  const d = dayjs(input);
  return d.isValid() ? d.format(fmt) : String(input);
}

export function formatDateTime(input?: string | null): string {
  if (!input) return '';
  const d = dayjs(input);
  return d.isValid() ? d.format('MMM D, YYYY h:mm A') : String(input);
}

export function humanizeEnum(value?: string | null): string {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
