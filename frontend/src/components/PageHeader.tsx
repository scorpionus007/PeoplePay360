import { ReactNode } from 'react';
import './PageHeader.css';

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: { label: ReactNode; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <header className="pp-page-header">
      <div className="pp-page-header__titles">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="pp-page-header__crumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span>{crumb.label}</span>}
                {i < breadcrumbs.length - 1 && <span className="pp-page-header__crumbs-sep">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="pp-page-header__title">{title}</h1>
        {subtitle && <div className="pp-page-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="pp-page-header__actions">{actions}</div>}
    </header>
  );
}
