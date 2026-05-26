import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BrainCircuit,
  Clock,
  Database,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import './Admin.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminStats {
  totalScans: number;
  averageScore: number;
  totalContacts: number;
  totalFixes?: number;
  scoreDistribution: { low: number; medium: number; high: number };
  keywordTrends: Array<{ keyword: string; count: number }>;
  recentScans: Array<{ id: string; fileName: string; score: number; createdAt: string; missingKeywords: string[] }>;
  contactMessages: Array<{ id: string; name: string; email: string; subject: string; message: string; createdAt: string }>;
  recentFixes?: Array<{ id: string; fileName: string; priorScore: number; createdAt: string }>;
  database: { path: string; updatedAt: string | null };
}

interface AdminProps {
  setCurrentPage: (page: string) => void;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, caption, trendCls }: { icon: ReactNode; label: string; value: string; caption: string; trendCls?: string }) {
  return (
    <div className={`admin-stat-card glass-card ${trendCls || ''}`}>
      <div className="card-ambient-glow"></div>
      <div className="stat-card-header">
        <div className="admin-stat-icon">{icon}</div>
        <span className="admin-stat-label">{label}</span>
      </div>
      <div className="stat-card-body">
        <strong>{value}</strong>
        <p>{caption}</p>
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, count, total, barCls }: { label: string; count: number; total: number; barCls: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="admin-score-row">
      <div className="score-row-info">
        <span className="score-row-label">{label}</span>
        <small className="score-row-count">{count} resume{count !== 1 ? 's' : ''}</small>
      </div>
      <div className="admin-score-track">
        <div className={`score-track-fill ${barCls}`} style={{ width: `${pct}%` }} />
      </div>
      <strong className="score-row-pct">{pct}%</strong>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button className={`admin-nav-btn${active ? ' active' : ''}`} onClick={onClick}>
      <span className="btn-icon">{icon}</span>
      <span className="btn-label">{label}</span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Admin({ setCurrentPage }: AdminProps) {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [secret, setSecret]           = useState(() => localStorage.getItem('cvmind_admin_secret') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(() => !!localStorage.getItem('cvmind_admin_secret'));
  const [isLoading, setIsLoading]     = useState(false);
  const [isFetching, setIsFetching]   = useState(false);
  const [error, setError]             = useState('');
  const [stats, setStats]             = useState<AdminStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  const BACKEND = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

  // Live time counter in top bar
  useEffect(() => {
    const timeId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeId);
  }, []);

  const fetchStats = useCallback(async (key: string) => {
    setIsFetching(true);
    setError('');
    try {
      const res  = await fetch(`${BACKEND}/api/admin/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': key },
        body: JSON.stringify({ secret: key })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics.');
      setStats(data.data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setIsFetching(false);
    }
  }, [BACKEND]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res  = await fetch(`${BACKEND}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid username or password.');
      
      const secretKey = data.secret;
      setSecret(secretKey);
      localStorage.setItem('cvmind_admin_secret', secretKey);
      setIsLoggedIn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats once logged in
  useEffect(() => {
    if (isLoggedIn && secret) {
      fetchStats(secret);
    }
  }, [isLoggedIn, secret, fetchStats]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!isLoggedIn || !secret) return;
    const id = window.setInterval(() => fetchStats(secret), 30000);
    return () => window.clearInterval(id);
  }, [fetchStats, isLoggedIn, secret]);

  // ── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        {/* Futuristic Background particles */}
        <div className="cyber-stage" aria-hidden="true">
          <div className="neon-orbit"></div>
          <div className="scan-beam"></div>
          <span className="pixel-particle" style={{ left: '15%', top: '25%' }}></span>
          <span className="pixel-particle" style={{ left: '85%', top: '75%', animationDelay: '1s' }}></span>
          <span className="pixel-particle" style={{ left: '45%', top: '80%', animationDelay: '1.8s' }}></span>
        </div>

        <button className="admin-login-back" onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={14} /> Back to main site
        </button>

        <div className="admin-login-card glass-card">
          <div className="admin-login-brand">
            <div className="logo-container">
              <div className="logo-icon-wrapper">
                <BrainCircuit className="logo-icon" />
              </div>
              <span className="logo-text">CVMind <span className="logo-accent">AI</span></span>
            </div>
          </div>

          <div className="login-header-group">
            <h2>Admin Console</h2>
            <p>Access platform-wide diagnostic statistics, keyword matching analytics, and contact submissions.</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form" autoComplete="off">
            <div className="admin-input-group">
              <label htmlFor="admin-username">Username</label>
              <div className="admin-field-wrapper">
                <Users size={16} className="field-icon" />
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter administrator username..."
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-field-wrapper">
                <KeyRound size={16} className="field-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  required
                />
                <button type="button" className="pass-toggle-btn" onClick={() => setShowPassword(v => !v)} title="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="admin-primary-btn btn-primary" type="submit" disabled={isLoading || !username.trim() || !password.trim()}>
              {isLoading
                ? <><span className="admin-spinner" />Verifying Session...</>
                : <><Lock size={15} />Access Control Panel</>
              }
            </button>
          </form>

          {error && (
            <div className="admin-error animate-fade-in-up">
              <Shield size={15} /> {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── COMPUTED ─────────────────────────────────────────────────────────────────
  const total      = stats ? stats.scoreDistribution.high + stats.scoreDistribution.medium + stats.scoreDistribution.low : 0;
  const highRate   = total > 0 && stats ? Math.round((stats.scoreDistribution.high / total) * 100) : 0;
  const maxKeyword = stats?.keywordTrends[0]?.count || 1;

  // ── DASHBOARD LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-shell">

        {/* ── SIDEBAR ── */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand" onClick={() => setCurrentPage('home')}>
            <div className="logo-container">
              <div className="logo-icon-wrapper">
                <BrainCircuit className="logo-icon" />
              </div>
              <span className="logo-text">CVMind <span className="logo-accent">AI</span></span>
            </div>
          </div>

          <div className="admin-sidebar-menu">
            <div className="admin-sidebar-section-label">Overview</div>
            <NavItem icon={<LayoutDashboard size={15} />} label="Dashboard"         active={activeSection === 'dashboard'}  onClick={() => setActiveSection('dashboard')} />
            <NavItem icon={<BarChart3 size={15} />}       label="Score Analytics"   active={activeSection === 'scores'}     onClick={() => setActiveSection('scores')} />
            <NavItem icon={<Search size={15} />}          label="Keyword Trends"    active={activeSection === 'keywords'}   onClick={() => setActiveSection('keywords')} />

            <div className="admin-sidebar-section-label">Data Storage</div>
            <NavItem icon={<FileText size={15} />}        label="Recent Scans"      active={activeSection === 'scans'}      onClick={() => setActiveSection('scans')} />
            <NavItem icon={<BrainCircuit size={15} />}    label="AI Auto-Fixes"     active={activeSection === 'fixes'}      onClick={() => setActiveSection('fixes')} />
            <NavItem icon={<Mail size={15} />}            label="Contact Leads"  active={activeSection === 'messages'}   onClick={() => setActiveSection('messages')} />

            <div className="admin-sidebar-section-label">System</div>
            <NavItem icon={<Database size={15} />}        label="Database Health"   active={activeSection === 'database'}   onClick={() => setActiveSection('database')} />
          </div>

          <div className="admin-sidebar-user glass-card">
            <div className="admin-user-avatar">
              <Shield size={16} />
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">SysAdmin</div>
              <div className="admin-user-role">
                <span className="admin-user-dot"></span> Live Session
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE ── */}
        <div className="admin-main">

          {/* Top bar */}
          <header className="admin-topbar glass-card">
            <div className="admin-topbar-left">
              <h1>
                {activeSection === 'dashboard'  && 'Console Dashboard'}
                {activeSection === 'scores'     && 'Score Matrix Analytics'}
                {activeSection === 'keywords'   && 'Keyword Analytics & Trends'}
                {activeSection === 'scans'      && 'Scan Database Records'}
                {activeSection === 'fixes'      && 'AI Resume Auto-Fix Logs'}
                {activeSection === 'messages'   && 'Incoming Contact Leads'}
                {activeSection === 'database'   && 'System Architecture & Health'}
              </h1>
              <p className="admin-topbar-meta">
                <Clock size={12} style={{ color: 'var(--color-accent)' }} /> 
                {currentTime.toLocaleTimeString()} · {currentTime.toLocaleDateString()}
                {lastUpdated ? ` · Refreshed ${lastUpdated.toLocaleTimeString()}` : ''}
              </p>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-badge-online">
                <span className="admin-dot-live"></span> System Active
              </div>
              <button className="admin-icon-btn" onClick={() => setCurrentPage('home')} title="Return to Website Home">
                <ArrowLeft size={13} /> Back to Site
              </button>
              <button className="admin-icon-btn" onClick={() => fetchStats(secret)} disabled={isFetching} title="Force reload stats">
                <RefreshCw size={13} className={isFetching ? 'spin-refresh' : ''} /> {isFetching ? 'Fetching...' : 'Sync'}
              </button>
              <button className="admin-signout-btn" onClick={() => { setIsLoggedIn(false); setStats(null); setSecret(''); localStorage.removeItem('cvmind_admin_secret'); }}>
                Disconnect
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="admin-content">
            {error && (
              <div className="admin-error-panel animate-fade-in-up">
                <AlertTriangle size={18} />
                <div className="error-panel-details">
                  <strong>Network Sync Failure</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!stats ? (
              <div className="admin-loading-skeleton">
                <div className="skeleton-spinner">
                  <Activity size={24} className="skeleton-pulse" />
                </div>
                <span>Securing socket & synchronized stats...</span>
                <div className="skeleton-bar-loading">
                  <div className="skeleton-fill" />
                </div>
              </div>
            ) : (
              <div className="admin-section-wrapper animate-fade-in-up">

                {/* ─ DASHBOARD SECTION ─ */}
                {(activeSection === 'dashboard') && (
                  <>
                    {/* Status strip */}
                    <div className="admin-status-strip glass-card">
                      <div className="admin-status-item">
                        <span className="status-indicator-green" />
                        Backend Endpoint: <strong className="highlight-cyan">Online</strong>
                      </div>
                      <span className="admin-status-sep" />
                      <div className="admin-status-item">
                        <Clock size={13} /> Auto-sync rate: 30s
                      </div>
                      <span className="admin-status-sep" />
                      <div className="admin-status-item">
                        <Calendar size={13} /> Data Source:
                        <span className="admin-status-mono">Local JSON Document</span>
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="admin-stat-grid">
                      <StatCard icon={<FileText size={18} />}    label="Total Resumes Scanned" value={stats.totalScans.toLocaleString()} caption="Evaluated against ATS rules" trendCls="card-purple" />
                      <StatCard icon={<TrendingUp size={18} />}  label="Average Score"          value={stats.averageScore ? `${stats.averageScore}/10` : '—'} caption={`${highRate}% scored 8 or above`} trendCls="card-cyan" />
                      <StatCard icon={<Search size={18} />}      label="Skills Monitored"       value={stats.keywordTrends.length.toString()} caption="Unique missing ATS keywords" trendCls="card-indigo" />
                      <StatCard icon={<BrainCircuit size={18} />} label="Resumes Auto-Fixed"     value={(stats.totalFixes ?? 0).toLocaleString()} caption="ATS-optimized by AI" trendCls="card-emerald" />
                      <StatCard icon={<Mail size={18} />}        label="Total Leads"            value={(stats.totalContacts ?? 0).toLocaleString()} caption="User messages via Contact form" trendCls="card-amber" />
                    </div>

                    {/* Grid — score dist + keywords */}
                    <div className="admin-main-grid">
                      <div className="admin-panel glass-card">
                        <div className="admin-panel-head">
                          <h2><BarChart3 size={15} /> Resume Quality Distribution</h2>
                          <span className="panel-badge">{total} scans</span>
                        </div>
                        <div className="admin-panel-body">
                          {total === 0 ? (
                            <div className="admin-empty">
                              <span className="admin-empty-icon">📊</span>
                              <p>No scans recorded. Distribution metrics will appear as users test resumes.</p>
                            </div>
                          ) : (
                            <div className="score-bars-container">
                              <ScoreBar label="High Match (8–10)"  count={stats.scoreDistribution.high}   total={total} barCls="admin-bar-high" />
                              <ScoreBar label="Medium Match (6–7)" count={stats.scoreDistribution.medium} total={total} barCls="admin-bar-mid" />
                              <ScoreBar label="Low Match (< 6)"    count={stats.scoreDistribution.low}    total={total} barCls="admin-bar-low" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="admin-panel glass-card">
                        <div className="admin-panel-head">
                          <h2><Search size={15} /> Top Missing ATS Keywords</h2>
                          <span className="panel-badge">High Frequency</span>
                        </div>
                        <div className="admin-panel-body">
                          {stats.keywordTrends.length === 0 ? (
                            <div className="admin-empty">
                              <span className="admin-empty-icon">🔍</span>
                              <p>Keyword metrics are populated automatically based on AI analysis gaps.</p>
                            </div>
                          ) : (
                            <div className="admin-keyword-list">
                              {stats.keywordTrends.slice(0, 5).map((item, i) => (
                                <div className="admin-keyword-row glass-card" key={item.keyword}>
                                  <strong className="keyword-rank">#0{i + 1}</strong>
                                  <span className="keyword-name">{item.keyword}</span>
                                  <div className="keyword-track">
                                    <span className="keyword-track-fill" style={{ width: `${(item.count / maxKeyword) * 100}%` }} />
                                  </div>
                                  <small className="keyword-count">{item.count} scans</small>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Grid — recent scans + recent messages */}
                    <div className="admin-main-grid">
                      <div className="admin-panel glass-card">
                        <div className="admin-panel-head">
                          <h2><Users size={15} /> Recent AI Scans</h2>
                          <span className="panel-badge">Latest Records</span>
                        </div>
                        <div className="admin-panel-body">
                          {stats.recentScans.length === 0 ? (
                            <div className="admin-empty">
                              <span className="admin-empty-icon">📄</span>
                              <p>Scan records will populate here immediately upon file uploads.</p>
                            </div>
                          ) : (
                            <div className="admin-table-list">
                              {stats.recentScans.map(scan => (
                                <div className="admin-table-row glass-card" key={scan.id}>
                                  <div className="table-row-details">
                                    <strong className="row-filename">{scan.fileName}</strong>
                                    <small className="row-timestamp">{new Date(scan.createdAt).toLocaleString()}</small>
                                  </div>
                                  <span className={`admin-score-pill ${scan.score >= 8 ? 'high' : scan.score >= 6 ? 'mid' : 'low'}`}>
                                    {scan.score}/10
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="admin-panel glass-card">
                        <div className="admin-panel-head">
                          <h2><Mail size={15} /> Recent Contact Submissions</h2>
                          <span className="panel-badge">Inbox Leads</span>
                        </div>
                        <div className="admin-panel-body">
                          {stats.contactMessages.length === 0 ? (
                            <div className="admin-empty">
                              <span className="admin-empty-icon">✉️</span>
                              <p>No user messages in the database directory.</p>
                            </div>
                          ) : (
                            <div className="admin-message-list">
                              {stats.contactMessages.map(msg => (
                                <article className="admin-message glass-card" key={msg.id}>
                                  <div className="msg-header">
                                    <div className="msg-sender">
                                      <strong>{msg.name}</strong>
                                      <small>{msg.email}</small>
                                    </div>
                                    <span className="msg-time">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <b className="msg-subject">{msg.subject}</b>
                                  <p className="msg-body-content">{msg.message}</p>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Grid — recent fixes */}
                    <div className="admin-panel glass-card" style={{ marginTop: '2rem' }}>
                      <div className="admin-panel-head">
                        <h2><BrainCircuit size={15} /> Recent AI Auto-Fix Logs</h2>
                        <span className="panel-badge">Latest Optimizations</span>
                      </div>
                      <div className="admin-panel-body">
                        {!(stats.recentFixes) || stats.recentFixes.length === 0 ? (
                          <div className="admin-empty">
                            <span className="admin-empty-icon">🤖</span>
                            <p>No resume optimizations recorded in logs.</p>
                          </div>
                        ) : (
                          <div className="admin-table-list">
                            {stats.recentFixes.slice(0, 5).map(fix => (
                              <div className="admin-table-row glass-card" key={fix.id}>
                                <div className="table-row-details">
                                  <strong className="row-filename">{fix.fileName}</strong>
                                  <small className="row-timestamp">{new Date(fix.createdAt).toLocaleString()}</small>
                                </div>
                                <div className="table-row-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <span className="admin-prior-score-pill" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    Prior Score: <strong style={{ color: 'var(--admin-cyan)' }}>{fix.priorScore}/10</strong>
                                  </span>
                                  <span className="badge badge-success">
                                    Fixed
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ─ SCORE ANALYTICS SECTION ─ */}
                {activeSection === 'scores' && (
                  <div className="admin-panel glass-card detail-view">
                    <div className="admin-panel-head">
                      <h2><BarChart3 size={15} /> Platform Resume Assessment breakdown</h2>
                      <span className="panel-badge">{total} Scanned documents</span>
                    </div>
                    <div className="admin-panel-body">
                      {total === 0 ? (
                        <div className="admin-empty">
                          <span className="admin-empty-icon">📊</span>
                          <p>Score details will display after scanning resume documents.</p>
                        </div>
                      ) : (
                        <div className="score-details-layout">
                          <div className="visual-dist-bars">
                            <ScoreBar label="High Match (8–10)"  count={stats.scoreDistribution.high}   total={total} barCls="admin-bar-high" />
                            <ScoreBar label="Medium Match (6–7)" count={stats.scoreDistribution.medium} total={total} barCls="admin-bar-mid" />
                            <ScoreBar label="Low Match (< 6)"    count={stats.scoreDistribution.low}    total={total} barCls="admin-bar-low" />
                          </div>
                          <div className="score-matrix-summary glass-card">
                            <h3>Analytics Summary</h3>
                            <div className="summary-stat-row">
                              <span>Average Quality Assessment Score:</span>
                              <strong className="highlight-cyan">{stats.averageScore}/10</strong>
                            </div>
                            <div className="summary-stat-row">
                              <span>Top Tier Ratio (ATS Ready):</span>
                              <strong className="highlight-green">{highRate}%</strong>
                            </div>
                            <p className="summary-help-note">
                              An average score above 7 indicates high-quality candidate submissions that generally fulfill default industry keywords and clean formatting constraints.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─ KEYWORD TRENDS SECTION ─ */}
                {activeSection === 'keywords' && (
                  <div className="admin-panel glass-card detail-view">
                    <div className="admin-panel-head">
                      <h2><Search size={15} /> Tracked Skill and ATS Keyword Gaps</h2>
                      <span className="panel-badge">{stats.keywordTrends.length} unique keywords</span>
                    </div>
                    <div className="admin-panel-body">
                      {stats.keywordTrends.length === 0 ? (
                        <div className="admin-empty">
                          <span className="admin-empty-icon">🔍</span>
                          <p>No skill gaps recorded. Scan resumes to let AI extract critical skills gaps.</p>
                        </div>
                      ) : (
                        <div className="full-keyword-grid">
                          {stats.keywordTrends.map((item, i) => (
                            <div className="admin-keyword-row glass-card" key={item.keyword}>
                              <strong className="keyword-rank">#{String(i + 1).padStart(2, '0')}</strong>
                              <span className="keyword-name">{item.keyword}</span>
                              <div className="keyword-track">
                                <span className="keyword-track-fill" style={{ width: `${(item.count / maxKeyword) * 100}%` }} />
                              </div>
                              <small className="keyword-count">{item.count} scans</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─ RECENT SCANS SECTION ─ */}
                {activeSection === 'scans' && (
                  <div className="admin-panel glass-card detail-view">
                    <div className="admin-panel-head">
                      <h2><Users size={15} /> Full Diagnostic Scan Records</h2>
                      <span className="panel-badge">{stats.recentScans.length} historical entries</span>
                    </div>
                    <div className="admin-panel-body">
                      {stats.recentScans.length === 0 ? (
                        <div className="admin-empty">
                          <span className="admin-empty-icon">📄</span>
                          <p>No historical scans found in memory.</p>
                        </div>
                      ) : (
                        <div className="admin-scans-detail-list">
                          {stats.recentScans.map(scan => (
                            <div className="admin-table-row glass-card detail" key={scan.id}>
                              <div className="table-row-details">
                                <strong className="row-filename">{scan.fileName}</strong>
                                <div className="row-metadata-strip">
                                  <span>ID: <code className="admin-status-mono">{scan.id.slice(0,8)}...</code></span>
                                  <span>•</span>
                                  <span>Scanned: {new Date(scan.createdAt).toLocaleString()}</span>
                                </div>
                                {scan.missingKeywords && scan.missingKeywords.length > 0 && (
                                  <div className="row-keywords-pill-box">
                                    {scan.missingKeywords.slice(0,5).map(kw => (
                                      <span key={kw} className="kw-pill">{kw}</span>
                                    ))}
                                    {scan.missingKeywords.length > 5 && (
                                      <span className="kw-pill-more">+{scan.missingKeywords.length - 5} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="table-row-right">
                                <span className={`admin-score-pill large ${scan.score >= 8 ? 'high' : scan.score >= 6 ? 'mid' : 'low'}`}>
                                  {scan.score}/10
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─ AI AUTO-FIX LOGS SECTION ─ */}
                {activeSection === 'fixes' && (
                  <div className="admin-panel glass-card detail-view">
                    <div className="admin-panel-head">
                      <h2><BrainCircuit size={15} /> AI Resume Auto-Fix Logs</h2>
                      <span className="panel-badge">{(stats.recentFixes || []).length} optimizations</span>
                    </div>
                    <div className="admin-panel-body">
                      {!(stats.recentFixes) || stats.recentFixes.length === 0 ? (
                        <div className="admin-empty">
                          <span className="admin-empty-icon">🤖</span>
                          <p>No AI optimizations recorded yet. Logs appear when users trigger the AI Auto-Fix.</p>
                        </div>
                      ) : (
                        <div className="admin-fixes-detail-list">
                          {stats.recentFixes.map(fix => (
                            <div className="admin-table-row glass-card detail" key={fix.id}>
                              <div className="table-row-details">
                                <strong className="row-filename">{fix.fileName}</strong>
                                <div className="row-metadata-strip">
                                  <span>Log ID: <code className="admin-status-mono">{fix.id.slice(0,8)}...</code></span>
                                  <span>•</span>
                                  <span>Optimized: {new Date(fix.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="table-row-right" style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="admin-prior-score-pill">
                                  Prior Score: <strong>{fix.priorScore}/10</strong>
                                </span>
                                <span className="badge badge-success" style={{ marginLeft: '1rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Sparkles size={11} /> Auto-Fixed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─ CONTACT MESSAGES SECTION ─ */}
                {activeSection === 'messages' && (
                  <div className="admin-panel glass-card detail-view">
                    <div className="admin-panel-head">
                      <h2><Mail size={15} /> All Contact leads</h2>
                      <span className="panel-badge">{stats.contactMessages.length} total messages</span>
                    </div>
                    <div className="admin-panel-body">
                      {stats.contactMessages.length === 0 ? (
                        <div className="admin-empty">
                          <span className="admin-empty-icon">✉️</span>
                          <p>No incoming contact form leads recorded.</p>
                        </div>
                      ) : (
                        <div className="admin-messages-detail-list">
                          {stats.contactMessages.map(msg => (
                            <article className="admin-message glass-card detail" key={msg.id}>
                              <div className="msg-header">
                                <div className="msg-sender">
                                  <strong>{msg.name}</strong>
                                  <span className="msg-email-code">{msg.email}</span>
                                </div>
                                <span className="msg-time">{new Date(msg.createdAt).toLocaleString()}</span>
                              </div>
                              <b className="msg-subject">{msg.subject}</b>
                              <p className="msg-body-content">{msg.message}</p>
                              <div className="msg-footer-details">
                                <span>Message Reference ID: <code>{msg.id}</code></span>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─ DATABASE HEALTH SECTION ─ */}
                {activeSection === 'database' && (
                  <div className="admin-panel glass-card detail-view" style={{ maxWidth: 800 }}>
                    <div className="admin-panel-head">
                      <h2><Database size={15} /> Active Platform File Database Health</h2>
                      <span className="panel-badge online">Health: Excellent</span>
                    </div>
                    <div className="admin-panel-body">
                      <div className="system-health-layout">
                        {[
                          { label: 'Storage Engine',   value: 'Persistent JSON (In-Memory Buffer Cache)', icon: '💾' },
                          { label: 'Storage File Path',   value: stats.database?.path || 'N/A', icon: '📂' },
                          { label: 'Last Write Sync',     value: stats.database?.updatedAt ? new Date(stats.database.updatedAt).toLocaleString() : 'N/A', icon: '🕐' },
                          { label: 'Stored Metrics Volume',  value: `${stats.totalScans} scan records, ${stats.totalContacts ?? 0} user contact leads`, icon: '📋' },
                          { label: 'Synchronization Server Status', value: 'Active socket listening', icon: '🟢' },
                        ].map(row => (
                          <div key={row.label} className="system-health-card glass-card">
                            <span className="row-icon">{row.icon}</span>
                            <div className="row-details">
                              <div className="row-label">{row.label}</div>
                              <div className="row-value">{row.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="admin-footer">
            CVMind AI Admin Dashboard Console · Designed & Engineered by <a href="https://www.manavtiwari.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Manav Tiwari</a> · Session Secured via local memory keys
          </div>
        </div>
      </div>
    </div>
  );
}
