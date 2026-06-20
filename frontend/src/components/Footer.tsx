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

            {/* Social links */}
            <div className="footer-social-row">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/manavtiwari1/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 0 1-1.981-1.98c0-1.094.887-1.981 1.981-1.981s1.98.887 1.98 1.98a1.98 1.98 0 0 1-1.98 1.981zm1.958 13.019H3.379V9h3.916v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/manavtiwari_in"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="X (Twitter)"
                title="X"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/manavtiwari.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
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
              <button className="footer-link" onClick={() => setCurrentPage('pricing')}>Pricing Plans</button>
              <button className="footer-link" onClick={() => setCurrentPage('tailor')}>Resume Tailorer</button>
              <button className="footer-link" onClick={() => setCurrentPage('job-finder')}>AI Job Finder</button>
              <button className="footer-link" onClick={() => setCurrentPage('about')}>How it Works</button>
            </div>

            {/* Company column */}
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <button className="footer-link" onClick={() => setCurrentPage('about')}>About Us</button>
              <button className="footer-link" onClick={() => setCurrentPage('contact')}>Contact</button>
              <button className="footer-link" onClick={() => setCurrentPage('privacy')}>Privacy</button>
              <button className="footer-link" onClick={() => setCurrentPage('faq')}>FAQ's</button>
              <button className="footer-link" onClick={() => setCurrentPage('blog')}>Blog</button>
            </div>

            {/* Legal column */}
            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <button className="footer-link" onClick={() => setCurrentPage('terms')}>Terms &amp; Conditions</button>
              <button className="footer-link" onClick={() => setCurrentPage('refund-policy')}>Refund Policy</button>
              <button className="footer-link" onClick={() => setCurrentPage('disclaimer')}>Disclaimer</button>
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
