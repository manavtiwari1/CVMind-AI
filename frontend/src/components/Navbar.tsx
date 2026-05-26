import { Sun, Moon } from 'lucide-react';
import cvmindLogo from '../assets/cvmind_logo_transparent.png';
import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function Navbar({ currentPage, setCurrentPage, theme, toggleTheme }: NavbarProps) {
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

        {/* Right Actions */}
        <div className="navbar-actions">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
          </button>
        </div>

      </div>
    </header>
  );
}
