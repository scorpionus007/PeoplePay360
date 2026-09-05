import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { LoginForm } from '../components/LoginForm';
import './Login.css';

export function LoginPage() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="pp-login">
      <div className="pp-login__left">
        <Link to="/" className="pp-login__brand" aria-label="Back to peoplepay">
          <Logo size={32} />
        </Link>
        <div className="pp-login__card">
          <h1 className="pp-login__title">Welcome back</h1>
          <p className="pp-login__subtitle">Sign in to your workspace to continue.</p>
          <LoginForm />
        </div>
      </div>
      <div className="pp-login__right" aria-hidden="true">
        <div className="pp-login__pitch">
          <div className="pp-login__pitch-eyebrow">hr · payroll · it · benefits · hiring · mobility</div>
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
