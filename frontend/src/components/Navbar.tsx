import React, { useState } from 'react';
import { ChevronDown, Settings, X, Key, Info } from 'lucide-react';
import cvmindLogo from '../assets/cvmind_logo_transparent.png';
import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  customApiKey: string;
  setCustomApiKey: (key: string) => void;
}

export default function Navbar({ currentPage, setCurrentPage, customApiKey, setCustomApiKey }: NavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(customApiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(tempKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  const handleClear = () => {
    setCustomApiKey('');
    setTempKey('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

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

        {/* Right Actions - Settings Toggle */}
        <div className="navbar-actions">
          <button className="settings-toggle-btn" onClick={() => {
            setTempKey(customApiKey);
            setIsSettingsOpen(true);
          }} title="AI Settings">
            <Settings size={18} />
          </button>
        </div>

      </div>

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="settings-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <header className="settings-modal-header">
              <div className="settings-modal-title">
                <Settings className="settings-icon animate-spin-slow" size={20} />
                <h3>AI Console Settings</h3>
              </div>
              <button className="settings-modal-close" onClick={() => setIsSettingsOpen(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSave} className="settings-modal-form">
              <p className="settings-modal-desc">
                Configure your custom API key to bypass default platform credit ceilings. Custom keys are stored completely securely on your local device.
              </p>

              <div className="settings-key-info-box">
                <Info size={14} className="text-info-icon" />
                <p>
                  <strong>Recommended:</strong> Get a <strong>100% Free Gemini API key</strong> at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>. Free tier supports 15 Requests Per Minute!
                </p>
              </div>

              <div className="settings-input-group">
                <label htmlFor="api-key-input">
                  <Key size={14} /> Gemini or OpenRouter API Key
                </label>
                <input
                  id="api-key-input"
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste your API key here (AIzaSy... or sk-or-...)"
                />
              </div>

              <div className="settings-modal-actions">
                {customApiKey && (
                  <button type="button" className="btn-secondary" onClick={handleClear}>
                    Clear Key
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={saveSuccess}>
                  {saveSuccess ? 'Saved successfully!' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
