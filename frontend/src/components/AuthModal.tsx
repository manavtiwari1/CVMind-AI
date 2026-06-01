import { useState, useEffect } from 'react';
import { Mail, Lock, X, Sparkles, AlertCircle, ArrowRight, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset state on modal open/close
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setName('');
      setPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const body = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setLoading(false);
      localStorage.setItem('cvmind_logged_in', 'true');
      localStorage.setItem('cvmind_user', JSON.stringify(data.user));
      
      setSuccessMsg(data.message || 'Authenticated successfully!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Connection to server failed.');
    }
  };

  const handleGithubLogin = () => {
    const clientId = 'Ov23liErarN0zjhEZ0g5';
    const redirectUri = encodeURIComponent(window.location.origin + '/github-callback');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  return (
    <div 
      className="auth-modal-overlay animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-modal-card glass-card animate-scale-up">
        {/* Close Button */}
        <button 
          className="auth-close-btn" 
          onClick={onClose}
          aria-label="Close authentication panel"
        >
          <X size={16} />
        </button>

        {/* Brand Tag */}
        <div className="auth-brand-badge">
          <Sparkles size={13} className="animate-pulse" /> Secure Gate
        </div>

        {/* Header */}
        <div className="auth-header">
          <h2 className="auth-title">
            {isSignUp ? 'Create your profile' : 'Sign in to CVMind AI'}
          </h2>
          <p className="auth-subtitle">
            {isSignUp 
              ? 'Join professionals acing ATS & recruiting filters today.' 
              : 'Unlock advanced ATS diagnostics, AI tailors, & prep panels.'
            }
          </p>
        </div>

        {/* Forms */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name-input">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-name-input"
                  type="text"
                  className="form-input auth-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email-input">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email-input"
                type="email"
                className="form-input auth-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass-input">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-pass-input"
                type="password"
                className="form-input auth-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div className="auth-alert error animate-slide-down">
              <AlertCircle size={14} className="auth-alert-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success animate-slide-down">
              <Sparkles size={14} className="auth-alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner"></span>
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Social logins */}
        <div className="auth-oauth-row-google" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              setLoading(true);
              setErrorMsg(null);
              setSuccessMsg(null);
              
              const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

              try {
                const response = await fetch(`${baseUrl}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: credentialResponse.credential })
                });
                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Google login failed.');
                }

                setLoading(false);
                localStorage.setItem('cvmind_logged_in', 'true');
                localStorage.setItem('cvmind_user', JSON.stringify(data.user));
                setSuccessMsg('Signed in with Google successfully!');
                
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 1000);
              } catch (err: any) {
                setLoading(false);
                setErrorMsg(err.message || 'Connection to database server failed.');
              }
            }}
            onError={() => {
              setErrorMsg('Google login failed. Please try again.');
            }}
            theme="filled_black"
            shape="pill"
            size="large"
            width="375px"
          />

          <button 
            type="button"
            onClick={handleGithubLogin}
            className="oauth-github-btn"
            style={{
              width: '375px',
              height: '40px',
              borderRadius: '980px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#24292e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.88rem',
              transition: 'all 0.2s cubic-bezier(0.42, 0, 0.58, 1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              padding: '0'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2f363d';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#24292e';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="oauth-svg">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Toggle Panel Switcher */}
        <div className="auth-toggle-mode">
          <span>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            className="auth-toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
