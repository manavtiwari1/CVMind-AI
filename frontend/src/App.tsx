import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Tailor from './pages/Tailor';
import Prep from './pages/Prep';
import CoverLetter from './pages/CoverLetter';
import LinkedIn from './pages/linkedin/LinkedIn';
import LinkedInBio from './pages/linkedin/LinkedInBio';
import LinkedInOutreach from './pages/linkedin/LinkedInOutreach';
import CareerCourses from './pages/career-path-ai/CareerCourses';
import ElevatorPitch from './pages/career-path-ai/ElevatorPitch';
import CareerRoadmap from './pages/career-path-ai/CareerRoadmap';
import Portfolio from './pages/Portfolio';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import LinkedInPost from './pages/linkedin/LinkedInPost';
import VoicePrep from './pages/VoicePrep';
import PortfolioGen from './pages/PortfolioGen';
import Products from './pages/Products';
import JobFinder from './pages/JobFinder';
import ResumeBuilderLanding from './pages/ResumeBuilderLanding';
import Pricing from './pages/Pricing';
import AuthModal from './components/AuthModal';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import Disclaimer from './pages/Disclaimer';
import Proofreading from './pages/Proofreading';
import DigitalSerenityBackground from './components/DigitalSerenityBackground';
import CrispChat from './components/CrispChat';
import { applySEO } from './utils/seo';
import './styles/theme.css';
import './styles/3d-effects.css';
import './styles/skeleton.css';


