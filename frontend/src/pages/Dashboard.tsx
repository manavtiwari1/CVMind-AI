import { useState } from 'react';
import { 
  Award, FileText, CheckCircle2, AlertTriangle, 
  RotateCcw, Printer, ArrowRight, Target, Check, AlertCircle, Copy 
} from 'lucide-react';
import './Dashboard.css';

interface Suggestions {
  original: string;
  improved: string;
}

interface AnalysisData {
  score: number;
  summary: string;
  atsKeywords: {
    score: number;
    matched: string[];
    missing: string[];
    feedback: string;
  };
  contentAndImpact: {
    score: number;
    feedback: string;
    suggestions: Suggestions[];
  };
  formattingAndStyle: {
    score: number;
    feedback: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  analysisResult: AnalysisData | null;
  resetAnalysis: () => void;
}

export default function Dashboard({ setCurrentPage, analysisResult, resetAnalysis }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'keywords' | 'rewrites' | 'formatting'>('summary');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Return to uploader if no results yet
  if (!analysisResult) {
    return (
      <div className="dashboard-empty-state glass-card animate-fade-in-up">
        <AlertTriangle size={48} className="empty-icon text-warning" />
        <h3>No Analysis Data Available</h3>
        <p>Please upload a resume first from the home dashboard to generate feedback report.</p>
        <button className="btn-primary" onClick={() => setCurrentPage('home')}>
          Go to Uploader
        </button>
      </div>
    );
  }

  const {
    score,
    summary,
    atsKeywords,
    contentAndImpact,
    formattingAndStyle,
    strengths,
    weaknesses,
    recommendations
  } = analysisResult;

  // Determine score color classes
  const getScoreColorClass = (val: number) => {
    if (val >= 8) return 'score-success';
    if (val >= 6) return 'score-warning';
    return 'score-danger';
  };

  const getScoreText = (val: number) => {
    if (val >= 8) return 'Excellent';
    if (val >= 6) return 'Good Effort';
    return 'Needs Attention';
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Circular progress calculation
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div className="dashboard-container animate-fade-in-up">
      {/* Background glow node */}
      <div className="glow-ambient" style={{ top: '15%', right: '15%' }}></div>
      
      {/* Header Actions */}
      <div className="dashboard-header no-print">
        <div>
          <h1 className="dashboard-title-text">Resume Analysis</h1>
          <p className="dashboard-subtitle">A comprehensive breakdown of your document health.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={resetAnalysis}>
            <RotateCcw size={16} /> Re-scan Resume
          </button>
          <button className="btn-primary" onClick={triggerPrint}>
            <Printer size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <section className="overview-row">
        {/* Animated Circular Score widget */}
        <div className={`score-radial-card glass-card ${getScoreColorClass(score)}`}>
          <div className="radial-wrapper">
            <svg height={radius * 2} width={radius * 2} className="radial-svg">
              <circle
                stroke="rgba(255,255,255,0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="radial-bar"
              />
            </svg>
            <div className="radial-content">
              <span className="score-number-display">{score}</span>
              <span className="score-total">/10</span>
            </div>
          </div>
          <div className="radial-label-group">
            <h3 className="radial-grade-label">{getScoreText(score)}</h3>
            <p className="radial-desc">Overall Quality Rating</p>
          </div>
        </div>

        {/* Professional Summary Paragraph */}
        <div className="summary-block glass-card">
          <div className="summary-header">
            <FileText className="summary-icon text-primary" size={20} />
            <h3 className="summary-title">Executive Summary</h3>
          </div>
          <p className="summary-content">{summary}</p>
        </div>
      </section>

      {/* Tabs Selector */}
      <div className="tabs-bar no-print">
        <button 
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <Award size={16} /> Executive Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          <Target size={16} /> ATS Keywords ({atsKeywords.matched.length + atsKeywords.missing.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rewrites' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewrites')}
        >
          <CheckCircle2 size={16} /> Experience Bullet Rewriter
        </button>
        <button 
          className={`tab-btn ${activeTab === 'formatting' ? 'active' : ''}`}
          onClick={() => setActiveTab('formatting')}
        >
          <FileText size={16} /> Formatting & Layout
        </button>
      </div>

      {/* PRINT VIEW EXCLUSIVE SECTION (Always visible during print) */}
      <div className="print-exclusive-header">
        <div className="print-title-row">
          <h2>CVMind AI Resume Audit Report</h2>
          <div className="print-score-pill">Score: {score}/10</div>
        </div>
        <p className="print-summary">{summary}</p>
      </div>

      {/* Tabs Content */}
      <div className="tabs-content-area">
        
        {/* Tab 1: Executive Overview */}
        {(activeTab === 'summary' || window.matchMedia('print').matches) && (
          <div className={`tab-pane ${activeTab !== 'summary' ? 'print-only' : ''}`}>
            
            {/* Strengths & Weaknesses Grid */}
            <div className="responsive-grid sw-grid">
              <div className="sw-card glass-card strength-border">
                <h4 className="sw-card-title text-success">
                  <CheckCircle2 size={18} /> Top Strengths
                </h4>
                <ul className="sw-list">
                  {strengths.map((str, i) => (
                    <li key={i} className="sw-list-item">
                      <span className="bullet-dot bg-success"></span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sw-card glass-card weakness-border">
                <h4 className="sw-card-title text-danger">
                  <AlertCircle size={18} /> Major Gaps
                </h4>
                <ul className="sw-list">
                  {weaknesses.map((weak, i) => (
                    <li key={i} className="sw-list-item">
                      <span className="bullet-dot bg-danger"></span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prioritized Recommendations */}
            <div className="recommendations-block glass-card">
              <h4 className="rec-block-title">
                <Target size={18} className="text-primary" /> Prioritized Action Items
              </h4>
              <div className="rec-timeline">
                {recommendations.map((rec, i) => (
                  <div key={i} className="rec-timeline-item">
                    <div className="rec-number-badge">{i + 1}</div>
                    <div className="rec-content">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: ATS Keywords */}
        {(activeTab === 'keywords' || window.matchMedia('print').matches) && (
          <div className={`tab-pane ${activeTab !== 'keywords' ? 'print-only' : ''}`}>
            <div className="keywords-panel glass-card">
              <div className="panel-header-row">
                <h4 className="panel-title">ATS Optimization Index</h4>
                <div className={`tab-score-badge badge ${getScoreColorClass(atsKeywords.score)}`}>
                  ATS Score: {atsKeywords.score}/10
                </div>
              </div>
              
              <p className="panel-desc">{atsKeywords.feedback}</p>

              <div className="keyword-badges-container">
                <div className="keyword-column">
                  <h5 className="kw-heading-success">Matched Keywords ({atsKeywords.matched.length})</h5>
                  {atsKeywords.matched.length > 0 ? (
                    <div className="badge-grid">
                      {atsKeywords.matched.map((kw, i) => (
                        <span key={i} className="badge badge-success">{kw}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-badge-info">No major matched industry keywords detected.</p>
                  )}
                </div>

                <div className="keyword-column">
                  <h5 className="kw-heading-danger">Recommended Missing Keywords ({atsKeywords.missing.length})</h5>
                  {atsKeywords.missing.length > 0 ? (
                    <div className="badge-grid">
                      {atsKeywords.missing.map((kw, i) => (
                        <span key={i} className="badge badge-danger">{kw}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-badge-info">Amazing! No major missing keywords identified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bullet Rewriter */}
        {(activeTab === 'rewrites' || window.matchMedia('print').matches) && (
          <div className={`tab-pane ${activeTab !== 'rewrites' ? 'print-only' : ''}`}>
            <div className="rewrites-panel glass-card">
              <div className="panel-header-row">
                <h4 className="panel-title">Experience Impact Analyzer</h4>
                <div className={`tab-score-badge badge ${getScoreColorClass(contentAndImpact.score)}`}>
                  Impact Rating: {contentAndImpact.score}/10
                </div>
              </div>

              <p className="panel-desc">{contentAndImpact.feedback}</p>

              <div className="rewrites-table-wrapper">
                {contentAndImpact.suggestions.length > 0 ? (
                  <div className="rewrites-list">
                    {contentAndImpact.suggestions.map((sug, i) => (
                      <div key={i} className="rewrite-row">
                        <div className="rewrite-block original-block">
                          <span className="block-label text-danger">Original bullet (Passive / Weak)</span>
                          <p className="block-content">"{sug.original}"</p>
                        </div>
                        <div className="rewrite-arrow-cell no-print">
                          <ArrowRight size={20} />
                        </div>
                        <div className="rewrite-block improved-block">
                          <div className="improved-header-row">
                            <span className="block-label text-success">AI Improved (Result-driven / Quantified)</span>
                            <button 
                              className="copy-btn no-print" 
                              onClick={() => handleCopy(sug.improved, i)}
                              title="Copy improved text"
                            >
                              {copiedIndex === i ? (
                                <>
                                  <Check size={14} className="text-success" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={14} /> Copy
                                </>
                              )}
                            </button>
                          </div>
                          <p className="block-content">"{sug.improved}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-rewrites-box">
                    <p>No passive bullet rewrites suggested. Your experience section is already formatted strongly with action verbs and metrics!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Formatting */}
        {(activeTab === 'formatting' || window.matchMedia('print').matches) && (
          <div className={`tab-pane ${activeTab !== 'formatting' ? 'print-only' : ''}`}>
            <div className="formatting-panel glass-card">
              <div className="panel-header-row">
                <h4 className="panel-title">Visual Layout Audits</h4>
                <div className={`tab-score-badge badge ${getScoreColorClass(formattingAndStyle.score)}`}>
                  Layout Score: {formattingAndStyle.score}/10
                </div>
              </div>

              <p className="formatting-feedback-content">{formattingAndStyle.feedback}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
