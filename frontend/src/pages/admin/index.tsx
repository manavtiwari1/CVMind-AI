import { useCallback, useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminShell from './AdminShell';
import type { AdminStats } from './types';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface AdminIndexProps {
  setCurrentPage: (page: string) => void;
}

export default function AdminIndex({ setCurrentPage }: AdminIndexProps) {
  const [secret, setSecret] = useState(() => localStorage.getItem('cvmind_admin_secret') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('cvmind_admin_secret'));
  const [isFetching, setIsFetching] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  const BACKEND = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');

  const fetchStats = useCallback(async (key: string) => {
    if (!key) return;
    setIsFetching(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/api/admin/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': key },
        body: JSON.stringify({ secret: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch platform diagnostics.');
      setStats(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed to backend API.');
    } finally {
      setIsFetching(false);
    }
  }, [BACKEND]);

  // Handle initial data load when user has a saved secret
  useEffect(() => {
    if (isLoggedIn && secret) {
      fetchStats(secret);
    }
  }, [isLoggedIn, secret, fetchStats]);

  // Set up auto-refresh timer
  useEffect(() => {
    if (!isLoggedIn || !secret) return;
    const interval = setInterval(() => {
      fetchStats(secret);
    }, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [isLoggedIn, secret, fetchStats]);

  const handleLogin = (secretKey: string) => {
    setSecret(secretKey);
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    setSecret('');
    setIsLoggedIn(false);
    setStats(null);
    localStorage.removeItem('cvmind_admin_secret');
  };

  if (!isLoggedIn) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        setCurrentPage={setCurrentPage}
        BACKEND={BACKEND}
      />
    );
  }

  if (isFetching && !stats) {
    return (
      <div className="admin-v2" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--root)', gap: 16 }}>
        <Loader2 className="login-spinner" size={24} style={{ color: 'var(--blue)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>Synchronizing secure admin keys…</span>
      </div>
    );
  }

  return (
    <div className="admin-v2">
      {error && (
        <div className="admin-error-banner" style={{ margin: 16 }}>
          <AlertTriangle size={16} />
          <div>
            <strong>Backend Connection Issue</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {stats ? (
        <AdminShell
          stats={stats}
          isFetching={isFetching}
          onRefresh={() => fetchStats(secret)}
          onSignOut={handleSignOut}
          setCurrentPage={setCurrentPage}
          secret={secret}
          BACKEND={BACKEND}
        />
      ) : (
        <div className="admin-loading" style={{ minHeight: '80vh' }}>
          <Loader2 className="login-spinner" size={24} />
          <p>Awaiting platform data payload…</p>
        </div>
      )}
    </div>
  );
}
