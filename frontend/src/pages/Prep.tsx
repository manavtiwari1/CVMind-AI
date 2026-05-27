import { useState, useRef } from 'react';
import { 
  Sparkles, FileText, Upload, Lock, ShieldAlert, ArrowRight,
  ChevronDown, ChevronUp, Copy, Check, CheckCircle2,
  Building2, HelpCircle, Lightbulb, RefreshCw, FileDown,
  Briefcase, Cpu
} from 'lucide-react';
import './Prep.css';

interface PrepQuestion {
  category: string;
  companySource: string;
  question: string;
  answer: string;
  tip: string;
}

interface PrepProps {
  customApiKey: string;
  resumeText: string;
  setResumeText: (text: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function Prep({ customApiKey, resumeText, setResumeText, setCurrentPage }: PrepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<PrepQuestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loaderSteps = [
    'Scanning CV professional history...',
    'Identifying domain experience indicators...',
    'Extracting technical stacks & soft skills...',
    'Simulating corporate interviewer questions...',
    'Sourcing Big Tech & Big 4 HR interview models...',
    'Formulating STAR structured responses...',
    'Assembling executive coaching guidelines...'
  ];

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
    
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 5MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQuestions = async (useCached = false) => {
    if (!selectedFile && (!useCached || !resumeText)) return;

    setLoading(true);
    setLoadingStep(0);
    setErrorMsg(null);
    setQuestions([]);
    setExpandedIndex(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loaderSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
      const headers: Record<string, string> = {};
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      let response;
      if (useCached && resumeText) {
        headers['Content-Type'] = 'application/json';
        response = await fetch(`${baseUrl}/api/prep`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            resumeText,
            fileName: 'Cached CV Context',
            fileSize: resumeText.length
          })
        });
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        response = await fetch(`${baseUrl}/api/prep`, {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        throw new Error('No resume source selected.');
      }

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Server error during questions generation');
      }

      if (resData.success && resData.data && resData.data.questions) {
        setQuestions(resData.data.questions);
        if (resData.resumeText) {
          setResumeText(resData.resumeText);
        }
      } else {
        throw new Error('Failed to generate interview questions. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Connection failed. Make sure the backend server is running.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    const formatted = questions.map((q, i) => 
      `Question ${i + 1} [Source: ${q.companySource} | Category: ${q.category}]\nQuestion: ${q.question}\n\nModel Answer:\n${q.answer}\n\nRecruiter Insider Tip:\n${q.tip}\n\n${'-'.repeat(50)}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  const downloadPrepDoc = () => {
    const formatted = questions.map((q, i) => 
      `Question ${i + 1} [Source: ${q.companySource} | Category: ${q.category}]\nQuestion: ${q.question}\n\nModel Answer:\n${q.answer}\n\nRecruiter Insider Tip:\n${q.tip}\n\n${'='.repeat(60)}`
    ).join('\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([`CVMIND AI - SMARTPREP INTERVIEW scorecard\nGenerated at: ${new Date().toLocaleDateString()}\n\n${formatted}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `cvmind_smartprep_interview_prep.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category)))];
  const filteredQuestions = activeFilter === 'All' 
    ? questions 
    : questions.filter(q => q.category === activeFilter);

  return (
    <div className="prep-container animate-fade-in-up">
      {/* Background radial glow nodes */}
      <div className="glow-ambient" style={{ top: '10%', left: '10%' }}></div>
      <div className="glow-ambient" style={{ bottom: '20%', right: '10%' }}></div>

      {/* Header */}
      <div className="prep-header no-print">
        <div className="prep-title-section">
          <div className="prep-badge">
            <Sparkles size={13} className="animate-pulse" /> Sourced from HR Leaders
          </div>
          <h1 className="prep-title-text">SmartPrep AI</h1>
          <p className="prep-subtitle-text">
            Simulate realistic corporate interviews. Scan your resume to generate customized questions, STAR framework answers, and recruiter insider tips.
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => setCurrentPage('home')}>
            Back to Home
          </button>
          {questions.length > 0 && (
            <button className="btn-secondary" onClick={() => setQuestions([])}>
              <RefreshCw size={14} /> Scan Another Resume
            </button>
          )}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="prep-workspace">
        
        {/* Upload and Context Zone (Displays when questions are empty and not loading) */}
        {!loading && questions.length === 0 && (
          <div className="prep-upload-card glass-card">
            <div className="prep-upload-info">
              <Cpu className="prep-upload-cpu-icon" />
              <h3>Choose Resume Source</h3>
              <p>Select whether to leverage your previously analyzed resume or upload a new CV to generate specialized interview questions.</p>
            </div>

            {/* Quick Context Action */}
            {resumeText && (
              <div className="cached-resume-strip glass-card">
                <div className="cached-resume-details">
                  <CheckCircle2 className="text-success" size={20} />
                  <div>
                    <strong>Active CV Session Detected</strong>
                    <p>Use your already uploaded resume context to generate prep questions instantly.</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => generateQuestions(true)}>
                  Analyze Active CV <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Upload Zone */}
            <div className="prep-drop-zone">
              <div className="divider-or"><span>OR UPLOAD NEW CV</span></div>
              
              <div 
                className={`prep-upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
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
                />

                {selectedFile ? (
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
                      <button className="btn-primary" onClick={() => generateQuestions(false)}>
                        Scan & Prep <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-prompt-state" onClick={triggerUpload}>
                    <Upload className="upload-icon" />
                    <button className="upload-cta" type="button">
                      Upload Resume Document
                    </button>
                    <div className="privacy-note">
                      <Lock size={13} /> Secure local sandboxed evaluation
                    </div>
                    <div className="file-limits-info">
                      PDF, DOCX, or TXT up to 5MB
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="error-message-bar">
                  <ShieldAlert className="error-icon" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Scanner */}
        {loading && (
          <div className="prep-loading-card glass-card">
            <div className="scan-beam"></div>
            <div className="spinner-wrapper">
              <div className="prep-spinner"></div>
            </div>
            <h3 className="loading-title">Generating Tailored Questions</h3>
            <p className="loading-step-text animate-pulse">{loaderSteps[loadingStep]}</p>
            
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${((loadingStep + 1) / loaderSteps.length) * 100}%` }}
              ></div>
            </div>
            <p className="loading-note">Sourcing corporate recruiter strategies & structured STAR responses...</p>
          </div>
        )}

        {/* Results Panel */}
        {!loading && questions.length > 0 && (
          <div className="prep-results-area">
            
            {/* Toolbar */}
            <div className="prep-results-toolbar glass-card no-print">
              <div className="toolbar-left">
                <span className="results-count">Generated {questions.length} Interview Scorecards</span>
                
                {/* Category Badges Filter */}
                <div className="category-filters">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      className={`filter-badge ${activeFilter === cat ? 'active' : ''}`}
                      onClick={() => {
                        setActiveFilter(cat);
                        setExpandedIndex(null);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="toolbar-right">
                <button className="btn-secondary btn-sm" onClick={handleCopyAll}>
                  {copiedAll ? <><Check size={14} className="text-success" /> Copied Scorecard!</> : <><Copy size={14} /> Copy All</>}
                </button>
                <button className="btn-primary btn-sm" onClick={downloadPrepDoc}>
                  <FileDown size={14} /> Download TXT
                </button>
              </div>
            </div>

            {/* Accordion Questions List */}
            <div className="prep-questions-list">
              {filteredQuestions.length === 0 ? (
                <div className="glass-card empty-results-state">
                  <HelpCircle size={40} className="text-muted" />
                  <h4>No questions match the active filter.</h4>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`prep-question-card glass-card ${isExpanded ? 'expanded' : ''}`}
                    >
                      {/* Accordion Header */}
                      <header 
                        className="question-card-header" 
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      >
                        <div className="question-header-info">
                          <div className="question-badges-row">
                            <span className="badge badge-primary">
                              <Building2 size={11} /> {q.companySource} Style
                            </span>
                            <span className="badge badge-success">
                              <Briefcase size={11} /> {q.category}
                            </span>
                          </div>
                          <h3 className="question-heading">
                            {idx + 1}. {q.question}
                          </h3>
                        </div>
                        <button className="accordion-toggle-btn" title={isExpanded ? 'Collapse' : 'Expand'}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </header>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div className="question-card-body">
                          
                          {/* Model Answer Section */}
                          <div className="body-section model-answer-section">
                            <div className="section-header-row">
                              <h4 className="section-title">
                                <CheckCircle2 size={15} className="text-success" /> Professional Model Answer (STAR)
                              </h4>
                              <button 
                                className="copy-btn" 
                                onClick={() => handleCopy(q.answer, idx)}
                                title="Copy answer to clipboard"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check size={12} className="text-success" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} /> Copy Answer
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="answer-text-box">
                              {q.answer}
                            </div>
                          </div>

                          {/* Recruiter Insider Tip Section */}
                          <div className="body-section recruiter-tip-section">
                            <h4 className="section-title">
                              <Lightbulb size={15} className="text-warning" /> Recruiter Insights & Insider Strategies
                            </h4>
                            <p className="tip-text-box">
                              {q.tip}
                            </p>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
