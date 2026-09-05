import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  block?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  block,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={clsx('pp-btn', `pp-btn--${variant}`, `pp-btn--${size}`, block && 'pp-btn--block', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="pp-btn__spinner" aria-hidden="true" /> : leftIcon && <span className="pp-btn__icon">{leftIcon}</span>}
      {children && <span className="pp-btn__label">{children}</span>}
      {!loading && rightIcon && <span className="pp-btn__icon">{rightIcon}</span>}
    </button>
  );
}
