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
// import JobFinder from './pages/JobFinder'; // temporarily disabled — restore with the job-finder case below
import ResumeBuilderLanding from './pages/ResumeBuilderLanding';
import Pricing from './pages/Pricing';
import AuthModal from './components/AuthModal';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import Disclaimer from './pages/Disclaimer';
import Proofreading from './pages/Proofreading';
import AutoApply from './pages/AutoApply';
import CareerCopilot from './pages/CareerCopilot';
import ArticleAtsResume from './pages/ArticleAtsResume';
import ArticlePage from './pages/ArticlePage';
import { ARTICLES } from './data/articles';
import DigitalSerenityBackground from './components/DigitalSerenityBackground';
import TawkChat from './components/TawkChat';
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
    const validPages = ['home', 'about', 'contact', 'dashboard', 'admin', 'tailor', 'prep', 'linkedin', 'linkedin-bio', 'linkedin-outreach', 'linkedin-post', 'career-courses', 'elevator-pitch', 'career-roadmap', 'resume-builder', 'resume-editor', 'privacy', 'faq', 'blog', 'voice-prep', 'portfolio-gen', 'products', 'job-finder', 'pricing', 'terms', 'refund-policy', 'disclaimer', 'proofreading', 'auto-apply', 'career-copilot', ...ARTICLES.map(a => a.slug)];
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


  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('resumetrics_gemini_key') || '';
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [hasAutoApplyAccess, setHasAutoApplyAccess] = useState<boolean>(() => {
    return localStorage.getItem('cvmind_aa_access') === 'true';
  });

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cvmind_logged_in') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [loadedWork, setLoadedWork] = useState<any>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://cvmindai-backend.onrender.com');
    if (!isLoggedIn) {
      setHasAutoApplyAccess(false); localStorage.removeItem('cvmind_aa_access');
      localStorage.removeItem('cvmind_cc_access');
      return;
    }
    const user = JSON.parse(localStorage.getItem('cvmind_user') || '{}');
    if (!user?.email) return;
    fetch(`${base}/api/auto-apply/check-access?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json()).then(d => { setHasAutoApplyAccess(!!d.hasAccess); localStorage.setItem('cvmind_aa_access', d.hasAccess ? 'true' : 'false'); }).catch(() => {});
  }, [isLoggedIn]);

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
    const privatePages = ['prep', 'resume-editor', 'linkedin', 'linkedin-bio', 'linkedin-outreach', 'linkedin-post', 'proofreading', 'tailor', 'voice-prep', 'portfolio-gen', 'job-finder', 'career-courses', 'elevator-pitch', 'career-roadmap', 'auto-apply', 'career-copilot'];

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
    // Registry-driven articles render generically; bespoke ones fall through to the switch.
    if (ARTICLES.some(a => a.slug === currentPage && a.sections)) {
      return <ArticlePage slug={currentPage} setCurrentPage={setCurrentPage} />;
    }
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
      case 'how-to-create-an-ats-friendly-resume':
        return <ArticleAtsResume setCurrentPage={setCurrentPage} />;
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
        // Temporarily locked — restore `return <JobFinder customApiKey={customApiKey} />;` to re-enable.
        return (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',gap:'18px',textAlign:'center',padding:'40px 24px'}}>
            <div style={{fontSize:'3rem'}}>🔍</div>
            <h2 style={{fontSize:'1.8rem',fontWeight:800,margin:0}}>AI Job Finder</h2>
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'linear-gradient(135deg,#ff9f0a,#ff453a)',color:'#fff',padding:'4px 14px',borderRadius:'99px',fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.05em'}}>TEMPORARILY UNAVAILABLE</div>
            <p style={{color:'#6e6e73',fontSize:'1rem',maxWidth:'440px',lineHeight:1.6,margin:0}}>AI Job Finder is temporarily unavailable while we upgrade it. It will be back soon — meanwhile, try the AI Career Copilot for curated job matches.</p>
            <button onClick={() => setCurrentPage('career-copilot')} style={{marginTop:'8px',padding:'12px 28px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#2997ff,#bf5af2)',color:'#fff',fontWeight:600,fontSize:'0.95rem',cursor:'pointer'}}>Try AI Career Copilot →</button>
            <button onClick={() => setCurrentPage('home')} style={{padding:'10px 24px',borderRadius:'12px',border:'none',background:'#1d1d1f',color:'#fff',fontWeight:600,fontSize:'0.9rem',cursor:'pointer'}}>← Go Home</button>
          </div>
        );
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
      case 'career-copilot':
        return <CareerCopilot customApiKey={customApiKey} resumeText={resumeText} setResumeText={setResumeText} />;
      case 'auto-apply':
        return hasAutoApplyAccess ? (
          <AutoApply customApiKey={customApiKey} resumeText={resumeText} setResumeText={setResumeText} />
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',gap:'18px',textAlign:'center',padding:'40px 24px'}}>
            <div style={{fontSize:'3rem'}}>🚀</div>
            <h2 style={{fontSize:'1.8rem',fontWeight:800,margin:0}}>Auto Apply Agent</h2>
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'linear-gradient(135deg,#ff9f0a,#ff453a)',color:'#fff',padding:'4px 14px',borderRadius:'99px',fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.05em'}}>COMING SOON</div>
            <p style={{color:'#6e6e73',fontSize:'1rem',maxWidth:'420px',lineHeight:1.6,margin:0}}>We're building an AI agent that automatically applies to jobs on your behalf — tailored resume, cover letter, and real form submission. Stay tuned!</p>
            <button onClick={() => setCurrentPage('home')} style={{marginTop:'8px',padding:'12px 28px',borderRadius:'12px',border:'none',background:'#1d1d1f',color:'#fff',fontWeight:600,fontSize:'0.95rem',cursor:'pointer'}}>← Go Home</button>
          </div>
        );
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
      {!isMinimalPage && <TawkChat />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => { setIsLoggedIn(true); }}
      />
    </div>
  );
}
