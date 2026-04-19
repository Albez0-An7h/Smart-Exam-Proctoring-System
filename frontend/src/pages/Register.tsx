import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { extractError } from '../api/errorUtils';

type Role = 'STUDENT' | 'TEACHER';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      login(res.data.token);
      navigate(role === 'TEACHER' ? '/teacher' : '/dashboard');
    } catch (err: any) {
      setError(extractError(err, 'Registration failed.'));
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
            Join the<br />
            <span className="grad-text">smarter</span><br />
            way to test.
          </h2>
          <p>Create an account and start taking or building proctored exams in minutes.</p>
        </div>

        <p className="auth-quote">
          3 question types · Auto-grading · Real-time proctoring
        </p>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1>Create account</h1>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form
            id="register-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Role selector */}
            <div className="form-group">
              <label>I am a</label>
              <div className="role-selector">
                <button
                  id="role-student"
                  type="button"
                  className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                  onClick={() => setRole('STUDENT')}
                >
                  Student
                </button>
                <button
                  id="role-teacher"
                  type="button"
                  className={`role-btn ${role === 'TEACHER' ? 'active' : ''}`}
                  onClick={() => setRole('TEACHER')}
                >
                  Teacher
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                className="form-control"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              id="reg-submit"
              type="submit"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Get started →'}
            </button>
          </form>

          <hr className="divider" />
          <p className="text-sm" style={{ color: 'var(--text-3)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'underline', textDecorationColor: 'var(--border2)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