export default function App() {
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/portfolio/')) {
      return 'portfolio';
    }
    const urlPage = pathname.replace(/^\//, '');
    const validPages = ['home', 'about', 'contact', 'dashboard', 'admin', 'tailor', 'prep', 'linkedin', 'linkedin-bio', 'linkedin-outreach', 'linkedin-post', 'career-courses', 'elevator-pitch', 'career-roadmap', 'resume-builder', 'resume-editor', 'privacy', 'faq', 'blog', 'voice-prep', 'portfolio-gen', 'products', 'job-finder', 'pricing', 'terms', 'refund-policy', 'disclaimer', 'proofreading'];
    if (urlPage && validPages.includes(urlPage)) {
      return urlPage;
    }
    const savedPage = localStorage.getItem('cvmind_current_page');
    if (savedPage && validPages.includes(savedPage)) {
      return savedPage;
    }
    return 'home';
  });

  const theme = 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('cvmind_theme', 'light');

    // Check if running inside the mobile app WebView
    if (window.location.search.includes('platform=app')) {
      localStorage.setItem('is_cvmind_app', 'true');
    }
  }, []);

  useEffect(() => {
    applySEO(currentPage);
  }, [currentPage]);

  // Scroll to top of the page on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Dynamically update SEO Metadata based on the active page
  useEffect(() => {
    const metaData: Record<string, { title: string; description: string; keywords: string }> = {
      home: {
        title: "CV Mind - Free AI Resume Checker & ATS Optimization Tool",
        description: "Optimize your resume instantly with CV Mind. Our corporate AI recruiter audits formatting, structural weaknesses, missing keywords, and provides professional before-and-after experience rewrites.",
        keywords: "AI Resume Checker, ATS Optimizer, Resume Audit, Free Resume Review, Career Optimization, Bullet Rewriter, Resume Rating"
      },
      about: {
        title: "About Us | CV Mind Resume Intelligence",
        description: "Learn about CV Mind, our mission to democratize recruitment technology, and how our corporate AI resume scanner helps candidates beat applicant tracking systems.",
        keywords: "About CV Mind, AI resume scanner, ATS technology, resume optimization mission, career tech"
      },
      contact: {
        title: "Contact Us | Support & Feedback - CV Mind",
        description: "Get in touch with the CV Mind team. We welcome your feedback, partnership inquiries, and questions about our AI resume checker and ATS optimization tools.",
        keywords: "Contact CV Mind, resume checker support, career tool help, feedback, partnership"
      },
      privacy: {
        title: "Privacy Policy | Secure & Anonymous Resume Parsing - CV Mind",
        description: "Your privacy is our priority. CV Mind parses your resume entirely in memory. Read our Privacy Policy to understand how we protect your document and data.",
        keywords: "Privacy Policy, secure resume parsing, data privacy, resume builder terms"
      },
      faq: {
        title: "Frequently Asked Questions (FAQ) | CV Mind",
        description: "Find answers to common questions about CV Mind, ATS resume scoring, keyword optimization, privacy, and how to download your recruiter-ready resume.",
        keywords: "FAQ, CV Mind questions, ATS help, resume builder help, how to write resume"
      },
      blog: {
        title: "Career Advice & Resume Optimization Blog | CV Mind",
        description: "Explore expert tips, resume writing guides, career strategies, and ATS secrets from recruiters to help you land your dream job.",
        keywords: "Resume Blog, Career Advice, Resume Writing Guides, Job Search Tips, Recruiter Secrets, ATS Optimization"
      },
      dashboard: {
        title: "Resume Audit Scorecard & ATS Analytics | CV Mind",
        description: "View your detailed AI resume analysis score, structural formatting alerts, keyword matches, and recruiter insights on your personalized CVMind dashboard.",
        keywords: "Resume Dashboard, Resume Scorecard, ATS Score, Keyword Match, Resume Analysis"
      },
      admin: {
        title: "Admin Dashboard | CV Mind",
        description: "Secure administrator console for CV Mind system health, user analytics, and database telemetry.",
        keywords: "Admin, CVMind Admin, DB Telemetry"
      },
      tailor: {
        title: "AI Resume Tailoring Tool | Match Job Descriptions - CV Mind",
        description: "Tailor your resume to any job description instantly. Our AI matches keywords, optimizes achievements, and aligns your experience for maximum ATS compatibility.",
        keywords: "Resume Tailorer, Job Matching, Resume Alignment, ATS Keyword Match"
      },
      prep: {
        title: "AI Interview Preparation & Mock Interviews | CV Mind",
        description: "Prepare for interviews with personalized AI coaching. Get simulated behavioral questions, instant answers assessment, and industry-specific prep tips based on your resume.",
        keywords: "AI Interview Prep, Mock Interview, Interview Coaching, Behavioral Questions"
      },
      linkedin: {
        title: "LinkedIn Profile Optimizer | CV Mind",
        description: "Optimize your LinkedIn profile to get noticed by recruiters. Learn how to align your experience, headline, and skills with AI-driven recommendations.",
        keywords: "LinkedIn Optimizer, LinkedIn SEO, Profile Optimization, Recruiter Attraction"
      },
      'linkedin-bio': {
        title: "AI LinkedIn Bio Generator | Headline & Summary - CV Mind",
        description: "Create a compelling LinkedIn bio and headline in seconds. Our AI generates professional summaries that align with your industry, resume, and target roles.",
        keywords: "LinkedIn Bio Generator, Professional Headline, LinkedIn Summary AI"
      },
      'linkedin-outreach': {
        title: "AI LinkedIn Outreach Message Generator | CV Mind",
        description: "Generate personalized LinkedIn outreach messages to connect with recruiters, hiring managers, and industry peers to accelerate your job search.",
        keywords: "LinkedIn Outreach, Networking Messages, Recruiter Outreach AI"
      },
      'career-courses': {
        title: "AI-Recommended Career & Skill Development Courses | CV Mind",
        description: "Discover online courses curated by AI to fill your skill gaps. Advance your career with targeted learning options based on your resume analysis.",
        keywords: "Career Development Courses, Skill Gap, Professional Learning, Online Courses"
      },
      'elevator-pitch': {
        title: "AI Elevator Pitch Generator | Self-Introduction - CV Mind",
        description: "Generate a high-impact professional elevator pitch for networking events, job interviews, and cold outreach. Sound confident, clear, and recruiter-ready.",
        keywords: "Elevator Pitch Generator, Self-Introduction, Job Interview Pitch"
      },
      'career-roadmap': {
        title: "AI Career Path Roadmap Generator | Career Planning - CV Mind",
        description: "Map out your long-term career growth with our AI Career Roadmap generator. Get step-by-step career milestones, certification paths, and skill progression plans.",
        keywords: "Career Roadmap Generator, Career Path Planner, Skill Progression, Career Strategy"
      },
      'resume-builder': {
        title: "AI Resume Builder & Free ATS Templates | CV Mind",
        description: "Build a professionally formatted resume in minutes with our free AI Resume Builder. Choose from 10+ ATS-compliant templates and get AI-powered text refining.",
        keywords: "AI Resume Builder, ATS Templates, Free Resume Maker, Resume Generator"
      },
      'linkedin-post': {
        title: "AI LinkedIn Post Generator | Viral Posts - CV Mind",
        description: "Generate 3 viral LinkedIn post styles in seconds. AI writes professional, storytelling & bold posts with hooks, emojis, and optimized hashtags.",
        keywords: "LinkedIn Post Generator, Viral LinkedIn Posts, AI Content Writer, LinkedIn Growth"
      },
      'voice-prep': {
        title: "Voice Interview Practice | AI Coaching - CV Mind",
        description: "Practice interviews by speaking your answers aloud. AI transcribes, analyzes confidence, detects filler words, and gives real-time coaching feedback.",
        keywords: "Voice Interview Practice, AI Interview Coach, Mock Interview, Speech Analysis"
      },
      'portfolio-gen': {
        title: "AI Portfolio Website Generator | Free - CV Mind",
        description: "Generate a stunning, responsive portfolio website from your resume in seconds. Choose themes, preview live, and download the HTML file instantly.",
        keywords: "Portfolio Website Generator, AI Portfolio Builder, Resume to Portfolio, HTML Portfolio"
      },
      portfolio: {
        title: "Developer Portfolio Showcase | CV Mind",
        description: "Interactive professional portfolio showcasing developer projects, skills, and work achievements powered by CV Mind.",
        keywords: "Developer Portfolio, Interactive CV, Project Showcase"
      },
      products: {
        title: "All AI Career Tools | Product Showcase - CV Mind",
        description: "Explore all 7 AI-powered career tools by CVMind. From resume checking to interview prep, LinkedIn optimization, career roadmapping, and AI job finding — all in one place.",
        keywords: "AI Career Tools, Resume Checker, Interview Prep, LinkedIn Optimizer, Career Roadmap, Voice Coach, Job Finder"
      },
      'job-finder': {
        title: "AI Job Finder | Match Jobs to Your CV - CV Mind",
        description: "Upload your CV and describe your target role. CV Mind matches you with 8–10 curated job openings complete with match scores, required skills, salary ranges, and direct apply links.",
        keywords: "AI Job Finder, Job Search, Resume to Jobs, Remote Jobs, Full-time Jobs, Internship Finder, Career Match"
      },
      proofreading: {
        title: "AI Proofreading | Grammar, Tone & Power Verbs - CV Mind",
        description: "Let AI proofread your resume, cover letter, or any professional text. Fixes grammar, spelling, passive voice, weak verbs, and aligns tone to your target industry — one click.",
        keywords: "AI Proofreading, Grammar Checker, Active Voice, Power Verbs, Resume Proofreader, Professional Writing"
      }
    };

    const currentMeta = metaData[currentPage] || metaData.home;
    document.title = currentMeta.title;

    // Update description meta tag
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', currentMeta.description);

    // Update keywords meta tag
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', currentMeta.keywords);

    // Update Open Graph tags (dynamic matching)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', currentMeta.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', currentMeta.description);

    // Update Twitter Card tags (dynamic matching)
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', currentMeta.title);

    const twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', currentMeta.description);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const domain = window.location.origin;
    const path = currentPage === 'home' ? '' : `/${currentPage}`;
    canonicalLink.setAttribute('href', `${domain}${path}`);
  }, [currentPage]);


  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('resumetrics_gemini_key') || '';
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cvmind_logged_in') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [loadedWork, setLoadedWork] = useState<any>(null);

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    localStorage.setItem('cvmind_current_page', page);
    const newPath = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({}, '', newPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/portfolio/')) {
        setCurrentPageState('portfolio');
        return;
      }
      const page = pathname.replace(/^\//, '') || 'home';
      setCurrentPageState(page);
      localStorage.setItem('cvmind_current_page', page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync custom API key to LocalStorage for premium usability
  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem('resumetrics_gemini_key', customApiKey);
    } else {
      localStorage.removeItem('resumetrics_gemini_key');
    }
  }, [customApiKey]);

  // Private route interceptor — all private pages require sign-in only (no paid gating)
  useEffect(() => {
    const privatePages = ['prep', 'resume-editor', 'linkedin', 'linkedin-bio', 'linkedin-outreach', 'linkedin-post', 'proofreading', 'tailor', 'voice-prep', 'portfolio-gen', 'job-finder', 'career-courses', 'elevator-pitch', 'career-roadmap'];

    if (privatePages.includes(currentPage) && !isLoggedIn) {
      setCurrentPage('home');
      setShowAuthModal(true);
    }
  }, [currentPage, isLoggedIn]);

  // Auto-detect resetToken in URL and trigger AuthModal password reset popup
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('resetToken');
    const email = searchParams.get('email');
    if (token && email) {
      setShowAuthModal(true);
    }
  }, []);

  // Handle Google OAuth Redirect Callback
  useEffect(() => {
    const handleGoogleRedirect = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      if (!idToken) return;

      // Clear the hash from address bar immediately
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');

        const res = await fetch(`${baseUrl}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google login failed.');

        localStorage.setItem('cvmind_logged_in', 'true');
        localStorage.setItem('cvmind_user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      } catch (err: any) {
        console.error('Google Redirect Auth Error:', err);
      }
    };

    handleGoogleRedirect();
  }, []);


  const handleSignOut = () => {
    localStorage.removeItem('cvmind_logged_in');
    setIsLoggedIn(false);
    resetAnalysis();
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setResumeText('');
    setCurrentPage('home');
  };

  // Helper to switch pages dynamically
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setAnalysisResult={setAnalysisResult}
            setResumeText={setResumeText}
            customApiKey={customApiKey}
          />
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'privacy':
        return <Privacy />;
      case 'faq':
        return <FAQ setCurrentPage={setCurrentPage} />;
      case 'blog':
        return <Blog setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            analysisResult={analysisResult}
            resumeText={resumeText}
            resetAnalysis={resetAnalysis}
            customApiKey={customApiKey}
          />
        );
      case 'admin':
        return <Admin setCurrentPage={setCurrentPage} />;
      case 'tailor':
        return <Tailor customApiKey={customApiKey} />;
      case 'prep':
        return (
          <Prep 
            customApiKey={customApiKey}
            resumeText={resumeText}
            setResumeText={setResumeText}
            setCurrentPage={setCurrentPage}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'linkedin':
        return (
          <LinkedIn 
            customApiKey={customApiKey}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'linkedin-bio':
        return (
          <LinkedInBio 
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'linkedin-outreach':
        return (
          <LinkedInOutreach 
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'career-courses':
        return (
          <CareerCourses 
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'elevator-pitch':
        return (
          <ElevatorPitch 
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'career-roadmap':
        return (
          <CareerRoadmap 
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'linkedin-post':
        return (
          <LinkedInPost
            customApiKey={customApiKey}
            resumeText={resumeText}
            loadedWork={loadedWork}
            setLoadedWork={setLoadedWork}
          />
        );
      case 'voice-prep':
        return (
          <VoicePrep
            customApiKey={customApiKey}
            resumeText={resumeText}
          />
        );
      case 'portfolio-gen':
        return (
          <PortfolioGen
            customApiKey={customApiKey}
            resumeText={resumeText}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'products':
        return <Products setCurrentPage={setCurrentPage} />;
      case 'job-finder':
        return <JobFinder customApiKey={customApiKey} />;
      case 'portfolio':
        const wId = window.location.pathname.split('/').pop();
        return <Portfolio workId={wId} />;
      case 'resume-builder':
        return <ResumeBuilderLanding setCurrentPage={setCurrentPage} />;
      case 'resume-editor':
        return <CoverLetter customApiKey={customApiKey} loadedWork={loadedWork} setLoadedWork={setLoadedWork} />;
      case 'pricing':
        return <Pricing setCurrentPage={setCurrentPage} isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} />;
      case 'terms':
        return <Terms />;
      case 'refund-policy':
        return <RefundPolicy />;
      case 'disclaimer':
        return <Disclaimer />;
      case 'proofreading':
        return <Proofreading customApiKey={customApiKey} />;
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setAnalysisResult={setAnalysisResult}
            setResumeText={setResumeText}
            customApiKey={customApiKey}
          />
        );
    }
  };

  const isAdminPage = currentPage === 'admin';
  const isMinimalPage = currentPage === 'admin' || currentPage === 'portfolio';

  return (
    <div className={`app-container ${isAdminPage ? 'admin-shell' : ''}`}>

      {/* ── Global Digital Serenity Background (for both dark & light modes) ── */}
      {!isMinimalPage && <DigitalSerenityBackground theme={theme} />}

      {!isMinimalPage && (
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          customApiKey={customApiKey}
          setCustomApiKey={setCustomApiKey}
          isLoggedIn={isLoggedIn}
          setShowAuthModal={setShowAuthModal}
          handleSignOut={handleSignOut}
          setLoadedWork={setLoadedWork}
        />
      )}

      <main className="main-content">
        {renderPage()}
      </main>

      {!isMinimalPage && <Footer setCurrentPage={setCurrentPage} />}
      {!isMinimalPage && <Chatbot customApiKey={customApiKey} />}
      {!isMinimalPage && <CrispChat />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => { setIsLoggedIn(true); }}
      />
    </div>
  );
}
