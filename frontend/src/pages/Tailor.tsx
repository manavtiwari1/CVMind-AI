import React, { useState, useRef } from 'react';
import { Upload, FileText, ChevronRight, Check, Copy, Sparkles, BrainCircuit, RefreshCw, Cpu, CheckCircle2, ShieldCheck, FileCheck, Download, ChevronDown } from 'lucide-react';
import './Tailor.css';

interface TailorProps {
  customApiKey: string;
}

interface TailorResult {
  tailoredResume: string;
  matchScore: number;
  keyTailoringInsights: string[];
  matchedSkills: string[];
  missingSkillsRecommended: string[];
}

export default function Tailor({ customApiKey }: TailorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loaderSteps = [
    'Reading original CV structures...',
    'Parsing credentials & work history...',
    'Matching keyword requirements from the JD...',
    'Emphasizing high-impact accomplishments...',
    'Injecting required industry skills naturally...',
    'Generating polished, ATS-optimized layout...'
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
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (file: File) => {
    setErrorMsg(null);
    const allowed = ['pdf', 'docx', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowed.includes(ext)) {
      setErrorMsg('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Max size is 5MB.');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTailor = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload your current CV first.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setErrorMsg('Please paste a target Job Description (min 15 characters).');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loaderSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('jobDescription', jobDescription.trim());

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');
      
      const headers: Record<string, string> = {};
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      const response = await fetch(`${baseUrl}/api/tailor`, {
        method: 'POST',
        headers,
        body: formData
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Server error during tailoring');
      }

      if (resData.success && resData.data) {
        setResult(resData.data);
        setEditedText(resData.data.tailoredResume);
        setIsEditing(false);
      } else {
        throw new Error('Completed, but failed to retrieve tailored output.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Connection failed. Make sure the backend server is running.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertResumeTextToHTML = (text: string) => {
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    
    let name = '';
    const contactLines: string[] = [];
    let bodyStartIndex = 0;
    
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      if (/summary|skills|competencies|internship|experience|employment|responsibility|education|projects|certifications|achievements/i.test(line)) {
        bodyStartIndex = i;
        break;
      }
      
      if (!name && line.length > 2 && line.length < 40 && !line.includes('|') && !line.includes('@') && !line.includes(':') && !line.includes('Phone')) {
        name = line;
        bodyStartIndex = i + 1;
      } else if (line.includes('@') || line.includes('|') || line.includes('Phone') || line.includes('Email') || line.includes('LinkedIn') || line.includes('github.com')) {
        contactLines.push(line);
        bodyStartIndex = i + 1;
      }
    }

    if (!name && lines[0]) {
      name = lines[0].trim().replace(/[#*]/g, '');
      bodyStartIndex = 1;
    }

    html += '<div class="resume-header">';
    html += '<h1 class="candidate-name">' + name + '</h1>';
    if (contactLines.length > 0) {
      const contactText = contactLines.join(' | ').replace(/\s*\|\s*\|\s*/g, ' | ');
      html += '<div class="contact-info">' + contactText + '</div>';
    }
    html += '</div>';
    html += '<hr class="header-divider"/>';

    for (let i = bodyStartIndex; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        continue;
      }

      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

      const cleanHeaderLine = line.replace(/^[#\s\-*]+/, '').replace(/<[^>]*>/g, '').trim();
      const isSectionHeader = /^(professional\s+)?summary$|^(technical\s+)?skills$|^(core\s+)?competencies$|^internship$|^(work\s+)?experience$|^(professional\s+)?experience$|^employment\s+history$|^position(s)?\s+of\s+responsibility$|^education$|^(academic\s+)?projects$|^projects$|^certifications$|^achievements$/i.test(cleanHeaderLine);

      if (isSectionHeader) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += '<h2 class="section-title">' + cleanHeaderLine.toUpperCase() + '</h2>';
        continue;
      }

      const isListItem = /^[•\-\*\s]+/.test(lines[i]) || line.startsWith('-') || line.startsWith('*');
      if (isListItem) {
        const cleanContent = line.replace(/^[•\-\*\s]+/, '').trim();
        if (!inList) {
          html += '<ul class="bullet-list">';
          inList = true;
        }
        html += '<li>' + cleanContent + '</li>';
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        
        if (line.includes('|') || line.includes(' - ') || line.includes('Present') || line.includes('202')) {
          html += '<div class="info-line">' + line + '</div>';
        } else {
          html += '<p class="normal-paragraph">' + line + '</p>';
        }
      }
    }

    if (inList) {
      html += '</ul>';
    }

    return html;
  };

  const handleDownloadDocx = () => {
    const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
      '<title>Tailored Resume</title>' +
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
      '<style>' +
      'body { font-family: Arial, sans-serif; font-size: 10.5pt; line-height: 1.4; color: #111111; margin: 1in; }' +
      '.resume-header { text-align: center; margin-bottom: 8px; }' +
      '.candidate-name { font-size: 20pt; font-weight: bold; color: #102a43; margin-bottom: 4px; }' +
      '.contact-info { font-size: 9.5pt; color: #486581; }' +
      '.header-divider { border-top: 2px solid #102a43; height: 0; margin-bottom: 12px; }' +
      '.section-title { font-size: 11pt; font-weight: bold; color: #102a43; text-transform: uppercase; border-bottom: 1.5px solid #102a43; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px; }' +
      '.bullet-list { margin-bottom: 6px; padding-left: 20px; }' +
      '.bullet-list li { font-size: 10.5pt; color: #243e56; margin-bottom: 3px; }' +
      '.info-line { font-weight: bold; font-size: 10.5pt; color: #102a43; margin-top: 6px; margin-bottom: 3px; }' +
      '.normal-paragraph { font-size: 10.5pt; color: #243e56; margin-bottom: 6px; text-align: justify; }' +
      '</style>' +
      '</head>' +
      '<body>';
    const footer = '</body></html>';
    const formattedBody = convertResumeTextToHTML(editedText);
    const html = header + formattedBody + footer;
    const blob = new Blob(['\ufeff' + html], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = selectedFile ? selectedFile.name.split('.').slice(0, -1).join('.') + '_Tailored.doc' : 'Tailored_Resume.doc';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const htmlContent = '<html>' +
      '<head>' +
      '<title>Tailored_Resume</title>' +
      '<style>' +
      '@page { size: A4; margin: 20mm; }' +
      'body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #1a1a1a; background: #ffffff; padding: 0; margin: 0; }' +
      '.resume-header { text-align: center; margin-bottom: 8px; }' +
      '.candidate-name { font-size: 20pt; font-weight: 800; color: #102a43; margin: 0 0 4px; }' +
      '.contact-info { font-size: 9.5pt; color: #486581; margin: 0; font-weight: 500; }' +
      '.header-divider { border: 0; border-top: 2px solid #102a43; margin: 8px 0 12px; }' +
      '.section-title { font-size: 11pt; font-weight: 800; color: #102a43; text-transform: uppercase; border-bottom: 1.5px solid #102a43; padding-bottom: 3px; margin-top: 14px; margin-bottom: 6px; letter-spacing: 0.02em; }' +
      '.bullet-list { margin: 0 0 6px; padding-left: 20px; list-style-type: disc; }' +
      '.bullet-list li { margin-bottom: 3px; font-size: 10.5pt; color: #243e56; text-align: justify; }' +
      '.info-line { font-weight: bold; font-size: 10.5pt; color: #102a43; margin-top: 6px; margin-bottom: 3px; }' +
      '.normal-paragraph { font-size: 10.5pt; color: #243e56; margin: 0 0 6px; text-align: justify; }' +
      'strong { color: #102a43; font-weight: bold; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      convertResumeTextToHTML(editedText) +
      '<script>' +
      'window.onload = function() {' +
      '  window.print();' +
      '  setTimeout(function() {' +
      '    window.frameElement.remove();' +
      '  }, 100);' +
      '};' +
      '</script>' +
      '</body>' +
      '</html>';

    doc.write(htmlContent);
    doc.close();
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription('');
    removeFile();
  };

  return (
    <div className="tailor-page-container animate-fade-in-up">
      <div className="tailor-stage" aria-hidden="true">
        <div className="stage-glow-left"></div>
        <div className="stage-glow-right"></div>
      </div>

      <header className="tailor-header">
        <div className="tailor-badge">
          <Cpu size={14} /> AI Tailorer Console
        </div>
        <h1 className="tailor-title">Tailor Your Resume to Any Job</h1>
        <p className="tailor-subtitle">
          Upload your CV, paste your target Job Description (JD), and let our artificial corporate recruiter craft a beautifully aligned, ATS-perfect resume.
        </p>
      </header>

      {!result ? (
        <div className="tailor-workspace">
          <div className="tailor-inputs-wrapper glass-card">
            <h2 className="workspace-card-title">1. Upload Your Current CV</h2>
            
            <div 
              className={`tailor-upload-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''} ${loading ? 'is-loading' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="tailor-hidden-input"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={loading}
              />

              {loading ? (
                <div className="tailor-loading-state">
                  <div className="tailor-shimmer"></div>
                  <div className="tailor-spinner"></div>
                  <h3 className="loading-title">Tailoring in Progress...</h3>
                  <p className="loading-text animate-pulse">{loaderSteps[loadingStep]}</p>
                </div>
              ) : selectedFile ? (
                <div className="tailor-file-details">
                  <div className="tailor-file-icon">
                    <FileText size={32} />
                  </div>
                  <div className="tailor-file-meta">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <button className="btn-secondary remove-file-btn" onClick={removeFile}>
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="tailor-prompt" onClick={triggerUpload}>
                  <Upload className="upload-icon" />
                  <button className="upload-cta-btn" type="button">Select CV File</button>
                  <p className="file-formats-note">PDF, DOCX, or TXT (Max 5MB)</p>
                </div>
              )}
            </div>

            <h2 className="workspace-card-title mt-4">2. Paste Target Job Description (JD)</h2>
            <textarea
              className="tailor-textarea"
              placeholder="Paste the target Job Description (JD), key responsibilities, or role guidelines here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
            />

            {errorMsg && (
              <div className="tailor-error-banner animate-fade-in-up">
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              className="btn-primary tailor-submit-btn" 
              onClick={handleTailor} 
              disabled={loading || !selectedFile || !jobDescription.trim()}
            >
              Tailor Resume <ChevronRight size={18} />
            </button>
          </div>

          <div className="tailor-features-card glass-card">
            <h2 className="features-card-title"><Sparkles size={16} /> Targeted Optimization</h2>
            <p className="features-card-desc">How our AI Tailorer transforms your application to pass the screening:</p>
            
            <div className="features-bullet-list">
              <div className="features-bullet-item">
                <CheckCircle2 className="bullet-icon-check" />
                <div>
                  <strong>Semantic Keyword Alignment:</strong>
                  <p>Injects high-impact terms and technical stack requirements mentioned in the JD naturally into your profile.</p>
                </div>
              </div>
              <div className="features-bullet-item">
                <CheckCircle2 className="bullet-icon-check" />
                <div>
                  <strong>Achievement Tailoring:</strong>
                  <p>Reframes your work history bullets to showcase accomplishments that match the primary responsibilities sought by the hiring team.</p>
                </div>
              </div>
              <div className="features-bullet-item">
                <CheckCircle2 className="bullet-icon-check" />
                <div>
                  <strong>ATS Integrity Protection:</strong>
                  <p>Re-structures the resume sections strictly following standard structural headers (Summary, Skills, Experience, Education).</p>
                </div>
              </div>
            </div>

            <div className="security-guarantee">
              <ShieldCheck size={18} />
              <span>Parsed securely in-memory. Zero data persistency.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="tailor-results-workspace">
          <div className="results-toolbar">
            <button className="btn-secondary reset-workspace-btn" onClick={handleReset}>
              <RefreshCw size={14} /> Start Fresh
            </button>
          </div>

          <div className="results-split-pane">
            {/* Left Pane - Tailored Resume text editor */}
            <div className="results-editor-pane glass-card">
              <div className="pane-header">
                <h3><FileCheck size={18} className="highlight-cyan" /> Optimized Resume Draft</h3>
                <div className="editor-controls">
                  <button 
                    className={`btn-secondary control-btn ${isEditing ? 'active-edit-mode' : ''}`} 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Done Tweak' : 'Tweak Text'}
                  </button>
                  <button className="btn-secondary control-btn" onClick={handleCopy}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>

                  <div className="download-dropdown-container">
                    <button className="btn-primary control-btn download-toggle-btn">
                      <Download size={14} /> Download <ChevronDown size={12} className="download-arrow" />
                    </button>
                    <div className="download-dropdown-menu glass-card">
                      <button 
                        className="download-dropdown-item"
                        onClick={handleDownloadDocx}
                      >
                        <FileText size={14} className="dropdown-item-icon color-blue" />
                        <span>Word Document (.doc)</span>
                      </button>
                      <button 
                        className="download-dropdown-item"
                        onClick={handleDownloadPDF}
                      >
                        <FileCheck size={14} className="dropdown-item-icon color-cyan" />
                        <span>PDF Document (.pdf)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="editor-workspace-container">
                {isEditing ? (
                  <textarea
                    className="tailored-textarea-editor"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                ) : (
                  <pre className="tailored-resume-pre">{editedText}</pre>
                )}
              </div>
            </div>

            {/* Right Pane - Tailoring Metrics & Insights */}
            <div className="results-insights-pane">
              {/* Match Score Card */}
              <div className="glass-card match-score-card">
                <div className="gauge-wrapper" style={{ '--percentage': `${result.matchScore}%` } as React.CSSProperties}>
                  <div className="gauge-content">
                    <span className="gauge-number">{result.matchScore}%</span>
                    <span className="gauge-label">Match Score</span>
                  </div>
                </div>
                <div className="score-feedback">
                  <h4>Excellent JD Alignment!</h4>
                  <p>Your resume highlights the core requirements requested in the Job Description, greatly increasing call-back chances.</p>
                </div>
              </div>

              {/* Keyword Badges */}
              <div className="glass-card keywords-card">
                <h4><BrainCircuit size={16} /> Matched Skills & Keywords</h4>
                <div className="keyword-badges-grid">
                  {result.matchedSkills.map((skill) => (
                    <span key={skill} className="keyword-badge matched">{skill}</span>
                  ))}
                </div>

                <h4 className="mt-4"><Sparkles size={16} /> Recommended Additions</h4>
                <div className="keyword-badges-grid">
                  {result.missingSkillsRecommended.map((skill) => (
                    <span key={skill} className="keyword-badge missing">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Action Insights */}
              <div className="glass-card insights-list-card">
                <h4>AI Tailoring Insights</h4>
                <div className="insights-checklist">
                  {result.keyTailoringInsights.map((insight, idx) => (
                    <div key={idx} className="insight-checklist-item">
                      <Check className="check-bullet" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
