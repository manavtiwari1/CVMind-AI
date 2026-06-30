import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ── Storage ────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const APPS_FILE = path.join(DATA_DIR, 'auto_apply_applications.json');

function readApps() {
  try {
    if (!fs.existsSync(APPS_FILE)) return [];
    return JSON.parse(fs.readFileSync(APPS_FILE, 'utf-8'));
  } catch { return []; }
}
function writeApps(apps) {
  try { fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2)); } catch {}
}

// ── Mock Job Database (30 realistic jobs) ─────────────────────────────────────
const MOCK_JOBS = [
  { id: 'j001', title: 'Senior Frontend Engineer', company: 'Razorpay', domain: 'razorpay.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹25L–₹40L/yr', exp: '3–5 yrs', posted: '1 day ago', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'CSS', 'Performance'], industry: 'Fintech', logo: null },
  { id: 'j002', title: 'Full Stack Developer', company: 'Zepto', domain: 'zepto.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Onsite', salary: '₹18L–₹30L/yr', exp: '2–4 yrs', posted: '2 days ago', skills: ['React', 'Node.js', 'MongoDB', 'Redis', 'Docker', 'AWS'], industry: 'E-commerce', logo: null },
  { id: 'j003', title: 'React Native Developer', company: 'CRED', domain: 'cred.club', location: 'Bengaluru, India', type: 'Full-time', remote: 'Remote', salary: '₹20L–₹35L/yr', exp: '2–5 yrs', posted: '3 days ago', skills: ['React Native', 'JavaScript', 'Redux', 'iOS', 'Android'], industry: 'Fintech', logo: null },
  { id: 'j004', title: 'Backend Engineer', company: 'PhonePe', domain: 'phonepe.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹22L–₹38L/yr', exp: '2–5 yrs', posted: '1 day ago', skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL', 'Microservices'], industry: 'Fintech', logo: null },
  { id: 'j005', title: 'Machine Learning Engineer', company: 'Google', domain: 'google.com', location: 'Hyderabad, India', type: 'Full-time', remote: 'Hybrid', salary: '₹45L–₹80L/yr', exp: '3–7 yrs', posted: '4 days ago', skills: ['Python', 'TensorFlow', 'PyTorch', 'ML', 'NLP', 'Data Science'], industry: 'Tech', logo: null },
  { id: 'j006', title: 'Data Scientist', company: 'Flipkart', domain: 'flipkart.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹20L–₹35L/yr', exp: '2–5 yrs', posted: '5 days ago', skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Tableau', 'Statistics'], industry: 'E-commerce', logo: null },
  { id: 'j007', title: 'DevOps Engineer', company: 'Swiggy', domain: 'swiggy.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹18L–₹32L/yr', exp: '2–4 yrs', posted: '2 days ago', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'], industry: 'Food-tech', logo: null },
  { id: 'j008', title: 'Product Manager', company: 'Meesho', domain: 'meesho.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹25L–₹45L/yr', exp: '3–6 yrs', posted: '3 days ago', skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Roadmap', 'UX', 'Stakeholder Management'], industry: 'E-commerce', logo: null },
  { id: 'j009', title: 'UI/UX Designer', company: 'Nykaa', domain: 'nykaa.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Hybrid', salary: '₹12L–₹22L/yr', exp: '2–4 yrs', posted: '1 day ago', skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems', 'CSS'], industry: 'E-commerce', logo: null },
  { id: 'j010', title: 'Software Development Engineer', company: 'Amazon', domain: 'amazon.com', location: 'Hyderabad, India', type: 'Full-time', remote: 'Hybrid', salary: '₹35L–₹60L/yr', exp: '2–6 yrs', posted: '6 days ago', skills: ['Java', 'Python', 'AWS', 'System Design', 'Data Structures', 'Algorithms'], industry: 'Tech', logo: null },
  { id: 'j011', title: 'Frontend Developer', company: 'Paytm', domain: 'paytm.com', location: 'Noida, India', type: 'Full-time', remote: 'Onsite', salary: '₹15L–₹28L/yr', exp: '1–3 yrs', posted: '2 days ago', skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux', 'REST APIs'], industry: 'Fintech', logo: null },
  { id: 'j012', title: 'Cloud Engineer', company: 'Infosys', domain: 'infosys.com', location: 'Pune, India', type: 'Full-time', remote: 'Hybrid', salary: '₹12L–₹22L/yr', exp: '2–5 yrs', posted: '1 week ago', skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Cloud Architecture', 'Security'], industry: 'IT Services', logo: null },
  { id: 'j013', title: 'iOS Developer', company: 'Zomato', domain: 'zomato.com', location: 'Gurugram, India', type: 'Full-time', remote: 'Hybrid', salary: '₹20L–₹35L/yr', exp: '2–5 yrs', posted: '3 days ago', skills: ['Swift', 'iOS', 'Xcode', 'SwiftUI', 'REST APIs', 'Core Data'], industry: 'Food-tech', logo: null },
  { id: 'j014', title: 'Blockchain Developer', company: 'CoinDCX', domain: 'coindcx.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Remote', salary: '₹22L–₹40L/yr', exp: '2–4 yrs', posted: '5 days ago', skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Node.js', 'React'], industry: 'Crypto', logo: null },
  { id: 'j015', title: 'Security Engineer', company: 'BrowserStack', domain: 'browserstack.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Hybrid', salary: '₹20L–₹38L/yr', exp: '3–6 yrs', posted: '2 days ago', skills: ['Penetration Testing', 'OWASP', 'Security Audits', 'Python', 'Network Security'], industry: 'Tech', logo: null },
  { id: 'j016', title: 'Data Engineer', company: 'Ola', domain: 'ola.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Onsite', salary: '₹18L–₹32L/yr', exp: '2–4 yrs', posted: '4 days ago', skills: ['Apache Spark', 'Kafka', 'Python', 'SQL', 'ETL', 'Data Warehousing'], industry: 'Transport', logo: null },
  { id: 'j017', title: 'QA Automation Engineer', company: 'Freshworks', domain: 'freshworks.com', location: 'Chennai, India', type: 'Full-time', remote: 'Hybrid', salary: '₹12L–₹22L/yr', exp: '2–4 yrs', posted: '1 week ago', skills: ['Selenium', 'Python', 'Jest', 'Cypress', 'API Testing', 'CI/CD'], industry: 'SaaS', logo: null },
  { id: 'j018', title: 'Embedded Software Engineer', company: 'Ather Energy', domain: 'atherenergy.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Onsite', salary: '₹15L–₹28L/yr', exp: '2–5 yrs', posted: '3 days ago', skills: ['C', 'C++', 'Embedded Systems', 'RTOS', 'CAN Bus', 'Firmware'], industry: 'EV', logo: null },
  { id: 'j019', title: 'Technical Lead', company: 'InMobi', domain: 'inmobi.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹35L–₹55L/yr', exp: '6–10 yrs', posted: '2 days ago', skills: ['Leadership', 'System Design', 'Java', 'Distributed Systems', 'Mentoring'], industry: 'AdTech', logo: null },
  { id: 'j020', title: 'Go Developer', company: 'slice', domain: 'sliceit.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Remote', salary: '₹18L–₹32L/yr', exp: '2–4 yrs', posted: '5 days ago', skills: ['Go', 'Microservices', 'gRPC', 'PostgreSQL', 'Docker', 'Kubernetes'], industry: 'Fintech', logo: null },
  { id: 'j021', title: 'Software Engineer', company: 'Microsoft', domain: 'microsoft.com', location: 'Hyderabad, India', type: 'Full-time', remote: 'Hybrid', salary: '₹40L–₹70L/yr', exp: '2–6 yrs', posted: '1 week ago', skills: ['C#', '.NET', 'Azure', 'TypeScript', 'React', 'System Design'], industry: 'Tech', logo: null },
  { id: 'j022', title: 'AI/ML Research Engineer', company: 'Samsung R&D', domain: 'samsung.com', location: 'Noida, India', type: 'Full-time', remote: 'Onsite', salary: '₹25L–₹45L/yr', exp: '3–6 yrs', posted: '6 days ago', skills: ['Python', 'Deep Learning', 'Computer Vision', 'PyTorch', 'Research', 'NLP'], industry: 'Tech', logo: null },
  { id: 'j023', title: 'SRE / Platform Engineer', company: 'Hotstar', domain: 'hotstar.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Hybrid', salary: '₹25L–₹45L/yr', exp: '3–6 yrs', posted: '4 days ago', skills: ['SRE', 'Kubernetes', 'Go', 'Prometheus', 'AWS', 'Incident Management'], industry: 'Streaming', logo: null },
  { id: 'j024', title: 'Node.js Developer', company: 'Juspay', domain: 'juspay.in', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹15L–₹28L/yr', exp: '1–3 yrs', posted: '2 days ago', skills: ['Node.js', 'JavaScript', 'REST APIs', 'PostgreSQL', 'Redis', 'TypeScript'], industry: 'Fintech', logo: null },
  { id: 'j025', title: 'Product Designer', company: 'Notion', domain: 'notion.so', location: 'Remote', type: 'Full-time', remote: 'Remote', salary: '$120K–$160K/yr', exp: '3–6 yrs', posted: '1 week ago', skills: ['Figma', 'Product Design', 'User Research', 'Interaction Design', 'Design Systems'], industry: 'Productivity', logo: null },
  { id: 'j026', title: 'Frontend Engineer', company: 'Vercel', domain: 'vercel.com', location: 'Remote', type: 'Full-time', remote: 'Remote', salary: '$100K–$150K/yr', exp: '2–5 yrs', posted: '3 days ago', skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'Performance', 'Web APIs'], industry: 'Cloud/DevTools', logo: null },
  { id: 'j027', title: 'Android Developer', company: 'Dream11', domain: 'dream11.com', location: 'Mumbai, India', type: 'Full-time', remote: 'Hybrid', salary: '₹20L–₹35L/yr', exp: '2–5 yrs', posted: '5 days ago', skills: ['Kotlin', 'Android', 'Jetpack Compose', 'MVVM', 'Coroutines', 'Room'], industry: 'Gaming', logo: null },
  { id: 'j028', title: 'Growth Engineer', company: 'Lenskart', domain: 'lenskart.com', location: 'New Delhi, India', type: 'Full-time', remote: 'Hybrid', salary: '₹15L–₹28L/yr', exp: '1–3 yrs', posted: '1 day ago', skills: ['Python', 'SQL', 'A/B Testing', 'Analytics', 'Experimentation', 'Data'], industry: 'E-commerce', logo: null },
  { id: 'j029', title: 'Staff Engineer', company: 'Atlassian', domain: 'atlassian.com', location: 'Bengaluru, India', type: 'Full-time', remote: 'Remote', salary: '₹60L–₹1Cr/yr', exp: '8–12 yrs', posted: '1 week ago', skills: ['Architecture', 'Java', 'Distributed Systems', 'Technical Leadership', 'Mentoring'], industry: 'SaaS', logo: null },
  { id: 'j030', title: 'MLOps Engineer', company: 'Sarvam AI', domain: 'sarvam.ai', location: 'Bengaluru, India', type: 'Full-time', remote: 'Hybrid', salary: '₹25L–₹45L/yr', exp: '2–5 yrs', posted: '2 days ago', skills: ['Python', 'Kubernetes', 'MLflow', 'Model Serving', 'LLMs', 'Docker'], industry: 'AI', logo: null },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function computeMatchScore(jobSkills, candidateSkills) {
  if (!candidateSkills || !candidateSkills.length) return Math.floor(Math.random() * 30) + 40;
  const cSkills = candidateSkills.map(s => s.toLowerCase());
  let matched = 0;
  for (const s of jobSkills) {
    if (cSkills.some(c => c.includes(s.toLowerCase()) || s.toLowerCase().includes(c))) matched++;
  }
  const base = Math.round((matched / jobSkills.length) * 100);
  // Add slight variance for realism
  const variance = Math.floor(Math.random() * 8) - 4;
  return Math.max(20, Math.min(99, base + variance));
}

function callGemini(prompt, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured.');

  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: 'application/json' }
    })
  })
    .then(r => r.json())
    .then(d => {
      const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());
    });
}

// ── POST /api/auto-apply/profile ───────────────────────────────────────────────
router.post('/profile', async (req, res) => {
  const { resumeText } = req.body || {};
  const apiKey = req.headers['x-gemini-key'] || null;
  if (!resumeText || resumeText.trim().length < 50)
    return res.status(400).json({ error: 'Resume text is required.' });

  try {
    const prompt = `Extract a detailed candidate profile from this resume. Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "title": "Current or Target Job Title",
  "email": "email if found",
  "phone": "phone if found",
  "location": "City, Country",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...up to 15 skills],
  "techStack": ["tech1", "tech2", ...up to 10 technologies],
  "experience": [{"company":"","title":"","duration":"","description":""}],
  "education": [{"degree":"","institution":"","year":""}],
  "languages": ["English"],
  "preferredRoles": ["role1", "role2", "role3"],
  "seniority": "Entry / Mid / Senior / Lead",
  "yearsOfExperience": 3,
  "certifications": ["cert1"],
  "github": "",
  "linkedin": "",
  "portfolio": "",
  "industries": ["industry1", "industry2"]
}

Resume:
${resumeText.substring(0, 3000)}`;

    const profile = await callGemini(prompt, apiKey);
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Auto-apply profile error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate profile.' });
  }
});

// ── POST /api/auto-apply/jobs ──────────────────────────────────────────────────
router.post('/jobs', async (req, res) => {
  const { skills = [], roles = [], locations = [], remote, minSalary, maxSalary, industry } = req.body || {};

  let jobs = [...MOCK_JOBS];

  // Filter by remote preference
  if (remote === 'Remote') jobs = jobs.filter(j => j.remote === 'Remote');
  else if (remote === 'Onsite') jobs = jobs.filter(j => j.remote !== 'Remote');

  // Filter by role keywords
  if (roles && roles.length > 0) {
    const roleLower = roles.map(r => r.toLowerCase());
    const filtered = jobs.filter(j =>
      roleLower.some(r => j.title.toLowerCase().includes(r) || j.industry.toLowerCase().includes(r))
    );
    if (filtered.length >= 5) jobs = filtered;
  }

  // Filter by industry
  if (industry && industry !== 'All') {
    const filtered = jobs.filter(j => j.industry.toLowerCase().includes(industry.toLowerCase()));
    if (filtered.length >= 3) jobs = filtered;
  }

  // Compute match scores
  const scored = jobs.map(j => ({
    ...j,
    matchScore: computeMatchScore(j.skills, skills),
    matchedSkills: j.skills.filter(s => skills.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase()))),
    missingSkills: j.skills.filter(s => !skills.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase()))).slice(0, 3),
  })).sort((a, b) => b.matchScore - a.matchScore);

  return res.json({ success: true, data: { jobs: scored, total: scored.length } });
});

