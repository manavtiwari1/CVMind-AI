import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, ShieldAlert, Cpu, ArrowRight, ShieldCheck, Lock, Search, BarChart3, Sparkles, Wand2, FileDown, X, Pencil } from 'lucide-react';
import './Home.css';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setAnalysisResult: (result: any) => void;
  setResumeText: (text: string) => void;
  customApiKey: string;
  isLoggedIn: boolean;
  setShowAuthModal: (show: boolean) => void;
}

export default function Home({ setCurrentPage, setAnalysisResult, setResumeText, customApiKey, isLoggedIn, setShowAuthModal }: HomeProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tiltStyle, setTiltStyle] = useState<{ transform: string }>({ transform: 'rotateY(-14deg) rotateX(8deg)' });
  const sceneRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const hasSeen = localStorage.getItem('cvmind_tailor_welcome_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for Escape key to close the welcome popup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWelcomeModal) {
        localStorage.setItem('cvmind_tailor_welcome_seen', 'true');
        setShowWelcomeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcomeModal]);

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
    
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
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
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
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
      {showWelcomeModal && (
        <div 
          className="welcome-modal-overlay animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              localStorage.setItem('cvmind_tailor_welcome_seen', 'true');
              setShowWelcomeModal(false);
            }
          }}
          title="Click outside to close"
        >
          <div className="welcome-modal-card glass-card animate-scale-up">
            <button 
              className="modal-close-icon-btn" 
              onClick={() => {
                localStorage.setItem('cvmind_tailor_welcome_seen', 'true');
                setShowWelcomeModal(false);
              }}
              title="Close announcement (Esc)"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="modal-badge">
              <Sparkles size={14} className="animate-pulse" /> Platform Upgrade
            </div>
            <h2 className="modal-title">Major AI Platform Upgrades Released!</h2>
            <p className="modal-desc">
              We have launched two powerful, premium corporate-hiring features to make your resume completely job-ready and help you ace your interview panels.
            </p>
            <div className="modal-feature-list">
              <div className="modal-feature-item">
                <CheckCircle2 size={16} className="modal-feature-icon" />
                <span><strong>AI Resume Tailorer:</strong> Align and optimize CV accomplishments to any target Job Description (JD) to pass ATS checks.</span>
              </div>
              <div className="modal-feature-item">
                <CheckCircle2 size={16} className="modal-feature-icon" style={{ color: '#a855f7' }} />
                <span><strong>SmartPrep AI:</strong> Scan your CV history to generate targeted interview prep scorecards with STAR answers and expert recruiter tips.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-primary modal-cta-btn" 
                style={{ background: 'linear-gradient(135deg, #a855f7, #00f5ff)', boxShadow: '0 0 16px rgba(168,85,247,0.3)' }}
                onClick={() => {
                  localStorage.setItem('cvmind_tailor_welcome_seen', 'true');
                  setShowWelcomeModal(false);
                  setCurrentPage('prep');
                }}
              >
                Try SmartPrep AI <ArrowRight size={16} />
              </button>
              <button 
                className="btn-secondary modal-close-btn" 
                onClick={() => {
                  localStorage.setItem('cvmind_tailor_welcome_seen', 'true');
                  setShowWelcomeModal(false);
                  setCurrentPage('tailor');
                }}
              >
                Resume Tailorer
              </button>
            </div>
          </div>
        </div>
      )}

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
        <h2 className="section-title">Deep Resume Diagnostics</h2>
        <p className="section-subtitle">What our artificial recruiter evaluates in your document:</p>
        
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
