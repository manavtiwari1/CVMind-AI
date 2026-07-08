import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bell, RefreshCw, Search, X } from 'lucide-react';
import type { AdminStats } from '../types';

interface TopbarProps {
  activeSection: string;
  isFetching: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
  setCurrentPage: (p: string) => void;
  stats: AdminStats | null;
  setActiveSection: (s: string) => void;
}

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Console Dashboard',
  'analytics-resume': 'Resume Analytics',
  'analytics-users': 'User Analytics',
  'analytics-ai': 'AI Usage Analytics',
  'analytics-revenue': 'Revenue Analytics',
  'analytics-job-finder': 'Job Finder Analytics',
  'analytics-linkedin': 'LinkedIn Analytics',
  'users-all': 'All Users',
  'users-waitlist': 'Waitlist',
  'users-premium': 'Premium Users',
  'users-suspended': 'Suspended Users',
  'users-deleted': 'Deleted Users',
  'users-whitelist': 'Access Manager',
  'users-sessions': 'Login Sessions',
  'ai-resume-analyzer': 'Resume Analyzer Logs',
  'ai-auto-fix': 'AI Auto-Fix Logs',
  'ai-tailors': 'Resume Tailoring Logs',
  'ai-preps': 'SmartPrep Logs',
  'ai-linkedin': 'LinkedIn Audit Logs',
  'ai-linkedin-bio': 'LinkedIn Bio Logs',
  'ai-linkedin-outreach': 'LinkedIn Outreach Logs',
  'ai-skill-gap': 'Skill Gap Logs',
  'ai-elevator-pitch': 'Elevator Pitch Logs',
  'ai-career-roadmap': 'Career Roadmap Logs',
  'ai-portfolio': 'Portfolio Generator Logs',
  'ai-voice-prep': 'Voice Practice Logs',
  'ai-job-finder': 'Job Finder Logs',
  'payments-transactions': 'Payment Transactions',
  'payments-revenue': 'Revenue Summary',
  'payments-subscriptions': 'Subscriptions',
  'payments-refunds': 'Refunds',
  'payments-coupons': 'Coupons',
  'payments-invoices': 'Invoices',
  'support-leads': 'Contact Leads',
  'support-feedback': 'Feedback',
  'support-bugs': 'Bug Reports',
  'support-features': 'Feature Requests',
  'reports-export': 'Export Center',
  'system-database': 'Database Health',
  'system-api': 'API Health',
  'system-queue': 'Queue Status',
  'system-storage': 'Storage',
  'system-flags': 'Feature Flags',
  'system-audit': 'Audit Logs',
  'system-sessions': 'Login Sessions',
  'settings-general': 'General Settings',
  'settings-security': 'Security Settings',
  'settings-access': 'Access Control',
  'settings-branding': 'Branding',
  'settings-api': 'API Configuration',
  'settings-email': 'Email Settings',
};

const BREADCRUMBS: Record<string, string> = {
  'analytics-resume': 'Analytics',
  'analytics-users': 'Analytics',
  'analytics-ai': 'Analytics',
  'analytics-revenue': 'Analytics',
  'analytics-job-finder': 'Analytics',
  'analytics-linkedin': 'Analytics',
  'users-all': 'User Management',
  'users-waitlist': 'User Management',
  'users-premium': 'User Management',
  'users-suspended': 'User Management',
  'users-deleted': 'User Management',
  'users-whitelist': 'User Management',
  'users-sessions': 'User Management',
  'payments-transactions': 'Payments',
  'payments-revenue': 'Payments',
  'payments-subscriptions': 'Payments',
  'payments-refunds': 'Payments',
  'payments-coupons': 'Payments',
  'payments-invoices': 'Payments',
  'support-leads': 'Support',
  'support-feedback': 'Support',
  'support-bugs': 'Support',
  'support-features': 'Support',
  'reports-export': 'Reports',
  'system-database': 'System',
  'system-api': 'System',
  'system-queue': 'System',
  'system-storage': 'System',
  'system-flags': 'System',
  'system-audit': 'System',
  'system-sessions': 'System',
  'settings-general': 'Settings',
  'settings-security': 'Settings',
  'settings-access': 'Settings',
  'settings-branding': 'Settings',
  'settings-api': 'Settings',
  'settings-email': 'Settings',
};

