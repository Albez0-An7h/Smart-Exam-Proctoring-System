import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { extractError } from '../api/errorUtils';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token);
      const role = res.data.user?.role || '';
      navigate(role === 'TEACHER' ? '/teacher' : '/dashboard');
    } catch (err: any) {
      setError(extractError(err, 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-brand">
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'linear-gradient(135deg,#c2f542,#91e800)',
            display: 'inline-block'
          }} />
          SmartExam
        </div>

        <div className="auth-tagline">
          <h2>
            Exams,<br />
            <span className="grad-text">reimagined</span><br />
            for the web.
          </h2>
          <p>Secure, proctored, and automatically evaluated. Built for modern classrooms.</p>
        </div>

        <p className="auth-quote">
          Trusted by students and instructors across 50+ institutions.
        </p>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1>Sign in</h1>
          <p className="auth-subtitle">Enter your credentials to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form
            id="login-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Continue →'}
            </button>
          </form>

          <hr className="divider" />
          <p className="text-sm" style={{ color: 'var(--text-3)', textAlign: 'center' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--text-2)', textDecoration: 'underline', textDecorationColor: 'var(--border2)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
