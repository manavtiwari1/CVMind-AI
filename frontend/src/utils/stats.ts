import { useEffect, useState } from 'react';

export interface PublicStats {
  resumesAnalyzed?: number;
  totalUsers?: number;
  usersThisMonth?: number;
}

// Module-level cache so every component shares one fetch per page load.
let cached: PublicStats | null = null;
let inflight: Promise<PublicStats | null> | null = null;

function fetchStats(): Promise<PublicStats | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');
    inflight = fetch(`${baseUrl}/api/stats/public`)
      .then(r => r.json())
      .then(d => (d?.success && d.data ? (cached = d.data) : null))
      .catch(() => null);
  }
  return inflight;
}

/** Live public stats; empty object until loaded (callers keep their static fallback). */
export function useLiveStats(): PublicStats {
  const [stats, setStats] = useState<PublicStats>(cached || {});
  useEffect(() => {
    fetchStats().then(s => { if (s) setStats(s); });
  }, []);
  return stats;
}

export function formatStat(n: number): string {
  if (n >= 10000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  return `${n.toLocaleString()}+`;
}
