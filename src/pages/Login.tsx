import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, signInWithPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (err) {
      setError(err.message ?? 'Erro ao entrar. Verifique email e senha.');
      return;
    }
    navigate('/', { replace: true });
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    const { error: err } = await signInWithGoogle();
    setSubmitting(false);
    if (err) {
      setError(err.message ?? 'Erro ao entrar com Google.');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">LideraSpace</h1>
        <p className="login-subtitle">Entre na sua conta</p>

        {error && <div className="login-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
            disabled={submitting}
          />
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={submitting}
          />
          <button type="submit" className="login-btn-primary" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="login-divider">ou</div>

        <button
          type="button"
          className="login-btn-google"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
