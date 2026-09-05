import { Link } from 'react-router-dom';
import { Home, ShieldOff } from 'lucide-react';
import { Button } from '../components/Button';

export function AccessDeniedPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 84,
          height: 84,
          borderRadius: 'var(--pp-radius-xl)',
          background: 'var(--pp-rose-100)',
          color: 'var(--pp-rose-500)',
        }}
      >
        <ShieldOff size={40} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pp-rose-500)' }}>
        403 Access denied
      </div>
      <h2 style={{ letterSpacing: '-0.02em' }}>You do not have access to this page</h2>
      <p className="pp-muted" style={{ maxWidth: 440 }}>
        Your role does not include permission for this area. If you believe this is a mistake, contact your workspace administrator.
      </p>
      <Link to="/dashboard">
        <Button leftIcon={<Home size={16} />}>Back to dashboard</Button>
      </Link>
    </div>
  );
}
