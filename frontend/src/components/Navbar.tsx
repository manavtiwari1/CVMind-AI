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
