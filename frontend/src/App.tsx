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
import LinkedIn from './pages/LinkedIn';
import Portfolio from './pages/Portfolio';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import AuthModal from './components/AuthModal';
import ParticleBackground from './components/ParticleBackground';
import './styles/theme.css';
import './styles/3d-effects.css';

export default function App() {
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/portfolio/')) {
      return 'portfolio';
    }
    const urlPage = pathname.replace(/^\//, '');
    const validPages = ['home', 'about', 'contact', 'dashboard', 'admin', 'tailor', 'prep', 'linkedin', 'resume-builder', 'privacy', 'faq'];
    if (urlPage && validPages.includes(urlPage)) {
      return urlPage;
    }
    const savedPage = localStorage.getItem('cvmind_current_page');
    if (savedPage && validPages.includes(savedPage)) {
      return savedPage;
    }
    return 'home';
  });

  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('cvmind_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cvmind_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
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

  // Private route interceptor to enforce Sign In for product modules
  useEffect(() => {
    const privatePages = ['tailor', 'prep', 'resume-builder', 'linkedin'];
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
      case 'portfolio':
        const wId = window.location.pathname.split('/').pop();
        return <Portfolio workId={wId} />;
      case 'resume-builder':
        return <CoverLetter customApiKey={customApiKey} loadedWork={loadedWork} setLoadedWork={setLoadedWork} />;
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

      {/* ── Global Animated 3D Particle Background ──────────── */}
      {!isMinimalPage && <ParticleBackground theme={theme} />}

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
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      <main className="main-content">
        {renderPage()}
      </main>

      {!isMinimalPage && <Footer setCurrentPage={setCurrentPage} />}
      {!isMinimalPage && <Chatbot customApiKey={customApiKey} />}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => setIsLoggedIn(true)} 
      />
    </div>
  );
}
