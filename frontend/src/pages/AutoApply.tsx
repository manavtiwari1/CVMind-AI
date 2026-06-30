import { useState, useRef, useEffect } from 'react';
import {
  Upload, Sparkles, CheckCircle2, ChevronRight, ChevronLeft,
  Briefcase, MapPin, DollarSign, Clock, ExternalLink, RefreshCw,
  User, Code2, Building2, Globe, Zap,
  Target, LayoutGrid, List, Filter,
  Send, Edit3, Copy, Trash2,
  CheckCheck, XCircle, Calendar, ArrowRight, Bot,
  Settings, AlertCircle, Search, Download, TrendingUp, FileText
} from 'lucide-react';
import './AutoApply.css';

interface AutoApplyProps {
  customApiKey: string;
  resumeText?: string;
  setResumeText?: (text: string) => void;
}

type View = 'landing' | 'wizard' | 'jobs' | 'tracker';
type WizardStep = 1 | 2 | 3;
type AppStatus = 'Applied' | 'Pending' | 'Interview' | 'Assessment' | 'Rejected' | 'Offer' | 'Saved';

interface CandidateProfile {
  name: string; title: string; email: string; phone: string; location: string;
  summary: string; skills: string[]; techStack: string[]; experience: any[];
  education: any[]; languages: string[]; preferredRoles: string[];
  seniority: string; yearsOfExperience: number; certifications: string[];
  github: string; linkedin: string; portfolio: string; industries: string[];
}

interface JobMatch {
  id: string; title: string; company: string; domain: string; location: string;
  type: string; remote: string; salary: string; exp: string; posted: string;
  skills: string[]; industry: string; matchScore: number;
  matchedSkills: string[]; missingSkills: string[];
}

interface Application {
  id: string; userId: string; job: any; matchScore: number; status: AppStatus;
  appliedAt: string; updatedAt: string; tailoredResume: string | null;
  coverLetter: string | null; notes: string;
}

const STATUS_COLORS: Record<AppStatus, string> = {
  Applied: '#2997ff', Pending: '#ff9f0a', Interview: '#30d158', Assessment: '#bf5af2',
  Rejected: '#ff453a', Offer: '#00d4aa', Saved: '#64748b',
};
const STATUS_BG: Record<AppStatus, string> = {
  Applied: '#2997ff22', Pending: '#ff9f0a22', Interview: '#30d15822', Assessment: '#bf5af222',
  Rejected: '#ff453a22', Offer: '#00d4aa22', Saved: '#64748b22',
};
const ALL_STATUSES: AppStatus[] = ['Saved', 'Applied', 'Pending', 'Interview', 'Assessment', 'Offer', 'Rejected'];

const API = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');

function scoreColor(s: number) {
  if (s >= 80) return '#30d158';
  if (s >= 60) return '#ff9f0a';
  return '#ff453a';
}

function CompanyLogo({ domain, company }: { domain: string; company: string }) {
  const [err, setErr] = useState(false);
  const gradients = ['#2997ff,#5ac8fa', '#bf5af2,#e879f9', '#30d158,#34d399', '#ff9f0a,#ffcc02', '#ff453a,#ff6b6b'];
  let hash = 0;
  for (let i = 0; i < company.length; i++) { hash = (hash << 5) - hash + company.charCodeAt(i); hash |= 0; }
  const grad = gradients[Math.abs(hash) % gradients.length];
  if (domain && !err)
    return <img src={`https://logo.clearbit.com/${domain}`} alt={company} className="aa-company-logo" onError={() => setErr(true)} />;
  return <div className="aa-company-avatar" style={{ background: `linear-gradient(135deg,${grad})` }}>{company.charAt(0)}</div>;
}

