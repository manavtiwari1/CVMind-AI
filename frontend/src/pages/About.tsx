import { Cpu, Eye, FileSearch, GraduationCap } from 'lucide-react';
import './About.css';

export default function About() {
  const steps = [
    {
      icon: <FileSearch className="step-icon" />,
      title: "1. Raw Document Parse",
      desc: "Our node parser processes your uploaded PDF, DOCX, or TXT file entirely in memory, extracting unicode blocks, raw paragraph layouts, and styling sections. No file logs are ever written to disk."
    },
    {
      icon: <Cpu className="step-icon" />,
      title: "2. ATS Keyword Match",
      desc: "The system runs text vector matching against standard corporate role models to detect missing technologies, key tools, and structural keywords critical to passing automated screening audits."
    },
    {
      icon: <GraduationCap className="step-icon" />,
      title: "3. Gemini Cognitive Audit",
      desc: "Our customized Gemini-2.5-Flash cognitive model plays the role of an elite HR director. It evaluates the impact score of each sentence, highlighting responsibility phrasing and rewriting weak descriptions."
    },
    {
      icon: <Eye className="step-icon" />,
      title: "4. Multi-Layer Scorecard",
      desc: "All extracted metrics are compiled into a comprehensive results dashboard detailing key strengths, weaknesses, line-by-line before/after recommendations, and downloadable PDF reports."
    }
  ];

  return (
    <div className="about-container animate-fade-in-up">
      {/* Background glow node */}
      <div className="glow-ambient" style={{ top: '20%', right: '10%' }}></div>
      <div className="glow-ambient" style={{ bottom: '20%', left: '10%' }}></div>

      <section className="about-hero">
        <h1 className="about-title">Cognitive Resume Intelligence</h1>
        <p className="about-subtitle">
          Engineered to give job seekers an unfair advantage in the modern hiring landscape.
        </p>
      </section>

      {/* Tech Stack details */}
      <section className="about-info-block glass-card">
        <h3 className="info-title">Why CVMind AI?</h3>
        <p className="info-text">
          Modern recruitment is broken. Over 75% of resumes are discarded by Applicant Tracking Systems (ATS) before a human recruiter even looks at them. Of the remaining 25%, the average recruiter spends less than 6 seconds reviewing each document.
        </p>
        <p className="info-text">
          CVMind AI was built to solve this asymmetry. By deploying advanced Large Language Models, we give you immediate access to corporate-level resume diagnostics. You receive instant, comprehensive, and hyper-actionable feedback that aligns your profile with what recruiters and algorithms search for.
        </p>
      </section>

      {/* Workflow Process Timeline */}
      <section className="about-timeline-section">
        <h2 className="timeline-section-title">The Engineering Workflow</h2>
        <p className="timeline-section-subtitle">How our platform evaluates your career history:</p>

        <div className="timeline-wrapper">
          {steps.map((step, idx) => (
            <div key={idx} className="timeline-item glass-card animate-fade-in-up" style={{ animationDelay: `${idx * 0.15}s` }}>
              <div className="timeline-icon-box">
                {step.icon}
              </div>
              <div className="timeline-content-box">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Ethics Section */}
      <section className="privacy-card glass-card">
        <h3 className="privacy-title">Data Ethics & Security</h3>
        <p className="privacy-text">
          We believe in absolute data privacy. Your resume content is never stored on a database, never shared with third parties, and never used to train machine learning models. The file is parsed in-memory, analyzed by the Gemini API in a secure single session, and immediately cleared from the server.
        </p>
      </section>
    </div>
  );
}
