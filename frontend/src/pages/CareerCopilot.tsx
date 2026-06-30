import { useState, useEffect } from 'react';
import {
  Sparkles, Upload, Target, Brain, Briefcase, TrendingUp, Users, BarChart3,
  MessageSquare, DollarSign, BookOpen, CheckCircle2, ChevronRight, ChevronLeft,
  RefreshCw, Zap, Star, ArrowRight, Bell, Award, Globe, Code2,
  FileText, Linkedin, AlertCircle, Play, LayoutDashboard,
  GraduationCap, Activity, Rocket, Shield, Bot, Search
} from 'lucide-react';
import './CareerCopilot.css';

const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');

interface CopilotProps { customApiKey: string; resumeText?: string; setResumeText?: (t: string) => void; }
type View = 'landing' | 'onboarding' | 'dashboard';
type Tab = 'home' | 'resume' | 'jobs' | 'learn' | 'interview' | 'analytics';

const AGENTS = [
  { icon: <FileText size={22} />, name: 'Resume Agent', color: '#2997ff', desc: 'ATS optimization, tailoring, keyword injection', status: 'active' },
  { icon: <Search size={22} />, name: 'Job Discovery', color: '#30d158', desc: 'Finds & ranks matching jobs across all platforms', status: 'active' },
  { icon: <Linkedin size={22} />, name: 'LinkedIn Agent', color: '#0077b5', desc: 'Profile optimization, networking, posts', status: 'active' },
  { icon: <BookOpen size={22} />, name: 'Skill Coach', color: '#bf5af2', desc: 'Gap analysis, learning roadmap, certifications', status: 'active' },
  { icon: <MessageSquare size={22} />, name: 'Interview Coach', color: '#ff9f0a', desc: 'Mock sessions, STAR method, voice practice', status: 'active' },
  { icon: <Users size={22} />, name: 'Networking Agent', color: '#00c7be', desc: 'Recruiters, alumni, connection drafts', status: 'active' },
  { icon: <Activity size={22} />, name: 'Application Intel', color: '#ff6b35', desc: 'Track stages, detect patterns, optimize strategy', status: 'active' },
  { icon: <DollarSign size={22} />, name: 'Salary Intel', color: '#30d158', desc: 'Benchmarking, negotiation advice, offer comparison', status: 'active' },
  { icon: <BarChart3 size={22} />, name: 'Career Analytics', color: '#ff453a', desc: 'Weekly reports, growth charts, interview ratio', status: 'active' },
];

const FEATURES = [
  { icon: <Brain size={28} />, color: '#2997ff', title: 'AI Career Manager', desc: 'One goal → full strategy. AI orchestrates 9 specialized agents working for you 24/7.' },
  { icon: <Target size={28} />, color: '#30d158', title: 'Career Health Score', desc: 'Live score across resume, LinkedIn, skills, projects, and interview readiness.' },
  { icon: <Rocket size={28} />, color: '#bf5af2', title: 'Daily AI Briefing', desc: 'Every morning: new jobs, resume tips, skill alerts, and interview prep — personalized.' },
  { icon: <BarChart3 size={28} />, color: '#ff9f0a', title: 'Career Analytics', desc: 'Track interview rate, offer rate, resume performance, and career growth over time.' },
];

function HealthRing({ score }: { score: number }) {
  const r = 52; const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 70 ? '#30d158' : score >= 50 ? '#ff9f0a' : '#ff453a';
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle cx="68" cy="68" r={r} fill="none" stroke="#f2f2f7" strokeWidth="11" />
      <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="11"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 68 68)"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x="68" y="63" textAnchor="middle" fontSize="26" fontWeight="800" fill="#1d1d1f">{score}</text>
      <text x="68" y="81" textAnchor="middle" fontSize="10" fill="#8e8e93">/ 100</text>
    </svg>
  );
}