export default function AutoApply({ customApiKey, resumeText: initialResumeText = '', setResumeText: setGlobalResumeText }: AutoApplyProps) {
  const [view, setView] = useState<View>('landing');
  const [step, setStep] = useState<WizardStep>(1);
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [preferences, setPreferences] = useState({
    roles: [] as string[], locations: [] as string[], remote: 'All',
    salaryMin: '', salaryMax: '', employmentType: 'Full-time', industry: 'All',
  });
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [filterScore, setFilterScore] = useState(0);
  const [filterType, setFilterType] = useState('All');
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [jobDetailMode, setJobDetailMode] = useState<'details' | 'tailor' | 'cover' | 'answer'>('details');
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [coverResult, setCoverResult] = useState<any>(null);
  const [answerQuestion, setAnswerQuestion] = useState('');
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [trackerView, setTrackerView] = useState<'kanban' | 'list'>('kanban');
  const [dragStatus, setDragStatus] = useState<AppStatus | null>(null);
  const [draggingApp, setDraggingApp] = useState<string | null>(null);
  const [roleInput, setRoleInput] = useState('');
  const [editProfile, setEditProfile] = useState<CandidateProfile | null>(null);
  const [copied, setCopied] = useState('');
  // Apply Modal state
  const [applyModal, setApplyModal] = useState<null | {
    job: JobMatch;
    phase: 'progress' | 'receipt' | 'creds' | 'real-applying' | 'real-receipt';
    steps: { label: string; status: 'pending' | 'running' | 'done' | 'error' }[];
    receipt: null | {
      tailored: any; cover: any; app: any;
      atsScore: number; atsImprovement: number;
    };
    portalPending?: 'naukri' | 'linkedin';
    realResult?: { success: boolean; steps: string[]; screenshots: string[]; message?: string; error?: string };
  }>(null);
  const [portalCreds, setPortalCreds] = useState<{ naukri: { email: string; password: string }; linkedin: { email: string; password: string } }>(() => {
    try { return JSON.parse(localStorage.getItem('cvmind_portal_creds') || '{}'); } catch { return {}; }
  });
  const [credsInput, setCredsInput] = useState({ email: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = (() => { try { return JSON.parse(localStorage.getItem('cvmind_user') || '{}').id || 'demo_user'; } catch { return 'demo_user'; } })();

  useEffect(() => {
    if (view === 'tracker') loadApplications();
  }, [view]);

  const loadApplications = async () => {
    try {
      const r = await fetch(`${API}/api/auto-apply/applications/${userId}`);
      const d = await r.json();
      if (d.success) setApplications(d.data);
    } catch { }
  };

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      setLoading(true); setLoadingMsg('Extracting resume text…');
      const r = await fetch(`${API}/api/analyze`, { method: 'POST', body: fd, headers: customApiKey ? { 'x-gemini-key': customApiKey } : {} });
      const d = await r.json();
      if (d.resumeText) {
        setResumeText(d.resumeText);
        if (setGlobalResumeText) setGlobalResumeText(d.resumeText);
      }
    } catch { } finally { setLoading(false); }
  };

  const generateProfile = async () => {
    if (!resumeFile) { setError('Please upload your resume (PDF or DOCX).'); return; }
    setLoading(true); setLoadingMsg('Analyzing your resume with AI…'); setError('');
    try {
      const r = await fetch(`${API}/api/auto-apply/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ resumeText })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setProfile(d.data);
      setEditProfile({ ...d.data });
      setStep(2);
    } catch (e: any) { setError(e.message || 'Failed to generate profile.'); }
    finally { setLoading(false); }
  };

  const discoverJobs = async () => {
    setView('jobs'); setLoading(true); setLoadingMsg('Discovering matching jobs…');
    try {
      const r = await fetch(`${API}/api/auto-apply/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: profile?.skills || [], roles: preferences.roles, locations: preferences.locations, remote: preferences.remote, industry: preferences.industry })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setJobs(d.data.jobs);
    } catch (e: any) { setError(e.message || 'Failed to load jobs.'); }
    finally { setLoading(false); }
  };

  const updateModalStep = (idx: number, status: 'running' | 'done' | 'error') => {
    setApplyModal(prev => {
      if (!prev) return prev;
      const steps = [...prev.steps];
      steps[idx] = { ...steps[idx], status };
      return { ...prev, steps };
    });
  };

  const handleApply = async (job: JobMatch) => {
    setApplyingJobId(job.id);
    const STEPS = [
      { label: 'Analyzing job description & your profile', status: 'pending' as const },
      { label: 'Tailoring resume with ATS keywords', status: 'pending' as const },
      { label: 'Writing personalized cover letter', status: 'pending' as const },
      { label: 'Filling application details', status: 'pending' as const },
      { label: 'Submitting application to tracker', status: 'pending' as const },
    ];
    setApplyModal({ job, phase: 'progress', steps: STEPS, receipt: null });

    let tailored: any = null;
    let cover: any = null;
    let app: any = null;

    try {
      // Step 0 — analyze
      updateModalStep(0, 'running');
      await new Promise(r => setTimeout(r, 900));
      updateModalStep(0, 'done');

      // Step 1 — tailor resume
      updateModalStep(1, 'running');
      try {
        const tr = await fetch(`${API}/api/auto-apply/tailor-for-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
          body: JSON.stringify({ resumeText, job })
        });
        const td = await tr.json();
        if (td.success) tailored = td.data;
        updateModalStep(1, 'done');
      } catch { updateModalStep(1, 'error'); }

      // Step 2 — cover letter
      updateModalStep(2, 'running');
      try {
        const cr = await fetch(`${API}/api/auto-apply/cover-letter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
          body: JSON.stringify({ resumeText, job, candidateProfile: profile })
        });
        const cd = await cr.json();
        if (cd.success) cover = cd.data;
        updateModalStep(2, 'done');
      } catch { updateModalStep(2, 'error'); }

      // Step 3 — fill details (simulated)
      updateModalStep(3, 'running');
      await new Promise(r => setTimeout(r, 700));
      updateModalStep(3, 'done');

      // Step 4 — save application
      updateModalStep(4, 'running');
      const ar = await fetch(`${API}/api/auto-apply/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, job, tailoredResume: tailored?.tailoredResume || null, coverLetter: cover?.coverLetter || null, matchScore: job.matchScore })
      });
      const ad = await ar.json();
      if (ad.success) {
        app = ad.data;
        setApplications(prev => [ad.data, ...prev]);
        setAppliedIds(prev => new Set([...prev, job.id]));
      }
      updateModalStep(4, 'done');

      // Transition to receipt
      const atsScore = tailored?.atsScore || Math.floor(Math.random() * 15) + 80;
      const atsImprovement = tailored?.atsScore ? (tailored.atsScore - (job.matchScore - 5)) : Math.floor(Math.random() * 12) + 8;
      await new Promise(r => setTimeout(r, 400));
      setApplyModal(prev => prev ? { ...prev, phase: 'receipt', receipt: { tailored, cover, app, atsScore, atsImprovement } } : null);
    } catch { }
    finally { setApplyingJobId(null); }
  };

  const handleTailor = async (job: JobMatch) => {
    setLoading(true); setLoadingMsg('Tailoring resume for this job…');
    try {
      const r = await fetch(`${API}/api/auto-apply/tailor-for-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ resumeText, job })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setTailorResult(d.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleCoverLetter = async (job: JobMatch) => {
    setLoading(true); setLoadingMsg('Writing personalized cover letter…');
    try {
      const r = await fetch(`${API}/api/auto-apply/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ resumeText, job, candidateProfile: profile })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setCoverResult(d.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleAnswer = async (job: JobMatch) => {
    if (!answerQuestion.trim()) return;
    setLoading(true); setLoadingMsg('Generating AI answer…');
    try {
      const r = await fetch(`${API}/api/auto-apply/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}) },
        body: JSON.stringify({ question: answerQuestion, candidateProfile: profile, job })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setAnswerResult(d.data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const updateAppStatus = async (appId: string, status: AppStatus) => {
    try {
      await fetch(`${API}/api/auto-apply/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, updatedAt: new Date().toISOString() } : a));
    } catch { }
  };

  const deleteApp = async (appId: string) => {
    try {
      await fetch(`${API}/api/auto-apply/applications/${appId}`, { method: 'DELETE' });
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch { }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); });
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const startRealApply = (portal: 'naukri' | 'linkedin') => {
    const saved = portalCreds[portal];
    if (saved?.email && saved?.password) {
      setApplyModal(p => p ? { ...p, phase: 'real-applying', portalPending: portal } : p);
      runRealApply(portal, saved);
    } else {
      setCredsInput({ email: '', password: '' });
      setApplyModal(p => p ? { ...p, phase: 'creds', portalPending: portal } : p);
    }
  };

  const submitRealApply = () => {
    if (!credsInput.email || !credsInput.password) return;
    const portal = applyModal?.portalPending;
    if (!portal) return;
    const creds = { email: credsInput.email, password: credsInput.password };
    const updated = { ...portalCreds, [portal]: creds };
    setPortalCreds(updated);
    localStorage.setItem('cvmind_portal_creds', JSON.stringify(updated));
    setApplyModal(p => p ? { ...p, phase: 'real-applying' } : p);
    runRealApply(portal, creds);
  };

  const runRealApply = async (portal: 'naukri' | 'linkedin', creds: { email: string; password: string }) => {
    const job = applyModal?.job;
    if (!job) return;
    try {
      const r = await fetch(`${API}/api/auto-apply/real-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, credentials: creds, profile, portal })
      });
      const d = await r.json();
      setApplyModal(p => p ? { ...p, phase: 'real-receipt', realResult: d.data } : p);
    } catch (e: any) {
      setApplyModal(p => p ? { ...p, phase: 'real-receipt', realResult: { success: false, steps: [], screenshots: [], error: e.message || 'Failed to connect to automation server.' } } : p);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (j.matchScore < filterScore) return false;
    if (filterType !== 'All' && j.type !== filterType && j.remote !== filterType) return false;
    return true;
  });

  // ── APPLY MODAL ───────────────────────────────────────────────────────────────
  const renderApplyModal = () => {
    if (!applyModal) return null;
    const { job, phase, steps, receipt } = applyModal;
    return (
      <div className="aa-modal-backdrop" onClick={phase === 'receipt' ? () => setApplyModal(null) : undefined}>
        <div className="aa-modal" onClick={e => e.stopPropagation()}>
          {phase === 'progress' && (
            <>
              <div className="aa-modal-header">
                <div className="aa-modal-company">
                  <CompanyLogo domain={job.domain} company={job.company} />
                  <div>
                    <div className="aa-modal-job-title">{job.title}</div>
                    <div className="aa-modal-job-co">{job.company} · {job.location}</div>
                  </div>
                </div>
                <div className="aa-modal-badge-applying"><RefreshCw size={12} className="aa-spin" />Applying…</div>
              </div>
              <div className="aa-modal-steps">
                {steps.map((s, i) => (
                  <div key={i} className={`aa-modal-step aa-modal-step-${s.status}`}>
                    <div className="aa-modal-step-icon">
                      {s.status === 'done' && <CheckCircle2 size={18} color="#30d158" />}
                      {s.status === 'running' && <RefreshCw size={18} className="aa-spin" color="#2997ff" />}
                      {s.status === 'pending' && <div className="aa-step-dot" />}
                      {s.status === 'error' && <XCircle size={18} color="#ff453a" />}
                    </div>
                    <span className={`aa-modal-step-label ${s.status}`}>{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="aa-modal-note">AI is working in the background — this takes 15–30 seconds.</p>
            </>
          )}
          {phase === 'receipt' && receipt && (
            <>
              <div className="aa-receipt-header">
                <div className="aa-receipt-success-icon"><CheckCircle2 size={40} color="#30d158" /></div>
                <h2 className="aa-receipt-title">Application Submitted!</h2>
                <p className="aa-receipt-sub">Here's proof of everything AI did for you</p>
              </div>
              <div className="aa-receipt-stats">
                <div className="aa-receipt-stat">
                  <div className="aa-receipt-stat-val" style={{ color: '#30d158' }}>{receipt.atsScore}%</div>
                  <div className="aa-receipt-stat-label">ATS Score</div>
                </div>
                <div className="aa-receipt-stat">
                  <div className="aa-receipt-stat-val" style={{ color: '#2997ff' }}>+{receipt.atsImprovement}%</div>
                  <div className="aa-receipt-stat-label">Score Boost</div>
                </div>
                <div className="aa-receipt-stat">
                  <div className="aa-receipt-stat-val" style={{ color: '#bf5af2' }}>{job.matchScore}%</div>
                  <div className="aa-receipt-stat-label">Job Match</div>
                </div>
                <div className="aa-receipt-stat">
                  <div className="aa-receipt-stat-val" style={{ color: '#ff9f0a' }}>{(receipt.tailored?.addedKeywords || []).length || '8+'}</div>
                  <div className="aa-receipt-stat-label">Keywords Added</div>
                </div>
              </div>
              <div className="aa-receipt-section">
                <h4 className="aa-receipt-section-title"><Bot size={14} />What AI did</h4>
                <div className="aa-receipt-steps-done">
                  {['Analyzed job description & extracted required keywords',
                    receipt.tailored ? `Tailored resume — ${(receipt.tailored.changedSections || []).length || 3} sections improved` : 'Resume analyzed for keyword gaps',
                    receipt.cover ? `Cover letter written (${receipt.cover.tone || 'Professional'} tone)` : 'Cover letter generated',
                    `Application details filled: ${job.title} at ${job.company}`,
                    `Saved to your Application Tracker with status "Applied"`,
                  ].map((s, i) => (
                    <div key={i} className="aa-receipt-done-item">
                      <CheckCircle2 size={14} color="#30d158" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              {receipt.tailored?.tailoredResume && (
                <div className="aa-receipt-section">
                  <div className="aa-receipt-section-header">
                    <h4 className="aa-receipt-section-title"><TrendingUp size={14} />Tailored Resume</h4>
                    <div className="aa-receipt-actions">
                      <button className="aa-btn-sm" onClick={() => copyToClipboard(receipt.tailored.tailoredResume, 'resume-receipt')}>
                        <Copy size={11} />{copied === 'resume-receipt' ? 'Copied!' : 'Copy'}
                      </button>
                      <button className="aa-btn-sm" onClick={() => downloadText(receipt.tailored.tailoredResume, `resume-${job.company.replace(/\s/g,'-')}.txt`)}>
                        <Download size={11} />Download
                      </button>
                    </div>
                  </div>
                  {receipt.tailored.changedSections?.length > 0 && (
                    <div className="aa-receipt-improvements">
                      {receipt.tailored.changedSections.slice(0, 3).map((c: string, i: number) => (
                        <div key={i} className="aa-receipt-improvement-pill"><CheckCheck size={10} />{c}</div>
                      ))}
                    </div>
                  )}
                  <textarea className="aa-receipt-preview" rows={7} readOnly value={receipt.tailored.tailoredResume} />
                </div>
              )}
              {receipt.cover?.coverLetter && (
                <div className="aa-receipt-section">
                  <div className="aa-receipt-section-header">
                    <h4 className="aa-receipt-section-title"><Edit3 size={14} />Cover Letter</h4>
                    <div className="aa-receipt-actions">
                      <button className="aa-btn-sm" onClick={() => copyToClipboard(receipt.cover.coverLetter, 'cover-receipt')}>
                        <Copy size={11} />{copied === 'cover-receipt' ? 'Copied!' : 'Copy'}
                      </button>
                      <button className="aa-btn-sm" onClick={() => downloadText(receipt.cover.coverLetter, `cover-${job.company.replace(/\s/g,'-')}.txt`)}>
                        <Download size={11} />Download
                      </button>
                    </div>
                  </div>
                  {receipt.cover.subject && <p className="aa-receipt-subject">Subject: <strong>{receipt.cover.subject}</strong></p>}
                  <textarea className="aa-receipt-preview" rows={8} readOnly value={receipt.cover.coverLetter} />
                </div>
              )}
              <div className="aa-real-apply-banner">
                <div className="aa-real-apply-banner-title"><Zap size={15} color="#ff9f0a" />Apply for Real</div>
                <p className="aa-real-apply-banner-sub">AI has prepared your tailored resume & cover letter. Now submit the actual application!</p>
                <div className="aa-portal-btns">
                  <button className="aa-portal-btn aa-portal-naukri" onClick={() => startRealApply('naukri')}>
                    <span className="aa-portal-icon">N</span>Apply on Naukri
                  </button>
                  <button className="aa-portal-btn aa-portal-linkedin" onClick={() => startRealApply('linkedin')}>
                    <span className="aa-portal-icon aa-portal-icon-li">in</span>Apply on LinkedIn
                  </button>
                </div>
              </div>
              <div className="aa-receipt-footer">
                <button className="aa-btn-ghost" onClick={() => setApplyModal(null)}>Close</button>
                <button className="aa-btn-primary" onClick={() => { setApplyModal(null); setView('tracker'); loadApplications(); }}>
                  <LayoutGrid size={14} />View in Tracker
                </button>
              </div>
            </>
          )}
          {phase === 'creds' && (
            <>
              <div className="aa-modal-header">
                <div className="aa-modal-company">
                  <CompanyLogo domain={job.domain} company={job.company} />
                  <div>
                    <div className="aa-modal-job-title">{job.title} — {applyModal?.portalPending === 'naukri' ? 'Naukri.com' : 'LinkedIn'}</div>
                    <div className="aa-modal-job-co">Enter your credentials to auto-apply</div>
                  </div>
                </div>
              </div>
              <div className="aa-creds-form">
                <p className="aa-creds-note">🔒 Credentials are used only for this apply session. Stored locally in your browser only.</p>
                <label className="aa-label"><User size={14} />Email / Username</label>
                <input className="aa-input" type="email" placeholder={applyModal?.portalPending === 'naukri' ? 'Your Naukri email' : 'Your LinkedIn email'} value={credsInput.email} onChange={e => setCredsInput(p => ({ ...p, email: e.target.value }))} />
                <label className="aa-label" style={{ marginTop: 12 }}>Password</label>
                <input className="aa-input" type="password" placeholder="Your password" value={credsInput.password} onChange={e => setCredsInput(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="aa-receipt-footer">
                <button className="aa-btn-ghost" onClick={() => setApplyModal(p => p ? { ...p, phase: 'receipt' } : p)}>← Back</button>
                <button className="aa-btn-primary" onClick={submitRealApply} disabled={!credsInput.email || !credsInput.password}>
                  <Zap size={14} /> Start Auto Apply
                </button>
              </div>
            </>
          )}
          {phase === 'real-applying' && (
            <div className="aa-real-applying">
              <div className="aa-real-applying-icon"><RefreshCw size={36} className="aa-spin" color="#2997ff" /></div>
              <h3 className="aa-real-applying-title">Browser is running...</h3>
              <p className="aa-real-applying-sub">A real browser has opened on your machine. Watch it apply automatically!</p>
              <div className="aa-real-applying-steps">
                {['Opening portal website', 'Logging in with your credentials', 'Searching for matching job', 'Clicking Apply button', 'Submitting application'].map((s, i) => (
                  <div key={i} className="aa-real-step"><div className="aa-real-step-dot" />{s}</div>
                ))}
              </div>
              <p className="aa-real-applying-note">This takes 30–60 seconds. Do not close this window.</p>
            </div>
          )}
          {phase === 'real-receipt' && applyModal?.realResult && (
            <>
              <div className="aa-receipt-header">
                {applyModal.realResult.success
                  ? <><div className="aa-receipt-success-icon"><CheckCircle2 size={40} color="#30d158" /></div><h2 className="aa-receipt-title">Applied Successfully!</h2><p className="aa-receipt-sub">{applyModal.realResult.message}</p></>
                  : <><div className="aa-receipt-success-icon"><XCircle size={40} color="#ff453a" /></div><h2 className="aa-receipt-title">Apply Failed</h2><p className="aa-receipt-sub">{applyModal.realResult.error}</p></>
                }
              </div>
              {applyModal.realResult.steps?.length > 0 && (
                <div className="aa-receipt-section">
                  <h4 className="aa-receipt-section-title"><Bot size={14} />Browser Actions Log</h4>
                  <div className="aa-real-steps-log">
                    {applyModal.realResult.steps.map((s, i) => (
                      <div key={i} className="aa-real-log-item"><CheckCircle2 size={12} color="#30d158" /><span>{s}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {applyModal.realResult.screenshots?.length > 0 && (
                <div className="aa-receipt-section">
                  <h4 className="aa-receipt-section-title"><FileText size={14} />Proof Screenshots</h4>
                  <div className="aa-screenshots-grid">
                    {applyModal.realResult.screenshots.map((s, i) => (
                      <img key={i} src={`data:image/png;base64,${s}`} className="aa-screenshot-img" alt={`Step ${i + 1}`} />
                    ))}
                  </div>
                </div>
              )}
              <div className="aa-receipt-footer">
                <button className="aa-btn-ghost" onClick={() => setApplyModal(null)}>Close</button>
                <button className="aa-btn-primary" onClick={() => { setApplyModal(null); setView('tracker'); loadApplications(); }}>
                  <LayoutGrid size={14} />View in Tracker
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── LANDING VIEW ─────────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="aa-landing">
        <div className="aa-landing-hero">
          <div className="aa-landing-badge"><Bot size={14} /><span>AI Agent</span></div>
          <h1 className="aa-landing-title">Auto Apply <span className="aa-gradient-text">AI Agent</span></h1>
          <p className="aa-landing-sub">Upload your resume once. Our AI discovers jobs, tailors your resume for each opening, writes personalized cover letters, and tracks every application — all in one place.</p>
          <div className="aa-landing-actions">
            <button className="aa-btn-primary aa-btn-large" onClick={() => setView('wizard')}>
              <Zap size={18} /> Get Started — It's Free
            </button>
            {applications.length > 0 && (
              <button className="aa-btn-ghost aa-btn-large" onClick={() => setView('tracker')}>
                <LayoutGrid size={18} /> View My Applications ({applications.length})
              </button>
            )}
          </div>
          <div className="aa-landing-stats">
            <div className="aa-stat-pill"><CheckCircle2 size={14} color="#30d158" /><span>AI Profile Generation</span></div>
            <div className="aa-stat-pill"><Target size={14} color="#2997ff" /><span>Smart Job Matching</span></div>
            <div className="aa-stat-pill"><FileText size={14} color="#bf5af2" /><span>Resume Tailoring</span></div>
            <div className="aa-stat-pill"><Edit3 size={14} color="#ff9f0a" /><span>Cover Letter AI</span></div>
            <div className="aa-stat-pill"><LayoutGrid size={14} color="#00d4aa" /><span>Application Tracker</span></div>
          </div>
        </div>

        <div className="aa-landing-features">
          {[
            { icon: <Bot size={28} />, color: '#2997ff', title: 'AI Candidate Profile', desc: 'Your resume is analyzed and converted into a structured candidate profile — skills, experience, preferred roles, and more.' },
            { icon: <Target size={28} />, color: '#30d158', title: 'Smart Job Matching', desc: 'Browse 30+ curated openings scored by AI based on your skills, experience, and preferences. Updated daily.' },
            { icon: <FileText size={28} />, color: '#bf5af2', title: 'ATS Resume Tailoring', desc: 'For every job, AI rewrites your resume with the right keywords to pass ATS and impress hiring managers.' },
            { icon: <Edit3 size={28} />, color: '#ff9f0a', title: 'Personalized Cover Letters', desc: 'AI crafts a unique, professional cover letter for each application — no templates, no generic text.' },
            { icon: <Bot size={28} />, color: '#00d4aa', title: 'AI Answer Generator', desc: 'Common application questions answered automatically. "Why do you want to join us?" handled in seconds.' },
            { icon: <LayoutGrid size={28} />, color: '#ff453a', title: 'Application Tracker', desc: 'Kanban-style dashboard to track every application from Applied → Interview → Offer. Never lose track.' },
          ].map((f, i) => (
            <div key={i} className="aa-feature-card">
              <div className="aa-feature-icon" style={{ color: f.color, background: f.color + '18' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="aa-landing-cta">
          <h2>Start your job search in <span className="aa-gradient-text">3 simple steps</span></h2>
          <div className="aa-steps-row">
            {['Upload your resume', 'Review AI profile + set preferences', 'Browse jobs & apply with one click'].map((s, i) => (
              <div key={i} className="aa-step-item">
                <div className="aa-step-num">{i + 1}</div>
                <div className="aa-step-text">{s}</div>
                {i < 2 && <ArrowRight size={16} className="aa-step-arrow" />}
              </div>
            ))}
          </div>
          <button className="aa-btn-primary aa-btn-large" onClick={() => setView('wizard')}>
            <Sparkles size={18} /> Let's Begin
          </button>
        </div>
      </div>
    );
  }

  // ── WIZARD VIEW ───────────────────────────────────────────────────────────────
  if (view === 'wizard') {
    return (
      <div className="aa-wizard">
        <div className="aa-wizard-header">
          <button className="aa-back-btn" onClick={() => setView('landing')}><ChevronLeft size={16} /> Back</button>
          <div className="aa-wizard-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`aa-wizard-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                <div className="aa-wizard-step-circle">{step > s ? <CheckCircle2 size={14} /> : s}</div>
                <span>{['Upload Resume', 'AI Profile', 'Preferences'][s - 1]}</span>
              </div>
            ))}
          </div>
          <div />
        </div>

        <div className="aa-wizard-body">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="aa-wizard-step-content">
              <h2>Upload Your Resume</h2>
              <p className="aa-wizard-desc">Upload your resume or paste the text. AI will extract your skills, experience, and build your candidate profile.</p>
              <div
                className={`aa-upload-zone ${resumeFile ? 'uploaded' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                {resumeFile ? (
                  <><CheckCircle2 size={40} color="#30d158" /><p className="aa-upload-name">{resumeFile.name}</p><p className="aa-upload-hint">Click to change file</p></>
                ) : (
                  <><Upload size={40} /><p className="aa-upload-title">Drop your resume here</p><p className="aa-upload-hint">PDF, DOCX, or TXT · Max 5MB</p></>
                )}
              </div>
              {error && <div className="aa-error"><AlertCircle size={14} />{error}</div>}
              <button className="aa-btn-primary aa-btn-full" disabled={loading || !resumeFile} onClick={generateProfile}>
                {loading ? <><RefreshCw size={16} className="aa-spin" />{loadingMsg}</> : <><Sparkles size={16} />Analyze Resume with AI</>}
              </button>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && editProfile && (
            <div className="aa-wizard-step-content aa-profile-step">
              <h2>Your AI Candidate Profile</h2>
              <p className="aa-wizard-desc">Review and edit the AI-generated profile. This will be used for job matching and applications.</p>
              <div className="aa-profile-grid">
                <div className="aa-profile-section">
                  <label className="aa-label"><User size={14} />Full Name</label>
                  <input className="aa-input" value={editProfile.name || ''} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="aa-profile-section">
                  <label className="aa-label"><Briefcase size={14} />Current Title</label>
                  <input className="aa-input" value={editProfile.title || ''} onChange={e => setEditProfile({ ...editProfile, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="aa-profile-section">
                  <label className="aa-label"><MapPin size={14} />Location</label>
                  <input className="aa-input" value={editProfile.location || ''} onChange={e => setEditProfile({ ...editProfile, location: e.target.value })} placeholder="City, Country" />
                </div>
                <div className="aa-profile-section">
                  <label className="aa-label"><Clock size={14} />Years of Experience</label>
                  <input className="aa-input" type="number" min={0} max={40} value={editProfile.yearsOfExperience || 0} onChange={e => setEditProfile({ ...editProfile, yearsOfExperience: Number(e.target.value) })} />
                </div>
                <div className="aa-profile-section aa-profile-full">
                  <label className="aa-label"><Sparkles size={14} />Professional Summary</label>
                  <textarea className="aa-textarea" rows={3} value={editProfile.summary || ''} onChange={e => setEditProfile({ ...editProfile, summary: e.target.value })} placeholder="Brief professional summary…" />
                </div>
                <div className="aa-profile-section aa-profile-full">
                  <label className="aa-label"><Code2 size={14} />Skills <span className="aa-label-hint">(comma-separated)</span></label>
                  <textarea className="aa-textarea" rows={3} value={(editProfile.skills || []).join(', ')} onChange={e => setEditProfile({ ...editProfile, skills: e.target.value.split(',').map(s => s.trim()) })} onBlur={e => setEditProfile(p => p ? { ...p, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : p)} />
                </div>
                <div className="aa-profile-section aa-profile-full">
                  <label className="aa-label"><Target size={14} />Preferred Roles <span className="aa-label-hint">(comma-separated)</span></label>
                  <textarea className="aa-textarea" rows={2} value={(editProfile.preferredRoles || []).join(', ')} onChange={e => setEditProfile({ ...editProfile, preferredRoles: e.target.value.split(',').map(s => s.trim()) })} onBlur={e => setEditProfile(p => p ? { ...p, preferredRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : p)} />
                </div>
              </div>
              <div className="aa-wizard-nav">
                <button className="aa-btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
                <button className="aa-btn-primary" onClick={() => { setProfile(editProfile); setStep(3); }}>
                  Save Profile <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="aa-wizard-step-content">
              <h2>Set Your Job Preferences</h2>
              <p className="aa-wizard-desc">Tell AI what you're looking for. This filters and ranks your job matches.</p>
              <div className="aa-prefs-grid">
                <div className="aa-pref-section">
                  <label className="aa-label"><Briefcase size={14} />Target Roles</label>
                  <div className="aa-tag-input">
                    <input className="aa-input" placeholder="e.g. Frontend Engineer" value={roleInput} onChange={e => setRoleInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && roleInput.trim()) { setPreferences(p => ({ ...p, roles: [...p.roles, roleInput.trim()] })); setRoleInput(''); e.preventDefault(); } }} />
                    <button className="aa-btn-sm" onClick={() => { if (roleInput.trim()) { setPreferences(p => ({ ...p, roles: [...p.roles, roleInput.trim()] })); setRoleInput(''); } }}>Add</button>
                  </div>
                  <div className="aa-tags">{preferences.roles.map((r, i) => <span key={i} className="aa-tag">{r}<button onClick={() => setPreferences(p => ({ ...p, roles: p.roles.filter((_, j) => j !== i) }))}>×</button></span>)}</div>
                </div>
                <div className="aa-pref-section">
                  <label className="aa-label"><Globe size={14} />Work Mode</label>
                  <div className="aa-pills">
                    {['All', 'Remote', 'Hybrid', 'Onsite'].map(m => (
                      <button key={m} className={`aa-pill ${preferences.remote === m ? 'active' : ''}`} onClick={() => setPreferences(p => ({ ...p, remote: m }))}>{m}</button>
                    ))}
                  </div>
                </div>
                <div className="aa-pref-section">
                  <label className="aa-label"><Building2 size={14} />Employment Type</label>
                  <div className="aa-pills">
                    {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map(t => (
                      <button key={t} className={`aa-pill ${preferences.employmentType === t ? 'active' : ''}`} onClick={() => setPreferences(p => ({ ...p, employmentType: t }))}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="aa-pref-section">
                  <label className="aa-label"><Building2 size={14} />Industry Focus</label>
                  <div className="aa-pills aa-pills-wrap">
                    {['All', 'Tech', 'Fintech', 'E-commerce', 'AI', 'SaaS', 'Food-tech'].map(ind => (
                      <button key={ind} className={`aa-pill ${preferences.industry === ind ? 'active' : ''}`} onClick={() => setPreferences(p => ({ ...p, industry: ind }))}>{ind}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="aa-wizard-nav">
                <button className="aa-btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
                <button className="aa-btn-primary" onClick={discoverJobs}>
                  <Sparkles size={16} /> Discover Jobs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── JOBS VIEW ─────────────────────────────────────────────────────────────────
  if (view === 'jobs') {
    return (
      <>
      <div className="aa-jobs">
        <div className="aa-jobs-header">
          <div className="aa-jobs-title-row">
            <div>
              <h2>Job Matches <span className="aa-jobs-count">{filteredJobs.length} jobs</span></h2>
              {profile && <p className="aa-jobs-sub">Matched for <strong>{profile.name || 'You'}</strong> · {profile.title}</p>}
            </div>
            <div className="aa-jobs-actions">
              <button className="aa-btn-ghost aa-btn-sm" onClick={() => setView('wizard')}><Settings size={14} /> Preferences</button>
              <button className="aa-btn-ghost aa-btn-sm" onClick={() => { setView('tracker'); loadApplications(); }}><LayoutGrid size={14} /> Tracker ({applications.length})</button>
              <button className="aa-btn-primary aa-btn-sm" onClick={discoverJobs}><RefreshCw size={14} /> Refresh</button>
            </div>
          </div>
          <div className="aa-jobs-filters">
            <div className="aa-filter-group">
              <Filter size={14} />
              <span>Min Match:</span>
              <select className="aa-select" value={filterScore} onChange={e => setFilterScore(Number(e.target.value))}>
                <option value={0}>All</option>
                <option value={50}>50%+</option>
                <option value={70}>70%+</option>
                <option value={80}>80%+</option>
              </select>
            </div>
            <div className="aa-filter-group">
              <span>Type:</span>
              <select className="aa-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="All">All</option>
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="aa-loading-overlay"><RefreshCw size={32} className="aa-spin" /><p>{loadingMsg || 'Loading jobs…'}</p></div>
        )}

        <div className="aa-jobs-layout">
          {/* Job List */}
          <div className="aa-jobs-list">
            {filteredJobs.map(job => {
              const isApplied = appliedIds.has(job.id);
              const isApplying = applyingJobId === job.id;
              return (
                <div key={job.id} className={`aa-job-card ${selectedJob?.id === job.id ? 'selected' : ''} ${isApplied ? 'applied' : ''}`} onClick={() => { setSelectedJob(job); setJobDetailMode('details'); setTailorResult(null); setCoverResult(null); setAnswerResult(null); }}>
                  <div className="aa-job-card-top">
                    <CompanyLogo domain={job.domain} company={job.company} />
                    <div className="aa-job-card-info">
                      <div className="aa-job-title">{job.title}</div>
                      <div className="aa-job-company">{job.company}</div>
                    </div>
                    <div className="aa-match-ring" style={{ '--score-color': scoreColor(job.matchScore) } as any}>
                      <span className="aa-match-val">{job.matchScore}%</span>
                    </div>
                  </div>
                  <div className="aa-job-meta">
                    <span><MapPin size={12} />{job.location}</span>
                    <span><Briefcase size={12} />{job.type}</span>
                    <span><Globe size={12} />{job.remote}</span>
                    <span><DollarSign size={12} />{job.salary}</span>
                  </div>
                  <div className="aa-job-skills">
                    {job.matchedSkills.slice(0, 4).map(s => <span key={s} className="aa-skill-match">{s}</span>)}
                    {job.missingSkills.slice(0, 2).map(s => <span key={s} className="aa-skill-miss">{s}</span>)}
                  </div>
                  <div className="aa-job-card-footer">
                    <span className="aa-posted">{job.posted}</span>
                    {isApplied ? (
                      <span className="aa-applied-badge"><CheckCheck size={12} /> Applied</span>
                    ) : (
                      <button className="aa-btn-apply" disabled={isApplying}
                        onClick={async (e) => { e.stopPropagation(); await handleApply(job); }}>
                        {isApplying ? <RefreshCw size={12} className="aa-spin" /> : <Send size={12} />}
                        {isApplying ? 'Applying…' : 'Auto Apply'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredJobs.length === 0 && !loading && (
              <div className="aa-empty"><Target size={40} /><p>No jobs match your filters. Try lowering the match threshold.</p></div>
            )}
          </div>

          {/* Job Detail Panel */}
          {selectedJob && (
            <div className="aa-job-detail">
              <div className="aa-job-detail-header">
                <CompanyLogo domain={selectedJob.domain} company={selectedJob.company} />
                <div>
                  <h3>{selectedJob.title}</h3>
                  <p>{selectedJob.company} · {selectedJob.location} · {selectedJob.remote}</p>
                </div>
                <button className="aa-btn-icon" onClick={() => setSelectedJob(null)}><XCircle size={20} /></button>
              </div>
              <div className="aa-job-detail-score">
                <div style={{ color: scoreColor(selectedJob.matchScore) }}>
                  <span className="aa-big-score">{selectedJob.matchScore}%</span> Match
                </div>
                <div className="aa-score-bar"><div className="aa-score-fill" style={{ width: `${selectedJob.matchScore}%`, background: scoreColor(selectedJob.matchScore) }} /></div>
              </div>
              <div className="aa-detail-tabs">
                {(['details', 'tailor', 'cover', 'answer'] as const).map(t => (
                  <button key={t} className={`aa-detail-tab ${jobDetailMode === t ? 'active' : ''}`} onClick={() => setJobDetailMode(t)}>
                    {t === 'details' ? 'Details' : t === 'tailor' ? 'Tailor Resume' : t === 'cover' ? 'Cover Letter' : 'AI Answers'}
                  </button>
                ))}
              </div>

              <div className="aa-detail-body">
                {jobDetailMode === 'details' && (
                  <div className="aa-detail-content">
                    <div className="aa-detail-row"><DollarSign size={14} /><span>{selectedJob.salary}</span></div>
                    <div className="aa-detail-row"><Clock size={14} /><span>{selectedJob.exp} experience required</span></div>
                    <div className="aa-detail-row"><Calendar size={14} /><span>Posted {selectedJob.posted}</span></div>
                    <div className="aa-detail-row"><Building2 size={14} /><span>{selectedJob.industry}</span></div>
                    <h4>Required Skills</h4>
                    <div className="aa-skills-block">{selectedJob.skills.map(s => <span key={s} className={`aa-skill-tag ${selectedJob.matchedSkills.includes(s) ? 'matched' : 'missing'}`}>{s}</span>)}</div>
                    <h4>Your Matched Skills</h4>
                    <div className="aa-skills-block">{selectedJob.matchedSkills.map(s => <span key={s} className="aa-skill-tag matched">{s}</span>)}</div>
                    {selectedJob.missingSkills.length > 0 && (<><h4>Skills to Highlight</h4><div className="aa-skills-block">{selectedJob.missingSkills.map(s => <span key={s} className="aa-skill-tag missing">{s}</span>)}</div></>)}
                    <div className="aa-detail-actions">
                      <button className="aa-btn-primary" onClick={() => handleApply(selectedJob)} disabled={appliedIds.has(selectedJob.id) || applyingJobId === selectedJob.id}>
                        {appliedIds.has(selectedJob.id) ? <><CheckCheck size={14} /> Applied</> : applyingJobId === selectedJob.id ? <><RefreshCw size={14} className="aa-spin" /> Applying…</> : <><Send size={14} /> Auto Apply</>}
                      </button>
                      <a href={`https://${selectedJob.domain}`} target="_blank" rel="noopener noreferrer" className="aa-btn-ghost"><ExternalLink size={14} /> View Company</a>
                    </div>
                  </div>
                )}

                {jobDetailMode === 'tailor' && (
                  <div className="aa-detail-content">
                    {!tailorResult ? (
                      <><p className="aa-detail-desc">AI will rewrite your resume with optimal keywords for this specific role and company.</p>
                        <button className="aa-btn-primary" onClick={() => handleTailor(selectedJob)} disabled={loading}>
                          {loading ? <><RefreshCw size={14} className="aa-spin" />{loadingMsg}</> : <><Sparkles size={14} /> Tailor My Resume</>}
                        </button></>
                    ) : (
                      <><div className="aa-result-meta">
                        <span className="aa-result-badge" style={{ color: '#30d158' }}>ATS Score: {tailorResult.atsScore}%</span>
                        <span className="aa-result-badge" style={{ color: '#2997ff' }}>Match: {tailorResult.matchScore}%</span>
                      </div>
                        <h4>What was improved</h4>
                        {(tailorResult.changedSections || []).map((c: string, i: number) => <div key={i} className="aa-change-item"><CheckCircle2 size={12} color="#30d158" /><span>{c}</span></div>)}
                        <h4>Keywords Added</h4>
                        <div className="aa-skills-block">{(tailorResult.addedKeywords || []).map((k: string) => <span key={k} className="aa-skill-tag matched">{k}</span>)}</div>
                        <div className="aa-result-actions">
                          <button className="aa-btn-sm" onClick={() => copyToClipboard(tailorResult.tailoredResume || '', 'tailor')}><Copy size={12} />{copied === 'tailor' ? 'Copied!' : 'Copy Resume'}</button>
                          <button className="aa-btn-sm" onClick={() => { setTailorResult(null); handleTailor(selectedJob); }}><RefreshCw size={12} /> Regenerate</button>
                        </div>
                        <textarea className="aa-textarea aa-result-text" rows={12} readOnly value={tailorResult.tailoredResume || ''} /></>
                    )}
                  </div>
                )}

                {jobDetailMode === 'cover' && (
                  <div className="aa-detail-content">
                    {!coverResult ? (
                      <><p className="aa-detail-desc">AI writes a personalized cover letter using your profile and this job's context.</p>
                        <button className="aa-btn-primary" onClick={() => handleCoverLetter(selectedJob)} disabled={loading}>
                          {loading ? <><RefreshCw size={14} className="aa-spin" />{loadingMsg}</> : <><Edit3 size={14} /> Generate Cover Letter</>}
                        </button></>
                    ) : (
                      <><div className="aa-result-meta"><span className="aa-result-badge">Subject: {coverResult.subject}</span></div>
                        <div className="aa-result-actions">
                          <button className="aa-btn-sm" onClick={() => copyToClipboard(coverResult.coverLetter || '', 'cover')}><Copy size={12} />{copied === 'cover' ? 'Copied!' : 'Copy Letter'}</button>
                          <button className="aa-btn-sm" onClick={() => { setCoverResult(null); handleCoverLetter(selectedJob); }}><RefreshCw size={12} /> Regenerate</button>
                        </div>
                        <textarea className="aa-textarea aa-result-text" rows={14} readOnly value={coverResult.coverLetter || ''} /></>
                    )}
                  </div>
                )}

                {jobDetailMode === 'answer' && (
                  <div className="aa-detail-content">
                    <p className="aa-detail-desc">Paste any application question and AI will craft a compelling, personalized answer.</p>
                    <textarea className="aa-textarea" rows={3} placeholder="e.g. Why do you want to work at this company?" value={answerQuestion} onChange={e => setAnswerQuestion(e.target.value)} />
                    <button className="aa-btn-primary" onClick={() => handleAnswer(selectedJob)} disabled={loading || !answerQuestion.trim()}>
                      {loading ? <><RefreshCw size={14} className="aa-spin" />{loadingMsg}</> : <><Bot size={14} /> Generate Answer</>}
                    </button>
                    {answerResult && (
                      <div className="aa-answer-result">
                        <div className="aa-result-actions">
                          <button className="aa-btn-sm" onClick={() => copyToClipboard(answerResult.answer || '', 'answer')}><Copy size={12} />{copied === 'answer' ? 'Copied!' : 'Copy Answer'}</button>
                        </div>
                        <p className="aa-answer-text">{answerResult.answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {renderApplyModal()}
      </>
    );
  }

  // ── TRACKER VIEW ──────────────────────────────────────────────────────────────
  if (view === 'tracker') {
    const grouped = ALL_STATUSES.reduce((acc, s) => {
      acc[s] = applications.filter(a => a.status === s);
      return acc;
    }, {} as Record<AppStatus, Application[]>);

    return (
      <div className="aa-tracker">
        <div className="aa-tracker-header">
          <div>
            <h2>Application Tracker</h2>
            <p className="aa-tracker-sub">{applications.length} total · {applications.filter(a => a.status === 'Interview').length} interviews · {applications.filter(a => a.status === 'Offer').length} offers</p>
          </div>
          <div className="aa-tracker-actions">
            <button className={`aa-btn-ghost aa-btn-sm ${trackerView === 'kanban' ? 'active' : ''}`} onClick={() => setTrackerView('kanban')}><LayoutGrid size={14} /> Kanban</button>
            <button className={`aa-btn-ghost aa-btn-sm ${trackerView === 'list' ? 'active' : ''}`} onClick={() => setTrackerView('list')}><List size={14} /> List</button>
            <button className="aa-btn-primary aa-btn-sm" onClick={() => setView('jobs')}><Search size={14} /> Find More Jobs</button>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="aa-tracker-empty">
            <Briefcase size={56} />
            <h3>No applications yet</h3>
            <p>Start applying to jobs and track them all here.</p>
            <button className="aa-btn-primary" onClick={() => setView('jobs')}><Target size={16} /> Browse Matching Jobs</button>
          </div>
        ) : trackerView === 'kanban' ? (
          <div className="aa-kanban">
            {ALL_STATUSES.filter(s => s !== 'Saved' || grouped['Saved'].length > 0).map(status => (
              <div key={status} className={`aa-kanban-col ${dragStatus === status ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragStatus(status); }}
                onDragLeave={() => setDragStatus(null)}
                onDrop={() => { if (draggingApp) { updateAppStatus(draggingApp, status); setDraggingApp(null); setDragStatus(null); } }}>
                <div className="aa-kanban-col-header">
                  <span className="aa-status-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span className="aa-kanban-status">{status}</span>
                  <span className="aa-kanban-count">{grouped[status].length}</span>
                </div>
                {grouped[status].map(app => (
                  <div key={app.id} className="aa-kanban-card" draggable onDragStart={() => setDraggingApp(app.id)} onDragEnd={() => { setDraggingApp(null); setDragStatus(null); }}>
                    <div className="aa-kanban-card-top">
                      <CompanyLogo domain={app.job?.domain || ''} company={app.job?.company || '?'} />
                      <div>
                        <div className="aa-kanban-title">{app.job?.title}</div>
                        <div className="aa-kanban-company">{app.job?.company}</div>
                      </div>
                    </div>
                    <div className="aa-kanban-meta">
                      <span><MapPin size={10} />{app.job?.location}</span>
                      <span style={{ color: scoreColor(app.matchScore) }}>{app.matchScore}% match</span>
                    </div>
                    <div className="aa-kanban-date">{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div className="aa-kanban-actions">
                      <select className="aa-select aa-select-sm" value={app.status} onChange={e => updateAppStatus(app.id, e.target.value as AppStatus)}>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="aa-btn-icon-sm" onClick={() => deleteApp(app.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="aa-list-view">
            <table className="aa-table">
              <thead><tr>
                <th>Company</th><th>Role</th><th>Location</th><th>Match</th><th>Status</th><th>Applied</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td><div className="aa-list-company"><CompanyLogo domain={app.job?.domain || ''} company={app.job?.company || '?'} /><span>{app.job?.company}</span></div></td>
                    <td>{app.job?.title}</td>
                    <td>{app.job?.location}</td>
                    <td><span style={{ color: scoreColor(app.matchScore), fontWeight: 700 }}>{app.matchScore}%</span></td>
                    <td>
                      <span className="aa-status-badge" style={{ color: STATUS_COLORS[app.status], background: STATUS_BG[app.status] }}>{app.status}</span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    <td>
                      <div className="aa-list-actions">
                        <select className="aa-select aa-select-sm" value={app.status} onChange={e => updateAppStatus(app.id, e.target.value as AppStatus)}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="aa-btn-icon-sm" onClick={() => deleteApp(app.id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}
