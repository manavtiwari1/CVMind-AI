import { 
  EyeOff, 
  Briefcase, 
  MessageSquare, 
  Terminal, 
  Cpu, 
  Scale, 
  ShieldCheck, 
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './Privacy.css';

export default function Privacy() {
  const privacyFeatures = [
    {
      icon: <EyeOff size={24} />,
      title: "Resumes (Zero Retention)",
      type: "secure",
      desc: "We cannot see or access your uploaded resumes. When you upload a PDF, DOCX, or TXT file for ATS auditing or scoring, it is parsed in-memory, analyzed in a secure single session, and immediately flushed. Your documents are never saved to a database, never written to disk, and never shared."
    },
    {
      icon: <Briefcase size={24} />,
      title: "Created Works (100% Private)",
      type: "secure",
      desc: "We cannot see your custom creations. Your tailored resumes, cover letters, smart interview preparation scorecards, and document drafts belong solely to you. We do not track, review, aggregate, or distribute the career materials you build on our platform."
    },
    {
      icon: <MessageSquare size={24} />,
      title: "AI Assistant Chats (Safe Quality Auditing)",
      type: "monitoring",
      desc: "We can see your conversations with the AI Assistant. To resolve system glitches, monitor API errors, and ensure the chatbot provides safe, helpful career advice, dialogue transcripts are logged. These chats are treated with strict confidentiality and are periodically purged."
    },
    {
      icon: <Terminal size={24} />,
      title: "System Logs (Strictly Anonymized)",
      type: "monitoring",
      desc: "We can see technical system logs for backend operations. However, these logs contain absolutely no personal details. No names, no email addresses, and no phone numbers are captured. The telemetry is entirely anonymous and used solely to optimize platform speed."
    },

    {
      icon: <Cpu size={24} />,
      title: "Zero Machine Learning Training",
      type: "secure",
      desc: "We believe your career data is yours. Unlike massive public services that ingest user inputs to train public LLM models, CV Mind uses enterprise API connections. None of your resume text, prompts, or interview answers are ever used to train public or private models."
    }
  ];

  return (
    <div className="privacy-container animate-fade-in-up">
      {/* Background glow nodes */}
      <div className="glow-ambient" style={{ top: '15%', left: '5%', opacity: 0.15 }}></div>
      <div className="glow-ambient" style={{ bottom: '30%', right: '5%', opacity: 0.15 }}></div>

      <section className="privacy-hero">
        <div className="privacy-hero-badge">
          <span className="badge badge-blue">
            <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Privacy Guaranteed
          </span>
        </div>
        <h1 className="privacy-title">Privacy Principles & Sovereignty</h1>
        <p className="privacy-subtitle">
          At CV Mind, privacy isn't a checkbox—it is a core pillar of our system architecture. We are transparent about what we log and absolute about what we protect.
        </p>
      </section>

      {/* The Constitutional Anchor: Article 21 Section */}
      <section className="constitution-card">
        <div className="constitution-glow"></div>
        <div className="constitution-header">
          <div className="constitution-icon-wrapper">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="constitution-title">Article 21 of the Constitution of India</h3>
            <span className="constitution-badge">The Sovereign Right to Privacy</span>
          </div>
        </div>

        <div className="constitution-quote-box">
          <p className="constitution-quote">
            "The right to privacy is an element of human dignity. The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution."
          </p>
          <span className="constitution-author">
            — Supreme Court of India (Landmark K.S. Puttaswamy v. Union of India Judgment, 2017)
          </span>
        </div>

        <p className="constitution-text">
          Article 21 guarantees the fundamental Right to Life and Personal Liberty. In honoring this constitutional mandate, CV Mind incorporates <strong>"Privacy by Design."</strong> We believe that your professional achievements, personal background, and career aspirations are sacred assets. Our platform is engineered to respect your autonomy, enforce structural boundaries on data access, and uphold the dignity of modern professionals in the digital age.
        </p>
      </section>

      {/* Detailed Privacy Matrix/Features */}
      <section className="privacy-features-section">
        <h2 className="features-title">Our Architecture & Guarantees</h2>
        <p className="features-subtitle">How your data is parsed, stored, and segregated across our platform:</p>

        <div className="features-grid">
          {privacyFeatures.map((feature, idx) => (
            <div key={idx} className="feature-card glass-card">
              <div className="feature-card-header">
                <div className={`feature-icon-wrapper ${feature.type}`}>
                  {feature.icon}
                </div>
                <h4>{feature.title}</h4>
              </div>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Transparency Matrix */}
      <section className="matrix-section">
        <h2 className="matrix-title">Transparency Dashboard</h2>
        <p className="matrix-subtitle">An honest, clear breakdown of data visibility:</p>

        <div className="matrix-table-wrapper glass-card">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Data Entity</th>
                <th>Who Can See It</th>
                <th>Storage Location</th>
                <th>Security Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Uploaded Resumes</strong></td>
                <td><span style={{ color: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><XCircle size={14} /> Nobody</span></td>
                <td>Temporary in-memory buffer (Never written to disk)</td>
                <td><span className="badge badge-green">Absolute</span></td>
              </tr>
              <tr>
                <td><strong>Created Drafts & Works</strong></td>
                <td><span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> Only You</span></td>
                <td>Secure cloud database synced via your private login</td>
                <td><span className="badge badge-green">High (Encrypted)</span></td>
              </tr>
              <tr>
                <td><strong>AI Chat Conversations</strong></td>
                <td><span style={{ color: 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Info size={14} /> Support & Developers</span></td>
                <td>Anonymized conversation logging server (No PII captured)</td>
                <td><span className="badge badge-orange">Monitored (QA)</span></td>
              </tr>
              <tr>
                <td><strong>System Logs</strong></td>
                <td><span style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Info size={14} /> System Engineers</span></td>
                <td>Protected telemetry dashboard (Strictly zero personal details)</td>
                <td><span className="badge badge-blue">Standard Logs</span></td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* Advertising & Cookies (required disclosure for Google AdSense) */}
      <section className="summary-box glass-card">
        <h3 className="summary-title">Advertising & Cookies</h3>
        <p className="summary-text">
          CV Mind uses Google AdSense, a third-party advertising service, to display ads on some pages. Google and its partners use cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website and other websites, and to measure ad performance. Google's use of advertising cookies enables it and its partners to show you personalized ads.
        </p>
        <p className="summary-text">
          You can opt out of personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>Google Ads Settings</a>, or opt out of many third-party advertising cookies at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>www.aboutads.info</a>. You can also block or delete cookies through your browser settings — the site's core tools work without advertising cookies.
        </p>
        <p className="summary-text">
          We also use essential cookies and local storage to keep you signed in and remember your preferences. These are strictly functional and are never sold or shared with advertisers.
        </p>
      </section>

      {/* Transit Security / Bottom Note */}
      <section className="summary-box glass-card">
        <h3 className="summary-title">End-to-End Encryption & Security</h3>
        <p className="summary-text">
          All communications between your browser and CV Mind AI are encrypted in transit using industry-standard TLS 1.3 protocols. This prevents interceptive snooping, ensuring that whether you are analyzing your score or talking to the AI coach, your session remains entirely private.
        </p>
      </section>
    </div>
  );
}
