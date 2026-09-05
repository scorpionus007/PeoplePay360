import clsx from 'clsx';
import './Avatar.css';

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
  const hue = Math.abs(hash(name)) % 360;
  return (
    <span
      className={clsx('pp-avatar', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.floor(size * 0.4)),
        background: `hsl(${hue}, 55%, 92%)`,
        color: `hsl(${hue}, 45%, 30%)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
