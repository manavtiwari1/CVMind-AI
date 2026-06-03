import { useState, useEffect } from 'react';
import { Copy, Check, Linkedin, ArrowRight, RefreshCw, Zap, Clock, Lightbulb } from 'lucide-react';
import './LinkedInPost.css';

interface LinkedInPostProps {
  customApiKey: string;
  resumeText: string;
  loadedWork?: any;
  setLoadedWork?: (work: any) => void;
}

const TONES = [
  { id: 'Professional', label: '💼 Professional', desc: 'Formal & data-driven' },
  { id: 'Storytelling', label: '📖 Storytelling', desc: 'Personal narrative arc' },
  { id: 'Witty & Bold', label: '⚡ Bold & Punchy', desc: 'Hook-based, viral' },
];

export default function LinkedInPost({ customApiKey, resumeText, loadedWork, setLoadedWork }: LinkedInPostProps) {
  const [topic, setTopic] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tone, setTone] = useState('Professional');
  const [useResume, setUseResume] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<number>(0);

  useEffect(() => {
    if (loadedWork?.type === 'linkedin-post') {
      try {
        const parsed = JSON.parse(loadedWork.htmlContent);
        setTopic(parsed.topic || '');
        setJobTitle(parsed.jobTitle || '');
        setTone(parsed.tone || 'Professional');
        setResult(parsed.result || null);
      } catch {}
    }
    if (loadedWork?.deleted) reset();
  }, [loadedWork]);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reset = () => {
    setResult(null); setTopic(''); setJobTitle(''); setTone('Professional');
    if (setLoadedWork) setLoadedWork(null);
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !jobTitle.trim()) {
      setErrorMsg('Topic and Job Title are required.'); return;
    }
    setLoading(true); setErrorMsg(null); setResult(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
      const userStr = localStorage.getItem('cvmind_user');
      let userId = '';
      if (userStr) { try { const u = JSON.parse(userStr); userId = u.id || u._id || ''; } catch {} }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-gemini-key'] = customApiKey;

      const res = await fetch(`${baseUrl}/api/linkedin/post`, {
        method: 'POST', headers,
        body: JSON.stringify({ topic, jobTitle, tone, resumeText: useResume ? resumeText : '', userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setResult(data.data);
      if (data.work && setLoadedWork) setLoadedWork(data.work);
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getPostGradient = (idx: number) => {
    const gradients = [
      'linear-gradient(135deg, rgba(41,151,255,0.08) 0%, rgba(99,102,241,0.04) 100%)',
      'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(236,72,153,0.04) 100%)',
      'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.04) 100%)',
    ];
    return gradients[idx % gradients.length];
  };
  const getPostAccent = (idx: number) => {
    return ['#2997ff', '#a78bfa', '#10b981'][idx % 3];
  };

  return (
    <div className="lp-container animate-fade-in-up">
      <div className="glow-ambient" style={{ top: '10%', left: '5%', background: 'radial-gradient(circle, rgba(41,151,255,0.12) 0%, transparent 70%)' }} />
      <div className="glow-ambient" style={{ bottom: '20%', right: '5%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="lp-header">
        <div className="lp-title-section">
          <div className="lp-badge">
            <Linkedin size={13} style={{ fill: 'currentColor' }} /> LinkedIn Post Generator
          </div>
          <h1 className="lp-title-text">AI LinkedIn Post Generator</h1>
          <p className="lp-subtitle-text">
            Turn your achievements into viral LinkedIn posts. AI crafts 3 unique styles — professional, storytelling & punchy — ready to copy & post.
          </p>
        </div>
        {result && (
          <button className="btn-secondary" onClick={reset}>
            <RefreshCw size={14} /> New Post
          </button>
        )}
      </div>

      <div className="lp-content">
        {!loading && !result && (
          <div className="lp-form-card glass-card">
            <div className="lp-form-info">
              <h3>What do you want to post about?</h3>
              <p>Describe your achievement, insight, or topic and let AI write 3 viral LinkedIn posts.</p>
            </div>

            <div className="lp-form">
              <div className="form-group">
                <label>Your Achievement / Topic *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Just got promoted to Senior Engineer after 2 years, led a team that shipped a feature used by 1M users..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="form-control-input lp-textarea"
                />
              </div>

              <div className="form-group">
                <label>Your Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer, Product Manager..."
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="form-control-input"
                />
              </div>

              <div className="form-group">
                <label>Post Tone</label>
                <div className="lp-tone-selector">
                  {TONES.map(t => (
                    <button
                      key={t.id}
                      className={`lp-tone-btn${tone === t.id ? ' active' : ''}`}
                      onClick={() => setTone(t.id)}
                    >
                      <span className="tone-label">{t.label}</span>
                      <span className="tone-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {resumeText && (
                <div className="lp-resume-toggle">
                  <input type="checkbox" id="lpResumeCheck" checked={useResume} onChange={e => setUseResume(e.target.checked)} />
                  <label htmlFor="lpResumeCheck">Include resume context for better personalization</label>
                </div>
              )}

              {errorMsg && (
                <div className="lp-error">⚠️ {errorMsg}</div>
              )}

              <button className="btn-primary lp-generate-btn" onClick={handleGenerate}>
                <Zap size={16} /> Generate 3 LinkedIn Posts <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="lp-loading glass-card">
            <div className="lp-loading-orbs">
              <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
            </div>
            <h3>Crafting viral LinkedIn posts...</h3>
            <p className="animate-pulse">AI is writing 3 unique post styles with hooks, emojis & hashtags</p>
          </div>
        )}

        {result && (
          <div className="lp-results">
            {/* Tips bar */}
            <div className="lp-tips-bar glass-card">
              <div className="lp-tip-item">
                <Clock size={14} />
                <span><strong>Best Time:</strong> {result.bestTimeToPost}</span>
              </div>
              <div className="lp-tip-divider" />
              <div className="lp-tip-item">
                <Lightbulb size={14} />
                <span><strong>Tip:</strong> {result.engagementTip}</span>
              </div>
            </div>

            {/* Posts */}
            <div className="lp-posts-grid">
              {(result.posts || []).map((post: any, idx: number) => (
                <div
                  key={idx}
                  className={`lp-post-card glass-card${expandedPost === idx ? ' expanded' : ''}`}
                  style={{ background: getPostGradient(idx), borderColor: `${getPostAccent(idx)}33` }}
                >
                  <div className="lp-post-header">
                    <div className="lp-post-meta">
                      <span className="lp-post-style" style={{ color: getPostAccent(idx), borderColor: `${getPostAccent(idx)}44`, background: `${getPostAccent(idx)}12` }}>
                        Post {idx + 1} · {post.style}
                      </span>
                    </div>
                    <button
                      className="lp-copy-btn"
                      onClick={() => copy(post.content, `post-${idx}`)}
                      style={{ color: getPostAccent(idx), borderColor: `${getPostAccent(idx)}44`, background: `${getPostAccent(idx)}12` }}
                    >
                      {copiedId === `post-${idx}` ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Post</>}
                    </button>
                  </div>

                  <div className="lp-post-hook" style={{ borderLeftColor: getPostAccent(idx) }}>
                    <span className="hook-label">Hook:</span> {post.hook}
                  </div>

                  <div className="lp-post-content" style={{ maxHeight: expandedPost === idx ? 'none' : '120px' }}>
                    {post.content}
                  </div>
                  <button className="lp-expand-btn" onClick={() => setExpandedPost(expandedPost === idx ? -1 : idx)}>
                    {expandedPost === idx ? '▲ Show less' : '▼ Read full post'}
                  </button>

                  <div className="lp-post-hashtags">
                    {(post.hashtags || []).map((tag: string, ti: number) => (
                      <span key={ti} className="lp-hashtag" style={{ color: getPostAccent(idx), background: `${getPostAccent(idx)}12`, borderColor: `${getPostAccent(idx)}33` }}>
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                    <button
                      className="lp-copy-hashtags"
                      onClick={() => copy((post.hashtags || []).join(' '), `hashtags-${idx}`)}
                    >
                      {copiedId === `hashtags-${idx}` ? <Check size={11} /> : <Copy size={11} />} Copy hashtags
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
