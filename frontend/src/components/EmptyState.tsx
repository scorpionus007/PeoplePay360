import { ReactNode } from 'react';
import './EmptyState.css';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="pp-empty">
      {icon && <div className="pp-empty__icon">{icon}</div>}
      <div className="pp-empty__title">{title}</div>
      {description && <div className="pp-empty__desc">{description}</div>}
      {action && <div className="pp-empty__action">{action}</div>}
    </div>
  );
}
