import { useState, useMemo } from 'react';
import { 
  Folder, 
  Search, 
  ChevronLeft, 
  Clock, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import './FAQ.css';

interface FAQArticle {
  id: number;
  question: string;
  title: string;
  editedTime: string;
  content: React.ReactNode;
  tags: string[];
}

interface FAQCategory {
  id: 'resumes' | 'accounts' | 'tailor-prep';
  title: string;
  description: string;
  articleCount: number;
  articles: FAQArticle[];
}

interface FAQProps {
  setCurrentPage: (page: string) => void;
}

export default function FAQ({ setCurrentPage }: FAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<'resumes' | 'accounts' | 'tailor-prep' | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Highly detailed and structured Help Center articles mapped exactly to CVMind's core features
  const faqCategories: FAQCategory[] = [
    {
      id: 'resumes',
      title: 'Resumes & Cover Letters',
      description: 'Articles about uploading, scanning, ATS scores, formatting rules, and CVMind\'s built-in resume designer.',
      articleCount: 5,
      articles: [
        {
          id: 1,
          question: 'How is the ATS compatibility score calculated?',
          title: 'ATS Scoring Criteria & Calculation Methods',
          editedTime: 'Edited 2 months ago',
          tags: ['score', 'ats', 'audit', 'formatting', 'parsing'],
          content: (
            <div className="article-body">
              <p className="lead-paragraph">
                CVMind AI’s proprietary Applicant Tracking System (ATS) scoring engine evaluates your resume against standard filters used by fortune 500 recruiters.
              </p>
              <h3>Scoring Vectors & Criteria</h3>
              <p>Your resume is audited across five fundamental categories:</p>
              <ul>
                <li><strong>Formatting & Layout (30%):</strong> Scans for complex layouts, invisible text, tables, columns, or graphic overlays that blind parsing engines.</li>
                <li><strong>Contact Details & Metadata (15%):</strong> Verifies existence and structures of email addresses, contact numbers, LinkedIn links, and location keywords.</li>
                <li><strong>Skills Density (25%):</strong> Measures concentrations of high-demand industry-specific keywords relative to your target role.</li>
                <li><strong>Action Verbs Check (15%):</strong> Analyzes bullet points to ensure achievements are led by impactful action words rather than passive descriptions.</li>
                <li><strong>Readability & Length (15%):</strong> Evaluates page ratios, word counts, paragraph margins, and semantic flow.</li>
              </ul>
              <div className="callout-info">
                <strong>Pro-Tip:</strong> Resumes scoring above 80% generally pass standard corporate ATS gatekeepers and secure human recruiter reviews.
              </div>
            </div>
          )
        },
        {
          id: 2,
          question: 'Can I design and build a resume from scratch?',
          title: 'Building a Resume From Scratch in CVMind AI',
          editedTime: 'Edited 1 month ago',
          tags: ['builder', 'design', 'templates', 'resume'],
          content: (
            <div className="article-body">
              <p>
                Yes! CVMind AI includes an advanced, interactive <strong>Resume Builder</strong> designed strictly within ATS compliance guidelines.
              </p>
              <h3>Step-by-Step Resume Building Process:</h3>
              <ol>
                <li>Navigate to the <strong>Resume Builder</strong> from the top navbar or footer.</li>
                <li>Choose from our curated collection of 10 modern, single-column corporate templates. These are pre-tested to pass ATS scanners.</li>
                <li>Fill out your contact details, objective, experience, education, and skills in the guided sidebar editor.</li>
                <li>Click the <strong>AI Assist</strong> button beside any text field to automatically draft and polish professional descriptions in real-time.</li>
                <li>Preview your changes and adjust margins, typography, and accent colors instantly.</li>
              </ol>
            </div>
          )
        },
        {
          id: 3,
          question: 'What export options do I have for my resume?',
          title: 'Supported Resume Export Formats & Downloads',
          editedTime: 'Edited 3 weeks ago',
          tags: ['export', 'pdf', 'docx', 'download'],
          content: (
            <div className="article-body">
              <p>
                CVMind AI supports professional downloads optimized for standard recruitment systems and human resource pipelines.
              </p>
              <h3>Available Download Formats</h3>
              <ul>
                <li>
                  <strong>PDF (Portable Document Format):</strong> Highly recommended for direct applications. Our PDF generator builds fully text-selectable documents, meaning ATS bots can easily read every word while ensuring formatting remains locked across all device sizes.
                </li>
                <li>
                  <strong>DOCX (Microsoft Word format):</strong> Best if you need to perform additional offline custom adjustments or require editing via desktop word processing tools.
                </li>
              </ul>
            </div>
          )
        },
        {
          id: 4,
          question: 'What file formats are supported for resume scanning?',
          title: 'Supported Upload File Formats & Scanning Limits',
          editedTime: 'Edited 2 months ago',
          tags: ['upload', 'pdf', 'docx', 'txt', 'size'],
          content: (
            <div className="article-body">
              <p>
                When uploading an existing resume to CVMind AI for quick ATS auditing, rating, and keyword scoring, our parser accepts the following formats:
              </p>
              <ul>
                <li><strong>PDF Documents (.pdf)</strong></li>
                <li><strong>Microsoft Word Documents (.docx)</strong></li>
                <li><strong>Plain Text Files (.txt)</strong></li>
              </ul>
              <h3>Uploading Limits</h3>
              <p>
                The maximum allowed file size is <strong>5MB</strong>. To maintain absolute safety and user trust, files are processed **strictly in-memory** and immediately flushed. Your physical resume documents are never written to disk or stored on CVMind AI servers.
              </p>
            </div>
          )
        },
        {
          id: 5,
          question: 'How do I ensure my resume formatting is ATS-friendly?',
          title: 'Crucial ATS Formatting Best Practices',
          editedTime: 'Edited 2 months ago',
          tags: ['ats', 'formatting', 'margins', 'fonts'],
          content: (
            <div className="article-body">
              <p>
                Many highly qualified professionals are rejected solely because their resume formatting breaks standard parsing software.
              </p>
              <h3>Rules to Guarantee ATS Readability:</h3>
              <ul>
                <li><strong>Avoid Tables and Text Boxes:</strong> Scanners parse text left-to-right; text boxes and multi-nested tables scramble your sentences.</li>
                <li><strong>Stick to Standard Fonts:</strong> Use clean, standard system fonts like Inter, Helvetica, Arial, Calibri, or Georgia. Avoid loading custom decorative fonts.</li>
                <li><strong>Use Direct Section Titles:</strong> Standard titles like "Work Experience", "Education", and "Skills" are immediately indexable. Do not use creative titles like "Where I've Been" or "My Superpowers".</li>
                <li><strong>No Icons, Charts, or Progress Bars:</strong> Scanners cannot decipher skills rated as "4 out of 5 stars" or styled inside colorful graphs. Use plain text lists instead.</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      id: 'accounts',
      title: 'Accounts',
      description: 'Articles regarding secure signups, multi-device cloud synchronization, usage limits, and privacy compliance.',
      articleCount: 5,
      articles: [
        {
          id: 6,
          question: 'Do I need to sign up to use CVMind AI?',
          title: 'Account Sign-Up Requirements & Benefits',
          editedTime: 'Edited 4 months ago',
          tags: ['signup', 'login', 'free', 'account'],
          content: (
            <div className="article-body">
              <p className="lead-paragraph">
                CVMind AI is built with user autonomy in mind. You can perform quick resume audits directly on the homepage without registering.
              </p>
              <h3>Why Create a Free Account?</h3>
              <p>To access our advanced professional suites, a secure login is required. An account unlocks:</p>
              <ul>
                <li><strong>Saved History:</strong> Access and manage your previous ATS scoring sheets, tailored variations, and drafts.</li>
                <li><strong>Resume Builder:</strong> Design, edit, and export corporate resumes using our interactive editor.</li>
                <li><strong>Resume Tailoring & SmartPrep:</strong> Run high-performance semantic keyword gap audits and custom mock interviews.</li>
                <li><strong>Dashboard Telemetry:</strong> Track your ATS progress score over time with graphical scorecards.</li>
              </ul>
            </div>
          )
        },
        {
          id: 7,
          question: 'How can I access my saved resumes on another device?',
          title: 'Real-Time Cloud Synchronization & Multi-Device Access',
          editedTime: 'Edited 1 month ago',
          tags: ['sync', 'devices', 'login', 'storage', 'cloud'],
          content: (
            <div className="article-body">
              <p className="lead-paragraph">
                CVMind AI supports real-time cloud synchronization, allowing you to access, edit, and export your career documents from any device.
              </p>
              <h3>Multi-Device Editing & Sync Guidelines</h3>
              <ul>
                <li><strong>Secured to Your Account:</strong> All of your tailored resumes, custom cover letters, dashboard scorecards, and smart mock interviews are synced automatically to your encrypted account profile.</li>
                <li><strong>Cross-Platform Fluidity:</strong> You can start parsing a resume on your desktop computer, make minor adjustments using the Resume Builder on your tablet, and download the clean PDF directly from your mobile phone while on the go.</li>
                <li><strong>Instant Synchronization:</strong> Changes are saved to our databases as you type, ensuring that logging in on any other web browser immediately pulls your latest edits without manual backup exports.</li>
              </ul>
            </div>
          )
        },
        {
          id: 8,
          question: 'What are the account rate limits and credits?',
          title: 'Daily Usage Quotas & Server Rate Limits',
          editedTime: 'Edited 2 weeks ago',
          tags: ['limits', 'credits', 'quota', 'free', 'usage'],
          content: (
            <div className="article-body">
              <p>
                To guarantee high-speed responsiveness for all candidates and prevent AI server congestion, CVMind AI sets standard daily usage credits on free accounts.
              </p>
              <h3>How Usage Credits Reset</h3>
              <ul>
                <li><strong>Daily Reset Timer:</strong> Your core credits for ATS checks, Job Description tailoring, cover letter drafting, and SmartPrep interview questions reset automatically every night at 12:00 AM UTC.</li>
                <li><strong>Status Checks:</strong> You can view your current remaining credits and active history logs inside your personal Dashboard panel.</li>
                <li><strong>Enterprise Scaling:</strong> For heavy job search pipelines requiring bulk tailoring and continuous prep sessions, we offer high-throughput tiers to keep your workflow uninterrupted.</li>
              </ul>
            </div>
          )
        },
        {
          id: 9,
          question: 'How can I delete my account and saved resumes?',
          title: 'Full Account Deletion & Permanent Data Purges',
          editedTime: 'Edited 2 months ago',
          tags: ['delete', 'remove', 'privacy', 'purge'],
          content: (
            <div className="article-body">
              <p>
                We believe you have complete ownership over your career data. If you decide to close your account, we ensure a clean, permanent wipe.
              </p>
              <h3>How Data is Purged</h3>
              <p>When you trigger an account deletion request inside your profile:</p>
              <ul>
                <li>All of your saved resume drafts, cover letters, and scorecards are **permanently deleted** from our secure database.</li>
                <li>We do not retain backup cache files of your career details.</li>
                <li>Your account information, login profiles, and connection metrics are permanently scrubbed from our systems.</li>
              </ul>
            </div>
          )
        },
        {
          id: 10,
          question: 'Is CVMind AI compliant with privacy laws?',
          title: 'Privacy by Design Compliance & Article 21',
          editedTime: 'Edited 2 months ago',
          tags: ['legal', 'privacy', 'article 21', 'gdpr', 'constitution'],
          content: (
            <div className="article-body">
              <p>
                Yes. CVMind AI is engineered under "Privacy by Design" guidelines.
              </p>
              <h3>Constitutional Sovereignty</h3>
              <p>
                In alignment with <strong>Article 21 of the Constitution of India</strong>—which guarantees the Right to Life and Personal Liberty as containing the Sovereign Right to Privacy—our software enforces absolute boundaries on data visibility.
              </p>
              <h3>Data Visibility Breakdown</h3>
              <ul>
                <li><strong>Resumes:</strong> Never saved (parsed in-memory).</li>
                <li><strong>Technical Logs:</strong> Anonymized backend metrics only (apki koi personal details nahi aati h).</li>
                <li><strong>AI Assistant Conversations:</strong> Monitored solely for safety/QA audits and systematically purged.</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      id: 'tailor-prep',
      title: 'Job Description AI Tailor & SmartPrep AI',
      description: 'Articles details regarding semantic gap keywords matching and interactive interviewer coaching.',
      articleCount: 4,
      articles: [
        {
          id: 11,
          question: 'How does the Job Description AI Tailor work?',
          title: 'Keyword Gap Analysis & Dynamic Resume Tailoring',
          editedTime: 'Edited 2 months ago',
          tags: ['tailor', 'job description', 'keywords', 'skills'],
          content: (
            <div className="article-body">
              <p className="lead-paragraph">
                The <strong>Resume Tailorer</strong> is built to adapt your current resume to align perfectly with the target role you are applying for.
              </p>
              <h3>How Tailoring works:</h3>
              <ol>
                <li>Paste the complete Job Description (JD) text into the Tailoring console.</li>
                <li>Our AI performs a semantic keywords gap audit, checking what skills, qualifications, and action verbs the job description expects.</li>
                <li>The engine uncovers key phrases present in the JD but missing in your resume.</li>
                <li>It outputs precise inline rewrites for your experience section, adapting sentences to highlight relevant skills while preserving factual career history.</li>
              </ol>
            </div>
          )
        },
        {
          id: 12,
          question: 'What is SmartPrep AI and how does it help?',
          title: 'SmartPrep AI - Customized Interview Coaching',
          editedTime: 'Edited 1 month ago',
          tags: ['prep', 'interview', 'coach', 'questions'],
          content: (
            <div className="article-body">
              <p>
                <strong>SmartPrep AI</strong> is our interactive, resume-driven mock interview simulator.
              </p>
              <h3>Personalized Interview Simulation</h3>
              <p>
                Unlike generic online interview lists, SmartPrep parses the exact experience on your resume to generate a customized set of high-impact behavioral, situational, and technical questions you are highly likely to face from recruiters.
              </p>
              <div className="callout-info">
                <strong>Behavioral Checks:</strong> SmartPrep analyzes your mock answers to evaluate STAR compliance (Situation, Task, Action, Result) to make sure your storytelling structure is correct.
              </div>
            </div>
          )
        },
        {
          id: 13,
          question: 'How is the interview scorecard calculated?',
          title: 'Interview Evaluation Scorecards & Feedback Criteria',
          editedTime: 'Edited 3 weeks ago',
          tags: ['scorecard', 'interview', 'feedback', 'grading'],
          content: (
            <div className="article-body">
              <p>
                When you complete a SmartPrep mock interview session, the AI compiles a detailed performance scorecard.
              </p>
              <h3>Grading Elements</h3>
              <ul>
                <li><strong>STAR Method Alignment:</strong> Evaluates if you clearly defined the context, your task, the active steps you took, and final quantitative results.</li>
                <li><strong>Grammar & Professional Tone:</strong> Scores sentence clarity, vocabulary impact, and professionalism.</li>
                <li><strong>Competency Alignment:</strong> Checks if your answers successfully demoed the specific technical skills claimed in your CV.</li>
                <li><strong>Actionable Fixes:</strong> Provides model answers showing exactly how to reword weaker portions.</li>
              </ul>
            </div>
          )
        },
        {
          id: 14,
          question: 'Are my mock interview answers recorded or shared?',
          title: 'Mock Interview Privacy & AI Chat Auditing',
          editedTime: 'Edited 2 months ago',
          tags: ['privacy', 'chat', 'logs', 'purges'],
          content: (
            <div className="article-body">
              <p>
                We protect your vulnerability during interview practices.
              </p>
              <h3>Strict Session Policies</h3>
              <ul>
                <li><strong>Zero Machine Learning Training:</strong> Your mock answers and conversational inputs are never uploaded to train public LLM models.</li>
                <li><strong>QA Logs Isolation:</strong> Conversation dialogue metrics are logged securely strictly for development error checks and chatbot behavior audits, and are periodically purged completely.</li>
              </ul>
            </div>
          )
        }
      ]
    }
  ];

  // Helper to resolve all articles into a flat list for global search filtering
  const allArticles = useMemo(() => {
    const list: { catId: 'resumes' | 'accounts' | 'tailor-prep'; article: FAQArticle }[] = [];
    faqCategories.forEach(category => {
      category.articles.forEach(article => {
        list.push({ catId: category.id, article });
      });
    });
    return list;
  }, []);

  // Filtered autocomplete search suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allArticles.filter(item => {
      return (
        item.article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [searchQuery, allArticles]);

  // Navigate to split view from categories dashboard
  const handleCategoryClick = (catId: 'resumes' | 'accounts' | 'tailor-prep') => {
    setSelectedCategory(catId);
    const category = faqCategories.find(c => c.id === catId);
    if (category && category.articles.length > 0) {
      setActiveArticleId(category.articles[0].id);
    }
  };

  // Jump to specific article directly (e.g. from search click)
  const handleArticleJump = (catId: 'resumes' | 'accounts' | 'tailor-prep', articleId: number) => {
    setSelectedCategory(catId);
    setActiveArticleId(articleId);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Reset to categories dashboard view
  const handleBackToHome = () => {
    setSelectedCategory(null);
    setActiveArticleId(null);
    setSearchQuery('');
  };

  // Active category object
  const activeCategoryObject = faqCategories.find(c => c.id === selectedCategory);

  // Active article object
  const activeArticleObject = activeCategoryObject?.articles.find(a => a.id === activeArticleId);

  return (
    <div className="faq-container animate-fade-in-up">
      {/* Background ambient glow nodes */}
      <div className="faq-glow faq-glow-left"></div>
      <div className="faq-glow faq-glow-right"></div>

      {/* Main dashboard view (Category Folder Selection Grid) */}
      {selectedCategory === null ? (
        <div className="faq-dashboard-view">
          <section className="faq-hero">
            <div className="faq-hero-badge">
              <span className="badge badge-purple">
                <HelpCircle size={12} style={{ marginRight: '4px' }} /> Support Center
              </span>
            </div>
            <h1 className="faq-title">How can we help you?</h1>
          </section>

          {/* Centered Global Search with suggestions */}
          <div className="faq-search-section">
            <div className="faq-search-wrapper glass-card">
              <Search className="faq-search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search articles by keywords (e.g. ATS, Cloud Sync, Privacy...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="faq-search-input"
              />
              {searchQuery && (
                <button 
                  className="faq-clear-btn" 
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                >
                  Clear
                </button>
              )}

              {/* Autocomplete Dropdown Panel */}
              {showSuggestions && searchQuery.trim() && (
                <div className="faq-search-dropdown glass-card">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <button 
                        key={item.article.id}
                        className="suggestion-row"
                        onClick={() => handleArticleJump(item.catId, item.article.id)}
                      >
                        <div className="suggestion-info">
                          <span className="suggestion-category-tag">{item.catId === 'resumes' ? 'Resumes & Cover Letters' : item.catId === 'accounts' ? 'Accounts' : 'AI Tailor & SmartPrep'}</span>
                          <span className="suggestion-question">{item.article.question}</span>
                        </div>
                        <ArrowRight size={14} className="suggestion-arrow" />
                      </button>
                    ))
                  ) : (
                    <div className="suggestion-empty">
                      No articles found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grid of Folders */}
          <div className="faq-folders-grid">
            {faqCategories.map((cat) => (
              <button 
                key={cat.id} 
                className="folder-card glass-card animate-hover"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="folder-icon-box">
                  <Folder size={32} className="folder-icon" />
                </div>
                <h3 className="folder-title">{cat.title}</h3>
                <p className="folder-articles-count">{cat.articleCount} articles</p>
              </button>
            ))}
          </div>

          {/* Premium Bottom Callout */}
          <section className="faq-cta-card glass-card">
            <div className="faq-cta-glow"></div>
            <div className="faq-cta-content">
              <div className="faq-cta-header">
                <Sparkles size={24} className="cta-icon" />
                <h2>Ready to Optimize Your Resume?</h2>
              </div>
              <p>
                Put these guides to the test. Let our AI audits grade your resume and optimize your professional outline in seconds.
              </p>
              <div className="faq-cta-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => { setCurrentPage('home'); window.scrollTo(0,0); }}
                >
                  Analyze Your Resume <ArrowRight size={16} />
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => { setCurrentPage('resume-builder'); window.scrollTo(0,0); }}
                >
                  Build from Scratch
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Split-Screen Article Reader View */
        <div className="faq-reader-view">
          {/* Top Breadcrumb Navigation */}
          <div className="faq-breadcrumb">
            <button className="breadcrumb-back-btn" onClick={handleBackToHome}>
              <ChevronLeft size={16} /> FAQ Home
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current-category">{activeCategoryObject?.title}</span>
          </div>

          <div className="faq-split-layout">
            {/* Left Sidebar - Article Links List */}
            <aside className="faq-sidebar">
              <h4 className="sidebar-heading">In this article</h4>
              <div className="sidebar-links-list">
                {activeCategoryObject?.articles.map((art) => {
                  const isActive = art.id === activeArticleId;
                  return (
                    <button 
                      key={art.id} 
                      className={`sidebar-article-link ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveArticleId(art.id)}
                    >
                      <span className="bullet-dot"></span>
                      <span className="link-text">{art.question}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Panel - Detailed Article Content */}
            <main className="faq-article-container glass-card">
              {activeArticleObject ? (
                <article className="faq-main-article">
                  <header className="article-header">
                    <h1 className="article-main-title">{activeArticleObject.title}</h1>
                    <div className="article-meta">
                      <Clock size={14} className="meta-icon" />
                      <span className="meta-text">{activeArticleObject.editedTime}</span>
                    </div>
                  </header>
                  <div className="article-content-body">
                    {activeArticleObject.content}
                  </div>
                  <div className="article-footer-tags">
                    {activeArticleObject.tags.map((tag, idx) => (
                      <span key={idx} className="article-tag">#{tag}</span>
                    ))}
                  </div>
                </article>
              ) : (
                <div className="article-placeholder">
                  <HelpCircle size={48} className="placeholder-icon animate-pulse" />
                  <h3>Select an article</h3>
                  <p>Choose one of the questions on the left to read its full help documentation.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
