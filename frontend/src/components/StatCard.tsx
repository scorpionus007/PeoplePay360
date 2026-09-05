import { ReactNode } from 'react';
import clsx from 'clsx';
import './StatCard.css';

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  loading?: boolean;
}) {
  return (
    <div className={clsx('pp-stat', `pp-stat--${tone}`)}>
      <div className="pp-stat__body">
        <div className="pp-stat__label">{label}</div>
        <div className="pp-stat__value">{loading ? <span className="pp-skeleton pp-stat__value-sk" /> : value}</div>
        {hint && <div className="pp-stat__hint">{hint}</div>}
      </div>
      {icon && <div className="pp-stat__icon">{icon}</div>}
    </div>
  );
}