// ── POST /api/auto-apply/tailor-for-job ───────────────────────────────────────
router.post('/tailor-for-job', async (req, res) => {
  const { resumeText, job } = req.body || {};
  const apiKey = req.headers['x-gemini-key'] || null;
  if (!resumeText || !job)
    return res.status(400).json({ error: 'Resume text and job details are required.' });

  try {
    const prompt = `You are an expert resume tailoring assistant. Given the resume and job, create an ATS-optimized tailored resume.

Job: ${job.title} at ${job.company}
Required Skills: ${job.skills?.join(', ')}
Industry: ${job.industry}

Resume:
${resumeText.substring(0, 2500)}

Return ONLY valid JSON:
{
  "tailoredResume": "Full tailored resume text with improved bullet points, keywords added",
  "addedKeywords": ["keyword1", "keyword2"],
  "changedSections": ["What was improved 1", "What was improved 2", "What was improved 3"],
  "atsScore": 87,
  "matchScore": 91
}`;

    const result = await callGemini(prompt, apiKey);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Tailor-for-job error:', err);
    return res.status(500).json({ error: err.message || 'Failed to tailor resume.' });
  }
});

// ── POST /api/auto-apply/cover-letter ─────────────────────────────────────────
router.post('/cover-letter', async (req, res) => {
  const { resumeText, job, candidateProfile } = req.body || {};
  const apiKey = req.headers['x-gemini-key'] || null;
  if (!job) return res.status(400).json({ error: 'Job details are required.' });

  try {
    const prompt = `Write a professional, personalized cover letter for this job application.

Job: ${job.title} at ${job.company}
Location: ${job.location}
Required Skills: ${job.skills?.join(', ')}

Candidate: ${candidateProfile?.name || 'Candidate'}
Current Title: ${candidateProfile?.title || 'Professional'}
Key Skills: ${(candidateProfile?.skills || []).slice(0, 8).join(', ')}
Years of Experience: ${candidateProfile?.yearsOfExperience || 'N/A'}

${resumeText ? `Resume Summary:\n${resumeText.substring(0, 800)}` : ''}

Return ONLY valid JSON:
{
  "coverLetter": "Full cover letter text (3-4 paragraphs, ~300 words)",
  "subject": "Email subject line",
  "tone": "Professional"
}`;

    const result = await callGemini(prompt, apiKey);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Cover letter error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate cover letter.' });
  }
});

