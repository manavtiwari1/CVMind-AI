import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, ShieldAlert, Cpu, ArrowRight, ShieldCheck, Lock, Search, BarChart3, Sparkles } from 'lucide-react';
import './Home.css';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setAnalysisResult: (result: any) => void;
  customApiKey: string;
}

export default function Home({ setCurrentPage, setAnalysisResult, customApiKey }: HomeProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setAnalysisResult(resData.data);
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

      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-badge">
            <Cpu size={14} /> AI Resume Checker
          </div>
          <h1 className="hero-title">
            CVMind AI Resume Intelligence.
          </h1>
          <p className="hero-subtitle">
            Upload your resume and get a futuristic ATS scorecard with keyword gaps, formatting alerts, recruiter insights, and bullet rewrites in seconds.
          </p>

          <div className="hero-chip-row" aria-label="CVMind AI capabilities">
            <span>ATS Score</span>
            <span>Keyword Radar</span>
            <span>AI Rewrites</span>
            <span>PDF Report</span>
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

        <div className="hero-preview" aria-hidden="true">
          <div className="preview-glow-label">Live AI Audit Console</div>
          <div className="preview-browser">
            <div className="preview-topbar">
              <span>CVMind AI</span>
              <div className="preview-bars">
                <i></i><i></i><i></i><i></i>
              </div>
              <b>Score 86/100</b>
            </div>
            <div className="preview-body">
              <aside className="preview-sidebar">
                <span></span><span></span><span className="active"></span><span></span>
              </aside>
              <div className="preview-analytics">
                <h3>Analytics</h3>
                <div className="score-card">
                  <div>
                    <strong>ATS Score</strong>
                    <small>Good match for recruiter screening</small>
                  </div>
                  <span>86</span>
                  <div className="score-line"><i></i></div>
                </div>
                <div className="issue-card">
                  <strong>Missing keywords</strong>
                  <p>React, SQL, Leadership, AWS</p>
                </div>
                <div className="issue-card neural-card">
                  <strong>AI rewrite ready</strong>
                  <p>3 weak bullets improved with metrics</p>
                </div>
              </div>
              <div className="preview-resume">
                <div className="avatar"></div>
                <h4>Candidate Resume</h4>
                <span></span><span></span><span></span>
                <div className="resume-lines">
                  <i></i><i></i><i></i><i></i><i></i>
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
          <h2 className="section-title">Resume analysis made effortlessly simple</h2>
          <p className="section-subtitle">Three quick steps to get a complete, professional resume report.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon"><Upload size={22} /></div>
            <span>Step 01</span>
            <h3>Upload Your Resume</h3>
            <p>Select a PDF, DOCX, or TXT file. Your resume is never saved to disk — it is parsed entirely in memory for complete privacy.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><Search size={22} /></div>
            <span>Step 02</span>
            <h3>AI Scan Runs Instantly</h3>
            <p>The system checks ATS keywords, action verbs, formatting, quantified impact, and overall recruiter readability.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><BarChart3 size={22} /></div>
            <span>Step 03</span>
            <h3>View Your Scorecard</h3>
            <p>Get your score, strengths, gaps, missing keywords, bullet rewrites, and a downloadable PDF report — all in one dashboard.</p>
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
