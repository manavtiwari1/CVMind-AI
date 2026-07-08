import { useState } from 'react';
import { Shield, Key, Building2, Lock, Palette, Mail } from 'lucide-react';
import type { AdminStats } from '../types';

interface SettingsProps {
  stats: AdminStats;
  subSection: string;
}

export default function Settings({ stats, subSection }: SettingsProps) {
  const [active, setActive] = useState(subSection || 'settings-access');
  const adminUsers = Math.max(1, Math.min(6, stats.totalLogins || 1));
  const settingsPages = {
    'settings-general': {
      title: 'General Settings',
      desc: 'Workspace identity, region, retention, and platform defaults',
      icon: <Building2 size={32} />,
      rows: [
        ['Workspace name', 'CVMind AI'],
        ['Default region', 'India / Global'],
        ['Data retention', 'Soft delete ready']
      ]
    },
    'settings-security': {
      title: 'Security Settings',
      desc: 'Session expiry, delete confirmations, 2FA readiness, and rate limits',
      icon: <Lock size={32} />,
      rows: [
        ['Session timeout', '30 minutes'],
        ['2FA readiness', 'Planned'],
        ['Permanent delete confirmation', 'Enabled']
      ]
    },
    'settings-branding': {
      title: 'Branding',
      desc: 'Console brand, theme defaults, logo usage, and product copy',
      icon: <Palette size={32} />,
      rows: [
        ['Brand', 'CVMind AI'],
        ['Default console theme', 'Dark SaaS'],
        ['Public theme', 'Light']
      ]
    },
    'settings-email': {
      title: 'Email Settings',
      desc: 'Transactional mail, support routing, templates, and sender identity',
      icon: <Mail size={32} />,
      rows: [
        ['SMTP relay', 'Configured'],
        ['Support inbox', `${stats.totalContacts || 0} contact records`],
        ['Template status', 'Ready']
      ]
    }
  } as const;

  return (
    <div className="section-animate">
      <div className="tab-bar">
        {[
          { id: 'settings-general', label: 'General', icon: <Building2 size={12} /> },
          { id: 'settings-security', label: 'Security', icon: <Lock size={12} /> },
          { id: 'settings-access', label: 'Access Control', icon: <Shield size={12} /> },
          { id: 'settings-branding', label: 'Branding', icon: <Palette size={12} /> },
          { id: 'settings-api', label: 'API Configuration', icon: <Key size={12} /> },
          { id: 'settings-email', label: 'Email Settings', icon: <Mail size={12} /> }
        ].map(t => (
          <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === 'settings-access' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Access Control</h2>
              <p>Configure administrator roles, permissions, security settings, and session timeouts</p>
            </div>
          </div>

          <div style={{ maxWidth: 800 }}>
            <div className="settings-section">
              <h3>Role-Based Access Control</h3>
              {[
                { role: 'Owner', desc: 'Full root access to delete system configuration and purge files', count: 1 },
                { role: 'Developer', desc: 'Access feature flags, system health, and database debug tools', count: Math.max(1, Math.floor(adminUsers / 3)) },
                { role: 'Support Agent', desc: 'Access contact messages and lead status pipelines', count: Math.max(1, adminUsers - 2) }
              ].map(r => (
                <div className="settings-row" key={r.role}>
                  <div className="settings-row-info">
                    <h4>{r.role} Role</h4>
                    <p>{r.desc}</p>
                  </div>
                  <span className="badge badge-gray">{r.count} users</span>
                </div>
              ))}
            </div>

            <div className="settings-section">
              <h3>Security Rules</h3>
              {[
                { name: 'Enforce Session Timeout', desc: 'Log out idle admin consoles after 30 minutes', enabled: true },
                { name: 'Strict Delete Confirmations', desc: 'Ask double confirm check before permanent data deletions', enabled: true },
                { name: 'Developer Mode Console logs', desc: 'Write diagnostic socket payload trace to developer console', enabled: false }
              ].map((s, i) => (
                <div className="settings-row" key={i}>
                  <div className="settings-row-info">
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked={s.enabled} />
                    <span className="toggle-track"></span>
                    <span className="toggle-thumb"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === 'settings-api' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>API Configuration</h2>
              <p>Setup backend credentials, token limits, and keys for third-party AI models</p>
            </div>
          </div>

          <div style={{ maxWidth: 800 }}>
            <div className="settings-section">
              <h3>AI Gateway Providers</h3>
              {[
                { name: 'Gemini 1.5 Pro API key', status: 'Active (Env config)', limit: 'Unlimited limits' },
                { name: 'OpenAI GPT-4o API key', status: 'Inactive', limit: '0 requests/min limit' },
                { name: 'Mailgun SMTP Relay key', status: 'Active', limit: '10k emails/month limit' }
              ].map((api, idx) => (
                <div className="settings-row" key={idx}>
                  <div className="settings-row-info">
                    <h4>{api.name}</h4>
                    <p>Status: <strong style={{ color: api.status.includes('Active') ? 'var(--green)' : 'var(--text-3)' }}>{api.status}</strong></p>
                  </div>
                  <span className="badge badge-gray">{api.limit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {active in settingsPages && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>{settingsPages[active as keyof typeof settingsPages].title}</h2>
              <p>{settingsPages[active as keyof typeof settingsPages].desc}</p>
            </div>
          </div>

          <div className="glass-panel" style={{ maxWidth: 820 }}>
            <div className="panel-header">
              <div className="panel-header-left">
                {settingsPages[active as keyof typeof settingsPages].icon}
                <h3>Configuration</h3>
              </div>
            </div>
            <div className="panel-body">
              {settingsPages[active as keyof typeof settingsPages].rows.map(([label, value]) => (
                <div className="settings-row" key={label}>
                  <div className="settings-row-info">
                    <h4>{label}</h4>
                    <p>{value}</p>
                  </div>
                  <span className="badge badge-gray">Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
