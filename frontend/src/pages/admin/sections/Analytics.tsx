import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, FileText, Cpu, TrendingUp, Users, Briefcase, Linkedin } from 'lucide-react';
import type { AdminStats } from '../types';

interface AnalyticsProps { stats: AdminStats; subSection: string }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      {label && <div className="ct-label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>{p.name}:</span>
          <span className="ct-value" style={{ color: p.color }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function ResumeAnalytics({ stats }: { stats: AdminStats }) {
  const total = stats.scoreDistribution.high + stats.scoreDistribution.medium + stats.scoreDistribution.low;
  const maxKeyword = stats.keywordTrends[0]?.count || 1;
  const scoreBarData = [
    { name: 'High Match (80-100)', value: stats.scoreDistribution.high, fill: '#22C55E' },
    { name: 'Medium (60-79)', value: stats.scoreDistribution.medium, fill: '#F59E0B' },
    { name: 'Low (<60)', value: stats.scoreDistribution.low, fill: '#F54F64' },
  ];

  return (
    <div className="section-animate">
      <div className="section-header">
        <div className="section-header-left">
          <h2>Resume Analytics</h2>
          <p>ATS score distribution, keyword trends, and scan metrics</p>
        </div>
        <span className="panel-badge blue">{total} total scans</span>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Scans', value: total.toLocaleString(), accent: 'blue' },
          { label: 'Avg ATS Score', value: `${stats.averageScore || 0}/100`, accent: 'green' },
          { label: 'High ATS (80+)', value: `${stats.scoreDistribution.high}`, accent: 'purple' },
          { label: 'Keywords Tracked', value: stats.keywordTrends.length.toString(), accent: 'amber' },
        ].map(c => (
          <div key={c.label} className={`stat-card accent-${c.accent}`}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid-2">
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-header-left"><BarChart3 size={14} /><h3>Score Distribution</h3></div>
            <span className="panel-badge">{total} scans</span>
          </div>
          <div className="panel-body">
            {total === 0 ? (
              <div className="empty-state"><BarChart3 size={28} /><p>No scan data yet</p></div>
            ) : (
              <>
                <div className="score-bars">
                  {scoreBarData.map(b => {
                    const pct = total > 0 ? Math.round((b.value / total) * 100) : 0;
                    return (
                      <div key={b.name} className="score-bar-row">
                        <span className="score-bar-label">{b.name}</span>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${pct}%`, background: b.fill }} />
                        </div>
                        <span className="score-bar-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <ResponsiveContainer width="100%" height={160} style={{ marginTop: 16 }}>
                  <BarChart data={scoreBarData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="value" name="Resumes" radius={[4,4,0,0]}>
                      {scoreBarData.map((b, i) => <Cell key={i} fill={b.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-header-left"><FileText size={14} /><h3>Top Missing ATS Keywords</h3></div>
            <span className="panel-badge">{stats.keywordTrends.length} unique</span>
          </div>
          <div className="panel-body no-pad">
            {stats.keywordTrends.length === 0 ? (
              <div className="empty-state"><FileText size={28} /><p>No keyword data yet</p></div>
            ) : (
              <div>
                {stats.keywordTrends.map((k, i) => {
                  const pct = Math.round((k.count / maxKeyword) * 100);
                  return (
                    <div key={k.keyword} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', width: 24 }}>#{i + 1}</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>{k.keyword}</span>
                      <div style={{ width: 80, height: 5, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blue)', borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 50, textAlign: 'right' }}>{k.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIAnalytics({ stats }: { stats: AdminStats }) {
  const aiData = [
    { name: 'Resume Scan', value: stats.totalScans || 0, fill: '#4F6DF7' },
    { name: 'Auto Fix', value: stats.totalFixes || 0, fill: '#8B72F5' },
    { name: 'Tailoring', value: stats.totalTailors || 0, fill: '#22C55E' },
    { name: 'SmartPrep', value: stats.totalPreps || 0, fill: '#F59E0B' },
    { name: 'LinkedIn Audit', value: stats.totalLinkedins || 0, fill: '#06B6D4' },
    { name: 'LinkedIn Bio', value: stats.totalLinkedinBios || 0, fill: '#EC4899' },
    { name: 'Outreach DM', value: stats.totalLinkedinOutreachs || 0, fill: '#8B72F5' },
    { name: 'Skill Gap', value: stats.totalCareerCourses || 0, fill: '#22C55E' },
    { name: 'Elevator Pitch', value: stats.totalElevatorPitches || 0, fill: '#F54F64' },
    { name: 'Career Roadmap', value: stats.totalCareerRoadmaps || 0, fill: '#4F6DF7' },
    { name: 'Voice Practice', value: stats.totalVoicePreps || 0, fill: '#06B6D4' },
    { name: 'Portfolio Gen', value: stats.totalPortfolioGens || 0, fill: '#F59E0B' },
    { name: 'Job Finder', value: stats.totalJobFinders || 0, fill: '#22C55E' },
  ].sort((a, b) => b.value - a.value);

  const totalAI = aiData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="section-animate">
      <div className="section-header">
        <div className="section-header-left">
          <h2>AI Usage Analytics</h2>
          <p>Usage metrics across all 13 AI modules</p>
        </div>
        <span className="panel-badge blue">{totalAI.toLocaleString()} total requests</span>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total AI Requests', value: totalAI.toLocaleString(), accent: 'blue' },
          { label: 'Active Modules', value: aiData.filter(d => d.value > 0).length.toString(), accent: 'green' },
          { label: 'Most Used', value: aiData[0]?.name || '—', accent: 'purple' },
          { label: 'Least Used', value: aiData[aiData.length - 1]?.name || '—', accent: 'amber' },
        ].map(c => (
          <div key={c.label} className={`stat-card accent-${c.accent}`}>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-header-left"><Cpu size={14} /><h3>AI Module Usage Breakdown</h3></div>
          <span className="panel-badge">{aiData.length} modules</span>
        </div>
        <div className="panel-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aiData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,109,247,0.06)' }} />
              <Bar dataKey="value" name="Requests" radius={[0, 4, 4, 0]}>
                {aiData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RevenueAnalytics({ stats }: { stats: AdminStats }) {
  const payments = stats.recentPayments || [];
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalCount = stats.totalPayments || 0;
  const avg = totalCount > 0 ? Math.round(total / payments.length) : 0;

  const methodCount: Record<string, number> = {};
  payments.forEach(p => { methodCount[p.paymentMethod] = (methodCount[p.paymentMethod] || 0) + 1; });
  const methodData = Object.entries(methodCount).map(([name, value], i) => ({ name, value, fill: ['#4F6DF7','#22C55E','#F59E0B','#F54F64'][i % 4] }));

  return (
    <div className="section-animate">
      <div className="section-header">
        <div className="section-header-left">
          <h2>Revenue Analytics</h2>
          <p>Payment transactions, revenue metrics, and trends</p>
        </div>
        <span className="panel-badge green">{totalCount} transactions</span>
      </div>

      <div className="revenue-summary">
        {[
          { label: 'Total Revenue', value: `₹${total.toLocaleString()}`, sub: 'All time' },
          { label: 'Total Transactions', value: totalCount.toLocaleString(), sub: 'Completed' },
          { label: 'Avg. Order Value', value: `₹${avg.toLocaleString()}`, sub: 'Per transaction' },
          { label: 'Payment Methods', value: Object.keys(methodCount).length.toString(), sub: 'Active methods' },
        ].map(c => (
          <div key={c.label} className="revenue-card">
            <div className="revenue-card-label">{c.label}</div>
            <div className="revenue-card-value">{c.value}</div>
            <div className="revenue-card-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {methodData.length > 0 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-header-left"><TrendingUp size={14} /><h3>Payment Methods</h3></div>
          </div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label>
                  {methodData.map((_, i) => <Cell key={i} fill={methodData[i].fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function UserAnalytics({ stats }: { stats: AdminStats }) {
  const loginProviders: Record<string, number> = {};
  (stats.recentLogins || []).forEach(u => {
    loginProviders[u.provider] = (loginProviders[u.provider] || 0) + 1;
  });
  const providerData = Object.entries(loginProviders).map(([name, value], i) => ({
    name, value, fill: ['#4285F4','#8B72F5','#22C55E','#F59E0B'][i % 4]
  }));

  return (
    <div className="section-animate">
      <div className="section-header">
        <div className="section-header-left">
          <h2>User Analytics</h2>
          <p>Login providers, user activity, and session data</p>
        </div>
        <span className="panel-badge blue">{stats.totalLogins || 0} total logins</span>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total Logins', value: (stats.totalLogins || 0).toLocaleString(), accent: 'blue' },
          { label: 'Recent Sessions', value: (stats.recentLogins?.length || 0).toLocaleString(), accent: 'purple' },
          { label: 'Login Providers', value: Object.keys(loginProviders).length.toString(), accent: 'green' },
        ].map(c => (
          <div key={c.label} className={`stat-card accent-${c.accent}`}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {providerData.length > 0 && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-header-left"><Users size={14} /><h3>Login Provider Distribution</h3></div>
          </div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={providerData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label>
                  {providerData.map((_, i) => <Cell key={i} fill={providerData[i].fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={v => <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function FocusAnalytics({ stats, type }: { stats: AdminStats; type: 'job' | 'linkedin' }) {
  const isJob = type === 'job';
  const rows = isJob
    ? [
        ['Jobs searched', stats.totalJobFinders || 0],
        ['Recent searches', stats.recentJobFinders?.length || 0],
        ['Saved jobs', 0],
        ['Applications sent', 0]
      ]
    : [
        ['LinkedIn audits', stats.totalLinkedins || 0],
        ['Bio generations', stats.totalLinkedinBios || 0],
        ['Outreach messages', stats.totalLinkedinOutreachs || 0],
        ['LinkedIn posts', stats.totalLinkedinPosts || 0]
      ];

  return (
    <div className="section-animate">
      <div className="section-header">
        <div className="section-header-left">
          <h2>{isJob ? 'Job Finder Analytics' : 'LinkedIn Analytics'}</h2>
          <p>{isJob ? 'Job searches, matches, saved jobs, and application funnel metrics' : 'LinkedIn audit, bio, outreach, and post-generation metrics'}</p>
        </div>
        <span className="panel-badge blue">{rows.reduce((sum, row) => sum + Number(row[1]), 0)} events</span>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {rows.map(([label, value], idx) => (
          <div key={label} className={`stat-card accent-${['blue', 'green', 'purple', 'amber'][idx]}`}>
            <div className="stat-value">{Number(value).toLocaleString()}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="empty-state">
        {isJob ? <Briefcase size={32} /> : <Linkedin size={32} />}
        <h4>{isJob ? 'Job funnel trends ready' : 'LinkedIn trend charts ready'}</h4>
        <p>Daily and monthly charts will populate as richer event history is added to the backend.</p>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'analytics-resume', label: 'Resume', icon: <FileText size={13} /> },
  { id: 'analytics-users', label: 'Users', icon: <Users size={13} /> },
  { id: 'analytics-ai', label: 'AI Usage', icon: <Cpu size={13} /> },
  { id: 'analytics-revenue', label: 'Revenue', icon: <TrendingUp size={13} /> },
  { id: 'analytics-job-finder', label: 'Job Finder', icon: <Briefcase size={13} /> },
  { id: 'analytics-linkedin', label: 'LinkedIn', icon: <Linkedin size={13} /> },
];

export default function Analytics({ stats, subSection }: AnalyticsProps) {
  const [active, setActive] = useState(subSection || 'analytics-resume');

  return (
    <div className="section-animate">
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {active === 'analytics-resume' && <ResumeAnalytics stats={stats} />}
      {active === 'analytics-ai' && <AIAnalytics stats={stats} />}
      {active === 'analytics-revenue' && <RevenueAnalytics stats={stats} />}
      {active === 'analytics-users' && <UserAnalytics stats={stats} />}
      {active === 'analytics-job-finder' && <FocusAnalytics stats={stats} type="job" />}
      {active === 'analytics-linkedin' && <FocusAnalytics stats={stats} type="linkedin" />}
    </div>
  );
}
