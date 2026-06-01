import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import cvmindLogo from '../assets/cvmind_logo_transparent.png';
import './Footer.css';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-element">
      <div className="footer-particles" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand info */}
          <div className="footer-info">
            <div className="footer-logo-row">
              <img src={cvmindLogo} alt="CVMind AI Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">
              Futuristic resume intelligence for ATS scoring, keyword discovery, recruiter-focused rewrites, and career-ready reports.
            </p>
            <div className="footer-status-row">
              <span><ShieldCheck size={14} /> Private parsing</span>
              <span><Sparkles size={14} /> AI scorecard</span>
            </div>
          </div>

          {/* Links group */}
          <div className="footer-links-group">
            {/* Platform column */}
            <div className="footer-column">
              <h4 className="footer-heading">Platform</h4>
              <button className="footer-link" onClick={() => setCurrentPage('home')}>AI Analyzer</button>
              <button className="footer-link" onClick={() => setCurrentPage('dashboard')}>Score Dashboard</button>
              <button className="footer-link" onClick={() => setCurrentPage('resume-builder')}>Resume Builder</button>
              <button className="footer-link" onClick={() => setCurrentPage('tailor')}>Resume Tailorer</button>
              <button className="footer-link" onClick={() => setCurrentPage('about')}>How it Works</button>
            </div>

            {/* Company column */}
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <button className="footer-link" onClick={() => setCurrentPage('about')}>About Us</button>
              <button className="footer-link" onClick={() => setCurrentPage('contact')}>Contact</button>
            </div>
          </div>
        </div>


        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} CVMind AI. Designed and engineered by <a href="https://www.manavtiwari.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', transition: 'color 0.2s' }}>Manav Tiwari</a>.
          </p>
          <div className="footer-credits">
            <span className="credits-text">
              Made with <Heart className="heart-icon" /> for modern professionals
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