// ── POST /api/auto-apply/answer ───────────────────────────────────────────────
router.post('/answer', async (req, res) => {
  const { question, candidateProfile, job } = req.body || {};
  const apiKey = req.headers['x-gemini-key'] || null;
  if (!question) return res.status(400).json({ error: 'Question is required.' });

  try {
    const prompt = `Generate a professional answer to this job application question.

Question: "${question}"
Candidate: ${candidateProfile?.name || 'Candidate'} — ${candidateProfile?.title || 'Professional'} with ${candidateProfile?.yearsOfExperience || 'several'} years of experience
Key Skills: ${(candidateProfile?.skills || []).slice(0, 6).join(', ')}
Applying for: ${job?.title || 'this role'} at ${job?.company || 'this company'}

Return ONLY valid JSON:
{
  "answer": "A compelling, concise answer (2-4 sentences)",
  "wordCount": 60,
  "tone": "Professional"
}`;

    const result = await callGemini(prompt, apiKey);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate answer.' });
  }
});

// ── POST /api/auto-apply/apply ─────────────────────────────────────────────────
router.post('/apply', async (req, res) => {
  const { userId, job, tailoredResume, coverLetter, matchScore, notes } = req.body || {};
  if (!userId || !job) return res.status(400).json({ error: 'userId and job are required.' });

  const apps = readApps();
  const newApp = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: String(userId),
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      domain: job.domain,
      location: job.location,
      type: job.type,
      remote: job.remote,
      salary: job.salary,
    },
    matchScore: matchScore || job.matchScore || 0,
    status: 'Applied',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tailoredResume: tailoredResume || null,
    coverLetter: coverLetter || null,
    notes: notes || '',
  };
  apps.push(newApp);
  writeApps(apps);
  return res.json({ success: true, data: newApp });
});

