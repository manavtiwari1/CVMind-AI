import { useEffect, useState } from 'react';
import { Zap, Lock } from 'lucide-react';

interface UsageBadgeProps {
  feature: string;
  userId?: string;
  /** Called when usage data is fresh — lets parent know if 0 remain */
  onUsageLoaded?: (remaining: number, limit: number) => void;
  className?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  analyze:           'resume analyses',
  proofread:         'proofreads',
  prep:              'prep sessions',
  'linkedin-analyze':'LinkedIn audits',
  'linkedin-bio':    'bio generations',
  'linkedin-outreach':'outreach DMs',
  'linkedin-post':   'LinkedIn posts',
};

export default function UsageBadge({ feature, userId, onUsageLoaded, className = '' }: UsageBadgeProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
      || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

    fetch(`${baseUrl}/api/user/usage/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.usage?.[feature]) {
          const rem = data.usage[feature].remaining;
          const lim = data.usage[feature].limit;
          setRemaining(rem);
          setLimit(lim);
          onUsageLoaded?.(rem, lim);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, feature]);

  if (!userId || loading || remaining === null) return null;
  // Unlimited (paid user)
  if (remaining >= 999 || limit === 0) return null;

  const label = FEATURE_LABELS[feature] || 'uses';
  const pct = limit > 0 ? (remaining / limit) * 100 : 0;
  const color = remaining === 0 ? '#f43f5e' : remaining === 1 ? '#fb923c' : '#10b981';

  return (
    <div className={`usage-badge ${className}`} style={{ '--usage-color': color } as any}>
      <div className="usage-bar-track">
        <div className="usage-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="usage-badge-text">
        {remaining === 0 ? (
          <>
            <Lock size={11} style={{ color }} />
            <span style={{ color }}>Daily limit reached — <strong>{limit}</strong> {label}/day</span>
          </>
        ) : (
          <>
            <Zap size={11} style={{ color }} />
            <span><strong style={{ color }}>{remaining}</strong> of {limit} {label} left today</span>
          </>
        )}
      </div>
    </div>
  );
}
