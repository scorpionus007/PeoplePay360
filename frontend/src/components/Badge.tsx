import { ReactNode } from 'react';
import clsx from 'clsx';
import './Badge.css';

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

export function Badge({
  tone = 'neutral',
  children,
  dot,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={clsx('pp-badge', `pp-badge--${tone}`, className)}>
      {dot && <span className="pp-badge__dot" />}
      {children}
    </span>
  );
}

export function statusTone(status?: string | null): BadgeTone {
  if (!status) return 'muted';
  const s = String(status).toLowerCase();
  if (['active', 'approved', 'paid', 'hired', 'completed', 'accepted', 'reimbursed', 'delivered', 'connected', 'published', 'pass', 'redeemed', 'settled', 'validated'].includes(s)) return 'success';
  if (['pending', 'pending_approval', 'submitted', 'requested', 'draft', 'in_progress', 'in_review', 'documents_collecting', 'under_review', 'under_internal_review', 'filed', 'preparing', 'scheduled', 'issued', 'extended', 'in_stock', 'recovering', 'repaying', 'disbursed', 'computed', 'new'].includes(s)) return 'info';
  if (['on_hold', 'pending_admin_approval', 'pending_payroll_review', 'negotiating', 'rfe_pending', 'warn', 'late', 'early_leave', 'waiting_on_employee', 'escalated', 'degraded', 'assigned'].includes(s)) return 'warning';
  if (['rejected', 'denied', 'cancelled', 'refused', 'terminated', 'declined', 'rescinded', 'expired', 'fail', 'lost', 'quarantined', 'absent', 'no_show', 'exhausted'].includes(s)) return 'danger';
  return 'neutral';
}
