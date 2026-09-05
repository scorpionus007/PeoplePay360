import clsx from 'clsx';
import './Logo.css';

/**
 * PeoplePay wordmark: bold "people" + regular "pay" + bold ".".
 * Inherits currentColor so it themes cleanly on dark and light surfaces.
 */
export function Logo({
  size = 28,
  className,
  as: Tag = 'span',
}: {
  size?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Tag className={clsx('pp-logo', className)} style={{ fontSize: size }} aria-label="peoplepay">
      <span className="pp-logo__strong">people</span>
      <span className="pp-logo__weak">pay</span>
      <span className="pp-logo__strong">.</span>
    </Tag>
  );
}
