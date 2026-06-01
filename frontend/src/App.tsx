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
import AuthModal from './components/AuthModal';
import './styles/theme.css';

export default function App() {
  const [currentPage, setCurrentPageState] = useState<string>(() => {
    const savedPage = localStorage.getItem('cvmind_current_page');
    if (savedPage) return savedPage;
    return window.location.pathname.replace(/^\//, '') || 'home';
  });
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
      const page = window.location.pathname.replace(/^\//, '') || 'home';
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
    const privatePages = ['dashboard', 'tailor', 'prep', 'resume-builder'];
    if (privatePages.includes(currentPage) && !isLoggedIn) {
      setCurrentPage('home');
      setShowAuthModal(true);
    }
  }, [currentPage, isLoggedIn]);

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
            isLoggedIn={isLoggedIn}
            setShowAuthModal={setShowAuthModal}
          />
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
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
      case 'resume-builder':
        return <CoverLetter customApiKey={customApiKey} loadedWork={loadedWork} setLoadedWork={setLoadedWork} />;
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage} 
            setAnalysisResult={setAnalysisResult}
            setResumeText={setResumeText}
            customApiKey={customApiKey}
            isLoggedIn={isLoggedIn}
            setShowAuthModal={setShowAuthModal}
          />
        );
    }
  };

  const isAdminPage = currentPage === 'admin';

  return (
    <div className={`app-container ${isAdminPage ? 'admin-shell' : ''}`}>
      {!isAdminPage && (
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

      {!isAdminPage && <Footer setCurrentPage={setCurrentPage} />}
      {!isAdminPage && <Chatbot customApiKey={customApiKey} />}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => setIsLoggedIn(true)} 
      />
    </div>
  );
}