// ── PATCH /api/auto-apply/applications/:appId ──────────────────────────────────
router.patch('/applications/:appId', async (req, res) => {
  const { appId } = req.params;
  const { status, notes } = req.body || {};
  const apps = readApps();
  const idx = apps.findIndex(a => a.id === appId);
  if (idx === -1) return res.status(404).json({ error: 'Application not found.' });
  if (status) apps[idx].status = status;
  if (notes !== undefined) apps[idx].notes = notes;
  apps[idx].updatedAt = new Date().toISOString();
  writeApps(apps);
  return res.json({ success: true, data: apps[idx] });
});

// ── DELETE /api/auto-apply/applications/:appId ─────────────────────────────────
router.delete('/applications/:appId', async (req, res) => {
  const { appId } = req.params;
  const apps = readApps();
  const filtered = apps.filter(a => a.id !== appId);
  writeApps(filtered);
  return res.json({ success: true });
});

// ── GET /api/auto-apply/applications/:userId ───────────────────────────────────
router.get('/applications/:userId', async (req, res) => {
  const { userId } = req.params;
  const apps = readApps().filter(a => a.userId === userId);
  return res.json({ success: true, data: apps });
});

// ── POST /api/auto-apply/real-apply ───────────────────────────────────────────
router.post('/real-apply', async (req, res) => {
  const { job, credentials, profile, portal } = req.body || {};
  if (!credentials?.email || !credentials?.password) {
    return res.status(400).json({ success: false, error: 'Portal credentials are required.' });
  }
  if (!portal || !['naukri', 'linkedin'].includes(portal)) {
    return res.status(400).json({ success: false, error: 'portal must be "naukri" or "linkedin".' });
  }
  try {
    let result;
    if (portal === 'naukri') {
      const { applyNaukri } = await import('../automation/naukri.js');
      result = await applyNaukri({ jobTitle: job.title, company: job.company, credentials, profile });
    } else {
      const { applyLinkedIn } = await import('../automation/linkedin.js');
      result = await applyLinkedIn({ jobTitle: job.title, company: job.company, credentials, profile });
    }
    res.json({ success: result.success, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
