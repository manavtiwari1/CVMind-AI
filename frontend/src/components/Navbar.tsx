import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import cvmindLogo from '../assets/cvmind_logo_transparent.png';
import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  isLoggedIn: boolean;
  setShowAuthModal: (show: boolean) => void;
  handleSignOut: () => void;
}

export default function Navbar({ currentPage, setCurrentPage, isLoggedIn, setShowAuthModal, handleSignOut }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => go('home')}>
          <img src={cvmindLogo} alt="CVMind AI" className="navbar-logo-img" />
          <span className="navbar-brand-name">CVMind AI</span>
        </div>

        {/* Center Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {[
            { label: 'Home', page: 'home' },
            { label: 'Dashboard', page: 'dashboard' },
          ].map(({ label, page }) => (
            <button
              key={page}
              className={`nav-link${currentPage === page ? ' active' : ''}`}
              onClick={() => go(page)}
            >
              {label}
            </button>
          ))}

          {/* Products Dropdown */}
          <div className="nav-dropdown-container">
            <button
              className={`nav-link dropdown-toggle${['home', 'tailor', 'prep'].includes(currentPage) ? ' active' : ''}`}
            >
              Products <ChevronDown size={12} className="dropdown-arrow" />
            </button>
            <div className="nav-dropdown-menu">
              {[
                { label: 'AI Analyzer', page: 'home' },
                { label: 'Resume Tailorer', page: 'tailor' },
                { label: 'SmartPrep AI', page: 'prep' },
              ].map(({ label, page }) => (
                <button
                  key={page}
                  className={`dropdown-item${currentPage === page ? ' active' : ''}`}
                  onClick={() => go(page)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: 'About', page: 'about' },
            { label: 'Contact', page: 'contact' },
          ].map(({ label, page }) => (
            <button
              key={page}
              className={`nav-link${currentPage === page ? ' active' : ''}`}
              onClick={() => go(page)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <button
              className="navbar-cta"
              style={{ 
                background: 'rgba(255, 69, 58, 0.08)', 
                color: 'var(--red)', 
                border: '1px solid rgba(255, 69, 58, 0.22)', 
                boxShadow: 'none' 
              }}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          ) : (
            <button
              className="navbar-cta"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
          {/* Mobile menu toggle */}
          <button
            className="nav-link"
            style={{ display: 'none' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
}
