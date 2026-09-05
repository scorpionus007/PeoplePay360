import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';
import './Input.css';

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, hint, error, required, leftAdornment, rightAdornment, className, id, ...rest }, ref) => {
    const inputId = id || `pp-input-${Math.random().toString(36).slice(2, 8)}`;
    return (
      <div className={clsx('pp-field', error && 'pp-field--error')}>
        {label && (
          <label htmlFor={inputId} className="pp-field__label">
            {label}
            {required && <span className="pp-field__req"> *</span>}
          </label>
        )}
        <div className={clsx('pp-field__control', (leftAdornment || rightAdornment) && 'pp-field__control--adorned')}>
          {leftAdornment && <span className="pp-field__adornment pp-field__adornment--left">{leftAdornment}</span>}
          <input id={inputId} ref={ref} className={clsx('pp-input', className)} {...rest} />
          {rightAdornment && <span className="pp-field__adornment pp-field__adornment--right">{rightAdornment}</span>}
        </div>
        {(hint || error) && <div className={clsx('pp-field__hint', error && 'pp-field__hint--error')}>{error || hint}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export function Textarea({
  label,
  hint,
  error,
  required,
  className,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const inputId = id || `pp-textarea-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={clsx('pp-field', error && 'pp-field--error')}>
      {label && (
        <label htmlFor={inputId} className="pp-field__label">
          {label}
          {required && <span className="pp-field__req"> *</span>}
        </label>
      )}
      <textarea id={inputId} className={clsx('pp-input pp-textarea', className)} {...rest} />
      {(hint || error) && <div className={clsx('pp-field__hint', error && 'pp-field__hint--error')}>{error || hint}</div>}
    </div>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  className,
  id,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const inputId = id || `pp-select-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div className={clsx('pp-field', error && 'pp-field--error')}>
      {label && (
        <label htmlFor={inputId} className="pp-field__label">
          {label}
          {required && <span className="pp-field__req"> *</span>}
        </label>
      )}
      <div className="pp-field__control pp-field__control--select">
        <select id={inputId} className={clsx('pp-input pp-select', className)} {...rest}>
          {children}
        </select>
      </div>
      {(hint || error) && <div className={clsx('pp-field__hint', error && 'pp-field__hint--error')}>{error || hint}</div>}
    </div>
  );
}
