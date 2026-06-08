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
      id: 8,
      version: 'v2.5.0',
      date: 'June 8, 2026',
      title: 'AI Resume Wizard, Dynamic Form Sections & Preview Mockups',
      tag: 'New Features',
      description: 'Major update introducing the structured AI Resume Builder Wizard. Users can select any ATS resume template, fill in their credentials dynamically via dynamic form sections, and have AI generate a high-impact resume in under 60 seconds.',
      details: [
        '<strong>AI Resume Builder Wizard:</strong> A premium, multi-section form wizard collecting Personal info, Academic details, Work Experience, Skills, and Courses.',
        '<strong>Dynamic List Add/Remove Controls:</strong> Fully interactive controls to add or remove multiple dynamic work experiences, schools, or certifications.',
        '<strong>High-Resolution Template Previews:</strong> Replaced miniature placeholder drawings in the gallery with real, high-resolution preview screenshots of each template layout.',
        '<strong>Truncation-Free AI Refine:</strong> Upgraded the refinement engine with a 5,000-token capacity limit and structured instructions to prevent layout cut-offs.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-purple'
    },
    {
      id: 7,
      version: 'v2.4.0',
      date: 'June 5, 2026',
      title: 'Introducing AI Job Finder: CV-to-Role Matching Engine',
      tag: 'New Features',
      description: 'Find jobs tailored specifically to your resume in seconds. Upload your CV, describe your target role, and let AI scan the market to curate 8–10 matched opportunities with salary ranges, required skills, and direct LinkedIn apply links.',
      details: [
        '<strong>Intelligent Role Matching:</strong> Analyzes your resume experience and target preferences to align compatible roles, bypassing generic keyword filters.',
        '<strong>Compatibility Match Scores:</strong> Real-time percentage score checking showing how strongly your skills map to target responsibilities.',
        '<strong>Smart Work Type Filters:</strong> Instantly filter matches using Remote, Full-time, Part-time, and Internship selector pills.',
        '<strong>Direct Apply Links:</strong> Pre-populated, search-safe job board links matching the exact title and location on standard professional boards.',
        '<strong>Premium Interactive Visuals:</strong> Gorgeous animated scanning console displaying active step-by-step progress checklists while the AI curates matches.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-purple'
    },
    {
      id: 6,
      version: 'v2.3.0',
      date: 'June 4, 2026',
      title: '360° Rotating Product Showcase on Home Page',
      tag: 'UX Polish',
      description: 'A stunning 3D rotating product carousel has been added to the Home page, showcasing all 6 AI tools through interactive cards — featuring auto-rotation, drag support, flip animations, and live navigation controls.',
      details: [
        '<strong>360° 3D Card Carousel:</strong> A fully interactive 3D carousel is now embedded below the hero/upload section on the Home page. All 6 AI product cards rotate with real perspective depth and smooth transitions.',
        '<strong>Auto-Rotate with Pause-on-Hover:</strong> Cards automatically cycle every 6 seconds. Hovering pauses the rotation instantly, and it resumes as soon as the cursor leaves.',
        '<strong>Drag to Explore:</strong> Users can manually drag the carousel left or right using mouse or touch — fully functional on both desktop and mobile devices.',
        '<strong>Flip Animation (Front & Back):</strong> Each card can be flipped to reveal a "How it Works" back side showing a step-by-step guide and feature tags for that tool.',
        '<strong>Direct Navigation:</strong> Clicking "Try it Free" on any card navigates directly to that tool without any extra steps or redirects.',
        '<strong>Live Progress Arc:</strong> An animated arc indicator at the bottom displays the current card number and product name with a smooth fill transition.',
        '<strong>Per-Card Gradient Glow:</strong> Every product card has its own unique color gradient and ambient glow effect, giving the platform a premium, polished aesthetic.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-green'
    },
    {
      id: 5,
      version: 'v2.2.0',
      date: 'June 3, 2026',
      title: 'Voice Practice, AI Portfolios & LinkedIn Post Generator',
      tag: 'New Features',
      description: 'Massive update introducing three major tools: Web Speech API-based mock interviews, 1-click portfolio website generation, and viral LinkedIn post generation, along with complete AI API engine migrations.',
      details: [
        '<strong>Voice Interview Practice:</strong> Built an interactive mock interview sandbox utilizing the Web Speech API. Candidates can now speak their answers aloud, and the AI will analyze transcripts for STAR alignment, confidence, and filler words.',
        '<strong>Portfolio Website Generator:</strong> Instantly convert a resume into a responsive HTML/CSS portfolio website. Features 5 premium themes, an interactive device preview frame, and a direct .html download option.',
        '<strong>LinkedIn Post Generator:</strong> Generates 3 styles of viral LinkedIn posts (Professional, Storytelling, Punchy) with hooks and hashtags based on your resume achievements and target topic.',
        '<strong>Microphone Auto-Recovery:</strong> Implemented silent auto-restart logic to prevent the Web Speech API from abruptly stopping during long pauses or browser network timeouts.'
      ],
      icon: Sparkles,
      badgeColor: 'badge-purple'
    },
    {
      id: 1,
      version: 'v2.1.0',
      date: 'June 3, 2026',
      title: 'Big Product Update: CVMind AI is now Launch-Ready!',
      tag: 'Core Upgrade',
      description: 'Over the last few days, we have completely transformed CVMind AI from a simple resume reviewer into a comprehensive, end-to-end career suite. We have deployed major features and updates across product navigation, our core engine, and dashboard UX.',
      details: [
        '<strong>1. SmartPrep AI (HR & Technical Interview Coach)</strong><br/>Cracking interviews is now easier than ever! SmartPrep AI parses your resume and curates tailored interview questions based on your targeted job profile and domain checklists:',
        '<span class="sub-bullet"><strong>Practice Sandbox:</strong> Practice by typing your answers question-by-question.</span>',
        '<span class="sub-bullet"><strong>AI Evaluation & Score:</strong> Receive instant feedback and a score (out of 10) evaluating how well your answer aligns with the standard STAR (Situation, Task, Action, Result) framework.</span>',
        
        '<strong>2. LinkedIn Optimizer (Dedicated Submenu Suite)</strong><br/>Designed to elevate your professional branding to a state-of-the-art level:',
        '<span class="sub-bullet"><strong>Profile PDF Audit:</strong> Simply download your LinkedIn profile as a PDF, upload it here, and receive actionable optimization scores.</span>',
        '<span class="sub-bullet"><strong>Bio & Headline Generator:</strong> Auto-generate LinkedIn bios and headlines optimized with custom hooks, core skills, and key achievements.</span>',
        '<span class="sub-bullet"><strong>Outreach & DM Writer:</strong> Generate highly personalized templates for recruiter DMs, referral requests, and connection invites.</span>',

        '<strong>3. Career Path AI (Career Transitions Builder)</strong><br/>Define your professional benchmarks and plan milestones:',
        '<span class="sub-bullet"><strong>Skill Gap & Courses:</strong> Identify skill gaps relative to your target job profile and get curated online course recommendations.</span>',
        '<span class="sub-bullet"><strong>Elevator Pitch Builder:</strong> Craft custom 60-second verbal pitches tailored to Corporate, Startup, or Creative contexts.</span>',
        '<span class="sub-bullet"><strong>Interactive Career Roadmap:</strong> Get visual timeline checklists with milestones and step-by-step guidelines to upgrade from your current role to your target career path.</span>',

        '<strong>4. Premium UX & Auto-Save Features</strong><br/>For maximum user convenience, we have automated and refined manual actions:',
        '<span class="sub-bullet"><strong>Silent Background Auto-Save:</strong> The content editor (for Resumes and Cover Letters) now saves your progress in the background every 4 seconds without interrupting your typing or cursor position. SmartPrep AI practice logs and Outreach templates are also saved automatically upon creation.</span>',
        '<span class="sub-bullet"><strong>Visual Status Badges:</strong> The manual save button is replaced with an elegant, real-time status badge: "✓ Saved automatically to My Works".</span>',
        '<span class="sub-bullet"><strong>Deletion Safety Sync:</strong> Deleting a saved file from the "My Works" panel instantly resets the active editor or dashboard back to the gallery view, ensuring clean state sync across the board.</span>',

        '<strong>5. Upgraded Core Engine & Performance Optimizations</strong><br/>To keep the platform dynamic, highly responsive, and crash-proof:',
        '<span class="sub-bullet"><strong>Optimized Request Pipelines:</strong> We have fully rebuilt our server-side request pipelines. This guarantees instant response times, zero connection timeouts, and a seamless user experience under heavy loads.</span>',
        '<span class="sub-bullet"><strong>Schema-Safe Parsing:</strong> Integrated robust error boundaries between the frontend and backend, ensuring structured data compiles correctly with zero format mismatches.</span>'
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
          <span className="blog-launch-date">Launching Soon</span>
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
            <h3 className="cta-title">Launching Soon</h3>
            <p className="cta-desc">
              CVMind AI has completed rigorous performance optimizations, CORS resolutions, and TypeScript compilations. We are officially going live soon.
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
