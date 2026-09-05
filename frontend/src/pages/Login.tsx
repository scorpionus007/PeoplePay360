import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AtSign, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { extractApiError } from '../api/client';
import './Login.css';

export function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@peoplepay360.local');
  const [password, setPassword] = useState('ChangeMe!2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pp-login">
      <div className="pp-login__left">
        <div className="pp-login__brand">
          <Logo size={30} />
        </div>
        <div className="pp-login__card">
          <h1 className="pp-login__title">Welcome back</h1>
          <p className="pp-login__subtitle">Sign in to your workspace to continue.</p>

          <form className="pp-login__form" onSubmit={onSubmit}>
            <Input
              label="Work email"
              type="email"
              required
              autoComplete="email"
              leftAdornment={<AtSign size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              leftAdornment={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="pp-login__error">{error}</div>}
            <Button type="submit" size="lg" block loading={submitting} rightIcon={<ArrowRight size={16} />}>
              Sign in
            </Button>
          </form>

          <div className="pp-login__hint">
            Local demo: <span className="pp-mono">admin@peoplepay360.local</span> / <span className="pp-mono">ChangeMe!2026</span>
          </div>
        </div>
        <div className="pp-login__legal">
          Odoo Hackathon 2026 &middot; PeoplePay360
        </div>
      </div>
      <div className="pp-login__right" aria-hidden="true">
        <div className="pp-login__glow" />
        <div className="pp-login__pitch">
          <div className="pp-login__pitch-eyebrow">HR &middot; Payroll &middot; IT &middot; Benefits &middot; Hiring &middot; Mobility</div>
          <div className="pp-login__pitch-title">One platform for every person operation.</div>
          <div className="pp-login__pitch-body">
            Run global payroll, orchestrate hiring, ship devices, manage benefits and mobility, and keep every module in sync.
          </div>
          <ul className="pp-login__pitch-list">
            <li>Multi currency payroll with structure driven rules</li>
            <li>Attendance, leave and feedback in one HR surface</li>
            <li>Device fleet, EDR and baseline compliance</li>
            <li>Visa, relocation and travel workflows</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
