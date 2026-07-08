import { useState } from 'react';
import {
  FileText, Zap, Sparkles, BrainCircuit, Linkedin,
  BarChart3, Mic, Map, Globe, Briefcase, Search
} from 'lucide-react';
import type { AdminStats } from '../types';

interface AIActivityProps { stats: AdminStats; subSection: string }

const TABS = [
  { id: 'ai-resume-analyzer', label: 'Resume Analyzer', icon: <FileText size={12} /> },
  { id: 'ai-auto-fix', label: 'Auto Fix', icon: <Zap size={12} /> },
  { id: 'ai-tailors', label: 'Tailoring', icon: <Sparkles size={12} /> },
  { id: 'ai-preps', label: 'SmartPrep', icon: <BrainCircuit size={12} /> },
  { id: 'ai-linkedin', label: 'LinkedIn Audit', icon: <Linkedin size={12} /> },
  { id: 'ai-linkedin-bio', label: 'LinkedIn Bio', icon: <Linkedin size={12} /> },
  { id: 'ai-linkedin-outreach', label: 'Outreach', icon: <Linkedin size={12} /> },
  { id: 'ai-skill-gap', label: 'Skill Gap', icon: <BarChart3 size={12} /> },
  { id: 'ai-elevator-pitch', label: 'Elevator Pitch', icon: <Mic size={12} /> },
  { id: 'ai-career-roadmap', label: 'Career Roadmap', icon: <Map size={12} /> },
  { id: 'ai-portfolio', label: 'Portfolio Gen', icon: <Globe size={12} /> },
  { id: 'ai-voice-prep', label: 'Voice Practice', icon: <Mic size={12} /> },
  { id: 'ai-job-finder', label: 'Job Finder', icon: <Briefcase size={12} /> },
];

function LogHeader({ count, label }: { count: number; label: string }) {
  return (
    <div className="section-header">
      <div className="section-header-left">
        <h2>{label}</h2>
        <p>{count} entries in the database</p>
      </div>
      <span className="panel-badge blue">{count} records</span>
    </div>
  );
}

function EmptyLog({ label }: { label: string }) {
  return (
    <div className="empty-state" style={{ padding: '60px 0' }}>
      <Sparkles size={32} />
      <h4>No {label} logs yet</h4>
      <p>Logs will appear here as users interact with this AI module.</p>
    </div>
  );
}

function SimpleLogRow({ title, meta, badge, badgeType }: {
  title: string; meta: string; badge?: string; badgeType?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', transition: 'background var(--t-fast)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      <div>
        <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-1)' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>{meta}</div>
      </div>
      {badge && <span className={`badge badge-${badgeType || 'blue'}`}>{badge}</span>}
    </div>
  );
}

