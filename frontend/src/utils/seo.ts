interface PageSEO {
  title: string;
  description: string;
}

const SITE_URL = 'https://cvmind.ai';

const PAGE_SEO: Record<string, PageSEO> = {
  home: {
    title: 'CV Mind - Free AI Resume Checker & ATS Optimization Tool',
    description: 'Optimize your resume instantly with CV Mind. Our AI recruiter audits formatting, structural weaknesses, missing keywords, and provides professional before-and-after experience rewrites.',
  },
  about: {
    title: 'About Us | CV Mind',
    description: 'Learn how CV Mind uses AI to help job seekers pass ATS screening, improve resume quality, and land more interviews.',
  },
  contact: {
    title: 'Contact Us | CV Mind',
    description: 'Get in touch with the CV Mind team for support, feedback, or business inquiries.',
  },
  faq: {
    title: 'Frequently Asked Questions | CV Mind',
    description: 'Answers to common questions about CV Mind, ATS resume scoring, AI optimization, and how our tools work.',
  },
  blog: {
    title: 'Career & Resume Tips Blog | CV Mind',
    description: 'Resume writing tips, ATS optimization guides, and career advice to help you land your next job.',
  },
  privacy: {
    title: 'Privacy Policy | CV Mind',
    description: 'Read how CV Mind collects, uses, and protects your data and resume information.',
  },
  terms: {
    title: 'Terms & Conditions | CV Mind',
    description: 'Terms and conditions for using CV Mind\'s AI resume and career tools.',
  },
  'refund-policy': {
    title: 'Refund Policy | CV Mind',
    description: 'CV Mind\'s refund policy for paid services.',
  },
  disclaimer: {
    title: 'Disclaimer | CV Mind',
    description: 'Disclaimer regarding the use of CV Mind\'s AI-generated resume and career content.',
  },
  pricing: {
    title: 'Pricing | CV Mind',
    description: 'Simple, transparent pricing for CV Mind\'s AI resume and career tools.',
  },
  products: {
    title: 'All AI Career Tools | CV Mind',
    description: 'Explore CV Mind\'s full suite of AI-powered resume, LinkedIn, interview, and career tools.',
  },
  'resume-builder': {
    title: 'Free AI Resume Builder | CV Mind',
    description: 'Build a professional, ATS-friendly resume in minutes with CV Mind\'s free AI resume builder.',
  },
  tailor: {
    title: 'AI Resume Tailorer - Match Any Job Description | CV Mind',
    description: 'Instantly tailor your resume to any job description with AI-matched skills and keyword optimization.',
  },
  prep: {
    title: 'AI Interview Prep & STAR Coaching | CV Mind',
    description: 'Practice behavioral and STAR-method interview questions tailored to your resume with AI coaching.',
  },
  'voice-prep': {
    title: 'AI Voice Interview Practice | CV Mind',
    description: 'Get real-time speaking feedback with CV Mind\'s AI-powered voice interview practice tool.',
  },
  'job-finder': {
    title: 'AI Job Finder - Curated Roles for You | CV Mind',
    description: 'Find curated job openings that match your resume and target role with CV Mind\'s AI Job Finder.',
  },
  proofreading: {
    title: 'AI Resume Proofreading | CV Mind',
    description: 'Fix grammar, tone, and weak verbs in your resume instantly with AI-powered proofreading.',
  },
  'portfolio-gen': {
    title: 'AI Portfolio Generator | CV Mind',
    description: 'Build a shareable professional portfolio website in minutes with CV Mind\'s AI Portfolio Generator.',
  },
  linkedin: {
    title: 'LinkedIn Profile PDF Audit | CV Mind',
    description: 'Get an AI-powered audit of your LinkedIn profile PDF with actionable improvement tips.',
  },
  'linkedin-bio': {
    title: 'LinkedIn Bio & Banner Generator | CV Mind',
    description: 'Generate a compelling LinkedIn bio and banner image with AI.',
  },
  'linkedin-outreach': {
    title: 'LinkedIn Outreach & DM Writer | CV Mind',
    description: 'Write effective LinkedIn outreach messages and connection requests with AI.',
  },
  'linkedin-post': {
    title: 'LinkedIn Post Generator | CV Mind',
    description: 'Generate engaging LinkedIn posts to grow your professional presence with AI.',
  },
  'career-courses': {
    title: 'Skill Gaps & Course Recommendations | CV Mind',
    description: 'Discover your skill gaps and get AI-curated course recommendations to advance your career.',
  },
  'elevator-pitch': {
    title: 'AI Elevator Pitch Builder | CV Mind',
    description: 'Craft a compelling elevator pitch tailored to your career goals with AI.',
  },
  'career-roadmap': {
    title: 'Interactive Career Roadmap | CV Mind',
    description: 'Get a personalized, AI-generated career roadmap to reach your professional goals.',
  },
};

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySEO(page: string) {
  const seo = PAGE_SEO[page];
  if (!seo) return;

  document.title = seo.title;
  setMeta('description', seo.description);
  setMeta('og:title', seo.title, 'property');
  setMeta('og:description', seo.description, 'property');
  setMeta('twitter:title', seo.title, 'property');
  setMeta('twitter:description', seo.description, 'property');

  const url = page === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page}`;
  setMeta('og:url', url, 'property');
  setMeta('twitter:url', url, 'property');

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}
