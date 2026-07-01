import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Upload, Target, Brain, Briefcase, TrendingUp, Users, BarChart3,
  MessageSquare, DollarSign, BookOpen, CheckCircle2, ChevronRight, ChevronLeft,
  RefreshCw, Zap, Star, ArrowRight, Bell, Globe, Code2,
  FileText, Linkedin, AlertCircle, Play, LayoutDashboard,
  GraduationCap, Activity, Rocket, Bot, Search, X, ExternalLink, Youtube
} from 'lucide-react';
import './CareerCopilot.css';

const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');

interface CopilotProps { customApiKey: string; resumeText?: string; setResumeText?: (t: string) => void; }
type View = 'landing' | 'onboarding' | 'dashboard';
type Tab = 'home' | 'resume' | 'jobs' | 'learn' | 'interview' | 'analytics';

interface InterviewSession {
  type: string; questions: string[]; idx: number;
  answers: string[]; feedbacks: any[]; done: boolean;
}

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

const SKILL_DEMAND: Record<string, number> = {
  'React': 82, 'Node.js': 78, 'Python': 88, 'TypeScript': 76, 'Docker': 79,
  'Kubernetes': 68, 'AWS': 73, 'System Design': 85, 'GraphQL': 52, 'Redis': 61,
  'MongoDB': 65, 'PostgreSQL': 70, 'CI/CD': 75, 'Git': 90, 'REST API': 82,
  'Microservices': 71, 'Angular': 58, 'Vue.js': 54, 'Java': 72, 'Go': 64,
};