export default function AIActivity({ stats, subSection }: AIActivityProps) {
  const [active, setActive] = useState(subSection || 'ai-resume-analyzer');
  const [search, setSearch] = useState('');

  const renderContent = () => {
    switch (active) {
      case 'ai-resume-analyzer': {
        const items = (stats.recentScans || []).filter(s =>
          !search || s.fileName.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalScans || 0} label="Resume Analyzer Logs" />
            {items.length === 0 ? <EmptyLog label="Resume Analyzer" /> : (
              <div className="glass-panel">
                <div className="panel-body no-pad">
                  {items.map(s => (
                    <div key={s.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-1)' }}>{s.fileName}</div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-3)' }}>
                            ID: {s.id.slice(0, 8)}… · {new Date(s.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <span className={`score-pill ${s.score >= 80 ? 'high' : s.score >= 60 ? 'mid' : 'low'}`}>
                          {s.score}/100
                        </span>
                      </div>
                      {s.missingKeywords && s.missingKeywords.length > 0 && (
                        <div className="kw-pill-group">
                          {s.missingKeywords.slice(0, 6).map(kw => <span key={kw} className="kw-pill">{kw}</span>)}
                          {s.missingKeywords.length > 6 && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>+{s.missingKeywords.length - 6}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      }

      case 'ai-auto-fix': {
        const items = (stats.recentFixes || []).filter(s =>
          !search || s.fileName.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalFixes || 0} label="AI Auto-Fix Logs" />
            {items.length === 0 ? <EmptyLog label="Auto-Fix" /> : (
              <div className="glass-panel">
                <div className="panel-body no-pad">
                  {items.map(f => (
                    <SimpleLogRow key={f.id}
                      title={f.fileName}
                      meta={`Prior Score: ${f.priorScore}/100 · ${new Date(f.createdAt).toLocaleString()}`}
                      badge="Auto-Fixed" badgeType="green"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      }

      case 'ai-tailors': {
        const items = (stats.recentTailors || []).filter(s =>
          !search || s.fileName.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalTailors || 0} label="Resume Tailoring Logs" />
            {items.length === 0 ? <EmptyLog label="Tailoring" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(t => (
                  <div key={t.id} className="log-detail-card">
                    <div className="log-detail-header">
                      <div>
                        <div className="log-detail-title">{t.fileName}</div>
                        <div className="log-detail-meta">
                          <span>ID: <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{t.id.slice(0,8)}…</code></span>
                          <span>Size: <strong>{(t.fileSize / 1048576).toFixed(2)} MB</strong></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span className={`score-pill ${t.score >= 80 ? 'high' : t.score >= 60 ? 'mid' : 'low'}`}>Match: {t.score}%</span>
                        <span className="log-detail-time">{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {t.jobDescription && (
                      <div className="log-jd-block">{t.jobDescription}</div>
                    )}
                    {(t.matchedSkills?.length > 0 || t.missingSkills?.length > 0) && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {t.matchedSkills?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Matched Skills</div>
                            <div className="kw-pill-group">
                              {t.matchedSkills.slice(0, 8).map(s => <span key={s} className="kw-pill">{s}</span>)}
                              {t.matchedSkills.length > 8 && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>+{t.matchedSkills.length - 8}</span>}
                            </div>
                          </div>
                        )}
                        {t.missingSkills?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Recommended Additions</div>
                            <div className="kw-pill-group">
                              {t.missingSkills.slice(0, 8).map(s => <span key={s} className="kw-pill kw-pill-miss">{s}</span>)}
                              {t.missingSkills.length > 8 && <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>+{t.missingSkills.length - 8}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }

      case 'ai-preps': {
        const items = (stats.recentPreps || []).filter(s =>
          !search || s.fileName.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalPreps || 0} label="SmartPrep Logs" />
            {items.length === 0 ? <EmptyLog label="SmartPrep" /> : (
              <div className="glass-panel">
                <div className="panel-body no-pad">
                  {items.map(p => (
                    <SimpleLogRow key={p.id}
                      title={p.fileName}
                      meta={`Questions: ${p.questionsCount} · Size: ${(p.fileSize/1048576).toFixed(2)} MB · ${new Date(p.createdAt).toLocaleString()}`}
                      badge={`${p.questionsCount} Qs`} badgeType="purple"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      }

      case 'ai-linkedin': {
        const items = (stats.recentLinkedins || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalLinkedins || 0} label="LinkedIn Audit Logs" />
            {items.length === 0 ? <EmptyLog label="LinkedIn Audit" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map(l => (
                  <SimpleLogRow key={l.id}
                    title={l.email || 'Anonymous'}
                    meta={`Score: ${l.score}/10 · ${new Date(l.createdAt).toLocaleString()}`}
                    badge={`${l.score}/10`} badgeType={l.score >= 8 ? 'green' : l.score >= 6 ? 'amber' : 'red'}
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-linkedin-bio': {
        const items = (stats.recentLinkedinBios || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalLinkedinBios || 0} label="LinkedIn Bio Logs" />
            {items.length === 0 ? <EmptyLog label="LinkedIn Bio" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map(b => (
                  <SimpleLogRow key={b.id}
                    title={b.email || 'Anonymous'}
                    meta={`Job Title: ${b.jobTitle} · ${new Date(b.createdAt).toLocaleString()}`}
                    badge="Generated" badgeType="cyan"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-linkedin-outreach': {
        const items = (stats.recentLinkedinOutreachs || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalLinkedinOutreachs || 0} label="LinkedIn Outreach Logs" />
            {items.length === 0 ? <EmptyLog label="LinkedIn Outreach" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((o, i) => (
                  <SimpleLogRow key={o.id || i}
                    title={o.email || 'Anonymous'}
                    meta={`Job Title: ${o.jobTitle} · ${new Date(o.createdAt).toLocaleString()}`}
                    badge="DM Kit" badgeType="blue"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-skill-gap': {
        const items = (stats.recentCareerCourses || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalCareerCourses || 0} label="Skill Gap Logs" />
            {items.length === 0 ? <EmptyLog label="Skill Gap" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((cc, i) => (
                  <SimpleLogRow key={cc.id || i}
                    title={cc.email || 'Anonymous'}
                    meta={`Target Role: ${cc.jobTitle} · ${new Date(cc.createdAt).toLocaleString()}`}
                    badge="Analyzed" badgeType="purple"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-elevator-pitch': {
        const items = (stats.recentElevatorPitches || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalElevatorPitches || 0} label="Elevator Pitch Logs" />
            {items.length === 0 ? <EmptyLog label="Elevator Pitch" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((ep, i) => (
                  <SimpleLogRow key={ep.id || i}
                    title={ep.email || 'Anonymous'}
                    meta={`Target Job: ${ep.jobTitle} · ${new Date(ep.createdAt).toLocaleString()}`}
                    badge="Built" badgeType="green"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-career-roadmap': {
        const items = (stats.recentCareerRoadmaps || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalCareerRoadmaps || 0} label="Career Roadmap Logs" />
            {items.length === 0 ? <EmptyLog label="Career Roadmap" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((cr, i) => (
                  <SimpleLogRow key={cr.id || i}
                    title={cr.email || 'Anonymous'}
                    meta={new Date(cr.createdAt).toLocaleString()}
                    badge="Roadmap" badgeType="amber"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-portfolio': {
        const items = (stats.recentPortfolioGens || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalPortfolioGens || 0} label="Portfolio Generator Logs" />
            {items.length === 0 ? <EmptyLog label="Portfolio Generator" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((pg, i) => (
                  <SimpleLogRow key={pg.id || i}
                    title={pg.email || 'Anonymous'}
                    meta={`Theme: ${pg.theme} · ${new Date(pg.createdAt).toLocaleString()}`}
                    badge={pg.theme} badgeType="purple"
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-voice-prep': {
        const items = (stats.recentVoicePreps || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalVoicePreps || 0} label="Voice Practice Logs" />
            {items.length === 0 ? <EmptyLog label="Voice Practice" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((vp, i) => (
                  <SimpleLogRow key={vp.id || i}
                    title={`${vp.email || 'Anonymous'} — ${vp.jobTitle}`}
                    meta={`Score: ${vp.score}/10 · ${new Date(vp.createdAt).toLocaleString()}`}
                    badge={`${vp.score}/10`} badgeType={vp.score >= 8 ? 'green' : vp.score >= 6 ? 'amber' : 'red'}
                  />
                ))}
              </div></div>
            )}
          </>
        );
      }

      case 'ai-job-finder': {
        const items = (stats.recentJobFinders || []).filter(s =>
          !search || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <LogHeader count={stats.totalJobFinders || 0} label="Job Finder Logs" />
            {items.length === 0 ? <EmptyLog label="Job Finder" /> : (
              <div className="glass-panel"><div className="panel-body no-pad">
                {items.map((jf, i) => (
                  <div key={jf.id || i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-1)' }}>{jf.email || 'Anonymous'}</div>
                      <span className="badge badge-green">{jf.jobsCount} matches</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      Type: <strong style={{ color: 'var(--text-2)' }}>{jf.jobType}</strong>
                      {' '} · {new Date(jf.createdAt).toLocaleString()}
                    </div>
                    {jf.jobDescription && (
                      <div style={{ fontSize: '0.77rem', color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>
                        {jf.jobDescription.slice(0, 100)}{jf.jobDescription.length > 100 ? '…' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div></div>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="section-animate">
      {/* Tab bar */}
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${active === t.id ? ' active' : ''}`}
            onClick={() => { setActive(t.id); setSearch(''); }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="table-controls" style={{ marginBottom: 16 }}>
        <div className="table-search">
          <Search size={13} className="table-search-icon" />
          <input
            placeholder="Search logs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
