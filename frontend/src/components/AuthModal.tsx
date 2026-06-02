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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
      setIsForgotPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isForgotPassword) {
      if (!email) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
      try {
        const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Password reset request failed.');
        }

        setLoading(false);
        setSuccessMsg(data.message || 'A secure reset link has been sent to your email.');
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || 'Connection to server failed.');
      }
      return;
    }

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
            {isForgotPassword 
              ? 'Reset your password' 
              : isSignUp 
                ? 'Create your profile' 
                : 'Sign in to CVMind AI'
            }
          </h2>
          <p className="auth-subtitle">
            {isForgotPassword
              ? 'Enter the email address registered with your account and we will send you a secure link to change your password.'
              : isSignUp 
                ? 'Join professionals acing ATS & recruiting filters today.' 
                : 'Unlock advanced ATS diagnostics, AI tailors, & prep panels.'
            }
          </p>
        </div>

        {/* Forms */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isForgotPassword && isSignUp && (
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

          {!isForgotPassword && (
            <div className="form-group">
              <div className="password-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="auth-pass-input" style={{ margin: 0 }}>Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    className="auth-forgot-link" 
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
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
                  required={!isForgotPassword}
                />
              </div>
            </div>
          )}

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
                {isForgotPassword 
                  ? 'Send Reset Link' 
                  : isSignUp 
                    ? 'Create Account' 
                    : 'Sign In'
                } <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {!isForgotPassword && (
          <>
            {/* Separator */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Social logins */}
            <div className="auth-oauth-row-google" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
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
            </div>
          </>
        )}

        {/* Toggle Panel Switcher */}
        <div className="auth-toggle-mode">
          {isForgotPassword ? (
            <button 
              type="button" 
              className="auth-toggle-btn"
              onClick={() => {
                setIsForgotPassword(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              disabled={loading}
              style={{ fontWeight: 600 }}
            >
              Back to Sign In
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