const INTERVIEW_BANKS: Record<string, (goal: string) => string[]> = {
  'HR Interview': (g) => [
    `Tell me about yourself and why you're pursuing a ${g} role.`,
    `Where do you see yourself in 5 years as a ${g}?`,
    `What is your greatest strength relevant to ${g}?`,
    `Describe a challenge you faced at work and how you handled it.`,
    `Why are you looking for a new opportunity right now?`,
  ],
  'Technical Round': (g) => [
    `What are the core technical skills required for ${g} and how do you rate yourself on each?`,
    `Walk me through how you would debug a production issue in a ${g} system.`,
    `Explain a complex technical concept relevant to ${g} in simple terms.`,
    `Describe the most technically challenging project you've built. How did you architect it?`,
    `How do you approach system design? Design a URL shortener at scale.`,
  ],
  'Behavioral (STAR)': (g) => [
    `Tell me about a time you demonstrated leadership in a ${g} project.`,
    `Describe a situation where you had to meet an impossible deadline. What did you do?`,
    `Give an example of when you disagreed with a manager or teammate. How did you resolve it?`,
    `Tell me about your biggest professional failure and what you learned from it.`,
    `Describe a time you took initiative and went above and beyond your role.`,
  ],
  'Voice Practice': (g) => [
    `Introduce yourself in 60 seconds as a ${g} candidate.`,
    `What makes you the ideal candidate for this ${g} position over others?`,
    `Describe your most impressive project in 2 minutes.`,
    `What are your salary expectations for a ${g} role in 2025?`,
    `Do you have any questions for the hiring team?`,
  ],
};

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

  // Resume analysis
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const resumeAnalyzed = useRef(false);

  // Interview
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [interviewInput, setInterviewInput] = useState('');
  const [interviewEvalLoading, setInterviewEvalLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Analytics / Applications tracking
  const [applications, setApplications] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('cvmind_cc_apps') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (view === 'dashboard' && healthScore === 0) {
      setTimeout(() => setHealthScore(profile?.careerHealthScore || 72), 300);
    }
    if (view === 'dashboard' && !resumeAnalyzed.current && (resumeFile || resumeText)) {
      resumeAnalyzed.current = true;
      analyzeResume();
    }
  }, [view]);

  useEffect(() => {
    if (tab === 'resume' && !resumeAnalysis && !resumeLoading && (resumeFile || resumeText)) {
      analyzeResume();
    }
  }, [tab]);

  const analyzeResume = async () => {
    if (resumeLoading) return;
    setResumeLoading(true);
    try {
      const fd = new FormData();
      if (resumeFile) fd.append('resume', resumeFile);
      else if (resumeText) fd.append('resumeText', resumeText);
      else return;
      const headers: Record<string, string> = {};
      if (customApiKey) headers['x-gemini-key'] = customApiKey;
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', body: fd, headers });
      const d = await r.json();
      if (d.success && d.data) setResumeAnalysis(d.data);
    } catch { } finally { setResumeLoading(false); }
  };

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

  const applyToJob = (job: any, portal: 'linkedin' | 'naukri' | 'indeed') => {
    const q = encodeURIComponent(`${job.title} ${job.company}`);
    const loc = encodeURIComponent(job.location || 'India');
    const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const links = {
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}`,
      naukri: `https://www.naukri.com/${slug}-jobs-in-${encodeURIComponent((job.location || 'india').toLowerCase().replace(/\s+/g, '-'))}`,
      indeed: `https://in.indeed.com/jobs?q=${encodeURIComponent(job.title)}&l=${loc}`,
    };
    const app = { title: job.title, company: job.company, location: job.location, portal, appliedAt: new Date().toISOString() };
    const updated = [...applications, app];
    setApplications(updated);
    localStorage.setItem('cvmind_cc_apps', JSON.stringify(updated));
    window.open(links[portal], '_blank');
  };

  const startInterview = (type: string) => {
    const g = profile?.careerGoal || goal || 'Software Engineer';
    const questions = INTERVIEW_BANKS[type]?.(g) || INTERVIEW_BANKS['HR Interview'](g);
    setInterviewSession({ type, questions, idx: 0, answers: [], feedbacks: [], done: false });
    setInterviewInput('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const submitAnswer = async () => {
    if (!interviewSession || !interviewInput.trim()) return;
    setInterviewEvalLoading(true);
    const currentQ = interviewSession.questions[interviewSession.idx];
    let feedback: any = null;
    try {
      const r = await fetch(`${API}/api/prep/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ question: currentQ, userAnswer: interviewInput, resumeText })
      });
      const d = await r.json();
      feedback = d.success ? d.data : null;
    } catch { }
    const newAnswers = [...interviewSession.answers, interviewInput];
    const newFeedbacks = [...interviewSession.feedbacks, feedback];
    const nextIdx = interviewSession.idx + 1;
    const done = nextIdx >= interviewSession.questions.length;
    setInterviewSession({ ...interviewSession, idx: nextIdx, answers: newAnswers, feedbacks: newFeedbacks, done });
    setInterviewInput('');
    setInterviewEvalLoading(false);
    if (!done) setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const avgInterviewScore = () => {
    if (!interviewSession?.feedbacks.length) return 0;
    const valid = interviewSession.feedbacks.filter(Boolean);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((s, f) => s + (f.score || 0), 0) / valid.length * 10);
  };

  const getSkillGaps = () => {
    if (resumeAnalysis?.atsKeywords?.missing?.length) {
      return resumeAnalysis.atsKeywords.missing.slice(0, 8).map((s: string) => ({
        skill: s, demand: SKILL_DEMAND[s] || Math.floor(50 + Math.random() * 35),
        priority: (SKILL_DEMAND[s] || 60) >= 70 ? 'high' : 'medium'
      }));
    }
    return [
      { skill: 'Docker', demand: 79, priority: 'high' },
      { skill: 'System Design', demand: 85, priority: 'high' },
      { skill: 'AWS', demand: 73, priority: 'high' },
      { skill: 'Kubernetes', demand: 68, priority: 'high' },
      { skill: 'Redis', demand: 61, priority: 'medium' },
      { skill: 'GraphQL', demand: 52, priority: 'medium' },
    ];
  };

  const LEARN_PATH = [
    { step: 1, title: 'Docker Fundamentals', time: '1 week', platform: 'YouTube', yt: 'https://www.youtube.com/results?search_query=docker+tutorial+for+beginners', udemy: 'https://www.udemy.com/courses/search/?q=docker' },
    { step: 2, title: 'System Design Primer', time: '2 weeks', platform: 'YouTube / Educative', yt: 'https://www.youtube.com/results?search_query=system+design+interview+prep', udemy: 'https://www.udemy.com/courses/search/?q=system+design' },
    { step: 3, title: 'AWS Cloud Practitioner', time: '3 weeks', platform: 'AWS / YouTube', yt: 'https://www.youtube.com/results?search_query=aws+cloud+practitioner+full+course', udemy: 'https://www.udemy.com/courses/search/?q=aws+cloud+practitioner' },
    { step: 4, title: 'Kubernetes Crash Course', time: '1 week', platform: 'YouTube / KodeKloud', yt: 'https://www.youtube.com/results?search_query=kubernetes+crash+course+for+beginners', udemy: 'https://www.udemy.com/courses/search/?q=kubernetes' },
  ];

  const resumeScores = resumeAnalysis ? [
    ['ATS Score', resumeAnalysis.atsKeywords?.score ?? 72, '#2997ff'],
    ['Keyword Match', Math.round(((resumeAnalysis.atsKeywords?.matched?.length || 0) / Math.max((resumeAnalysis.atsKeywords?.matched?.length || 0) + (resumeAnalysis.atsKeywords?.missing?.length || 1), 1)) * 100), '#bf5af2'],
    ['Readability', resumeAnalysis.formattingAndStyle?.score ?? 85, '#30d158'],
    ['Impact Score', resumeAnalysis.contentAndImpact?.score ?? 61, '#ff9f0a'],
  ] : [
    ['ATS Score', 72, '#2997ff'], ['Keyword Match', 68, '#bf5af2'],
    ['Readability', 85, '#30d158'], ['Impact Score', 61, '#ff9f0a'],
  ];

  const aiSuggestions: string[] = resumeAnalysis?.recommendations?.length
    ? resumeAnalysis.recommendations
    : resumeAnalysis?.weaknesses?.length
      ? resumeAnalysis.weaknesses
      : [
        'Add quantified achievements (e.g. "Reduced load time by 40%") to experience bullets.',
        'Include 3 missing keywords: Docker, Microservices, CI/CD.',
        'Summary section is too generic — personalize for each target role.',
        'Add a Projects section to showcase hands-on experience.',
        'Skills section missing: TypeScript, Redis, System Design.',
      ];

  const portalCounts = applications.reduce((acc: Record<string, number>, a) => { acc[a.portal] = (acc[a.portal] || 0) + 1; return acc; }, {});

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

  const skillGaps = getSkillGaps();

  return (
    <div className="cc-dashboard">
      {/* Interview Modal */}
      {interviewSession && (
        <div className="cc-modal-backdrop" onClick={() => setInterviewSession(null)}>
          <div className="cc-interview-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <div>
                <div className="cc-modal-title">{interviewSession.type}</div>
                {!interviewSession.done && <div className="cc-modal-progress">Question {interviewSession.idx + 1} of {interviewSession.questions.length}</div>}
              </div>
              <button className="cc-icon-btn" onClick={() => setInterviewSession(null)}><X size={18} /></button>
            </div>

            {!interviewSession.done ? (
              <>
                <div className="cc-modal-q-track">
                  {interviewSession.questions.map((_, i) => (
                    <div key={i} className={`cc-q-dot ${i < interviewSession.idx ? 'done' : i === interviewSession.idx ? 'active' : ''}`} />
                  ))}
                </div>
                <div className="cc-modal-question">{interviewSession.questions[interviewSession.idx]}</div>

                {/* Show feedback from previous answer if exists */}
                {interviewSession.feedbacks.length > 0 && interviewSession.feedbacks[interviewSession.idx - 1] && (
                  <div className="cc-answer-feedback">
                    <div className="cc-feedback-score">Score: <strong>{interviewSession.feedbacks[interviewSession.idx - 1].score}/10</strong></div>
                    <div className="cc-feedback-strengths"><CheckCircle2 size={13} color="#30d158" />{interviewSession.feedbacks[interviewSession.idx - 1].strengths}</div>
                    <div className="cc-feedback-improve"><AlertCircle size={13} color="#ff9f0a" />{interviewSession.feedbacks[interviewSession.idx - 1].improvements}</div>
                    {interviewSession.feedbacks[interviewSession.idx - 1].refinedAnswer && (
                      <details className="cc-refined-answer"><summary>See refined answer</summary><p>{interviewSession.feedbacks[interviewSession.idx - 1].refinedAnswer}</p></details>
                    )}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  className="cc-interview-textarea"
                  placeholder="Type your answer here… Be specific, use examples."
                  value={interviewInput}
                  onChange={e => setInterviewInput(e.target.value)}
                  rows={5}
                />
                <button className="cc-btn-primary cc-btn-full" disabled={!interviewInput.trim() || interviewEvalLoading} onClick={submitAnswer}>
                  {interviewEvalLoading ? <><RefreshCw size={15} className="cc-spin" />Evaluating…</> : interviewSession.idx === interviewSession.questions.length - 1 ? <>Submit & Finish <CheckCircle2 size={15} /></> : <>Submit & Next <ChevronRight size={15} /></>}
                </button>
              </>
            ) : (
              <div className="cc-interview-done">
                <div className="cc-done-score">
                  <HealthRing score={avgInterviewScore()} />
                  <div className="cc-done-label">Overall Score</div>
                </div>
                <div className="cc-done-breakdown">
                  {interviewSession.questions.map((q, i) => (
                    <div key={i} className="cc-done-row">
                      <div className="cc-done-q">Q{i + 1}: {q.slice(0, 60)}…</div>
                      {interviewSession.feedbacks[i] && (
                        <div className="cc-done-score-pill" style={{ background: (interviewSession.feedbacks[i].score || 0) >= 7 ? 'rgba(48,209,88,.12)' : 'rgba(255,159,10,.12)', color: (interviewSession.feedbacks[i].score || 0) >= 7 ? '#30d158' : '#ff9f0a' }}>
                          {interviewSession.feedbacks[i].score}/10
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="cc-btn-primary cc-btn-full" onClick={() => startInterview(interviewSession.type)}><RefreshCw size={15} /> Practice Again</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="cc-dash-header">
        <div className="cc-dash-title">
          <Bot size={20} color="#2997ff" />
          <span>Career Copilot</span>
          <span className="cc-dash-goal-badge"><Target size={11} />{profile?.careerGoal || goal || 'Software Engineer'}</span>
        </div>
        <div className="cc-dash-actions">
          <button className="cc-icon-btn" title="Notifications"><Bell size={18} /></button>
          <button className="cc-icon-btn" title="Refresh" onClick={analyzeResume} disabled={resumeLoading}>
            <RefreshCw size={18} className={resumeLoading ? 'cc-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="cc-tabs">
        {tabs.map(t => <button key={t.id} className={`cc-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>

      <div className="cc-dash-body">
        {/* HOME */}
        {tab === 'home' && (
          <div className="cc-home">
            <div className="cc-home-top">
              <div className="cc-health-card">
                <HealthRing score={healthScore} />
                <div className="cc-health-details">
                  <div className="cc-health-title">Career Health Score</div>
                  <div className="cc-health-breakdown">
                    {[['Resume', resumeAnalysis?.score ?? 78], ['LinkedIn', 60], ['Skills', 68], ['Interview', avgInterviewScore() || 55], ['Projects', 80]].map(([k, v]) => (
                      <div key={String(k)} className="cc-health-row">
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
              {agentActive && <div className="cc-agent-detail">{(() => { const ag = AGENTS.find(a => a.name === agentActive)!; return <><span style={{ color: ag.color, fontWeight: 700 }}>{ag.name}</span> — {ag.desc}</>; })()}</div>}
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
              {jobs.length === 0 && <div className="cc-empty-state"><Search size={28} /><p>No jobs loaded yet. Go to Jobs tab to discover matches.</p></div>}
            </div>
          </div>
        )}

        {/* RESUME */}
        {tab === 'resume' && (
          <div className="cc-module">
            <div className="cc-module-header">
              <FileText size={20} color="#2997ff" /><h3>Resume Center</h3>
              {resumeLoading && <span className="cc-loading-badge"><RefreshCw size={12} className="cc-spin" />Analyzing…</span>}
              {!resumeLoading && resumeAnalysis && <span className="cc-badge-green">AI Analyzed</span>}
            </div>
            <div className="cc-resume-scores">
              {resumeScores.map(([k, v, c]) => (
                <div key={String(k)} className="cc-score-card">
                  <div className="cc-score-val" style={{ color: String(c) }}>{v}%</div>
                  <div className="cc-score-label">{k}</div>
                </div>
              ))}
            </div>

            {resumeAnalysis?.atsKeywords?.missing?.length > 0 && (
              <div className="cc-missing-keywords">
                <div className="cc-section-label">Missing Keywords</div>
                <div className="cc-kw-chips">
                  {resumeAnalysis.atsKeywords.missing.slice(0, 10).map((kw: string) => (
                    <a key={kw} href={`https://www.youtube.com/results?search_query=learn+${encodeURIComponent(kw)}`} target="_blank" rel="noopener noreferrer" className="cc-kw-chip-missing">{kw} <ExternalLink size={10} /></a>
                  ))}
                </div>
              </div>
            )}

            <div className="cc-ai-suggestions">
              <div className="cc-section-label">AI Suggestions</div>
              {aiSuggestions.slice(0, 6).map((s, i) => (
                <div key={i} className="cc-suggestion"><Sparkles size={13} color="#2997ff" /><span>{s}</span></div>
              ))}
            </div>

            {resumeAnalysis?.contentAndImpact?.suggestions?.length > 0 && (
              <div className="cc-rewrites">
                <div className="cc-section-label">AI Bullet Rewrites</div>
                {resumeAnalysis.contentAndImpact.suggestions.map((s: any, i: number) => (
                  <div key={i} className="cc-rewrite-card">
                    <div className="cc-rewrite-before"><span>Before</span><p>{s.original}</p></div>
                    <ArrowRight size={14} color="#8e8e93" className="cc-rewrite-arrow" />
                    <div className="cc-rewrite-after"><span>After</span><p>{s.improved}</p></div>
                  </div>
                ))}
              </div>
            )}

            <div className="cc-resume-actions">
              <button className="cc-btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'resume-editor' }))}>
                <FileText size={15} /> Open Resume Builder
              </button>
              <button className="cc-btn-ghost" onClick={analyzeResume} disabled={resumeLoading}>
                <RefreshCw size={15} className={resumeLoading ? 'cc-spin' : ''} /> Re-Analyze
              </button>
            </div>
          </div>
        )}

        {/* JOBS */}
        {tab === 'jobs' && (
          <div className="cc-module">
            <div className="cc-module-header"><Briefcase size={20} color="#30d158" /><h3>Job Center</h3><span className="cc-badge">{jobs.length} matches</span></div>
            {jobs.map((j: any, i) => (
              <div key={i} className="cc-job-card">
                <div className="cc-job-card-score" style={{ background: j.matchScore >= 75 ? '#30d15820' : '#ff9f0a20', color: j.matchScore >= 75 ? '#30d158' : '#ff9f0a' }}>{j.matchScore}%</div>
                <div className="cc-job-card-body">
                  <div className="cc-job-card-title">{j.title} — {j.company}</div>
                  <div className="cc-job-card-meta">{j.location} · {j.type} · {j.remote} · {j.salary}</div>
                  <div className="cc-job-card-skills">
                    {(j.matchedSkills || []).slice(0, 3).map((s: string) => <span key={s} className="cc-skill-matched">{s}</span>)}
                    {(j.missingSkills || []).slice(0, 2).map((s: string) => <span key={s} className="cc-skill-missing">{s}</span>)}
                  </div>
                  <div className="cc-apply-links">
                    <button className="cc-apply-btn cc-apply-linkedin" onClick={() => applyToJob(j, 'linkedin')}><Linkedin size={13} /> LinkedIn</button>
                    <button className="cc-apply-btn cc-apply-naukri" onClick={() => applyToJob(j, 'naukri')}>🅽 Naukri</button>
                    <button className="cc-apply-btn cc-apply-indeed" onClick={() => applyToJob(j, 'indeed')}><Search size={13} /> Indeed</button>
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="cc-empty-state">
                <Search size={32} />
                <p>No jobs loaded yet.</p>
                <button className="cc-btn-primary" onClick={launchCopilot} disabled={loading}>
                  {loading ? <><RefreshCw size={14} className="cc-spin" />Loading…</> : <><RefreshCw size={14} /> Discover Jobs</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* LEARN */}
        {tab === 'learn' && (
          <div className="cc-module">
            <div className="cc-module-header"><GraduationCap size={20} color="#bf5af2" /><h3>Learning Center</h3></div>
            <div className="cc-section-label">Skill Gaps — Market Demand</div>
            {skillGaps.map((s: { skill: string; demand: number; priority: string }, i: number) => (
              <div key={i} className="cc-skill-gap-row">
                <span className="cc-skill-gap-name">{s.skill}</span>
                <div className="cc-skill-gap-bar"><div style={{ width: `${s.demand}%`, background: s.priority === 'high' ? '#ff453a' : '#ff9f0a' }} /></div>
                <span className="cc-skill-gap-pct">{s.demand}%</span>
                <span className={`cc-priority-badge ${s.priority}`}>{s.priority}</span>
                <a href={`https://www.youtube.com/results?search_query=learn+${encodeURIComponent(s.skill)}+tutorial`} target="_blank" rel="noopener noreferrer" className="cc-learn-yt-btn"><Youtube size={13} /></a>
              </div>
            ))}

            <div className="cc-section-label" style={{ marginTop: 24 }}>AI Learning Roadmap</div>
            {LEARN_PATH.map((item) => (
              <div key={item.step} className="cc-learn-step">
                <div className="cc-learn-step-num">{item.step}</div>
                <div style={{ flex: 1 }}>
                  <div className="cc-learn-step-title">{item.title}</div>
                  <div className="cc-learn-step-meta">{item.time} · {item.platform}</div>
                </div>
                <div className="cc-learn-step-links">
                  <a href={item.yt} target="_blank" rel="noopener noreferrer" className="cc-learn-link cc-learn-link-yt"><Youtube size={13} />YouTube</a>
                  <a href={item.udemy} target="_blank" rel="noopener noreferrer" className="cc-learn-link cc-learn-link-udemy"><Star size={13} />Udemy</a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERVIEW */}
        {tab === 'interview' && (
          <div className="cc-module">
            <div className="cc-module-header"><MessageSquare size={20} color="#ff9f0a" /><h3>Interview Coach</h3></div>
            <div className="cc-interview-scores">
              {[['HR Round', avgInterviewScore() || 65], ['Technical', 58], ['Behavioral', 72], ['Communication', 80]].map(([k, v]) => (
                <div key={String(k)} className="cc-score-card">
                  <div className="cc-score-val" style={{ color: Number(v) >= 70 ? '#30d158' : '#ff9f0a' }}>{v}%</div>
                  <div className="cc-score-label">{k}</div>
                </div>
              ))}
            </div>
            <div className="cc-section-label">Practice Sessions</div>
            {[
              { type: 'HR Interview', icon: <Users size={16} />, color: '#2997ff', desc: '5 personalized questions based on your profile' },
              { type: 'Technical Round', icon: <Code2 size={16} />, color: '#30d158', desc: 'DSA + System Design + Role-specific questions' },
              { type: 'Behavioral (STAR)', icon: <Star size={16} />, color: '#ff9f0a', desc: 'STAR method practice with AI feedback on each answer' },
              { type: 'Voice Practice', icon: <Play size={16} />, color: '#bf5af2', desc: '5 questions with detailed feedback and refined model answers' },
            ].map((s, i) => (
              <div key={i} className="cc-interview-session" style={{ '--si-color': s.color } as any}>
                <div className="cc-session-icon" style={{ color: s.color, background: `${s.color}15` }}>{s.icon}</div>
                <div style={{ flex: 1 }}><div className="cc-session-title">{s.type}</div><div className="cc-session-desc">{s.desc}</div></div>
                <button className="cc-btn-sm" onClick={() => startInterview(s.type)}><Play size={12} /> Start</button>
              </div>
            ))}
            <div className="cc-interview-tip">
              <Sparkles size={14} color="#2997ff" />
              <span>Each session evaluates your answers with AI and gives you a score out of 10 with improvements and a refined model answer.</span>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="cc-module">
            <div className="cc-module-header"><BarChart3 size={20} color="#ff453a" /><h3>Career Analytics</h3></div>
            <div className="cc-analytics-stats">
              {[
                ['Applications', applications.length, '#2997ff'],
                ['LinkedIn', portalCounts.linkedin || 0, '#0077b5'],
                ['Naukri', portalCounts.naukri || 0, '#ff6b35'],
                ['Indeed', portalCounts.indeed || 0, '#2164f3'],
              ].map(([k, v, c]) => (
                <div key={String(k)} className="cc-analytics-stat">
                  <div className="cc-stat-val" style={{ color: String(c) }}>{v}</div>
                  <div className="cc-stat-label">{k}</div>
                </div>
              ))}
            </div>

            {applications.length > 0 ? (
              <div className="cc-recent-apps">
                <div className="cc-section-label">Recent Applications</div>
                {applications.slice().reverse().slice(0, 8).map((a, i) => (
                  <div key={i} className="cc-app-row">
                    <div className="cc-app-icon" style={{ background: a.portal === 'linkedin' ? 'rgba(0,119,181,.1)' : a.portal === 'naukri' ? 'rgba(255,107,53,.1)' : 'rgba(33,100,243,.1)' }}>
                      {a.portal === 'linkedin' ? <Linkedin size={14} color="#0077b5" /> : <Search size={14} color="#ff6b35" />}
                    </div>
                    <div className="cc-app-info">
                      <div className="cc-app-title">{a.title} — {a.company}</div>
                      <div className="cc-app-meta">{a.portal} · {new Date(a.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className="cc-app-status">Applied</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cc-empty-state" style={{ marginTop: 16 }}>
                <Briefcase size={28} />
                <p>No applications tracked yet. Click apply buttons in the Jobs tab to track here.</p>
                <button className="cc-btn-primary" onClick={() => setTab('jobs')}><Briefcase size={14} /> Browse Jobs</button>
              </div>
            )}

            <div className="cc-weekly-report">
              <div className="cc-section-label">This Week's AI Summary</div>
              <div className="cc-report-items">
                <div className="cc-report-item"><CheckCircle2 size={14} color="#30d158" /><span>Career Copilot active — profile created and analyzed</span></div>
                <div className="cc-report-item"><CheckCircle2 size={14} color="#30d158" /><span>Career Health Score: {healthScore}/100 — keep improving</span></div>
                <div className="cc-report-item"><Activity size={14} color="#2997ff" /><span>{applications.length} jobs applied via Copilot</span></div>
                {resumeAnalysis && <div className="cc-report-item"><CheckCircle2 size={14} color="#30d158" /><span>Resume ATS Score: {resumeAnalysis.atsKeywords?.score ?? 72}% — {(resumeAnalysis.atsKeywords?.missing?.length || 0)} keywords to add</span></div>}
                <div className="cc-report-item"><Sparkles size={14} color="#2997ff" /><span>Practice more interview sessions to boost your coach score</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
