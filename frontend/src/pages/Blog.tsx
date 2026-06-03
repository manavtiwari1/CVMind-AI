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
      title: 'Big Product Update: CVMind AI is now Launch-Ready!',
      tag: 'Core Upgrade',
      description: 'Over the last few days, we have completely transformed CVMind AI from a simple resume reviewer into a comprehensive, end-to-end career suite powered by AI. Humne products navigation, core AI engine, aur dashboard UX me major features aur updates deploy kiye hain.',
      details: [
        '<strong>🎙️ 1. SmartPrep AI (HR & Technical Interview Coach)</strong><br/>Interview crack karna ab aur bhi easy hai! SmartPrep AI aapke resume ko parse karke exact targeted job profiles ke rules aur domain checklist ke according standard interview questions set karta hai:',
        '<span class="sub-bullet"><strong>Practice Sandbox:</strong> Aap question-by-question answers type karke prepare kar sakte hain.</span>',
        '<span class="sub-bullet"><strong>AI Evaluation & Score:</strong> Instant feedback aur score (out of 10) milta hai ki aapka answer standard STAR (Situation, Task, Action, Result) method me align ho raha hai ya nahi.</span>',
        
        '<strong>💼 2. LinkedIn Optimizer (Dedicated Submenu Suite)</strong><br/>Aapki professional branding ko state-of-the-art level par le jaane ke liye:',
        '<span class="sub-bullet"><strong>Profile PDF Audit:</strong> Apni LinkedIn profile ka PDF download karke upload karein aur optimization scores paayein.</span>',
        '<span class="sub-bullet"><strong>Bio & Banner Generator:</strong> Custom hook, core skills, aur metrics ke align-optimized LinkedIn bio aur headlines auto-generate karein.</span>',
        '<span class="sub-bullet"><strong>Outreach & DM Writer:</strong> Recruiter DMs, referral requests, aur connection requests ke custom personalized templates generate karein.</span>',

        '<strong>🗺️ 3. Career Path AI (Career Transitions Builder)</strong><br/>Apne standard career benchmark milestones define karein:',
        '<span class="sub-bullet"><strong>Skill Gap & Courses:</strong> Target job profiles ke related skills gap detect karein aur custom courses recommendations paayein.</span>',
        '<span class="sub-bullet"><strong>Elevator Pitch Builder:</strong> Corporate, Startup, aur Creative contexts ke according custom 60-second verbal pitches build karein.</span>',
        '<span class="sub-bullet"><strong>Interactive Career Roadmap:</strong> Apne current role se target role me upgrade hone ke liye visual timeline checklists ke milestones aur guidelines paayein.</span>',

        '<strong>🔄 4. Premium UX & Auto-Save Features</strong><br/>User convenience ke liye humne manual updates ko clear and automated banaya hai:',
        '<span class="sub-bullet"><strong>Silent Background Auto-Save:</strong> Content editor (Cover Letter/Resume) har 4 seconds me background changes ko save karega bina active cursor state disturb kiye. SmartPrep AI aur Outreach logs update hote hi auto-save hote hain.</span>',
        '<span class="sub-bullet"><strong>Visual Status Badges:</strong> Manual save button ki jagah ab elegant ✓ Saved automatically to My Works status badge show hota hai.</span>',
        '<span class="sub-bullet"><strong>Deletion Safety Sync:</strong> "My Works" modal se save file delete karte hi active editor/dashboard wapas gallery view par sync hokar state reset kar leta hai taaki clean logs rahein.</span>',

        '<strong>🤖 5. Upgraded AI API Engine (DeepSeek Integration)</strong><br/>Performance ko dynamic aur crash-proof rakhne ke liye humne ek bada step kiya hai:',
        '<span class="sub-bullet"><strong>Optimized API Integration:</strong> Humne Google Gemini 2.5 Flash aur OpenRouter API pipeline ko fully rebuild kiya hai, taaki users ko bina kisi fail rate ya connection timeouts ke, instant response mile aur product use karte waqt koi problem na aaye.</span>',
        '<span class="sub-bullet"><strong>Schema-Safe Parsing:</strong> Frontend aur backend ke beech API error boundaries build kiye hain, jisse output format mismatch hone ka chance zero ho gaya hai.</span>'
      ],
      icon: Cpu,
      badgeColor: 'badge-blue'
    },
    {
      id: 2,
      version: 'v2.0.0',
      date: 'June 1, 2026',
      title: 'LinkedIn Outreach & Transition Features Rollout',
      tag: 'New Features',
      description: 'Extending platform scopes into customized networking DMs, corporate pitches, visual timelines, and skill path planning.',
      details: [
        '<strong>Recruiter DMs & Connection Requests:</strong> Dynamic cold networking pitches customized for LinkedIn character limits.',
        '<strong>Automated Skill Gap Scans:</strong> Matches resume context against targeted descriptions and recommends online curriculum links.',
        '<strong>Custom Elevator Pitches:</strong> Produces narratives matching corporate, startup, or creative communication requirements.',
        '<strong>Interactive transition roadmap checklists:</strong> A 4-stage transitions timeline to benchmark candidate milestones.'
      ],
      icon: Rocket,
      badgeColor: 'badge-purple'
    },
    {
      id: 3,
      version: 'v1.2.0',
      date: 'May 29, 2026',
      title: 'Premium Portfolios & Interactive Coach Sandbox',
      tag: 'UX Polish',
      description: 'Adding interview question sandboxes and public-facing designer portfolios for recruiters.',
      details: [
        '<strong>SmartPrep Question Bank:</strong> Custom scorecards checking technical, behavioral, and HR questions based on your resume.',
        '<strong>Shareable Portfolio Links:</strong> Visual web portfolios featuring premium responsive templates, opening in clean external tabs.',
        '<strong>Banner Guidelines & Taglines:</strong> Layout design suggestions to optimize profile banner keywords.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-green'
    },
    {
      id: 4,
      version: 'v1.1.0',
      date: 'May 25, 2026',
      title: 'Email Password Reset & FAQ Help Center',
      tag: 'Security & Help',
      description: 'Hardening verification pipelines, logging administrator audits, and streamlining navigation guides.',
      details: [
        '<strong>SMTP Resend SDK Dispatcher:</strong> Enables live, secure, tokenized password reset links via email.',
        '<strong>Admin Audit Logs:</strong> Logs password reset triggers for secure developer maintenance.',
        '<strong>Redesigned FAQ split-screen articles:</strong> Streamlines user support access.',
        '<strong>Frictionless Landing Page:</strong> Removes authorization boundaries for initial resume scans.'
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
                      <li 
                        key={dIdx} 
                        className="blog-bullet-item" 
                        dangerouslySetInnerHTML={{ __html: detail }} 
                      />
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
