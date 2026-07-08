import { useState } from 'react';
import { BrainCircuit, Eye, EyeOff, KeyRound, Lock, Shield, Users } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (secret: string) => void;
  setCurrentPage: (page: string) => void;
  BACKEND: string;
}

export default function AdminLogin({ onLogin, setCurrentPage, BACKEND }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials.');
      localStorage.setItem('cvmind_admin_secret', data.secret);
      onLogin(data.secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-v2 admin-login-page">
      {/* Decorative orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-scan-beam" />

      <button className="admin-login-back" onClick={() => setCurrentPage('home')}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to site
      </button>

      <div className="admin-login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo-ring">
            <BrainCircuit size={20} />
          </div>
          <span className="login-brand-text">
            CVMind <span className="login-brand-accent">AI</span>
          </span>
        </div>

        {/* Header */}
        <div className="login-header">
          <h2>Operations Console</h2>
          <p>Secure access to platform-wide analytics, user management, AI monitoring, and business intelligence.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div className="login-field">
            <label htmlFor="admin-username">Username</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><Users size={15} /></span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter administrator username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon"><KeyRound size={15} /></span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                required
              />
              <button
                type="button"
                className="login-pass-toggle"
                onClick={() => setShowPassword(v => !v)}
                title="Toggle password"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            className="login-submit-btn"
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? (
              <><span className="login-spinner" /> Authenticating...</>
            ) : (
              <><Lock size={14} /> Access Control Panel</>
            )}
          </button>
        </form>

        {error && (
          <div className="login-error">
            <Shield size={14} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
