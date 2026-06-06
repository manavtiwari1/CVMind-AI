import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, ShieldAlert, Cpu, ArrowRight, ShieldCheck, Lock, Search, BarChart3, Sparkles, Wand2, FileDown, Pencil, Rocket, Brain, Target, Linkedin, Scissors, Map, Mic } from 'lucide-react';
import './Home.css';
import './HomeCarousel.css';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setAnalysisResult: (result: any) => void;
  setResumeText: (text: string) => void;
  customApiKey: string;
}

// June 17 2026, 17:00:00 IST = UTC+5:30 → UTC time = 11:30:00
const LAUNCH_DATE = new Date('2026-06-17T11:30:00Z');

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Product cards data ───────────────────────────────────────────────────
const homeProducts = [
  {
    id: 'resume-checker', icon: 'brain', title: 'AI Resume Checker', tagline: 'Beat Every ATS System',
    desc: 'Corporate-grade AI audits your resume for formatting, keyword gaps, and delivers professional rewrites.',
    features: ['ATS Score 0–100', 'Keyword Gap Analysis', 'Bullet Rewriter', 'Before & After View'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'Most Popular', badgeClass: 'badge-blue',
    stats: [{ label: 'Score Boost', value: '+42%' }, { label: 'Keywords', value: '18+' }], page: 'dashboard',
  },
  {
    id: 'interview-prep', icon: 'target', title: 'AI Interview Prep', tagline: 'Ace Every Interview',
    desc: 'Simulate behavioral questions, get STAR-framework coaching, and score your answers with instant AI feedback.',
    features: ['Behavioral Simulator', 'STAR Framework', 'Real-time Scoring', 'Voice Mode'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'AI-Powered', badgeClass: 'badge-blue',
    stats: [{ label: 'Questions', value: '500+' }, { label: 'Pass Rate', value: '89%' }], page: 'prep',
  },
  {
    id: 'linkedin', icon: 'linkedin', title: 'LinkedIn Optimizer', tagline: 'Get Noticed by Recruiters',
    desc: 'AI-generated bios, outreach messages, and viral posts that attract recruiters and build your personal brand.',
    features: ['Bio Generator', 'Outreach Writer', 'Viral Post Creator', 'Headline Optimizer'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'New', badgeClass: 'badge-blue',
    stats: [{ label: 'Profile Views', value: '3×' }, { label: 'Connection Rate', value: '+67%' }], page: 'linkedin',
  },
  {
    id: 'tailor', icon: 'scissors', title: 'Resume Tailor', tagline: 'Match Any Job Description',
    desc: 'Upload a job description and AI instantly aligns your resume — keywords, skills, achievements — for max ATS score.',
    features: ['JD Keyword Match', 'Skills Gap Detector', 'Achievement Rewriter', 'Match Score %'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'Smart', badgeClass: 'badge-blue',
    stats: [{ label: 'Accuracy', value: '96%' }, { label: 'Time Saved', value: '2hrs' }], page: 'tailor',
  },
  {
    id: 'career-roadmap', icon: 'map', title: 'Career Roadmap', tagline: 'Plan Your Next 5 Years',
    desc: 'Personalized AI career roadmap with step-by-step milestones, certifications, and skill progression paths.',
    features: ['Goal-based Planning', 'Certification Paths', 'Skill Milestones', 'Timeline View'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'Premium', badgeClass: 'badge-blue',
    stats: [{ label: 'Career Paths', value: '50+' }, { label: 'Satisfaction', value: '4.9★' }], page: 'career-roadmap',
  },
  {
    id: 'voice-prep', icon: 'mic', title: 'Voice Interview Coach', tagline: 'Speak Like a Pro',
    desc: 'Practice interviews aloud. AI transcribes, detects filler words, scores confidence, and gives real-time coaching.',
    features: ['Live Transcription', 'Filler Word Detector', 'Confidence Score', 'Instant Feedback'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'Live AI', badgeClass: 'badge-blue',
    stats: [{ label: 'Accuracy', value: '98%' }, { label: 'Improvement', value: '+31%' }], page: 'voice-prep',
  },
  {
    id: 'job-finder', icon: 'search', title: 'AI Job Finder', tagline: 'Match Jobs to Your CV',
    desc: 'Match your CV against target roles to find 8–10 curated job openings complete with match scores, skills gap lists, and direct apply links.',
    features: ['CV-to-Job Matching', 'Multi-Platform Links', 'Skills Gap Analysis', 'Salary Estimates'],
    gradient: 'linear-gradient(135deg, #2997ff 0%, #5ac8fa 100%)',
    glow: 'rgba(41,151,255,0.45)', color: '#2997ff', badge: 'New Tool', badgeClass: 'badge-blue',
    stats: [{ label: 'Match Accuracy', value: '95%' }, { label: 'Curated Jobs', value: '8-10' }], page: 'job-finder',
  },
];

const getProductIcon = (iconName: string) => {
  switch (iconName) {
    case 'brain': return <Brain className="hpc-card-icon-svg" />;
    case 'target': return <Target className="hpc-card-icon-svg" />;
    case 'linkedin': return <Linkedin className="hpc-card-icon-svg" />;
    case 'scissors': return <Scissors className="hpc-card-icon-svg" />;
    case 'map': return <Map className="hpc-card-icon-svg" />;
    case 'mic': return <Mic className="hpc-card-icon-svg" />;
    case 'search': return <Search className="hpc-card-icon-svg" />;
    default: return null;
  }
};


function HomeProductCarousel({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = homeProducts.length;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startAutoRotate = () => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, 3500);
  };

  const stopAutoRotate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoRotate();
    return () => stopAutoRotate();
  }, []);

  useEffect(() => {
    if (isHovered) {
      stopAutoRotate();
    } else {
      stopAutoRotate();
      startAutoRotate();
    }
  }, [isHovered]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    stopAutoRotate();
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragStartX;
    setRotationOffset(delta * 0.45);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = clientX - dragStartX;
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        setActiveIndex(prev => (prev + 1) % total);
      } else {
        setActiveIndex(prev => (prev - 1 + total) % total);
      }
    }
    setRotationOffset(0);
    if (!isHovered) startAutoRotate();
  };

  const getCardStyle = (index: number) => {
    const angleStep = 360 / total;
    const angle = ((index - activeIndex) * angleStep + rotationOffset + 360) % 360;
    const normalizedAngle = angle > 180 ? angle - 360 : angle;

    const isMobile = windowWidth < 600;
    const radius = isMobile ? 120 : 240;
    const radians = (normalizedAngle * Math.PI) / 180;
    const x = Math.sin(radians) * radius * (isMobile ? 0.85 : 1.15); // Spread cards further out horizontally
    const z = Math.cos(radians) * radius;

    const scale = isMobile
      ? (0.75 + ((z + radius) / (2 * radius)) * 0.28)
      : (0.72 + ((z + radius) / (2 * radius)) * 0.33); // Active center is ~1.03, side is ~0.94, back is ~0.72

    const isBackCard = Math.abs(normalizedAngle) > 80;
    const opacity = isMobile && isBackCard
      ? 0
      : (0.3 + ((z + radius) / (2 * radius)) * 0.7);

    const pointerEvents = isMobile && isBackCard ? 'none' : 'auto';
    const zIndex = Math.round(scale * 100);

    return {
      transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
      opacity,
      zIndex,
      pointerEvents,
      transition: isDragging ? 'none' : 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <section className="hpc-section">
      <div className="hpc-heading">
        <span className="hpc-eyebrow"><span className="hpc-dot" />Our AI Tools</span>
        <h2 className="hpc-title">Everything You Need to <span className="hpc-title-grad">Land the Job</span></h2>
      </div>

      <div
        className="hpc-carousel-scene"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsDragging(false); setRotationOffset(0); }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="hpc-carousel-glow"
          style={{ background: homeProducts[activeIndex].glow }}
        />

        <div className="hpc-carousel-3d">
          {homeProducts.map((p, index) => (
            <div
              key={p.id}
              className={`hpc-flip-card ${index === activeIndex ? 'active' : ''}`}
              style={{
                ...getCardStyle(index),
                '--card-glow': p.glow,
                '--card-color': p.color
              } as React.CSSProperties}
              onClick={() => {
                if (index !== activeIndex) {
                  stopAutoRotate();
                  setActiveIndex(index);
                  setTimeout(() => { if (!isHovered) startAutoRotate(); }, 4000);
                }
              }}
            >
              <div className="hpc-flip-inner">
                {/* FRONT */}
                <div className="hpc-flip-front">
                  {p.badge && <span className="hpc-card-badge">{p.badge}</span>}
                  <div className="hpc-flip-icon">{getProductIcon(p.icon)}</div>
                  <h3 className="hpc-flip-title">{p.title}</h3>
                  <div className="hpc-flip-tags">
                    {p.features.slice(0, 2).map(f => (
                      <span key={f} className="hpc-flip-tag">{f}</span>
                    ))}
                  </div>
                  <span className="hpc-flip-hint">hover to flip ↻</span>
                </div>

                {/* BACK */}
                <div className="hpc-flip-back">
                  <div className="hpc-flip-back-icon">{getProductIcon(p.icon)}</div>
                  <h3 className="hpc-flip-back-title">{p.title}</h3>
                  <p className="hpc-flip-back-desc">{p.desc}</p>
                  <div className="hpc-flip-back-stats">
                    {p.stats.map(s => (
                      <div key={s.label} className="hpc-flip-stat">
                        <span className="hpc-flip-stat-val">{s.value}</span>
                        <span className="hpc-flip-stat-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <button className="hpc-flip-cta" onClick={() => setCurrentPage(p.page)}>Try it Free →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hpc-drag-hint">
          <span>◁</span> drag to explore <span>▷</span>
        </div>
      </div>

      <div className="hpc-carousel-nav">
        <button
          className="hpc-nav-arrow"
          onClick={() => {
            stopAutoRotate();
            setActiveIndex(p => (p - 1 + total) % total);
            setTimeout(() => startAutoRotate(), 4000);
          }}
        >
          ‹
        </button>

        <div className="hpc-nav-dots">
          {homeProducts.map((p, i) => (
            <button
              key={p.id}
              className={`hpc-nav-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => {
                stopAutoRotate();
                setActiveIndex(i);
                setTimeout(() => startAutoRotate(), 4000);
              }}
              aria-label={`Go to ${p.title}`}
            />
          ))}
        </div>

        <button
          className="hpc-nav-arrow"
          onClick={() => {
            stopAutoRotate();
            setActiveIndex(p => (p + 1) % total);
            setTimeout(() => startAutoRotate(), 4000);
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}


// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home({ setCurrentPage, setAnalysisResult, setResumeText, customApiKey }: HomeProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tiltStyle, setTiltStyle] = useState<{ transform: string }>({ transform: 'rotateY(-14deg) rotateX(8deg)' });
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 18 - 14;
    const rotateX = -(((y - centerY) / centerY) * 14) + 8;
    
    setTiltStyle({
      transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
    });
  };

  const handleMouseLeave3D = () => {
    setTiltStyle({
      transform: 'rotateY(-14deg) rotateX(8deg)'
    });
  };

  // Steps to display in sequence during analysis to keep the user engaged
  const analysisSteps = [
    'Reading resume document...',
    'Extracting text formatting and structures...',
    'Matching skills against ATS algorithms...',
    'Analyzing tone and action verbs...',
    'Evaluating quantified metrics and achievements...',
    'Simulating corporate recruiter assessment...',
    'Generating comprehensive scorecard report...'
  ];

  const particleSpots = Array.from({ length: 28 }, (_, index) => ({
    left: `${(index * 37) % 96}%`,
    top: `${(index * 53) % 92}%`,
    delay: `${(index % 7) * 0.45}s`
  }));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setErrorMsg('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      setSelectedFile(null);
      return;
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 5MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setLoadingStep(0);
    setErrorMsg(null);

    // Dynamic loader step text changes every 1.5 seconds
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1600);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      // Direct integration with the Express backend
      // We will support a local dev server port OR dynamic environment detection.
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
      
      const headers: Record<string, string> = {};
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      const response = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Server error during analysis');
      }

      if (resData.success && resData.data) {
        const resultWithMeta = {
          ...resData.data,
          fileName: selectedFile.name
        };
        setAnalysisResult(resultWithMeta);
        if (resData.resumeText) {
          setResumeText(resData.resumeText);
        }
        setCurrentPage('dashboard');
      } else {
        throw new Error('Analysis completed, but failed to retrieve proper feedback metrics.');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'Connection failed. Ensure the backend server is running.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="home-container animate-fade-in-up">
      <div className="cyber-stage" aria-hidden="true">
        <div className="neon-orbit"></div>
        <div className="scan-beam"></div>
        {particleSpots.map((spot, index) => (
          <span
            key={index}
            className="pixel-particle"
            style={{ left: spot.left, top: spot.top, animationDelay: spot.delay }}
          />
        ))}
      </div>

      {/* ── Launch Countdown Banner ─────────────────────────── */}
      {timeLeft && (
        <div className="launch-countdown-banner" role="banner" aria-label="Launch countdown">
          <div className="countdown-banner-inner">
            <div className="countdown-label-left">
              <Rocket size={15} className="countdown-rocket-icon" />
              <span>launch to be soon</span>
            </div>
            <div className="countdown-units">
              <div className="countdown-unit">
                <span className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown-unit-label">Days</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-unit-label">Hrs</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-unit">
                <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-unit-label">Min</span>
              </div>
              <span className="countdown-separator">:</span>
              <div className="countdown-unit">
                <span className="countdown-number countdown-seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-unit-label">Sec</span>
              </div>
            </div>
            <div className="countdown-label-right">
              <span>June 17, 2026 · 5:00 PM IST</span>
            </div>
          </div>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-grid-container">
          <div className="hero-left-content">
            <div className="hero-badge">
              <Cpu size={13} /> AI-Powered Resume Intelligence
            </div>
            <div className="hero-copy">
              <h1 className="hero-title">
                Build Resumes That<br />
                <span className="gradient-word">Get You Hired.</span>
              </h1>
              <p className="hero-subtitle">
                Upload your resume and receive an instant ATS scorecard — keyword gaps, formatting issues, recruiter insights, and AI-powered rewrites in seconds.
              </p>

              <div className="hero-chip-row" aria-label="CVMind AI capabilities">
                <span>ATS Score</span>
                <span>Keyword Analysis</span>
                <span>AI Rewrites</span>
                <span>DOCX Export</span>
              </div>

              <div className="upload-section">
                <div className="upload-wrapper">
                  <div 
                    className={`upload-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''} ${loading ? 'is-loading' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file"
                      className="file-input-hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleChange}
                      disabled={loading}
                    />

                    {loading ? (
                      <div className="loading-state">
                        <div className="shimmer-scanner"></div>
                        <div className="spinner-wrapper">
                          <div className="premium-spinner"></div>
                        </div>
                        <h3 className="loading-title">Analyzing Your Resume</h3>
                        <p className="loading-step-text animate-pulse">{analysisSteps[loadingStep]}</p>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${((loadingStep + 1) / analysisSteps.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : selectedFile ? (
                      <div className="file-selected-state">
                        <div className="file-icon-wrapper">
                          <FileText className="file-icon" />
                        </div>
                        <div className="file-details">
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <div className="file-actions">
                          <button className="btn-secondary" onClick={removeFile}>
                            Remove
                          </button>
                          <button className="btn-primary" onClick={handleAnalyze}>
                            Analyze Resume <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-prompt-state" onClick={onButtonClick}>
                        <Upload className="upload-icon" />
                        <button className="upload-cta" type="button">
                          Upload Your Resume
                        </button>
                        <div className="privacy-note">
                          <Lock size={14} /> Privacy guaranteed
                        </div>
                        <div className="file-limits-info">
                          PDF, DOCX, or TXT up to 5MB
                        </div>

                        {/* ── or divider ── */}
                        <div className="upload-or-divider"><span>or</span></div>

                        {/* ── Create Resume ── */}
                        <button
                          className="upload-cta create-resume-cta"
                          id="home-create-resume-btn"
                          type="button"
                          onClick={e => { e.stopPropagation(); setCurrentPage('resume-builder'); }}
                        >
                          <Pencil size={16} /> Create Resume
                        </button>
                        <div className="file-limits-info">
                          10 ATS templates &nbsp;·&nbsp; Word editor &nbsp;·&nbsp; AI Refine
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="error-message-bar animate-fade-in-up">
                      <ShieldAlert className="error-icon" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div 
            className="hero-right-visual"
            ref={sceneRef}
            onMouseMove={handleMouseMove3D}
            onMouseLeave={handleMouseLeave3D}
          >
            <div className="scene-3d-wrapper">
              <div className="scene-3d" style={tiltStyle}>
                {/* 1. Profile Badge (floating top-left) */}
                <div className="floating-element float-profile glass-card">
                  <div className="profile-avatar-circle">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" 
                      alt="Profile" 
                      className="profile-avatar" 
                    />
                  </div>
                  <div className="profile-info">
                    <span className="profile-name-tag">Sarah Jenkins</span>
                    <span className="profile-role-tag">Senior Software Engineer</span>
                  </div>
                </div>

                {/* 2. ATS Score Circle Badge (floating top-right) */}
                <div className="floating-element float-score glass-card">
                  <div className="score-ring-container-3d">
                    <svg className="score-ring-svg-3d" viewBox="0 0 36 36">
                      <path className="ring-bg-3d" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="ring-fill-3d" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="score-ring-text-3d">88</div>
                  </div>
                  <div className="score-details-3d">
                    <span className="score-title-3d">ATS Score</span>
                    <span className="score-status-3d">Perfect Rank</span>
                  </div>
                </div>

                {/* 3. The Main Resume Card (Tilted centerpiece) */}
                <div className="resume-3d-card glass-card">
                  <div className="resume-3d-header">
                    <div className="resume-3d-name-bar">Sarah Jenkins</div>
                    <div className="resume-3d-sub-bar">Senior Software Engineer • San Francisco, CA • sarah.j@gmail.com</div>
                  </div>
                  <div className="resume-3d-body">
                    <div className="resume-3d-section-title">Professional Summary</div>
                    <div className="resume-3d-text-line">Highly driven engineer with 6+ years of experience...</div>
                    <div className="resume-3d-text-line short">Focused on scalable cloud architecture and intuitive interfaces.</div>
                    
                    <div className="resume-3d-section-title">Core Experience</div>
                    <div className="resume-3d-exp-block">
                      <div className="resume-3d-exp-title">Lead Engineer @ Tech Corp <span className="resume-3d-date">2023 - Pres</span></div>
                      <div className="resume-3d-text-line">• Spearheaded transition to serverless, reducing latency by 42%.</div>
                      <div className="resume-3d-text-line short-mid">• Mentored 6 developers, standardizing pipeline architecture.</div>
                    </div>
                    <div className="resume-3d-exp-block">
                      <div className="resume-3d-exp-title">Software Developer @ SaaS Inc <span className="resume-3d-date">2020 - 2023</span></div>
                      <div className="resume-3d-text-line">• Built complex React dashboards, increasing engagement by 18%.</div>
                    </div>
                  </div>
                </div>

                {/* 4. Skills Panel Card (floating bottom-left) */}
                <div className="floating-element float-skills glass-card">
                  <span className="skills-heading-3d">Matched Keywords</span>
                  <div className="skills-tags-3d">
                    <span className="skill-tag-3d green">React.js</span>
                    <span className="skill-tag-3d green">TypeScript</span>
                    <span className="skill-tag-3d green">Node.js</span>
                    <span className="skill-tag-3d purple">AWS Cloud</span>
                  </div>
                </div>

                {/* 5. Recruiter Checklist Card (floating bottom-right) */}
                <div className="floating-element float-checklist glass-card">
                  <span className="checklist-heading-3d">Format Audit</span>
                  <div className="checklist-items-3d">
                    <div className="checklist-item-3d">
                      <CheckCircle2 size={12} className="check-icon-3d" />
                      <span>Quantified Metrics (12x)</span>
                    </div>
                    <div className="checklist-item-3d">
                      <CheckCircle2 size={12} className="check-icon-3d" />
                      <span>Active Action Verbs</span>
                    </div>
                    <div className="checklist-item-3d">
                      <CheckCircle2 size={12} className="check-icon-3d" />
                      <span>One-Page Rule Safe</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           360° Rotating Product Cards Section
      ══════════════════════════════════════════════════════════ */}
      <HomeProductCarousel setCurrentPage={setCurrentPage} />

      <section className="security-badges-row">
        <div className="sec-badge">
          <ShieldCheck size={16} className="sec-icon" />
          <span>Private in-memory parsing</span>
        </div>
        <div className="sec-badge">
          <CheckCircle2 size={16} className="sec-icon" />
          <span>Instant ATS scorecard</span>
        </div>
        <div className="sec-badge">
          <Sparkles size={16} className="sec-icon" />
          <span>AI rewrite suggestions</span>
        </div>
      </section>

      <section className="steps-section">
        <div className="section-heading-row">
          <span>How it works</span>
          <h2 className="section-title">From raw resume to job-ready in five steps</h2>
          <p className="section-subtitle">Upload once — get a full audit, an AI-rewritten resume, and a recruiter-ready DOCX file.</p>
        </div>
        <div className="steps-grid steps-grid-5">
          <div className="step-card">
            <div className="step-icon"><Upload size={22} /></div>
            <span>Step 01</span>
            <h3>Upload Your Resume</h3>
            <p>Drop a PDF, DOCX, or TXT file. Your document is parsed entirely in memory — never saved to disk.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><Search size={22} /></div>
            <span>Step 02</span>
            <h3>AI Deep Scan</h3>
            <p>Our AI checks ATS keyword gaps, weak bullet points, formatting issues, and overall recruiter readability in seconds.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><BarChart3 size={22} /></div>
            <span>Step 03</span>
            <h3>Review Your Scorecard</h3>
            <p>See your full score, top strengths, major gaps, matched and missing ATS keywords — all in one clear dashboard.</p>
          </div>
          <div className="step-card step-card-highlight">
            <div className="step-icon step-icon-glow"><Wand2 size={22} /></div>
            <span>Step 04</span>
            <h3>AI Auto-Fixes Resume</h3>
            <p>Click <strong>"AI Auto-Fix Resume"</strong> — the AI rewrites your entire resume: injects missing keywords, replaces weak bullets with quantified achievements, and restructures every section for maximum ATS score.</p>
          </div>
          <div className="step-card step-card-highlight">
            <div className="step-icon step-icon-glow"><FileDown size={22} /></div>
            <span>Step 05</span>
            <h3>Download as DOCX</h3>
            <p>Get your AI-optimized resume as a professionally formatted <strong>.docx</strong> Word file — ATS-safe layout, clean section headers, action-verb bullets, ready to send to recruiters.</p>
          </div>
        </div>
      </section>

      {/* Way beyond a resume builder section */}
      <section className="beyond-section animate-fade-in-up">
        <h2 className="beyond-section-title">Way beyond a resume builder</h2>
        <p className="beyond-section-subtitle">Discover powerful AI features that elevate your job search and guarantee recruiter callbacks.</p>

        <div className="beyond-grid">
          
          {/* Card 1: Step-by-step guidance */}
          <div className="beyond-card glass-card">
            <div className="beyond-card-content">
              <span className="beyond-card-badge">✦ AI-powered</span>
              <h3 className="beyond-card-title">Step-by-step guidance</h3>
              <p className="beyond-card-desc">No need to think much. We guide you through every step of the process. We show you what to add, and where to add it. It's clear and simple.</p>
              <button className="beyond-card-link" onClick={() => setCurrentPage('resume-builder')}>
                Create my resume <ArrowRight size={14} />
              </button>
            </div>
            <div className="beyond-card-visual guidance-visual">
              <div className="visual-step visual-step-done">
                <span className="step-check">✓</span>
                <span className="step-name">Step 1 • Personal Details</span>
              </div>
              <div className="visual-step visual-step-done">
                <span className="step-check">✓</span>
                <span className="step-name">Step 2 • Professional Summary</span>
              </div>
              <div className="visual-step visual-step-active">
                <span className="step-dot"></span>
                <span className="step-name">Step 3 • Skills</span>
                <span className="step-link-icon">🔗</span>
              </div>
              <div className="visual-skills-list">
                <span className="visual-skill-chip">Management Skills <span>+</span></span>
                <span className="visual-skill-chip">Leadership and Team... <span>+</span></span>
                <span className="visual-skill-chip">Computer Skills <span>+</span></span>
                <span className="visual-skill-chip">Analytical Thinking <span>+</span></span>
              </div>
            </div>
          </div>

          {/* Card 2: AI writes for you */}
          <div className="beyond-card glass-card">
            <div className="beyond-card-content">
              <span className="beyond-card-badge">✦ AI-powered</span>
              <h3 className="beyond-card-title">AI writes for you</h3>
              <p className="beyond-card-desc">Speak into the mic and the AI fixes mistakes. Stuck? Click to add phrases that sound professional.</p>
            </div>
            <div className="beyond-card-visual ai-writes-visual">
              <div className="visual-editor-card">
                <h4 className="visual-editor-heading">Professional Summary</h4>
                <p className="visual-editor-sub">Write 2-4 short sentences to interest the reader. Mention your role, experience & most importantly - your biggest achievements.</p>
                <div className="visual-editor-toolbar">
                  <span>B</span><span>I</span><span>U</span><span>S</span><span>≡</span><span>≡</span><span>🔗</span><span>A</span>
                </div>
                <div className="visual-editor-text">
                  Experienced and effective Business Development Manager bringing a <span className="text-highlight">significant value and a genuine passion for management.</span> With a proven track record of driving growth and fostering strong client relationships...
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Instant cover letters */}
          <div className="beyond-card glass-card">
            <div className="beyond-card-content">
              <span className="beyond-card-badge">✦ AI-powered</span>
              <h3 className="beyond-card-title">Instant cover letters</h3>
              <p className="beyond-card-desc">Just paste a job link. We create a matching cover letter, using your resume. You're done in 2 mins! Purpose built to impress recruiters.</p>
            </div>
            <div className="beyond-card-visual cover-letter-visual">
              <div className="visual-cl-card">
                <div className="visual-cl-header">
                  <span className="cl-avatar-text">JS</span>
                  <div>
                    <h5 className="cl-name">JORGE SANDERS</h5>
                    <span className="cl-role">Financial Analyst</span>
                  </div>
                </div>
                <div className="visual-cl-body">
                  <div className="cl-line" />
                  <div className="cl-line" />
                  <div className="cl-line" />
                  <div className="cl-line-short" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Paste any job link */}
          <div className="beyond-card glass-card">
            <div className="beyond-card-content">
              <h3 className="beyond-card-title">Paste any job link</h3>
              <p className="beyond-card-desc">Simple and effective. We have the formula that works for recruiters. Just paste the job description and we pre-build your resume to match.</p>
            </div>
            <div className="beyond-card-visual paste-link-visual">
              <div className="visual-paste-panel">
                <div className="paste-input-container">
                  <span className="paste-search-icon">🔍</span>
                  <span className="paste-url-text">https://www.monster.com/product-designer-meta-2...</span>
                  <span className="paste-check-icon">✓</span>
                </div>
                <div className="paste-tip">Example: https://www.ziprecruiter.com/jobs/company/position</div>
                <div className="paste-buttons">
                  <button className="paste-btn-cancel">Cancel</button>
                  <button className="paste-btn-continue">Continue</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section">
        <div className="section-heading-row">
          <h2 className="section-title">Deep Resume Diagnostics</h2>
          <p className="section-subtitle">What our artificial recruiter evaluates in your document:</p>
        </div>
        
        <div className="responsive-grid features-grid">
          <div className="feature-card glass-card">
            <div className="feature-header">
              <span className="feature-number">01</span>
              <h3 className="feature-card-title">ATS Keyword Matrix</h3>
            </div>
            <p className="feature-desc">
              Scans your resume against top corporate recruitment models. Identifies critical industry skills, toolsets, and terms that are missing.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-header">
              <span className="feature-number">02</span>
              <h3 className="feature-card-title">Quantified Achievements</h3>
            </div>
            <p className="feature-desc">
              Checks whether your experience contains numbers, growth percentages, or dollar amounts. Replaces passive phrases with high-impact achievements.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-header">
              <span className="feature-number">03</span>
              <h3 className="feature-card-title">Recruiter Formatting</h3>
            </div>
            <p className="feature-desc">
              Audits document structure, spacing, font hierarchy, layout design, and page budget sizing, ensuring it passes the 6-second recruiter test.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