export default function CareerCopilot({ customApiKey, resumeText: initialResume = '', setResumeText: setGlobalResume }: CopilotProps) {
  const [view, setView] = useState<View>('landing');
  const [tab, setTab] = useState<Tab>('home');
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(initialResume);
  const [goal, setGoal] = useState('');
  const [prefs, setPrefs] = useState({ salary: '', location: '', remote: 'Hybrid', industry: 'All' });
  const [profile, setProfile] = useState<any>(null);
  const [healthScore, setHealthScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [dailyBriefing, setDailyBriefing] = useState<any>(null);
  const [agentActive, setAgentActive] = useState('');

  useEffect(() => {
    if (view === 'dashboard' && healthScore === 0) {
      setTimeout(() => setHealthScore(profile?.careerHealthScore || 72), 300);
    }
  }, [view]);

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    const fd = new FormData(); fd.append('resume', file);
    try {
      setLoading(true); setLoadingMsg('Reading resume…');
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', body: fd, headers: customApiKey ? { 'x-gemini-key': customApiKey } : {} });
      const d = await r.json();
      if (d.resumeText) { setResumeText(d.resumeText); if (setGlobalResume) setGlobalResume(d.resumeText); }
    } catch { } finally { setLoading(false); setLoadingMsg(''); }
  };

  const buildProfile = async () => {
    if (!resumeText.trim() && !resumeFile) { setError('Please upload your resume first.'); return; }
    setLoading(true); setLoadingMsg('AI is building your career profile…'); setError('');
    try {
      const r = await fetch(`${API}/api/auto-apply/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ resumeText })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfile({ ...d.data, careerGoal: goal, careerHealthScore: 72 });
      setStep(3);
    } catch (e: any) { setError(e.message || 'Failed to build profile.'); }
    finally { setLoading(false); }
  };

  const launchCopilot = async () => {
    setLoading(true); setLoadingMsg('Launching your AI Career Copilot…');
    try {
      const r = await fetch(`${API}/api/auto-apply/jobs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: profile?.skills || [], roles: [goal], locations: [prefs.location || 'India'], remote: prefs.remote, industry: prefs.industry })
      });
      const d = await r.json();
      if (d.success) setJobs(d.data.jobs || []);
      setDailyBriefing({
        date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
        newJobs: d.data?.jobs?.length || 0,
        resumeTip: 'Add quantified achievements to your experience section to boost ATS score by ~12%.',
        skillAlert: `You're missing Docker and Kubernetes — required in 68% of ${goal || 'tech'} roles.`,
        networkingAction: 'Connect with 3 recruiters at your target companies today.',
        interviewTip: 'Practice the STAR method for behavioral questions — your last weak area.',
      });
      setView('dashboard');
    } catch { setView('dashboard'); }
    finally { setLoading(false); }
  };

  // ── LANDING ────────────────────────────────────────────────────────────────────
  if (view === 'landing') return (
    <div className="cc-landing">
      <div className="cc-landing-hero">
        <div className="cc-hero-badge"><Bot size={14} /><span>9 AI Agents Working for You</span></div>
        <h1 className="cc-hero-title">AI Career <span className="cc-gradient-text">Copilot</span></h1>
        <p className="cc-hero-sub">Define your career goal. Our AI orchestrates 9 specialized agents to optimize your resume, discover jobs, prepare you for interviews, and track your entire career journey — automatically.</p>
        <div className="cc-hero-actions">
          <button className="cc-btn-primary cc-btn-large" onClick={() => setView('onboarding')}>
            <Rocket size={18} /> Launch My Copilot
          </button>
        </div>
        <div className="cc-hero-agents">
          {AGENTS.slice(0, 6).map((a, i) => (
            <div key={i} className="cc-agent-pill" style={{ '--ag-color': a.color } as any}>
              <span style={{ color: a.color }}>{a.icon}</span>{a.name}
            </div>
          ))}
        </div>
      </div>

      <div className="cc-features-grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="cc-feature-card">
            <div className="cc-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="cc-agents-section">
        <h2 className="cc-section-title">9 Specialized AI Agents</h2>
        <p className="cc-section-sub">Each agent masters one domain. Together they cover your entire career journey.</p>
        <div className="cc-agents-grid">
          {AGENTS.map((a, i) => (
            <div key={i} className="cc-agent-card">
              <div className="cc-agent-icon" style={{ background: `${a.color}15`, color: a.color }}>{a.icon}</div>
              <div className="cc-agent-info">
                <div className="cc-agent-name">{a.name}</div>
                <div className="cc-agent-desc">{a.desc}</div>
              </div>
              <div className="cc-agent-dot" style={{ background: '#30d158' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="cc-cta-section">
        <h2>Your AI Career Manager Awaits</h2>
        <p>Stop using 10 different tools. Let one AI handle your entire job search.</p>
        <button className="cc-btn-primary cc-btn-large" onClick={() => setView('onboarding')}>
          <Sparkles size={18} /> Get Started Free
        </button>
      </div>
    </div>
  );

  // ── ONBOARDING ─────────────────────────────────────────────────────────────────
  if (view === 'onboarding') return (
    <div className="cc-onboarding">
      <div className="cc-ob-progress">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`cc-ob-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
            <div className="cc-ob-dot">{step > s ? <CheckCircle2 size={14} /> : s}</div>
            <span>{['Resume', 'Career Goal', 'Profile', 'Preferences'][s - 1]}</span>
            {s < 4 && <ChevronRight size={14} className="cc-ob-arrow" />}
          </div>
        ))}
      </div>

      <div className="cc-ob-card">
        {step === 1 && (
          <>
            <div className="cc-ob-header"><Upload size={32} color="#2997ff" /><h2>Upload Your Resume</h2><p>AI will extract your skills, experience, and build your career profile.</p></div>
            <div className={`cc-upload-zone ${resumeFile ? 'uploaded' : ''}`} onClick={() => document.getElementById('cc-file')?.click()}>
              <input id="cc-file" type="file" accept=".pdf,.docx,.txt" hidden onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
              {loading ? <><RefreshCw size={32} className="cc-spin" color="#2997ff" /><p>{loadingMsg}</p></> :
                resumeFile ? <><CheckCircle2 size={40} color="#30d158" /><p className="cc-upload-name">{resumeFile.name}</p><p className="cc-upload-hint">Click to change</p></> :
                  <><Upload size={40} color="#8e8e93" /><p className="cc-upload-title">Drop your resume here</p><p className="cc-upload-hint">PDF, DOCX · Max 5MB</p></>}
            </div>
            {error && <div className="cc-error"><AlertCircle size={14} />{error}</div>}
            <button className="cc-btn-primary cc-btn-full" disabled={!resumeFile} onClick={() => setStep(2)}>Continue <ChevronRight size={16} /></button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="cc-ob-header"><Target size={32} color="#30d158" /><h2>Set Your Career Goal</h2><p>What role are you targeting? The AI will build a complete strategy around this.</p></div>
            <div className="cc-goal-grid">
              {['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'AI/ML Engineer', 'DevOps Engineer', 'Data Analyst', 'React Developer'].map(g => (
                <button key={g} className={`cc-goal-chip ${goal === g ? 'selected' : ''}`} onClick={() => setGoal(g)}>{g}</button>
              ))}
            </div>
            <input className="cc-input" placeholder="Or type your own goal…" value={goal} onChange={e => setGoal(e.target.value)} />
            <div className="cc-ob-nav">
              <button className="cc-btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="cc-btn-primary" disabled={!goal || loading} onClick={buildProfile}>
                {loading ? <><RefreshCw size={16} className="cc-spin" />{loadingMsg}</> : <>Build My Profile <ChevronRight size={16} /></>}
              </button>
            </div>
          </>
        )}

        {step === 3 && profile && (
          <>
            <div className="cc-ob-header"><CheckCircle2 size={32} color="#30d158" /><h2>Profile Built!</h2><p>Your AI career profile is ready. Here's what we found:</p></div>
            <div className="cc-profile-preview">
              <div className="cc-profile-row"><span className="cc-profile-label">Name</span><span>{profile.name || 'Your Name'}</span></div>
              <div className="cc-profile-row"><span className="cc-profile-label">Title</span><span>{profile.title || goal}</span></div>
              <div className="cc-profile-row"><span className="cc-profile-label">Experience</span><span>{profile.yearsOfExperience || 'N/A'} years</span></div>
              <div className="cc-profile-row"><span className="cc-profile-label">Skills</span>
                <div className="cc-skills-preview">{(profile.skills || []).slice(0, 8).map((s: string) => <span key={s} className="cc-skill-tag">{s}</span>)}</div>
              </div>
              <div className="cc-profile-row"><span className="cc-profile-label">Career Goal</span><span className="cc-goal-badge"><Target size={12} />{goal}</span></div>
            </div>
            <div className="cc-ob-nav">
              <button className="cc-btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
              <button className="cc-btn-primary" onClick={() => setStep(4)}>Set Preferences <ChevronRight size={16} /></button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="cc-ob-header"><Zap size={32} color="#ff9f0a" /><h2>Preferences</h2><p>Customize what the AI should focus on.</p></div>
            <div className="cc-pref-grid">
              <div><label className="cc-label"><DollarSign size={13} />Expected Salary</label><input className="cc-input" placeholder="e.g. ₹15L–₹25L" value={prefs.salary} onChange={e => setPrefs(p => ({ ...p, salary: e.target.value }))} /></div>
              <div><label className="cc-label"><Globe size={13} />Preferred Location</label><input className="cc-input" placeholder="e.g. Bengaluru, Mumbai" value={prefs.location} onChange={e => setPrefs(p => ({ ...p, location: e.target.value }))} /></div>
              <div><label className="cc-label"><Briefcase size={13} />Work Mode</label>
                <select className="cc-select" value={prefs.remote} onChange={e => setPrefs(p => ({ ...p, remote: e.target.value }))}>
                  {['Remote', 'Hybrid', 'Onsite', 'All'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className="cc-label"><Activity size={13} />Industry</label>
                <select className="cc-select" value={prefs.industry} onChange={e => setPrefs(p => ({ ...p, industry: e.target.value }))}>
                  {['All', 'Tech', 'Fintech', 'E-commerce', 'SaaS', 'Healthcare', 'EdTech', 'Gaming'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="cc-ob-nav">
              <button className="cc-btn-ghost" onClick={() => setStep(3)}><ChevronLeft size={16} /> Back</button>
              <button className="cc-btn-primary" disabled={loading} onClick={launchCopilot}>
                {loading ? <><RefreshCw size={16} className="cc-spin" />{loadingMsg}</> : <><Rocket size={16} /> Launch Copilot</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── DASHBOARD ──────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard size={16} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={16} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { id: 'learn', label: 'Learn', icon: <GraduationCap size={16} /> },
    { id: 'interview', label: 'Interview', icon: <MessageSquare size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  ];

  const mockSkillGaps = [
    { skill: 'Docker', demand: 78, priority: 'high' },
    { skill: 'Kubernetes', demand: 68, priority: 'high' },
    { skill: 'System Design', demand: 85, priority: 'high' },
    { skill: 'GraphQL', demand: 52, priority: 'medium' },
    { skill: 'Redis', demand: 61, priority: 'medium' },
    { skill: 'AWS', demand: 73, priority: 'high' },
  ];

  return (
    <div className="cc-dashboard">
      <div className="cc-dash-header">
        <div className="cc-dash-title">
          <Bot size={20} color="#2997ff" />
          <span>Career Copilot</span>
          <span className="cc-dash-goal-badge"><Target size={11} />{profile?.careerGoal || goal || 'Software Engineer'}</span>
        </div>
        <div className="cc-dash-actions">
          <button className="cc-icon-btn" title="Notifications"><Bell size={18} /></button>
          <button className="cc-icon-btn" title="Refresh Agents" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
            <RefreshCw size={18} className={loading ? 'cc-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="cc-tabs">
        {tabs.map(t => <button key={t.id} className={`cc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>

      <div className="cc-dash-body">
        {/* HOME TAB */}
        {tab === 'home' && (
          <div className="cc-home">
            <div className="cc-home-top">
              <div className="cc-health-card">
                <HealthRing score={healthScore} />
                <div className="cc-health-details">
                  <div className="cc-health-title">Career Health Score</div>
                  <div className="cc-health-breakdown">
                    {[['Resume', 78], ['LinkedIn', 60], ['Skills', 68], ['Interview', 55], ['Projects', 80]].map(([k, v]) => (
                      <div key={k} className="cc-health-row">
                        <span>{k}</span>
                        <div className="cc-health-bar"><div style={{ width: `${v}%`, background: Number(v) >= 70 ? '#30d158' : '#ff9f0a' }} /></div>
                        <span>{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {dailyBriefing && (
                <div className="cc-briefing-card">
                  <div className="cc-briefing-header"><Bell size={14} color="#2997ff" /><span>Daily AI Briefing</span><span className="cc-briefing-date">{dailyBriefing.date}</span></div>
                  <div className="cc-briefing-items">
                    <div className="cc-briefing-item cc-bi-jobs"><Briefcase size={13} /><span><strong>{dailyBriefing.newJobs} new jobs</strong> match your profile today</span></div>
                    <div className="cc-briefing-item cc-bi-resume"><TrendingUp size={13} /><span>{dailyBriefing.resumeTip}</span></div>
                    <div className="cc-briefing-item cc-bi-skill"><AlertCircle size={13} /><span>{dailyBriefing.skillAlert}</span></div>
                    <div className="cc-briefing-item cc-bi-network"><Users size={13} /><span>{dailyBriefing.networkingAction}</span></div>
                    <div className="cc-briefing-item cc-bi-interview"><MessageSquare size={13} /><span>{dailyBriefing.interviewTip}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="cc-agents-status">
              <div className="cc-section-label">Active Agents</div>
              <div className="cc-agents-row">
                {AGENTS.map((a, i) => (
                  <button key={i} className={`cc-agent-status-card ${agentActive === a.name ? 'active' : ''}`} onClick={() => setAgentActive(agentActive === a.name ? '' : a.name)} style={{ '--ag-c': a.color } as any}>
                    <div style={{ color: a.color }}>{a.icon}</div>
                    <span>{a.name.split(' ')[0]}</span>
                    <div className="cc-agent-pulse" style={{ background: a.color }} />
                  </button>
                ))}
              </div>
              {agentActive && (
                <div className="cc-agent-detail">
                  {AGENTS.find(a => a.name === agentActive) && (() => { const ag = AGENTS.find(a => a.name === agentActive)!; return (
                    <div><span style={{ color: ag.color, fontWeight: 700 }}>{ag.name}</span> — {ag.desc}</div>
                  );})()}
                </div>
              )}
            </div>

            <div className="cc-quick-jobs">
              <div className="cc-section-label">Top Job Matches Today</div>
              {jobs.slice(0, 4).map((j: any, i) => (
                <div key={i} className="cc-job-row">
                  <div className="cc-job-score" style={{ color: j.matchScore >= 75 ? '#30d158' : '#ff9f0a' }}>{j.matchScore}%</div>
                  <div className="cc-job-info"><div className="cc-job-title">{j.title}</div><div className="cc-job-co">{j.company} · {j.location} · {j.salary}</div></div>
                  <button className="cc-btn-sm" onClick={() => setTab('jobs')}>View <ArrowRight size={12} /></button>
                </div>
              ))}
              {jobs.length === 0 && <div className="cc-empty-state"><Search size={28} /><p>Running job discovery… Check back in a moment.</p></div>}
            </div>
          </div>
        )}

        {/* RESUME TAB */}
        {tab === 'resume' && (
          <div className="cc-module">
            <div className="cc-module-header"><FileText size={20} color="#2997ff" /><h3>Resume Center</h3></div>
            <div className="cc-resume-scores">
              {[['ATS Score', 72, '#2997ff'], ['Keyword Match', 68, '#bf5af2'], ['Readability', 85, '#30d158'], ['Impact Score', 61, '#ff9f0a']].map(([k, v, c]) => (
                <div key={String(k)} className="cc-score-card">
                  <div className="cc-score-val" style={{ color: String(c) }}>{v}%</div>
                  <div className="cc-score-label">{k}</div>
                </div>
              ))}
            </div>
            <div className="cc-ai-suggestions">
              <div className="cc-section-label">AI Suggestions</div>
              {['Add quantified achievements (e.g. "Reduced load time by 40%") to experience bullets.',
                'Include 3 missing keywords: Docker, Microservices, CI/CD.',
                'Summary section is too generic — personalize for each target role.',
                'Add a Projects section to showcase hands-on experience.',
                'Skills section missing: TypeScript, Redis, System Design.'].map((s, i) => (
                <div key={i} className="cc-suggestion"><Sparkles size={13} color="#2997ff" /><span>{s}</span></div>
              ))}
            </div>
            <button className="cc-btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'resume-editor' }))}>
              <FileText size={15} /> Open Resume Builder
            </button>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div className="cc-module">
            <div className="cc-module-header"><Briefcase size={20} color="#30d158" /><h3>Job Center</h3><span className="cc-badge">{jobs.length} matches</span></div>
            {jobs.map((j: any, i) => (
              <div key={i} className="cc-job-card">
                <div className="cc-job-card-score" style={{ background: j.matchScore >= 75 ? '#30d15820' : '#ff9f0a20', color: j.matchScore >= 75 ? '#30d158' : '#ff9f0a' }}>{j.matchScore}%</div>
                <div className="cc-job-card-body">
                  <div className="cc-job-card-title">{j.title} — {j.company}</div>
                  <div className="cc-job-card-meta">{j.location} · {j.type} · {j.remote} · {j.salary}</div>
                  <div className="cc-job-card-skills">{(j.matchedSkills || []).slice(0, 3).map((s: string) => <span key={s} className="cc-skill-matched">{s}</span>)}{(j.missingSkills || []).slice(0, 2).map((s: string) => <span key={s} className="cc-skill-missing">{s}</span>)}</div>
                </div>
                <div className="cc-job-card-actions">
                  <button className="cc-btn-sm">Auto Apply</button>
                  <a href={`https://${j.domain}`} target="_blank" rel="noopener noreferrer" className="cc-btn-ghost-sm"><Globe size={12} /></a>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <div className="cc-empty-state"><Search size={32} /><p>Discovering jobs for you…</p><button className="cc-btn-primary" onClick={launchCopilot}><RefreshCw size={14} /> Refresh Jobs</button></div>}
          </div>
        )}

        {/* LEARN TAB */}
        {tab === 'learn' && (
          <div className="cc-module">
            <div className="cc-module-header"><GraduationCap size={20} color="#bf5af2" /><h3>Learning Center</h3></div>
            <div className="cc-section-label">Skill Gaps (Based on Job Market)</div>
            {mockSkillGaps.map((s, i) => (
              <div key={i} className="cc-skill-gap-row">
                <span className="cc-skill-gap-name">{s.skill}</span>
                <div className="cc-skill-gap-bar"><div style={{ width: `${s.demand}%`, background: s.priority === 'high' ? '#ff453a' : '#ff9f0a' }} /></div>
                <span className="cc-skill-gap-pct">{s.demand}% demand</span>
                <span className={`cc-priority-badge ${s.priority}`}>{s.priority}</span>
              </div>
            ))}
            <div className="cc-section-label" style={{ marginTop: 24 }}>Recommended Learning Path</div>
            {[
              { step: 1, title: 'Docker Fundamentals', time: '1 week', platform: 'YouTube / Udemy' },
              { step: 2, title: 'System Design Basics', time: '2 weeks', platform: 'Educative / Book' },
              { step: 3, title: 'AWS Cloud Practitioner', time: '3 weeks', platform: 'AWS Training' },
              { step: 4, title: 'Kubernetes Crash Course', time: '1 week', platform: 'KodeKloud' },
            ].map((item) => (
              <div key={item.step} className="cc-learn-step">
                <div className="cc-learn-step-num">{item.step}</div>
                <div><div className="cc-learn-step-title">{item.title}</div><div className="cc-learn-step-meta">{item.time} · {item.platform}</div></div>
                <Award size={16} color="#ff9f0a" />
              </div>
            ))}
          </div>
        )}

        {/* INTERVIEW TAB */}
        {tab === 'interview' && (
          <div className="cc-module">
            <div className="cc-module-header"><MessageSquare size={20} color="#ff9f0a" /><h3>Interview Coach</h3></div>
            <div className="cc-interview-scores">
              {[['HR Round', 65], ['Technical', 58], ['Behavioral', 72], ['Communication', 80]].map(([k, v]) => (
                <div key={String(k)} className="cc-score-card">
                  <div className="cc-score-val" style={{ color: Number(v) >= 70 ? '#30d158' : '#ff9f0a' }}>{v}%</div>
                  <div className="cc-score-label">{k}</div>
                </div>
              ))}
            </div>
            <div className="cc-section-label">Practice Sessions</div>
            {[
              { type: 'HR Interview', icon: <Users size={16} />, color: '#2997ff', desc: '20 personalized questions based on your profile' },
              { type: 'Technical Round', icon: <Code2 size={16} />, color: '#30d158', desc: 'DSA + System Design + Role-specific questions' },
              { type: 'Behavioral (STAR)', icon: <Star size={16} />, color: '#ff9f0a', desc: 'Practice with real scenario questions & AI feedback' },
              { type: 'Voice Practice', icon: <Play size={16} />, color: '#bf5af2', desc: 'Record, replay, and get pronunciation feedback' },
            ].map((s, i) => (
              <div key={i} className="cc-interview-session" style={{ '--si-color': s.color } as any}>
                <div className="cc-session-icon" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
                <div><div className="cc-session-title">{s.type}</div><div className="cc-session-desc">{s.desc}</div></div>
                <button className="cc-btn-sm" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'prep' }))}>Start</button>
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="cc-module">
            <div className="cc-module-header"><BarChart3 size={20} color="#ff453a" /><h3>Career Analytics</h3></div>
            <div className="cc-analytics-stats">
              {[['Applications', '0', '#2997ff'], ['Interviews', '0', '#30d158'], ['Interview Rate', '—', '#ff9f0a'], ['Offers', '0', '#bf5af2']].map(([k, v, c]) => (
                <div key={String(k)} className="cc-analytics-stat">
                  <div className="cc-stat-val" style={{ color: String(c) }}>{v}</div>
                  <div className="cc-stat-label">{k}</div>
                </div>
              ))}
            </div>
            <div className="cc-weekly-report">
              <div className="cc-section-label">This Week's AI Summary</div>
              <div className="cc-report-items">
                <div className="cc-report-item"><CheckCircle2 size={14} color="#30d158" /><span>Career Copilot launched — baseline profile created</span></div>
                <div className="cc-report-item"><CheckCircle2 size={14} color="#30d158" /><span>Career Health Score: {healthScore}/100 (start tracking improvements)</span></div>
                <div className="cc-report-item"><AlertCircle size={14} color="#ff9f0a" /><span>Resume score 72% — 3 improvements recommended</span></div>
                <div className="cc-report-item"><AlertCircle size={14} color="#ff9f0a" /><span>6 skill gaps identified for {profile?.careerGoal || goal} roles</span></div>
                <div className="cc-report-item"><Sparkles size={14} color="#2997ff" /><span>Start applying to matched jobs to track interview rate</span></div>
              </div>
            </div>
            <div className="cc-coming-soon-module">
              <Shield size={24} color="#8e8e93" />
              <p>Detailed charts, monthly reports, and salary insights will populate as you apply and interview.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
