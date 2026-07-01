import * as React from "react"
import { cn } from '@/lib/utils'
import './hero-section-9.css'

interface HeroSectionProps {
  setCurrentPage?: (page: string) => void
  onAnalyzeClick?: () => void
}

export const HeroSection = ({ setCurrentPage, onAnalyzeClick }: HeroSectionProps) => {

    React.useEffect(() => {
        const main = document.querySelector('.main-content') as HTMLElement | null
        if (main) {
            main.style.maxWidth = 'none'
            main.style.padding = '0'
            main.style.margin = '0'
        }
        return () => {
            if (main) {
                main.style.maxWidth = ''
                main.style.padding = ''
                main.style.margin = ''
            }
        }
    }, [])

    return (
        <div className="hero9-page">

            {/* ────────── HERO SECTION ────────── */}
            <section className="hero9-section">

                <div className="hero9-blob hero9-blob-left" aria-hidden />
                <div className="hero9-blob hero9-blob-right" aria-hidden />

                {/* Left content */}
                <div className="hero9-content">

                    <div className="hero9-eyebrow">
                        <span className="hero9-eyebrow-dot" />
                        <span>AI-Powered Resume Intelligence</span>
                    </div>

                    <h1 className="hero9-h1">
                        Land More Interviews<br />
                        with <span className="hero9-grad">AI Resume Builder</span>
                    </h1>

                    <p className="hero9-sub">
                        ATS Score Check, AI Rewriter, and One-Click Job Tailoring —
                        everything you need to make your resume stand out to recruiters.
                    </p>

                    {/* CTAs */}
                    <div className="hero9-actions">
                        <button
                            className="hero9-btn-primary"
                            onClick={() => setCurrentPage?.('resume-builder')}
                        >
                            Build Your Resume
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <button
                            className="hero9-btn-secondary"
                            onClick={onAnalyzeClick}
                        >
                            Get Your Resume Score
                        </button>
                    </div>

                    {/* Social proof */}
                    <div className="hero9-social-proof">
                        <div className="hero9-stars">
                            {'★★★★★'.split('').map((s, i) => <span key={i} className="hero9-star">{s}</span>)}
                            <span className="hero9-rating-text">4.9 · <strong>12,400+ Reviews</strong></span>
                        </div>
                        <span className="hero9-sp-divider" />
                        <span className="hero9-sp-users">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <strong>50K+</strong> resumes analyzed
                        </span>
                    </div>

                    {/* Trust pills */}
                    <div className="hero9-trust">
                        {['No credit card required', 'Privacy guaranteed', 'Instant results'].map(t => (
                            <span key={t} className="hero9-trust-pill">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="#22c55e">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right column — dashboard visual */}
                <div className="hero9-visual">
                    <div className="hero9-visual-frame">

                        <div className="hero9-float hero9-float-score">
                            <div className="hero9-score-ring">
                                <svg viewBox="0 0 36 36" className="hero9-ring-svg">
                                    <path className="hero9-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="hero9-ring-fill" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="hero9-ring-num">88</span>
                            </div>
                            <div>
                                <div className="hero9-float-label">ATS Score</div>
                                <div className="hero9-float-sub hero9-green">Excellent ✓</div>
                            </div>
                        </div>

                        <div className="hero9-float hero9-float-keywords">
                            <div className="hero9-kw-grid">
                                <span className="hero9-kw hero9-kw-green">React.js</span>
                                <span className="hero9-kw hero9-kw-green">TypeScript</span>
                                <span className="hero9-kw hero9-kw-purple">AWS Cloud</span>
                                <span className="hero9-kw hero9-kw-green">Node.js</span>
                            </div>
                            <div className="hero9-float-label" style={{ marginTop: '0.5rem', fontSize: '0.6rem' }}>Matched Keywords</div>
                        </div>

                        <div className="hero9-resume-card">
                            <div className="hero9-resume-header">
                                <div className="hero9-resume-avatar">SJ</div>
                                <div>
                                    <div className="hero9-resume-name">Sarah Jenkins</div>
                                    <div className="hero9-resume-role">Senior Software Engineer · San Francisco</div>
                                </div>
                                <div className="hero9-resume-badge">88/100</div>
                            </div>

                            <div className="hero9-resume-section-title">Professional Summary</div>
                            <div className="hero9-resume-bar" style={{ width: '95%' }} />
                            <div className="hero9-resume-bar hero9-short" style={{ width: '80%' }} />

                            <div className="hero9-resume-section-title" style={{ marginTop: '0.75rem' }}>Experience</div>
                            <div className="hero9-resume-exp">
                                <div className="hero9-resume-exp-title">Lead Engineer @ TechCorp <span>2023–Present</span></div>
                                <div className="hero9-resume-bar" style={{ width: '90%' }} />
                                <div className="hero9-resume-bar hero9-short" style={{ width: '70%' }} />
                            </div>
                            <div className="hero9-resume-exp">
                                <div className="hero9-resume-exp-title">Software Developer @ SaaS Inc <span>2020–2023</span></div>
                                <div className="hero9-resume-bar" style={{ width: '85%' }} />
                            </div>

                            <div className="hero9-resume-section-title" style={{ marginTop: '0.75rem' }}>Skills</div>
                            <div className="hero9-resume-tags">
                                {['React', 'Node.js', 'AWS', 'TypeScript', 'Docker'].map(s => (
                                    <span key={s} className="hero9-resume-tag">{s}</span>
                                ))}
                            </div>
                        </div>

                        <div className="hero9-float hero9-float-audit">
                            <div className="hero9-float-label" style={{ marginBottom: '0.4rem' }}>Format Audit</div>
                            {['Action Verbs ✓', 'Quantified (12x) ✓', 'One-Page Safe ✓'].map(item => (
                                <div key={item} className="hero9-audit-item">{item}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ────────── PARTNERS SECTION ────────── */}
            <section className="hero9-partners">
                <div className="hero9-partners-inner">
                    <p className="hero9-partners-label">Trusted by job seekers at leading companies</p>
                    <div className="hero9-logos">
                        {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'OpenAI'].map(name => (
                            <span key={name} className="hero9-logo-text">{name}</span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export const Logo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-7 w-auto', className)}>
        <rect width="28" height="28" rx="6" fill="url(#logo-g)" />
        <path d="M7 8h5l3 9 3-9h5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <text x="34" y="20" fontFamily="Inter,sans-serif" fontSize="14" fontWeight="700" fill="currentColor" letterSpacing="-0.5">CV Mind</text>
        <defs>
            <linearGradient id="logo-g" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#7c3aed"/><stop offset="1" stopColor="#06b6d4"/>
            </linearGradient>
        </defs>
    </svg>
)
