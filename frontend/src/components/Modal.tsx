import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { Button } from './Button';
import './Modal.css';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="pp-modal-backdrop" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={clsx('pp-modal', `pp-modal--${size}`)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="pp-modal__header">
          <div className="pp-modal__titles">
            {title && <h2 className="pp-modal__title">{title}</h2>}
            {subtitle && <div className="pp-modal__subtitle">{subtitle}</div>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </header>
        <div className="pp-modal__body">{children}</div>
        {footer && <div className="pp-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
