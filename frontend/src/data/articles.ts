// Central registry for blog articles. Articles with `sections` render through
// the generic ArticlePage; entries without them use a bespoke page component.

export interface ArticleSection {
  id: string;
  heading: string;
  html: string;
}

export interface ArticleDef {
  slug: string;
  tag: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  date: string;
  isoDate: string;
  readTime: string;
  blurb: string;
  intro?: string;
  sections?: ArticleSection[];
  faqs?: { q: string; a: string }[];
  related?: string[];
}

export const ARTICLES: ArticleDef[] = [
  {
    slug: 'how-to-create-an-ats-friendly-resume',
    tag: 'Resume Guide',
    title: 'How to Create an ATS-Friendly Resume in 2026 (Step-by-Step Guide)',
    metaTitle: 'How to Create an ATS-Friendly Resume in 2026 (Guide)',
    metaDescription: 'Learn how to create an ATS-friendly resume that gets past screening software. Formatting rules, keyword tips, templates, and a free checker to test yours.',
    keywords: 'ATS Friendly Resume, ATS Resume Format, Resume Keywords, Applicant Tracking System, Resume Formatting Rules, ATS Resume Checker',
    date: 'July 8, 2026',
    isoDate: '2026-07-08',
    readTime: '12 min read',
    blurb: 'Why 88% of qualified candidates get filtered out before a human sees their resume — and the exact formatting rules, keywords, and tests to get past the software.',
  },
  {
    slug: 'resume-keywords-guide',
    tag: 'Resume Guide',
    title: 'Resume Keywords: The Complete Guide to Getting Shortlisted in 2026',
    metaTitle: 'Resume Keywords Guide: Get Shortlisted in 2026',
    metaDescription: 'Learn how to find, choose, and place resume keywords that ATS software and recruiters actually search for — with examples by industry and role.',
    keywords: 'Resume Keywords, ATS Keywords, Resume Skills Keywords, Keyword Optimization Resume, Job Description Keywords',
    date: 'July 8, 2026',
    isoDate: '2026-07-08',
    readTime: '9 min read',
    blurb: 'How to find the exact words recruiters and ATS software search for — and where to place them so your resume ranks higher for every job you apply to.',
    related: ['how-to-create-an-ats-friendly-resume', 'ats-resume-checklist', 'resume-mistakes-to-avoid'],
    intro: `<p>Two candidates apply for the same data analyst role. Both know SQL, both have three years of experience, both built dashboards. One gets shortlisted; the other never hears back.</p>
<p>The difference is often a handful of words. Applicant Tracking Systems rank resumes by how closely they match the job description — and recruiters run keyword searches inside those systems too. If the posting says "data visualization" and your resume says "made charts," the software scores you lower, and the recruiter's search never surfaces you at all.</p>
<p>This guide shows you how to find the right keywords for any job, where to place them, and the mistakes that make keyword optimization backfire.</p>`,
    sections: [
      {
        id: 'what-are-keywords',
        heading: 'What Resume Keywords Actually Are',
        html: `<p>Resume keywords are the specific terms an employer uses to describe the skills, tools, qualifications, and experience they want. They come in four types:</p>
<ul>
<li><strong>Hard skills and tools</strong> — SQL, Figma, AutoCAD, Google Ads, Python, Salesforce</li>
<li><strong>Job titles and functions</strong> — Product Manager, Financial Analyst, DevOps Engineer</li>
<li><strong>Qualifications</strong> — B.Tech, CPA, PMP, AWS Certified, MBA</li>
<li><strong>Methods and domain terms</strong> — Agile, A/B testing, cold outreach, GAAP, supply chain</li>
</ul>
<p>Soft skills ("team player," "hard-working") are rarely useful as keywords. Recruiters don't search for them, and every resume claims them. Show soft skills through results instead: "led a 6-person team" beats "leadership skills."</p>`,
      },
      {
        id: 'find-keywords',
        heading: 'How to Find the Right Keywords for Any Job',
        html: `<h3>1. Mine the job description</h3>
<p>Paste the posting into a document and highlight every skill, tool, title, and qualification. Pay special attention to:</p>
<ul>
<li>Anything mentioned <strong>two or more times</strong></li>
<li>Everything in the <strong>"Requirements"</strong> or <strong>"Must have"</strong> section</li>
<li>The <strong>exact job title</strong> — it's usually the heaviest-weighted keyword of all</li>
</ul>
<h3>2. Compare 3–5 similar postings</h3>
<p>Open a few postings for the same role at different companies. The keywords that appear in all of them are the core vocabulary of that role — those belong in your master resume permanently.</p>
<h3>3. Check LinkedIn profiles in that role</h3>
<p>Look at the Skills sections of people who already hold the job you want. Recurring terms there tend to match what recruiters search.</p>
<div class="art-example">
<p><strong>Example — keywords extracted from a real-style posting for "Digital Marketing Executive":</strong></p>
<p>SEO, Google Analytics, Google Ads, content marketing, email campaigns, social media marketing, keyword research, CTR, conversion rate optimization, HubSpot</p>
</div>`,
      },
      {
        id: 'placement',
        heading: 'Where to Place Keywords (Placement Matters)',
        html: `<p>An ATS gives different weight to different parts of your resume. Use all three zones:</p>
<div class="art-table-wrap"><table>
<thead><tr><th>Location</th><th>What to put there</th><th>Why it matters</th></tr></thead>
<tbody>
<tr><td>Professional Summary</td><td>Target job title + top 3 skills</td><td>Parsed first; recruiters read it in the preview</td></tr>
<tr><td>Skills section</td><td>All relevant hard skills and tools</td><td>Easiest section for exact-match searches</td></tr>
<tr><td>Experience bullets</td><td>Keywords in context with results</td><td>Proves you actually used the skill</td></tr>
</tbody>
</table></div>
<p>A keyword that appears only in your skills list is weak — the system (and the recruiter) can't tell whether you used it for five years or added it yesterday. Back every important keyword with at least one experience bullet.</p>
<div class="art-example">
<p>❌ <em>Skills: Python</em> (and Python appears nowhere else)</p>
<p>✅ <em>Skills: Python</em> + bullet: <em>"Automated weekly reporting with Python scripts, saving the team 6 hours per week."</em></p>
</div>`,
      },
      {
        id: 'exact-phrasing',
        heading: 'Use Exact Phrasing — Including Both Versions',
        html: `<p>Many ATS configurations match literally. If the posting says "Search Engine Optimization" and your resume only says "SEO," you may not get credit. The fix is simple: <strong>use both forms once</strong> — "Search Engine Optimization (SEO)."</p>
<p>Common pairs worth writing out:</p>
<ul>
<li>Customer Relationship Management (CRM)</li>
<li>Applicant Tracking System (ATS)</li>
<li>Profit &amp; Loss (P&amp;L)</li>
<li>Bachelor of Technology (B.Tech)</li>
<li>User Experience (UX) / User Interface (UI)</li>
</ul>
<p>Also match tense and form where natural: if the posting emphasizes "project management," prefer that phrase over "managed projects" at least once.</p>`,
      },
      {
        id: 'mistakes',
        heading: '4 Keyword Mistakes That Backfire',
        html: `<ul>
<li><strong>Keyword stuffing.</strong> Cramming terms unnaturally ("Excel Excel dashboards Excel reporting") reads as spam to recruiters and increasingly gets flagged by the software itself.</li>
<li><strong>White-text keywords.</strong> Hiding keywords in invisible text is the oldest trick in the book — and parsing converts everything to plain text, so recruiters see your hidden block instantly. It's an automatic credibility killer.</li>
<li><strong>Listing skills you don't have.</strong> You might pass the scan, but the first interview question exposes it. Only optimize for what's true.</li>
<li><strong>One generic resume for every job.</strong> Keyword matching is per-posting. A master resume plus 10 minutes of tailoring per application beats a "perfect" static resume every time. <a href="/tailor">CV Mind's Resume Tailorer</a> does this automatically — paste the job description and it matches the keywords for you.</li>
</ul>`,
      },
      {
        id: 'examples',
        heading: 'Keyword Examples by Role',
        html: `<div class="art-table-wrap"><table>
<thead><tr><th>Role</th><th>Keywords recruiters commonly search</th></tr></thead>
<tbody>
<tr><td>Software Engineer</td><td>Java, Python, React, REST APIs, microservices, Git, CI/CD, AWS, system design, unit testing</td></tr>
<tr><td>Data Analyst</td><td>SQL, Excel, Tableau, Power BI, Python, data visualization, dashboards, A/B testing, statistics</td></tr>
<tr><td>Digital Marketer</td><td>SEO, SEM, Google Analytics, Google Ads, content marketing, email marketing, CRO, social media</td></tr>
<tr><td>HR / Recruiter</td><td>talent acquisition, sourcing, ATS, onboarding, HRIS, employee engagement, stakeholder management</td></tr>
<tr><td>Financial Analyst</td><td>financial modeling, forecasting, variance analysis, Excel, P&amp;L, budgeting, SAP, valuation</td></tr>
<tr><td>Product Manager</td><td>product roadmap, user research, Agile, Scrum, stakeholder management, KPIs, go-to-market, SQL</td></tr>
</tbody>
</table></div>
<p>Treat these as starting points — the posting in front of you always wins.</p>`,
      },
      {
        id: 'test',
        heading: 'How to Check Your Keyword Match Before Applying',
        html: `<p>Don't eyeball it. Run your resume and the job description through <a href="/">CV Mind's free ATS Resume Checker</a> — it shows your match score, lists the keywords you're missing, and flags where to add them. Five minutes per application, and you apply knowing your rank instead of guessing.</p>`,
      },
    ],
    faqs: [
      { q: 'How many keywords should a resume have?', a: 'Enough to cover the essential requirements of the posting — typically 10–20 relevant terms woven naturally through your summary, skills section, and experience bullets. Coverage matters more than repetition.' },
      { q: 'Should I copy the job description into my resume?', a: 'No. Copying sentences wholesale is obvious to recruiters and can flag as spam. Extract the key terms and use them in your own sentences, attached to your real accomplishments.' },
      { q: 'Do keywords need to match exactly?', a: 'Often, yes — many systems match literally. Use the exact phrasing from the posting, and include both the full form and abbreviation of important terms, like "Search Engine Optimization (SEO)."' },
      { q: 'Are soft skills good resume keywords?', a: 'Rarely. Recruiters seldom search for "hard-working" or "team player." Demonstrate soft skills through results and metrics in your bullets instead of listing them as keywords.' },
      { q: 'Should keywords go in my cover letter too?', a: 'Yes, naturally. Some systems index cover letters for search, and it reinforces your fit for recruiters who read them. Never stuff — a cover letter is judged on writing quality.' },
      { q: 'How do I find keywords if the job description is vague?', a: 'Look up 3–5 similar postings for the same title at other companies and use the terms they share. LinkedIn profiles of people in that role are another reliable source.' },
    ],
  },
  {
    slug: 'ats-resume-checklist',
    tag: 'Checklist',
    title: 'The 21-Point ATS Resume Checklist (Use Before Every Application)',
    metaTitle: '21-Point ATS Resume Checklist for 2026 (Free)',
    metaDescription: 'A free 21-point checklist to make your resume ATS-proof before you apply — formatting, keywords, content, and file checks with a scoring tool to verify.',
    keywords: 'ATS Resume Checklist, Resume Checklist Before Applying, ATS Check, Resume Formatting Checklist, Job Application Checklist',
    date: 'July 8, 2026',
    isoDate: '2026-07-08',
    readTime: '7 min read',
    blurb: 'The exact 21 checks to run on your resume before you hit Apply — formatting, content, keywords, and file format, each one takes under a minute.',
    related: ['how-to-create-an-ats-friendly-resume', 'resume-keywords-guide', 'pdf-vs-docx-resume'],
    intro: `<p>Most resume rejections aren't about qualifications — they're about avoidable mechanical errors: a table the software can't parse, a missing keyword, contact details hidden in a header.</p>
<p>Pilots don't fly without a pre-flight checklist, and you shouldn't apply without one either. Run these 21 checks before every application. None takes more than a minute, and together they cover everything an Applicant Tracking System and a skim-reading recruiter will judge you on.</p>`,
    sections: [
      {
        id: 'formatting',
        heading: 'Formatting Checks (1–7)',
        html: `<ol>
<li><strong>Single-column layout.</strong> No sidebars, no two-column designs — the #1 cause of parsing failures.</li>
<li><strong>No tables, text boxes, or graphics.</strong> Including skill bars, charts, photos, and icons.</li>
<li><strong>Standard font.</strong> Calibri, Arial, Helvetica, Georgia, or Times New Roman, 10–12pt body.</li>
<li><strong>Standard section headings.</strong> "Work Experience," "Education," "Skills" — nothing creative.</li>
<li><strong>Contact info in the document body.</strong> Never only in the header or footer; some parsers skip them entirely.</li>
<li><strong>Consistent dates with month and year.</strong> "Jan 2023 – Present" everywhere, same format.</li>
<li><strong>Standard bullets.</strong> Round or square points only — arrows, stars, and emoji can parse as junk characters.</li>
</ol>`,
      },
      {
        id: 'content',
        heading: 'Content Checks (8–14)',
        html: `<ol start="8">
<li><strong>Professional summary states your target title.</strong> The job title is usually the heaviest-weighted keyword.</li>
<li><strong>Every experience bullet starts with an action verb.</strong> Built, launched, reduced, negotiated — not "responsible for."</li>
<li><strong>At least half your bullets contain a number.</strong> Percentages, money, time saved, team size, users.</li>
<li><strong>No first-person pronouns.</strong> Drop "I," "my," and "we" — resume convention, and it saves space.</li>
<li><strong>Zero typos.</strong> A single spelling error can end your candidacy; recruiters treat it as a proxy for carelessness. <a href="/proofreading">CV Mind's AI Proofreading</a> catches grammar, tone, and weak verbs in one pass.</li>
<li><strong>Right length.</strong> One page for under ~8 years of experience, two pages maximum otherwise.</li>
<li><strong>No unexplained gaps or overlaps.</strong> Check that your dates tell a coherent story.</li>
</ol>`,
      },
      {
        id: 'keywords',
        heading: 'Keyword Checks (15–18)',
        html: `<ol start="15">
<li><strong>Job title from the posting appears in your resume.</strong> In the summary, ideally.</li>
<li><strong>Top 5 required skills from the posting appear</strong> — in the exact phrasing the employer used.</li>
<li><strong>Abbreviations written both ways.</strong> "Customer Relationship Management (CRM)," "B.Tech (Bachelor of Technology)."</li>
<li><strong>Every key skill is backed by an experience bullet.</strong> A skill that only lives in your skills list is a weak claim.</li>
</ol>
<p>Full keyword strategy in our <a href="/resume-keywords-guide">Resume Keywords Guide</a>.</p>`,
      },
      {
        id: 'final',
        heading: 'Final Checks (19–21)',
        html: `<ol start="19">
<li><strong>Copy-paste test.</strong> Paste your resume into Notepad. If sections vanish or reorder, an ATS will have the same problem.</li>
<li><strong>Correct file format.</strong> DOCX or text-based PDF (if you can select the text, it's text-based). Details in <a href="/pdf-vs-docx-resume">PDF vs DOCX</a>.</li>
<li><strong>Run an ATS scan.</strong> <a href="/">CV Mind's free ATS Resume Checker</a> scores your resume and lists exactly what's missing for the job you're targeting — the fastest way to verify checks 1–20 in one shot.</li>
</ol>`,
      },
      {
        id: 'printable',
        heading: 'Quick Reference Table',
        html: `<div class="art-table-wrap"><table>
<thead><tr><th>Category</th><th>Checks</th><th>Time needed</th></tr></thead>
<tbody>
<tr><td>Formatting</td><td>1–7</td><td>~5 minutes</td></tr>
<tr><td>Content</td><td>8–14</td><td>~10 minutes</td></tr>
<tr><td>Keywords</td><td>15–18</td><td>~10 minutes per job</td></tr>
<tr><td>Final verification</td><td>19–21</td><td>~5 minutes</td></tr>
</tbody>
</table></div>
<p>First pass takes about 30 minutes. After that, only the keyword checks (15–18) change per application — 10 minutes per job for a measurably higher shortlist rate.</p>`,
      },
    ],
    faqs: [
      { q: 'How often should I run this checklist?', a: 'Checks 1–14 once, whenever you update your master resume. Checks 15–21 before every single application, because keyword matching is specific to each job description.' },
      { q: 'What ATS score is good enough to apply?', a: 'On CV Mind\'s checker, 80+ is strong. Between 60–80, add the missing keywords it lists. Below 60, your resume likely has structural issues — fix formatting first, then keywords.' },
      { q: 'Is one page really necessary?', a: 'For freshers and early-career candidates, yes — recruiters expect it. Past roughly 8 years of relevant experience, two pages is normal. Never pad to reach two pages.' },
      { q: 'Do I need a different resume for every job?', a: 'A different version, not a different resume. Keep one master document and adjust the summary and skills per posting — that\'s checks 15–18, about 10 minutes each time.' },
      { q: 'What\'s the single most important check?', a: 'The copy-paste test (#19). It takes 30 seconds and catches the catastrophic failures — if your resume survives Notepad intact, most parsers will read it correctly.' },
    ],
  },
  {
    slug: 'pdf-vs-docx-resume',
    tag: 'Resume Guide',
    title: 'PDF vs DOCX Resume: Which Format Should You Use in 2026?',
    metaTitle: 'PDF vs DOCX Resume: Which Format to Use (2026)',
    metaDescription: 'PDF or Word for your resume? When each format wins, how ATS software handles both, the image-PDF trap, and a simple rule that works for every application.',
    keywords: 'PDF vs DOCX Resume, Resume File Format, Word or PDF Resume, ATS PDF Resume, Resume Format for ATS',
    date: 'July 8, 2026',
    isoDate: '2026-07-08',
    readTime: '6 min read',
    blurb: 'Word ya PDF? When each format wins, how ATS software actually handles both, and the image-PDF trap that silently kills applications.',
    related: ['how-to-create-an-ats-friendly-resume', 'ats-resume-checklist', 'resume-mistakes-to-avoid'],
    intro: `<p>You've polished every bullet point, and now the upload form asks a deceptively simple question: PDF or Word?</p>
<p>Pick wrong and your carefully formatted resume can arrive as scrambled text — or not be readable at all. The good news: the decision comes down to one rule and a couple of edge cases, all covered below.</p>`,
    sections: [
      {
        id: 'short-answer',
        heading: 'The Short Answer',
        html: `<ol>
<li><strong>If the job posting specifies a format, use that.</strong> This overrides everything else.</li>
<li><strong>If not, a text-based PDF is the best default in 2026.</strong> It preserves your formatting exactly and parses correctly in virtually all modern systems.</li>
<li><strong>Keep a DOCX version ready</strong> for older portals, government applications, and recruiters who ask for an editable copy.</li>
</ol>`,
      },
      {
        id: 'how-ats-reads',
        heading: 'How ATS Software Handles Each Format',
        html: `<p>An Applicant Tracking System converts your file to plain text before matching keywords. The formats differ in how reliably that conversion works:</p>
<div class="art-table-wrap"><table>
<thead><tr><th>Factor</th><th>Text-based PDF</th><th>DOCX</th></tr></thead>
<tbody>
<tr><td>Modern ATS parsing (Greenhouse, Lever, Workday)</td><td>Excellent</td><td>Excellent</td></tr>
<tr><td>Older systems (some Taleo configs, legacy portals)</td><td>Occasionally shaky</td><td>Most reliable</td></tr>
<tr><td>Formatting preserved for the human reader</td><td>Pixel-perfect everywhere</td><td>Can shift between Word versions</td></tr>
<tr><td>Risk of accidental edits</td><td>None</td><td>Possible</td></tr>
<tr><td>Risk of being unreadable</td><td>Only if image-based (see below)</td><td>Very low</td></tr>
</tbody>
</table></div>`,
      },
      {
        id: 'image-trap',
        heading: 'The Image-PDF Trap (This Kills Applications Silently)',
        html: `<p>Not all PDFs are equal. A PDF exported from Word or Google Docs contains real text. A PDF exported from Canva, Photoshop, or a phone scanner is often just a <strong>picture of text</strong> — and an ATS reads it as an empty page.</p>
<div class="art-example">
<p><strong>The 10-second test:</strong> open your PDF and try to select a sentence with your cursor.</p>
<p>✅ Text highlights line by line → text-based, safe to upload.</p>
<p>❌ The whole page selects as one block, or nothing selects → it's an image. The ATS sees nothing.</p>
</div>
<p>If your resume fails the test, rebuild it in a text editor or use <a href="/resume-builder">CV Mind's Resume Builder</a> — every export is text-based and ATS-tested by design.</p>`,
      },
      {
        id: 'when-docx',
        heading: 'When DOCX Is the Better Choice',
        html: `<ul>
<li><strong>The posting asks for Word.</strong> Common with staffing agencies, who edit resumes before forwarding to clients.</li>
<li><strong>Older application portals.</strong> If the site looks dated or is a legacy government system, DOCX parses most reliably.</li>
<li><strong>Recruiter asks for an editable copy.</strong> Send DOCX; they often need to remove contact details or add a cover sheet.</li>
</ul>
<p>One caution with DOCX: fonts and spacing can shift on a machine with different Word versions. Stick to standard fonts (Calibri, Arial, Georgia) and your layout survives the trip.</p>`,
      },
      {
        id: 'never-use',
        heading: 'Formats to Never Use',
        html: `<ul>
<li><strong>JPG / PNG images</strong> — unreadable to every ATS.</li>
<li><strong>Apple Pages files (.pages)</strong> — most Windows-based HR teams can't open them.</li>
<li><strong>Google Docs share links</strong> — links aren't parsed, may require permissions, and can be edited after you apply.</li>
<li><strong>Old .doc format</strong> — works, but signals outdated software; use .docx.</li>
<li><strong>Canva/design-tool exports</strong> — usually flattened images (see the trap above), and multi-column layouts parse badly even when text-based.</li>
</ul>`,
      },
      {
        id: 'workflow',
        heading: 'The Practical Workflow',
        html: `<ol>
<li>Maintain your master resume in a text-based editor.</li>
<li>Export <strong>both</strong> a PDF and a DOCX every time you update it.</li>
<li>Name them professionally: <em>Priya_Sharma_Resume.pdf</em> — not <em>resume_final_v7_REAL.pdf</em>. Your file name is visible to the recruiter and often becomes the display title in the ATS.</li>
<li>Upload PDF by default; switch to DOCX when asked or when the portal looks legacy.</li>
<li>Before big applications, verify with a <a href="/">free ATS scan</a> that the file parses cleanly.</li>
</ol>`,
      },
    ],
    faqs: [
      { q: 'Is PDF or Word better for ATS in 2026?', a: 'Both parse well in modern systems. Text-based PDF is the best default because formatting never shifts; keep a DOCX ready for older portals and agency recruiters who need an editable copy.' },
      { q: 'How do I know if my PDF is text-based?', a: 'Try selecting a sentence with your cursor. If text highlights line by line, it\'s text-based. If nothing selects or the page selects as one block, it\'s an image and ATS software can\'t read it.' },
      { q: 'Does file size matter?', a: 'Keep it under 2 MB. Most portals cap uploads, and a text-based resume should naturally be small — a 10 MB resume is a sign it contains images.' },
      { q: 'What should I name my resume file?', a: 'FirstName_LastName_Resume.pdf. Recruiters see the file name, and in many systems it becomes your application\'s display title. Avoid version numbers and words like "final" or "new."' },
      { q: 'Can I send a Google Docs link instead of a file?', a: 'No — upload an actual file. Links aren\'t parsed by ATS software, may have permission issues, and editable links look unprofessional in a formal application.' },
      { q: 'Do fonts matter in a DOCX resume?', a: 'Yes. Non-standard fonts get substituted on machines that lack them, breaking your layout. Stick to Calibri, Arial, Georgia, or Times New Roman and the document renders the same everywhere.' },
    ],
  },
  {
    slug: 'resume-mistakes-to-avoid',
    tag: 'Resume Guide',
    title: '15 Resume Mistakes That Cost You Interviews (and How to Fix Each One)',
    metaTitle: '15 Resume Mistakes to Avoid in 2026 (With Fixes)',
    metaDescription: 'The 15 most common resume mistakes recruiters and ATS software punish — from weak bullets to formatting traps — with a concrete fix for each one.',
    keywords: 'Resume Mistakes, Resume Mistakes to Avoid, Common Resume Errors, Resume Tips, Why Resume Rejected',
    date: 'July 8, 2026',
    isoDate: '2026-07-08',
    readTime: '10 min read',
    blurb: 'Recruiters spend 7 seconds on the first scan. These 15 mistakes are what make them stop reading — and each one has a fix you can apply today.',
    related: ['how-to-create-an-ats-friendly-resume', 'resume-keywords-guide', 'ats-resume-checklist'],
    intro: `<p>Eye-tracking research by Ladders found that recruiters spend an average of 7.4 seconds on their first pass over a resume. In those seconds, they're not reading — they're scanning for reasons to keep going or stop.</p>
<p>Most rejections trace back to a short list of repeat offenders. Here are the 15 mistakes we see most often in resumes scanned by CV Mind, grouped by type, each with a fix you can apply in minutes.</p>`,
    sections: [
      {
        id: 'formatting-mistakes',
        heading: 'Formatting Mistakes (1–5)',
        html: `<h3>1. Fancy templates that ATS software can't read</h3>
<p>Two-column layouts, graphics, and skill bars scramble automated parsing — your experience can land in the wrong field or vanish. <strong>Fix:</strong> single-column layout, standard headings, no visuals. Full rules in our <a href="/how-to-create-an-ats-friendly-resume">ATS-friendly resume guide</a>.</p>
<h3>2. Contact details in the header</h3>
<p>Some parsers skip headers and footers entirely — and with them, your phone number. <strong>Fix:</strong> put name, phone, email, and LinkedIn in the top of the document body.</p>
<h3>3. Wrong length</h3>
<p>Three pages for two years of experience reads as padding; a cramped half-page reads as inexperience. <strong>Fix:</strong> one page under ~8 years of experience, two pages maximum after.</p>
<h3>4. Inconsistent formatting</h3>
<p>Mixed fonts, wandering date formats, uneven bullets — recruiters read it as carelessness. <strong>Fix:</strong> one font, one date format ("Jan 2023 – Present"), one bullet style, everywhere.</p>
<h3>5. Unprofessional file name</h3>
<p><em>resume_final_v3_ACTUAL.pdf</em> is visible to the recruiter and often becomes your application's title. <strong>Fix:</strong> <em>FirstName_LastName_Resume.pdf</em>.</p>`,
      },
      {
        id: 'content-mistakes',
        heading: 'Content Mistakes (6–11)',
        html: `<h3>6. Duties instead of achievements</h3>
<p>"Responsible for social media" describes the job, not you. <strong>Fix:</strong> lead with the result: "Grew Instagram engagement 42% in 6 months through A/B-tested content calendars."</p>
<h3>7. No numbers</h3>
<p>Unquantified claims are unverifiable claims. <strong>Fix:</strong> attach a metric to at least half your bullets — %, revenue, time saved, team size, users served. Estimate honestly when exact figures aren't available.</p>
<h3>8. Weak openers</h3>
<p>"Worked on," "helped with," "was part of" bury your contribution. <strong>Fix:</strong> start every bullet with a strong verb: built, launched, led, reduced, negotiated, automated.</p>
<h3>9. Typos and grammar errors</h3>
<p>The most preventable rejection there is — many recruiters stop at the first typo. <strong>Fix:</strong> run <a href="/proofreading">AI proofreading</a>, then read it aloud once. Your ears catch what your eyes skip.</p>
<h3>10. An objective statement from 2005</h3>
<p>"Seeking a challenging position in a growth-oriented company…" says nothing. <strong>Fix:</strong> replace it with a 3-line professional summary: target title, years of experience, top skills, one headline achievement.</p>
<h3>11. Irrelevant filler</h3>
<p>Hobbies with no job relevance, every certificate you've ever earned, "references available upon request." <strong>Fix:</strong> every line must earn its place for <em>this</em> job. Cut the rest.</p>`,
      },
      {
        id: 'strategy-mistakes',
        heading: 'Strategy Mistakes (12–15)',
        html: `<h3>12. One resume for every application</h3>
<p>ATS matching is per-job — a generic resume scores mediocre everywhere. <strong>Fix:</strong> keep a master resume, then spend 10 minutes per application matching the summary and skills to the posting. <a href="/tailor">CV Mind's Tailorer</a> automates exactly this.</p>
<h3>13. Ignoring keywords</h3>
<p>If the posting says "project management" and you wrote "led teams," the software scores you lower and recruiter searches miss you. <strong>Fix:</strong> mirror the posting's exact phrasing for skills that are true for you — full method in the <a href="/resume-keywords-guide">keywords guide</a>.</p>
<h3>14. Unexplained gaps</h3>
<p>A silent 18-month hole invites the worst assumption. <strong>Fix:</strong> one honest line covers it — career break, upskilling, caregiving, freelancing. Add what you learned or built during it if you can.</p>
<h3>15. Never testing before applying</h3>
<p>Most candidates apply blind and never learn why they weren't shortlisted. <strong>Fix:</strong> scan your resume with a <a href="/">free ATS checker</a> before applying — see your score, missing keywords, and formatting risks while there's still time to fix them.</p>`,
      },
      {
        id: 'priority',
        heading: 'Which Mistakes to Fix First',
        html: `<div class="art-table-wrap"><table>
<thead><tr><th>Priority</th><th>Mistakes</th><th>Why</th></tr></thead>
<tbody>
<tr><td>🔴 Fix today</td><td>#1, #2, #9, #15</td><td>These get you rejected before content is even read</td></tr>
<tr><td>🟠 Fix this week</td><td>#6, #7, #8, #13</td><td>These decide whether the recruiter keeps reading</td></tr>
<tr><td>🟡 Fix per application</td><td>#12, #11</td><td>Tailoring — repeat for every job you apply to</td></tr>
</tbody>
</table></div>`,
      },
    ],
    faqs: [
      { q: 'What is the most common resume mistake?', a: 'Listing duties instead of achievements. "Responsible for X" tells recruiters what the job was supposed to be — results with numbers tell them how well you actually did it.' },
      { q: 'Can one typo really get my resume rejected?', a: 'Yes. Surveys of hiring managers consistently show a majority will reject over typos, treating them as a proxy for attention to detail — especially unfair, and especially common, so proofread twice.' },
      { q: 'Should I explain a career gap on my resume?', a: 'Yes, briefly. One line — "Career break for family care / upskilling in X" — beats a silent gap, which invites worse assumptions. Detail belongs in the interview, not the resume.' },
      { q: 'Is it a mistake to use the same resume for every job?', a: 'For anything competitive, yes. ATS ranking is per-posting, so a generic resume scores mediocre everywhere. Ten minutes of keyword tailoring per application measurably improves shortlist rates.' },
      { q: 'How do I know which mistakes my resume has?', a: 'Scan it with CV Mind\'s free ATS Resume Checker — it flags formatting risks, weak bullets, missing keywords, and scores the result, so you fix real problems instead of guessing.' },
    ],
  },
];

export const getArticle = (slug: string) => ARTICLES.find(a => a.slug === slug);
