import { useState } from 'react';
import { Database, Flag, CheckCircle, Info, Activity, Server, HardDrive, ClipboardList, LogIn } from 'lucide-react';
import type { AdminStats } from '../types';

interface SystemHealthProps {
  stats: AdminStats;
  subSection: string;
}

export default function SystemHealth({ stats, subSection }: SystemHealthProps) {
  const [active, setActive] = useState(subSection || 'system-database');
  const [featureFlags, setFeatureFlags] = useState([
    { key: 'resume-builder', name: 'Resume Builder Module', desc: 'Allows users to build and edit resumes in the editor', enabled: true },
    { key: 'voice-practice', name: 'Voice Prep Mock Interview', desc: 'Realtime vocal interview analysis and assessment', enabled: true },
    { key: 'job-finder', name: 'AI Job Finder', desc: 'Auto jobs scanning matched with candidate skills', enabled: true },
    { key: 'portfolio-gen', name: 'Portfolio Generator', desc: 'Auto generates static HTML site drafts', enabled: true },
    { key: 'linkedin-outreach', name: 'LinkedIn Outreach DM Builder', desc: 'Generates professional templates for messages', enabled: true },
    { key: 'maintenance-mode', name: 'Global Maintenance Mode', desc: 'Forces frontends to show offline template page', enabled: false },
    { key: 'beta-features', name: 'Beta Features access', desc: 'Exposes in-testing tools to whitelisted testers', enabled: false }
  ]);

  const toggleFlag = (key: string) => {
    setFeatureFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };
  const systemPages = {
    'system-api': {
      title: 'API Health',
      desc: 'Backend routes, latency, errors, and third-party gateway status',
      icon: <Activity size={32} />,
      rows: [
        ['Backend API', 'Operational'],
        ['Gemini API', 'Configured'],
        ['OpenAI API', 'Ready for key'],
        ['Email Service', 'Operational']
      ]
    },
    'system-queue': {
      title: 'Queue Status',
      desc: 'Background jobs, retries, cron tasks, and pending workloads',
      icon: <Server size={32} />,
      rows: [
        ['Resume analysis queue', 'Idle'],
        ['Email dispatch queue', 'Idle'],
        ['Cron jobs', 'Scheduled']
      ]
    },
    'system-storage': {
      title: 'Storage',
      desc: 'File storage, JSON document store size, and backup readiness',
      icon: <HardDrive size={32} />,
      rows: [
        ['Database path', stats.database?.path || 'N/A'],
        ['Resume scans', `${stats.totalScans || 0} files`],
        ['Contact leads', `${stats.contactMessages?.length || 0} records`]
      ]
    },
    'system-audit': {
      title: 'Audit Logs',
      desc: 'Admin actions including grants, revokes, deletes, and config changes',
      icon: <ClipboardList size={32} />,
      rows: [
        ['Session started', 'Current admin session'],
        ['Last sync', stats.database?.updatedAt ? new Date(stats.database.updatedAt).toLocaleString() : 'N/A']
      ]
    },
    'system-sessions': {
      title: 'Login Sessions',
      desc: 'Active users, devices, browsers, and force logout controls',
      icon: <LogIn size={32} />,
      rows: [
        ['Recent login records', `${stats.recentLogins?.length || 0}`],
        ['Total login events', `${stats.totalLogins || 0}`]
      ]
    }
  } as const;

  return (
    <div className="section-animate">
      <div className="tab-bar">
        {[
          { id: 'system-database', label: 'Database Health', icon: <Database size={12} /> },
          { id: 'system-api', label: 'API Health', icon: <Activity size={12} /> },
          { id: 'system-queue', label: 'Queue Status', icon: <Server size={12} /> },
          { id: 'system-storage', label: 'Storage', icon: <HardDrive size={12} /> },
          { id: 'system-flags', label: 'Feature Flags', icon: <Flag size={12} /> },
          { id: 'system-audit', label: 'Audit Logs', icon: <ClipboardList size={12} /> },
          { id: 'system-sessions', label: 'Login Sessions', icon: <LogIn size={12} /> }
        ].map(t => (
          <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === 'system-database' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Database Health & Metrics</h2>
              <p>Platform file storage logs, data volumes, and synchronisation state</p>
            </div>
            <span className="badge badge-green">Operational</span>
          </div>

          <div style={{ maxWidth: 800 }}>
            <div className="glass-panel" style={{ marginBottom: 20 }}>
              <div className="panel-header">
                <div className="panel-header-left">
                  <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                  <h3>Active Storage Status</h3>
                </div>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Storage Engine', value: 'Persistent JSON Document Store' },
                    { label: 'Database Location Path', value: stats.database?.path || 'N/A' },
                    { label: 'Last Write Sync', value: stats.database?.updatedAt ? new Date(stats.database.updatedAt).toLocaleString() : 'N/A' },
                    { label: 'Total Scans Volume', value: `${stats.totalScans || 0} files` },
                    { label: 'Total Contact Leads', value: `${stats.contactMessages?.length || 0} messages` }
                  ].map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-3)' }}>{row.label}</span>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--text-1)' }} className="mono">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
              <Info size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.45 }}>
                The storage database synchronises state in-memory from backend storage and dumps updates instantly. If file writes fail, a sync error displays in the topbar.
              </p>
            </div>
          </div>
        </div>
      )}

      {active === 'system-flags' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Feature Flags</h2>
              <p>Instantly enable or disable front-end features without rebuilding code</p>
            </div>
          </div>

          <div className="glass-panel">
            <div className="feature-flag-list">
              {featureFlags.map(f => (
                <div className="feature-flag-row" key={f.key}>
                  <div className="feature-flag-info">
                    <div className="feature-flag-name">{f.name}</div>
                    <div className="feature-flag-desc">{f.desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={() => toggleFlag(f.key)}
                    />
                    <span className="toggle-track"></span>
                    <span className="toggle-thumb"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active in systemPages && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>{systemPages[active as keyof typeof systemPages].title}</h2>
              <p>{systemPages[active as keyof typeof systemPages].desc}</p>
            </div>
            <span className="badge badge-green">Operational</span>
          </div>

          <div className="glass-panel" style={{ maxWidth: 840 }}>
            <div className="panel-header">
              <div className="panel-header-left">
                {systemPages[active as keyof typeof systemPages].icon}
                <h3>Live Status</h3>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {systemPages[active as keyof typeof systemPages].rows.map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-3)' }}>{label}</span>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-1)' }} className="mono">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
