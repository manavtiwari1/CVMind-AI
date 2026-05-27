import { ChevronDown } from 'lucide-react';
import cvmindLogo from '../assets/cvmind_logo_transparent.png';
import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => setCurrentPage('home')}>
          <img src={cvmindLogo} alt="CVMind AI Logo" className="navbar-logo-img" />
        </div>

        {/* Centered Nav */}
        <nav className="navbar-nav">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          
          {/* Products Dropdown */}
          <div className="nav-dropdown-container">
            <button className={`nav-link dropdown-toggle ${currentPage === 'home' || currentPage === 'tailor' || currentPage === 'prep' ? 'active' : ''}`}>
              Products <ChevronDown size={14} className="dropdown-arrow" />
            </button>
            <div className="nav-dropdown-menu">
              <button 
                className={`dropdown-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentPage('home')}
              >
                AI Analyzer
              </button>
              <button 
                className={`dropdown-item ${currentPage === 'tailor' ? 'active' : ''}`}
                onClick={() => setCurrentPage('tailor')}
              >
                AI Resume Tailorer
              </button>
              <button 
                className={`dropdown-item ${currentPage === 'prep' ? 'active' : ''}`}
                onClick={() => setCurrentPage('prep')}
              >
                SmartPrep AI
              </button>
            </div>
          </div>

          <button
            className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => setCurrentPage('about')}
          >
            About
          </button>
          <button
            className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentPage('contact')}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions Spacer (keeps nav centered) */}
        <div className="navbar-brand" style={{ visibility: 'hidden', pointerEvents: 'none' }}>
          <img src={cvmindLogo} alt="" className="navbar-logo-img" />
        </div>

      </div>
    </header>
  );
}
