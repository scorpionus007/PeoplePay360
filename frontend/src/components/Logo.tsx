import clsx from 'clsx';
import './Logo.css';

type Variant = 'horizontal' | 'stacked' | 'mark';

/**
 * PeoplePay360 brand lockup. Renders the mark SVG as an <img> so it can
 * inherit color from a container class (light or dark surfaces) and pairs
 * it with the wordmark in Nunito bold to match the reference logo.
 */
export function Logo({
  variant = 'horizontal',
  size = 32,
  showWordmark = true,
  className,
}: {
  variant?: Variant;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  const mark = <MarkImg size={size} className="pp-logo__mark" />;
  if (variant === 'mark' || !showWordmark) {
    return <span className={clsx('pp-logo', className)}>{mark}</span>;
  }
  const wordSize = Math.round(size * 0.62);
  const wordmark = (
    <span className="pp-logo__wordmark" style={{ fontSize: wordSize }}>
      peoplepay<span className="pp-logo__wordmark-num">360</span>
      <span className="pp-logo__wordmark-deg" aria-hidden="true" />
    </span>
  );
  return (
    <span className={clsx('pp-logo', `pp-logo--${variant}`, className)}>
      {mark}
      {wordmark}
    </span>
  );
}

function MarkImg({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={clsx('pp-logo__mark-wrap', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" width="100%" height="100%">
        <g stroke="currentColor" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 138,30 A 82,82 0 1,1 42,58" />
          <path d="M 118,18 L 140,28 L 132,50" />
        </g>
        <g fill="currentColor">
          <circle cx="75" cy="80" r="15.5" />
          <circle cx="125" cy="80" r="15.5" />
        </g>
        <g stroke="currentColor" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 76,96 C 76,120 124,138 124,158 C 124,176 106,183 100,183" />
          <path d="M 124,96 C 124,120 76,138 76,158 C 76,176 94,183 100,183" />
          <path d="M 60,168 Q 100,190 140,168" />
        </g>
      </svg>
    </span>
  );
}