interface SearchResult {
  type: string;
  text: string;
  meta: string;
  section: string;
  color: string;
}

function buildSearchIndex(stats: AdminStats | null): SearchResult[] {
  if (!stats) return [];
  const results: SearchResult[] = [];

  stats.recentLogins?.forEach(u => {
    results.push({ type: 'User', text: u.name, meta: u.email, section: 'users-all', color: 'var(--blue)' });
  });
  stats.recentScans?.forEach(s => {
    results.push({ type: 'Scan', text: s.fileName, meta: `Score: ${s.score}`, section: 'ai-resume-analyzer', color: 'var(--purple)' });
  });
  stats.recentPayments?.forEach(p => {
    results.push({ type: 'Payment', text: p.email, meta: `₹${p.amount}`, section: 'payments-transactions', color: 'var(--green)' });
  });
  stats.contactMessages?.forEach(m => {
    results.push({ type: 'Lead', text: m.name, meta: m.subject, section: 'support-leads', color: 'var(--amber)' });
  });
  stats.recentJobFinders?.forEach(j => {
    results.push({ type: 'Job', text: j.email, meta: `${j.jobsCount} matches`, section: 'ai-job-finder', color: 'var(--cyan)' });
  });
  return results;
}

export default function Topbar({ activeSection, isFetching, onRefresh, onSignOut, setCurrentPage, stats, setActiveSection }: TopbarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const searchIndex = buildSearchIndex(stats);
  const results = query.trim().length > 1
    ? searchIndex.filter(r =>
        r.text.toLowerCase().includes(query.toLowerCase()) ||
        r.meta.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const title = SECTION_TITLES[activeSection] || 'Console';
  const breadcrumb = BREADCRUMBS[activeSection];

  return (
    <header className="admin-topbar">
      {/* Left: title + breadcrumb */}
      <div className="topbar-left">
        {breadcrumb && <span className="topbar-breadcrumb">{breadcrumb} /</span>}
        <span className="topbar-title">{title}</span>
      </div>

      {/* Center: Global search */}
      <div className="topbar-search">
        <span className="topbar-search-icon"><Search size={14} /></span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users, payments, leads…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query && (
          <button
            style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          >
            <X size={13} />
          </button>
        )}
        {focused && results.length > 0 && (
          <div className="topbar-search-results">
            {results.map((r, i) => (
              <div
                key={i}
                className="search-result-item"
                onClick={() => { setActiveSection(r.section); setQuery(''); }}
              >
                <span className="search-result-type" style={{ background: `${r.color}20`, color: r.color }}>
                  {r.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="search-result-text">{r.text}</div>
                  <div className="search-result-meta">{r.meta}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: controls */}
      <div className="topbar-right">
        <div className="topbar-live">
          <span className="topbar-live-dot" />
          Live
        </div>
        <span className="topbar-time">
          {currentTime.toLocaleTimeString()}
        </span>
        <button className="topbar-btn" onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={13} /> Site
        </button>
        <button
          className={`topbar-btn${isFetching ? ' spin' : ''}`}
          onClick={onRefresh}
          disabled={isFetching}
          title="Refresh data"
        >
          <RefreshCw size={13} /> {isFetching ? 'Syncing…' : 'Sync'}
        </button>
        <button className="topbar-notif-btn" title="Notifications">
          <Bell size={15} />
          <span className="topbar-notif-badge">3</span>
        </button>
        <button className="topbar-signout-btn" onClick={onSignOut}>
          Disconnect
        </button>
      </div>
    </header>
  );
}
