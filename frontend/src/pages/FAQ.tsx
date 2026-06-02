import { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  Layers, 
  ArrowRight,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import './FAQ.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'features' | 'privacy' | 'account';
  tags: string[];
}

interface FAQProps {
  setCurrentPage: (page: string) => void;
}

export default function FAQ({ setCurrentPage }: FAQProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'features' | 'privacy' | 'account'>('all');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: 'general',
      question: 'What is CVMind AI?',
      answer: 'CVMind AI is an advanced, AI-powered resume intelligence platform designed for modern professionals. It offers comprehensive ATS compatibility scoring, in-depth keyword analysis, instant recruiter-focused bullet point editing, customized interview preparation (SmartPrep AI), and a sleek drag-and-drop Resume Builder. Our system acts as your personal career strategist, analyzing your technical background and structuring your achievements to make a striking impression on recruiters.',
      tags: ['platform', 'about', 'introduction', 'ats']
    },
    {
      id: 2,
      category: 'features',
      question: 'How is the ATS compatibility score calculated?',
      answer: 'Our proprietary ATS (Applicant Tracking System) auditing engine simulates top-tier corporate recruitment filters. It thoroughly scans your resume file across five key vectors: layout & formatting (avoiding tables/columns/charts that blind parsing software), contact detail validity, core professional skills density, usage of high-impact action verbs, and structural readability. The result is an actionable, percentage-based score coupled with line-by-line recommendations on exactly what to modify.',
      tags: ['score', 'ats', 'audit', 'formatting']
    },
    {
      id: 3,
      category: 'features',
      question: 'What does the Resume Tailorer do?',
      answer: 'The Resume Tailorer is designed to bridge the gap between your background and your dream job. By pasting a target Job Description alongside your resume, our AI parses the semantic requirements, uncovers missing keywords, and optimizes your existing experience. It carefully adapts your bullet points to align with the employer’s exact terminology while keeping your professional history accurate, legal, and authentic.',
      tags: ['tailor', 'job description', 'optimization', 'keywords']
    },
    {
      id: 4,
      category: 'features',
      question: 'What is SmartPrep AI and how does it help?',
      answer: 'SmartPrep AI is a simulated technical and behavioral interview preparation tool. Using the details extracted from your resume history, the AI generates custom questions structured around real recruiter models (including the STAR method: Situation, Task, Action, Result). It allows you to simulate high-pressure interviews, provides sample answers, and gives you detailed scoring feedback to ensure you walk into your next interview completely prepared.',
      tags: ['prep', 'interview', 'questions', 'scorecard']
    },
    {
      id: 5,
      category: 'privacy',
      question: 'Is my uploaded resume saved or stored anywhere?',
      answer: 'Absolutely not. At CVMind AI, privacy is a structural pillar. When you upload a PDF, DOCX, or TXT file for ATS checking, the file text is parsed in-memory, evaluated securely using official LLM API endpoints in a single temporary session, and immediately cleared. Your physical documents are never stored on a hard drive, never written to a persistent database, and never sold, shared, or distributed.',
      tags: ['privacy', 'security', 'upload', 'data']
    },
    {
      id: 6,
      category: 'privacy',
      question: 'What data does CVMind AI collect and monitor?',
      answer: 'We believe in absolute transparency: 1) We cannot see your uploaded resumes. 2) We cannot see your saved works or custom-tailored outputs. 3) We do log system performance telemetries (API speeds, server errors), but these contain zero personally identifiable details (apki koi personal details nahi aati h). 4) We do monitor conversations between users and our AI chat assistant solely to ensure security, quality auditing, and API stability. These chat transcripts are periodically purged.',
      tags: ['data', 'logs', 'chat', 'gdpr', 'transparency']
    },
    {
      id: 7,
      category: 'privacy',
      question: 'Is CVMind AI compliant with privacy laws?',
      answer: 'Yes. Our infrastructure is built using the principles of "Privacy by Design." In keeping with the spirit of Article 21 of the Constitution of India—which guarantees the Right to Life and Personal Liberty as inclusive of the Sovereign Right to Privacy—our software respects user autonomy, enforces strict sandboxing, and prevents any passive collection of user-identifiable data.',
      tags: ['constitution', 'privacy', 'article 21', 'legal']
    },
    {
      id: 8,
      category: 'account',
      question: 'Do I need to supply my own Gemini API Key?',
      answer: 'No, CVMind AI works straight out of the box using our built-in servers! However, to prevent abuse and API exhaustion, a standard free account has reasonable hourly rate limits. If you are tailoring multiple resumes, practicing interview prepping extensively, or want unlimited high-speed bypass, you can choose to supply your own custom Gemini API Key in the navbar settings.',
      tags: ['api key', 'gemini', 'rate limit', 'free']
    },
    {
      id: 9,
      category: 'account',
      question: 'Are my custom Gemini API Keys secure?',
      answer: 'Completely sovereign and safe. When you supply your own Gemini API Key, it is stored locally in your browser’s secure LocalStorage. It never touches CVMind AI servers. Requests are sent directly from your client-side browser to Google’s Gemini endpoints, keeping your key fully under your ownership and completely hidden from anyone else.',
      tags: ['api key', 'security', 'storage', 'localstorage']
    },
    {
      id: 10,
      category: 'features',
      question: 'Can I design and build a resume from scratch?',
      answer: 'Yes, CVMind AI features a powerful Resume Builder equipped with 10 industry-standard, clean corporate layouts. The builder tracks ATS guidelines perfectly (avoiding non-standard section titles, tables, or columns that choke scanners) and offers inline AI assistance to draft bullets, restructure descriptions, and adjust text styling effortlessly.',
      tags: ['builder', 'design', 'templates', 'resume']
    },
    {
      id: 11,
      category: 'features',
      question: 'What export options do I have?',
      answer: 'Once you are finished editing or building your resume in the Resume Builder, you can export your optimized document as a clean, pixel-perfect PDF (ideal for direct job submissions) or download it as an editable DOCX (Microsoft Word) file, making it highly customizable for any last-minute modifications.',
      tags: ['export', 'pdf', 'docx', 'download']
    },
    {
      id: 12,
      category: 'account',
      question: 'Do I need to sign up to use CVMind AI?',
      answer: 'You can test your resume and get basic ATS scoring on the homepage without an account. However, to save your progress, access your personalized dashboard, manage tailored variations, write smart cover letters, and unlock advanced SmartPrep AI training sessions, you will need to create a free secure account.',
      tags: ['signup', 'account', 'login', 'dashboard']
    }
  ];

  // Filter and search FAQs
  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleFaq = (id: number) => {
    setOpenFaqId(prevId => (prevId === id ? null : id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <BookOpen size={16} />;
      case 'features': return <Sparkles size={16} />;
      case 'privacy': return <ShieldCheck size={16} />;
      case 'account': return <Key size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  return (
    <div className="faq-container animate-fade-in-up">
      {/* Ambient background glow elements */}
      <div className="faq-glow faq-glow-left"></div>
      <div className="faq-glow faq-glow-right"></div>

      <section className="faq-hero">
        <div className="faq-hero-badge">
          <span className="badge badge-purple">
            <HelpCircle size={12} style={{ marginRight: '4px' }} /> Support Center
          </span>
        </div>
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">
          Got questions? We have answers. Learn about CVMind AI’s algorithms, state-of-the-art privacy design, and professional developer tools.
        </p>
      </section>

      {/* Search and Filters panel */}
      <div className="faq-controls glass-card">
        <div className="faq-search-wrapper">
          <Search className="faq-search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search FAQs by keywords (e.g. ATS, Gemini, Privacy...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input"
          />
          {searchQuery && (
            <button 
              className="faq-clear-btn" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="faq-tabs">
          <button 
            className={`faq-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <Layers size={14} /> All FAQs
          </button>
          <button 
            className={`faq-tab ${activeCategory === 'general' ? 'active' : ''}`}
            onClick={() => setActiveCategory('general')}
          >
            <BookOpen size={14} /> General
          </button>
          <button 
            className={`faq-tab ${activeCategory === 'features' ? 'active' : ''}`}
            onClick={() => setActiveCategory('features')}
          >
            <Sparkles size={14} /> AI Features
          </button>
          <button 
            className={`faq-tab ${activeCategory === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveCategory('privacy')}
          >
            <ShieldCheck size={14} /> Privacy & Trust
          </button>
          <button 
            className={`faq-tab ${activeCategory === 'account' ? 'active' : ''}`}
            onClick={() => setActiveCategory('account')}
          >
            <Key size={14} /> Keys & Account
          </button>
        </div>
      </div>

      {/* FAQs List Accordion */}
      <div className="faq-list-section">
        {filteredFaqs.length > 0 ? (
          <div className="faq-accordion-group">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`faq-item-card glass-card ${isOpen ? 'expanded' : ''}`}
                >
                  <button 
                    className="faq-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-content">
                      <span className={`faq-category-indicator ${faq.category}`}>
                        {getCategoryIcon(faq.category)}
                        <span className="indicator-text">{faq.category}</span>
                      </span>
                      <h3 className="faq-question-text">{faq.question}</h3>
                    </div>
                    <div className={`faq-chevron-wrapper ${isOpen ? 'rotated' : ''}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  
                  <div className={`faq-answer-panel ${isOpen ? 'open' : 'collapsed'}`}>
                    <div className="faq-answer-content">
                      <p>{faq.answer}</p>
                      <div className="faq-tags-row">
                        {faq.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="faq-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="faq-empty-state glass-card">
            <MessageSquare size={48} className="empty-icon" />
            <h3>No Questions Found</h3>
            <p>We couldn't find any FAQs matching "{searchQuery}". Try searching for something else or browse categories.</p>
            <button className="reset-search-btn" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Premium Help CTA Card */}
      <section className="faq-cta-card glass-card">
        <div className="faq-cta-glow"></div>
        <div className="faq-cta-content">
          <div className="faq-cta-header">
            <Sparkles size={24} className="cta-icon" />
            <h2>Ready to Optimize Your Resume?</h2>
          </div>
          <p>
            Put these FAQs to the test. Let our AI audits grade your resume and optimize your professional outline in seconds.
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
  );
}
