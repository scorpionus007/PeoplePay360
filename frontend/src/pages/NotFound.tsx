import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/Button';

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--pp-primary-500)' }}>404</div>
      <h2 style={{ letterSpacing: '-0.02em' }}>We could not find that page</h2>
      <p className="pp-muted" style={{ maxWidth: 420 }}>The page you were looking for does not exist or has been moved.</p>
      <Link to="/dashboard"><Button leftIcon={<Home size={16} />}>Back to dashboard</Button></Link>
    </div>
  );
}
