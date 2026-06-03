import { useState } from 'react';
import { Cpu, ShieldCheck, Sparkles, Rocket, ArrowRight, ArrowLeft } from 'lucide-react';
import './Blog.css';

interface BlogProps {
  setCurrentPage: (page: string) => void;
}

export default function Blog({ setCurrentPage }: BlogProps) {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const changelogData = [
    {
      id: 1,
      version: 'v2.1.0',
      date: 'June 3, 2026',
      title: 'LLM Core Upgrade to DeepSeek & Silent Auto-Saves',
      tag: 'Core Upgrade',
      description: 'A massive performance rewrite migrating backend systems to DeepSeek API and integrating background automation for continuous data safety.',
      details: [
        'DeepSeek API Migration: Replaced our legacy LLM backend with the DeepSeek API (deepseek-chat), providing faster, schema-safe JSON evaluations with a zero connection timeout rate.',
        'Silent Background Auto-Save: Content editors (Resume Builder, Cover Letter) and SmartPrep AI sandboxes now automatically save changes every 4 seconds without active typing interruptions.',
        'Frictionless Deletion: Removed standard browser confirm popups. Deleting files is now instant, automatically syncing and resetting the active user view in real-time.',
        'Core Bugfixes: Resolved pre-declaration ReferenceError (Temporal Dead Zone) warnings, backend CORS DELETE blocking bugs, and mongoose deprecation warnings.'
      ],
      icon: Cpu,
      badgeColor: 'badge-blue'
    },
    {
      id: 2,
      version: 'v2.0.0',
      date: 'June 1, 2026',
      title: 'LinkedIn Optimizer & Career Path AI transition Suites',
      tag: 'New Features',
      description: 'Extending CVMind AI from a standard scanner into a complete, end-to-end career transition tool.',
      details: [
        'LinkedIn Profile Audit: Upload your LinkedIn profile in PDF format to receive instant branding optimization scores.',
        'Outreach & DM Builder: Auto-generate customized recruiter connection requests, referral pitches, and cold DMs.',
        'Career Path Planner: Visual roadmap transition steps detailing core milestones, skill gaps, and course recommendations.',
        'Elevator Pitch Builder: Instantly create metric-focused corporate verbal pitches and startup-oriented pitches.'
      ],
      icon: Rocket,
      badgeColor: 'badge-purple'
    },
    {
      id: 3,
      version: 'v1.2.0',
      date: 'May 29, 2026',
      title: 'SmartPrep AI Mock Interviews & Shareable Portfolios',
      tag: 'UX Polish',
      description: 'Adding interview question sandboxes and public-facing designer portfolios for recruiters.',
      details: [
        'SmartPrep AI Coach: Customized mock interviews checking technical, behavioral, and HR questions based on your resume.',
        'STAR Method Evaluations: Live answers grading out of 10 checking situation-task-action-result methodologies.',
        'Shareable Portfolios: Generates clean, responsive web pages of your resume, opening in separate tabs with unique themes.',
        'Bio & Banner Generator: Tags and copy headline templates to maximize social search indexing.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-green'
    },
    {
      id: 4,
      version: 'v1.1.0',
      date: 'May 25, 2026',
      title: 'Resend Email Dispatch & Split-Screen FAQ Help Center',
      tag: 'Security & Help',
      description: 'Hardening platform validation flows, introducing admin audit logs, and redesigning support guides.',
      details: [
        'Resend Integration: Integrated SMTP Resend SDK to enable automated, tokenized password reset links via email.',
        'Audit Logging Dashboard: Admin dashboard now records password reset events with audit logs.',
        'Split-Screen Help Center: Replaced legacy layout with a categorized FAQ article reader.',
        'Frictionless Resume Checks: Enabled public AI Resume Scans without requiring instant registration.'
      ],
      icon: ShieldCheck,
      badgeColor: 'badge-orange'
    }
  ];

  const tags = ['all', 'Core Upgrade', 'New Features', 'UX Polish', 'Security & Help'];

  const filteredData = selectedTag === 'all' 
    ? changelogData 
    : changelogData.filter(item => item.tag === selectedTag);

  return (
    <div className="blog-wrapper">
      {/* Back button */}
      <div className="blog-nav-header">
        <button className="blog-back-btn" onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>

      {/* Hero header */}
      <section className="blog-hero">
        <div className="blog-badge-wrapper">
          <span className="blog-pulse-dot"></span>
          <span className="blog-launch-date">Launch Date: June 17, 2026 at 5:00 PM IST</span>
        </div>
        <h1 className="blog-title">CVMind AI Changelog</h1>
        <p className="blog-subtitle">
          Follow our build progress, features deployment, and system updates from Day 1 to our production-ready release.
        </p>
      </section>

      {/* Tag Filters */}
      <div className="blog-filters">
        {tags.map(tag => (
          <button
            key={tag}
            className={`blog-filter-tag ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="blog-timeline">
        {filteredData.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="blog-card-item">
              {/* Left Timeline metadata */}
              <div className="blog-timeline-meta">
                <div className="blog-icon-ring">
                  <IconComponent size={20} />
                </div>
                <div className="blog-meta-texts">
                  <span className="blog-version">{item.version}</span>
                  <span className="blog-date">{item.date}</span>
                </div>
              </div>

              {/* Right blog content card */}
              <div className="blog-content-card">
                <div className="blog-card-header">
                  <span className={`blog-tag-badge ${item.badgeColor}`}>{item.tag}</span>
                  <h2 className="blog-card-title">{item.title}</h2>
                </div>
                <p className="blog-card-desc">{item.description}</p>
                <div className="blog-bullet-section">
                  <h4 className="bullet-section-title">Key Highlights:</h4>
                  <ul className="blog-bullet-list">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="blog-bullet-item">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch CTA card */}
      <section className="blog-cta-section">
        <div className="blog-cta-card">
          <div className="cta-content">
            <h3 className="cta-title">Ready for Launch?</h3>
            <p className="cta-desc">
              CVMind AI has completed rigorous performance optimizations, CORS resolutions, and TypeScript compilations. We are officially going live on June 17, 2026.
            </p>
            <button className="cta-btn" onClick={() => setCurrentPage('home')}>
              Try CVMind AI Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
