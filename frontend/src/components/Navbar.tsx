import { useState, useEffect } from 'react';
import { 
  ChevronDown, Menu, X, User, Briefcase, Mail, Settings, 
  LogOut, Loader2, Trash2, Edit3, Sparkles, MapPin, Key, Lock, AlertCircle, FileText, Camera 
} from 'lucide-react';
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
  setLoadedWork: (work: any) => void;
}

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  isLoggedIn, 
  setShowAuthModal, 
  handleSignOut,
  setLoadedWork
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'works' | 'settings' | null>(null);
  const [user, setUser] = useState<any>(null);

  // Profile Modal Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');

  // Password Modal Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Works State
  const [works, setWorks] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Sync user details reactively on login
  useEffect(() => {
    if (isLoggedIn) {
      const u = localStorage.getItem('cvmind_user');
      if (u) {
        try {
          const parsed = JSON.parse(u);
          setUser(parsed);
          setProfileName(parsed.name || '');
          setProfileEmail(parsed.email || '');
          setProfileAddress(parsed.address || '');
          setProfileAvatar(parsed.avatar || '');
        } catch {
          // ignore
        }
      }
    } else {
      setUser(null);
    }
  }, [isLoggedIn]);

  // Click outside listener for the profile dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const go = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setModalError('Profile picture must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileAvatar(String(event.target.result));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      setModalError('Name and email are required.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

    try {
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?._id,
          name: profileName.trim(),
          email: profileEmail.trim(),
          address: profileAddress.trim(),
          avatar: profileAvatar
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      localStorage.setItem('cvmind_user', JSON.stringify(data.user));
      setUser(data.user);
      setModalSuccess('Profile updated successfully!');
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while updating profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setModalError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

    try {
      const response = await fetch(`${baseUrl}/api/user/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?._id,
          currentPassword,
          newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');

      setModalSuccess(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while updating password.');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchUserWorks = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    setModalLoading(true);
    setModalError('');

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

    try {
      const response = await fetch(`${baseUrl}/api/user/work/${userId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch works');

      setWorks(data.data || []);
    } catch (err: any) {
      setModalError(err.message || 'Failed to load works.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteWork = async (workId: string) => {
    const userId = user?.id || user?._id;
    if (!userId || !workId) return;

    const confirmDelete = window.confirm('Are you sure you want to permanently delete this work?');
    if (!confirmDelete) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || (window.location.hostname.includes('vercel.app') ? '/_/backend' : 'http://localhost:5000');

    try {
      const response = await fetch(`${baseUrl}/api/user/work/${userId}/${workId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete work');

      setWorks(prev => prev.filter(w => (w.id || w._id) !== workId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete work.');
    }
  };

  return (
    <>
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

          {/* Resume Builder nav link */}
          <button
            className={`nav-link${currentPage === 'resume-builder' ? ' active' : ''}`}
            onClick={() => go('resume-builder')}
          >
            Resume Builder
          </button>

          {/* Products Dropdown */}
          <div className="nav-dropdown-container">
            <button
              className={`nav-link dropdown-toggle${['tailor', 'prep'].includes(currentPage) ? ' active' : ''}`}
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
          <button
            className="navbar-cta"
            style={{ 
              marginRight: '0.25rem',
              background: 'transparent',
              border: '1px solid var(--blue)',
              color: 'var(--blue)'
            }}
            onClick={() => go('resume-builder')}
          >
            Create Resume
          </button>
          {isLoggedIn ? (
            <div className="nav-profile-container" onClick={e => e.stopPropagation()}>
              <button 
                className="nav-profile-trigger" 
                onClick={() => setShowDropdown(prev => !prev)}
                title="Profile Menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="nav-profile-avatar" />
                ) : (
                  <div className="nav-profile-monogram">
                    {String(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              
              {showDropdown && (
                <div className="nav-profile-dropdown animate-scale-up">
                  <div className="nav-profile-dropdown-header">
                    <span className="nav-profile-name">{user?.name}</span>
                    <span className="nav-profile-email">{user?.email}</span>
                  </div>
                  
                  <div className="nav-profile-dropdown-divider" />
                  
                  <button className="nav-profile-dropdown-item" onClick={() => { setShowDropdown(false); setModalError(''); setModalSuccess(''); setActiveModal('profile'); }}>
                    <User size={14} /> My Profile
                  </button>
                  
                  <button className="nav-profile-dropdown-item" onClick={() => { setShowDropdown(false); setModalError(''); setModalSuccess(''); fetchUserWorks(); setActiveModal('works'); }}>
                    <Briefcase size={14} /> My Works
                  </button>
                  
                  <button className="nav-profile-dropdown-item" onClick={() => { setShowDropdown(false); go('contact'); }}>
                    <Mail size={14} /> Contact Us
                  </button>
                  
                  <button className="nav-profile-dropdown-item" onClick={() => { setShowDropdown(false); setModalError(''); setModalSuccess(''); setActiveModal('settings'); }}>
                    <Settings size={14} /> Settings
                  </button>
                  
                  <div className="nav-profile-dropdown-divider" />
                  
                  <button className="nav-profile-dropdown-item signout-item" onClick={() => { setShowDropdown(false); handleSignOut(); }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
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
            className="mobile-menu-toggle nav-link"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Premium Sliding Frosted Glass Mobile Menu Drawer */}
      <div className={`navbar-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        {[
          { label: 'Home', page: 'home' },
          { label: 'Dashboard', page: 'dashboard' },
          { label: 'Resume Builder', page: 'resume-builder' },
          { label: 'Resume Tailor', page: 'tailor' },
          { label: 'Interview Prep AI', page: 'prep' },
          { label: 'About CVMind AI', page: 'about' },
          { label: 'Contact Support', page: 'contact' }
        ].map(({ label, page }) => (
          <button
            key={label}
            className={`mobile-drawer-link${currentPage === page ? ' active' : ''}`}
            onClick={() => go(page)}
          >
            {label}
          </button>
        ))}

        {/* Dynamic Mobile CTA */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }}></div>
        {isLoggedIn ? (
          <button
            className="navbar-cta"
            style={{ 
              width: '100%',
              background: 'rgba(255, 69, 58, 0.08)', 
              color: 'var(--red)', 
              border: '1px solid rgba(255, 69, 58, 0.22)',
              padding: '0.65rem'
            }}
            onClick={() => {
              handleSignOut();
              setMobileOpen(false);
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            className="navbar-cta"
            style={{ width: '100%', padding: '0.65rem' }}
            onClick={() => {
              setShowAuthModal(true);
              setMobileOpen(false);
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>

    {/* ── MODALS ───────────────────────────────────────────────────────────── */}
      
      {/* 1. My Profile Modal */}
      {activeModal === 'profile' && (
        <div className="nav-modal-overlay animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="nav-modal-card glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
            <button className="nav-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">
              <X size={16} />
            </button>
            <div className="nav-modal-header">
              <Sparkles size={16} className="text-blue" />
              <h2 className="nav-modal-title">My Profile</h2>
              <p className="nav-modal-subtitle">View and update your personal profile details.</p>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="nav-modal-form">
              {/* Profile Photo Uploader */}
              <div className="nav-modal-avatar-uploader">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profileName} className="nav-profile-upload-preview" />
                ) : (
                  <div className="nav-profile-upload-monogram">
                    {String(profileName || profileEmail || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="avatar-uploader-actions">
                  <label className="btn-avatar-upload" htmlFor="avatar-file-input">
                    <Camera size={12} style={{ marginRight: '4px' }} /> Upload Photo
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {profileAvatar && (
                    <button type="button" className="btn-avatar-remove" onClick={() => setProfileAvatar('')}>
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    className="form-input auth-field"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    className="form-input auth-field"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address / Location</label>
                <div className="auth-input-wrapper">
                  <MapPin size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    className="form-input auth-field"
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder="New Delhi, India"
                  />
                </div>
              </div>

              {modalError && (
                <div className="auth-alert error">
                  <AlertCircle size={14} className="auth-alert-icon" />
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="auth-alert success">
                  <Sparkles size={14} className="auth-alert-icon" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <button type="submit" className="btn-primary auth-submit-btn" disabled={modalLoading}>
                {modalLoading ? <span className="auth-spinner"></span> : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Settings / Reset Password Modal */}
      {activeModal === 'settings' && (
        <div className="nav-modal-overlay animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="nav-modal-card glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
            <button className="nav-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">
              <X size={16} />
            </button>
            <div className="nav-modal-header">
              <Key size={16} className="text-blue" />
              <h2 className="nav-modal-title">Reset Password</h2>
              <p className="nav-modal-subtitle">Keep your secure account access password updated.</p>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="nav-modal-form">
              {user?.password?.startsWith('oauth-google-') ? (
                <div className="auth-alert success" style={{ marginBottom: '0.5rem', background: 'rgba(41, 151, 255, 0.08)', color: 'var(--blue)' }}>
                  <Sparkles size={14} className="auth-alert-icon" />
                  <span>Google Signed In: Set a password below to enable password login.</span>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      type="password"
                      className="form-input auth-field"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    className="form-input auth-field"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    className="form-input auth-field"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {modalError && (
                <div className="auth-alert error">
                  <AlertCircle size={14} className="auth-alert-icon" />
                  <span>{modalError}</span>
                </div>
              )}
              {modalSuccess && (
                <div className="auth-alert success">
                  <Sparkles size={14} className="auth-alert-icon" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <button type="submit" className="btn-primary auth-submit-btn" disabled={modalLoading}>
                {modalLoading ? <span className="auth-spinner"></span> : 'Update Account Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. My Works Modal */}
      {activeModal === 'works' && (
        <div className="nav-modal-overlay works-overlay animate-fade-in" onClick={() => setActiveModal(null)}>
          <div className="nav-modal-card works-card glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
            <button className="nav-modal-close" onClick={() => setActiveModal(null)} aria-label="Close modal">
              <X size={16} />
            </button>
            <div className="nav-modal-header">
              <Briefcase size={16} className="text-blue" />
              <h2 className="nav-modal-title">My Works</h2>
              <p className="nav-modal-subtitle">Your saved resumes and cover letters in one secure spot.</p>
            </div>
            
            <div className="works-list-container">
              {modalLoading ? (
                <div className="works-loading-state">
                  <Loader2 size={24} className="cl-spin text-blue" />
                  <span>Fetching your saved creations...</span>
                </div>
              ) : modalError ? (
                <div className="works-error-state">
                  <AlertCircle size={20} className="text-red" />
                  <span>{modalError}</span>
                </div>
              ) : works.length === 0 ? (
                <div className="works-empty-state">
                  <FileText size={32} className="text-tertiary" />
                  <span>No saved works found. Open Resume Builder to create some!</span>
                  <button className="btn-primary" style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1.25rem' }} onClick={() => { setActiveModal(null); go('resume-builder'); }}>
                    Start Building
                  </button>
                </div>
              ) : (
                <div className="works-grid">
                  {works.map((w: any) => (
                    <div key={w.id || w._id} className="work-item-card">
                      <div className="work-card-top">
                        <span className={`work-type-badge ${w.type}`}>
                          {w.type === 'cover-letter' ? 'Cover Letter' : 'Resume'}
                        </span>
                        <span className="work-date">
                          {new Date(w.updatedAt || w.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="work-item-title" title={w.title}>{w.title}</h3>
                      <p className="work-item-meta">Template: <span className="highlight-pill">{w.templateId}</span></p>
                      
                      <div className="work-card-actions">
                        <button className="work-action-btn edit-btn" title="Open in Editor" onClick={() => {
                          setActiveModal(null);
                          setLoadedWork(w);
                          go('resume-builder');
                        }}>
                          <Edit3 size={13} /> Open
                        </button>
                        
                        <button className="work-action-btn delete-btn" title="Delete Permanent" onClick={() => handleDeleteWork(w.id || w._id)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
