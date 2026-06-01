import { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import './GithubCallback.css';

interface GithubCallbackProps {
  onSuccess: () => void;
}

export default function GithubCallback({ onSuccess }: GithubCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code returned from GitHub.');
      return;
    }

    const verifyGithubAuth = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

      try {
        const response = await fetch(`${baseUrl}/api/auth/github`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'GitHub verification failed.');
        }

        setStatus('success');
        localStorage.setItem('cvmind_logged_in', 'true');
        localStorage.setItem('cvmind_user', JSON.stringify(data.user));

        setTimeout(() => {
          onSuccess();
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to establish session with CVMind AI servers.');
      }
    };

    verifyGithubAuth();
  }, [onSuccess]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="callback-overlay">
      <div className="callback-card">
        {status === 'loading' && (
          <div className="callback-content">
            <div className="callback-spinner-wrapper">
              <div className="callback-spinner-glow"></div>
              <div className="callback-spinner-ring"></div>
            </div>
            <h2 className="callback-title">Connecting with GitHub</h2>
            <p className="callback-subtitle">Establishing a secure session with CVMind AI...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-content callback-success animate-scale-up">
            <div className="callback-success-badge">
              <ShieldCheck size={36} />
            </div>
            <h2 className="callback-title success-title">Authentication Verified</h2>
            <p className="callback-subtitle">Welcome back! Redirecting you to your homepage...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-content callback-error animate-scale-up">
            <div className="callback-error-badge">
              <AlertCircle size={36} />
            </div>
            <h2 className="callback-title error-title">Authentication Failed</h2>
            <p className="callback-subtitle error-subtitle">{errorMsg}</p>
            <button 
              type="button" 
              onClick={handleGoHome}
              className="btn-primary callback-home-btn"
            >
              <ArrowLeft size={16} /> Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
