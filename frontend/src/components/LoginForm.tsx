import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { extractApiError } from '../api/client';
import '../pages/Login.css';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@peoplepay360.local');
  const [password, setPassword] = useState('ChangeMe!2026');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess?.();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
  );
}
