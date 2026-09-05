import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import './Card.css';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('pp-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('pp-card__header', className)}>
      <div className="pp-card__titles">
        {title && <h3 className="pp-card__title">{title}</h3>}
        {subtitle && <div className="pp-card__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="pp-card__actions">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('pp-card__body', className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('pp-card__footer', className)}>{children}</div>;
}
