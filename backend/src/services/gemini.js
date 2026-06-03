import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// JSON Schema for structured resume evaluation output
const resumeSchema = {
  type: 'object',
  properties: {
    score: { 
      type: 'integer', 
      description: 'Overall rating of the resume from 1 to 10.' 
    },
    summary: { 
      type: 'string', 
      description: 'A concise professional summary of the candidate and their background.' 
    },
    atsKeywords: {
      type: 'object',
      properties: {
        score: { 
          type: 'integer', 
          description: 'ATS optimization and keyword compatibility score from 1 to 10.' 
        },
        matched: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'List of relevant industry keywords/skills found in the resume.' 
        },
        missing: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'Critical industry keywords, technologies, or skills that are missing and should be added.' 
        },
        feedback: { 
          type: 'string', 
          description: 'Actionable feedback regarding keyword density and ATS formatting rules.' 
        }
      },
      required: ['score', 'matched', 'missing', 'feedback']
    },
    contentAndImpact: {
      type: 'object',
      properties: {
        score: { 
          type: 'integer', 
          description: 'Score reflecting the action-oriented phrasing, impact measurement, and results-driven writing from 1 to 10.' 
        },
        feedback: { 
          type: 'string', 
          description: 'Feedback on word choices, action verbs, and how achievements are quantified.' 
        },
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              original: { type: 'string', description: 'A weak, passive, or responsibility-focused bullet point from the resume.' },
              improved: { type: 'string', description: 'A revised, strong, action-oriented, and quantified version of that bullet point.' }
            },
            required: ['original', 'improved']
          },
          description: 'Up to 3 specific before-and-after rewrite examples to elevate experience bullet points.'
        }
      },
      required: ['score', 'feedback', 'suggestions']
    },
    formattingAndStyle: {
      type: 'object',
      properties: {
        score: { 
          type: 'integer', 
          description: 'Score reflecting document flow, consistency, font readability, and professional style from 1 to 10.' 
        },
        feedback: { 
          type: 'string', 
          description: 'Feedback on length (e.g., page budget), visual formatting consistency, and page structure.' 
        }
      },
      required: ['score', 'feedback']
    },
    strengths: { 
      type: 'array', 
      items: { type: 'string' }, 
      description: 'Top 3 structural or content strengths of this resume.' 
    },
    weaknesses: { 
      type: 'array', 
      items: { type: 'string' }, 
      description: 'Top 3 areas that need the most immediate improvement.' 
    },
    recommendations: { 
      type: 'array', 
      items: { type: 'string' }, 
      description: '3 to 5 clear, prioritized, actionable steps for the candidate to take next.' 
    }
  },
  required: [
    'score',
    'summary',
    'atsKeywords',
    'contentAndImpact',
    'formattingAndStyle',
    'strengths',
    'weaknesses',
    'recommendations'
  ]
};

/**
 * Uses Gemini API to analyze a resume's text.
 * @param {string} resumeText - The parsed raw text of the resume.
 * @param {string} [customApiKey] - An optional, user-supplied API key.
 * @returns {Promise<object>} - Clean, parsed structured JSON feedback.
 */
export async function analyzeResumeWithGemini(resumeText, customApiKey = null) {
  // Use custom key if available, otherwise fall back to system variable
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please supply an API key in your request header or ask the administrator to configure the server environment variable.'
    );
  }

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an elite corporate Recruiter, Talent Acquisition Director, and Applicant Tracking System (ATS) optimization specialist. 
          Your task is to conduct an extremely thorough, candid, and high-value assessment of the candidate's resume.
          Provide realistic scores out of 10. Avoid giving high scores (like 9 or 10) unless the resume is truly outstanding. 
          Deliver precise, constructive feedback, highlight concrete gaps, and write practical "Before & After" rewrite recommendations. 
          You MUST strictly respond with a JSON object that conforms to this JSON schema:
          ${JSON.stringify(resumeSchema, null, 2)}
          Make sure you return valid, parsable JSON. Do not wrap it in any HTML or markdown backticks, only return raw JSON matching the schema structure.`
        },
        {
          role: 'user',
          content: `Analyze this resume and provide feedback. Ensure you parse all relevant sections, measure its ATS compatibility, look for weak phrases, and evaluate overall professional formatting.
          
          Resume Text:
          """
          ${resumeText}
          """`
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.2,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      const responseText = result.choices[0].message.content.trim();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('OpenRouter Analysis Error:', error);
      throw new Error('AI analysis failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash as the primary, high-speed, cost-effective model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an elite corporate Recruiter, Talent Acquisition Director, and Applicant Tracking System (ATS) optimization specialist. 
      Your task is to conduct an extremely thorough, candid, and high-value assessment of the candidate's resume.
      Provide realistic scores out of 10. Avoid giving high scores (like 9 or 10) unless the resume is truly outstanding. 
      Deliver precise, constructive feedback, highlight concrete gaps, and write practical "Before & After" rewrite recommendations. 
      You MUST strictly return your response in the specified JSON structure. Do not wrap it in any HTML or markdown, only raw JSON matching the schema.`,
    });

    const prompt = `Analyze this resume and provide feedback. Ensure you parse all relevant sections, measure its ATS compatibility, look for weak phrases, and evaluate overall professional formatting.
    
    Resume Text:
    """
    ${resumeText}
    """`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
        temperature: 0.2, // Low temperature for more analytical, consistent evaluations
      },
    });

    const responseText = result.response.text();
    
    // Parse the JSON output
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key. Please verify your API key and try again.');
    }
    throw new Error('AI analysis failed. ' + error.message);
  }
}

export async function chatWithCVMind(message, history = [], customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  const cleanMessage = String(message || '').trim();

  if (!cleanMessage) {
    throw new Error('Message is required.');
  }

  if (!apiKey) {
    const lower = cleanMessage.toLowerCase();
    if (lower.includes('upload') || lower.includes('analyse') || lower.includes('analyze') || lower.includes('resume')) {
      return 'To analyze your resume, click the "Upload Your Resume" button, select a PDF, DOCX, or TXT file, then click "Analyze Resume". Your report will include an ATS score, missing keywords, formatting feedback, and bullet point rewrites.';
    }
    if (lower.includes('ats') || lower.includes('keyword')) {
      return 'Your ATS score is based on keyword relevance, section structure, formatting readability, and recruiter-friendly language. To improve it, naturally include important skills and technologies from your target job description.';
    }
    if (lower.includes('privacy') || lower.includes('safe') || lower.includes('data')) {
      return 'CVMind AI parses your resume entirely in memory. Your file is never permanently stored on disk. Only anonymized scan statistics are saved for admin analytics.';
    }
    return 'I am the CVMind AI assistant. You can ask me about the resume upload process, ATS scoring, missing keywords, formatting, bullet rewrites, dashboard reports, or data privacy.';
  }

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are CVMind AI's professional website assistant. Always respond in clear, concise English.
          Help users with: uploading and analyzing resumes, understanding ATS scores, keyword gaps, formatting tips, recruiter suggestions, dashboard reports, data privacy, and navigation.
          Keep answers brief, practical, and professional. Do not claim you analyzed a resume unless the user actually uploaded one through the analyzer.`
        }
      ];

      if (Array.isArray(history)) {
        history.slice(-8).forEach((item) => {
          messages.push({
            role: item.role === 'user' ? 'user' : 'assistant',
            content: item.content
          });
        });
      }

      messages.push({
        role: 'user',
        content: cleanMessage
      });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.45,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      return result.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter Chat Error:', error);
      throw new Error('Chat assistant failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are CVMind AI's professional website assistant. Always respond in clear, concise English.
      Help users with: uploading and analyzing resumes, understanding ATS scores, keyword gaps, formatting tips, recruiter suggestions, dashboard reports, data privacy, and navigation.
      Keep answers brief, practical, and professional. Do not claim you analyzed a resume unless the user actually uploaded one through the analyzer.`
    });

    const recentHistory = Array.isArray(history)
      ? history.slice(-8).map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`).join('\n')
      : '';

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Recent chat:\n${recentHistory}\n\nUser question:\n${cleanMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 350
      }
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw new Error('Chat assistant failed. ' + error.message);
  }
}

/**
 * Takes the original resume text + analysis result and rewrites the full resume
 * as an ATS-optimized plain-text document.
 * @param {string} resumeText - Raw original resume text.
 * @param {object} analysisResult - The structured evaluation returned by analyzeResumeWithGemini.
 * @param {string} [customApiKey] - Optional user-supplied API key.
 * @returns {Promise<string>} - The full rewritten resume as a plain-text string.
 */
export async function optimizeResumeWithGemini(resumeText, analysisResult, customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const missingKeywords = (analysisResult?.atsKeywords?.missing || []).join(', ');
  const weaknesses = (analysisResult?.weaknesses || []).join('; ');
  const recommendations = (analysisResult?.recommendations || []).join('; ');
  const bulletRewrites = (analysisResult?.contentAndImpact?.suggestions || [])
    .map(s => `Original: "${s.original}" → Improved: "${s.improved}"`)
    .join('\n');

  const systemPrompt = `You are an elite resume writer, ATS optimization specialist, and Fortune 500 hiring expert.
Your task is to completely rewrite the provided resume to make it a top-tier, ATS-passing document.

RULES (follow all of them strictly):
1. Keep ALL real information from the original resume — do NOT invent companies, titles, dates, or degrees.
2. Naturally inject these missing ATS keywords where relevant: ${missingKeywords || 'none identified'}.
3. Fix these identified weaknesses: ${weaknesses || 'none identified'}.
4. Follow these recommendations: ${recommendations || 'none identified'}.
5. Apply these bullet rewrites where the original bullets appear: ${bulletRewrites || 'none'}.
6. Use strong action verbs (Led, Engineered, Delivered, Increased, Reduced, Optimized, Spearheaded, etc.).
7. Quantify every achievement possible — add realistic percentages, numbers, timeframes where implied.
8. Structure the resume in this exact order using UPPERCASE section headers:
   PROFESSIONAL SUMMARY
   SKILLS
   EXPERIENCE
   EDUCATION
   (plus CERTIFICATIONS / PROJECTS / AWARDS if present in original)
9. Keep formatting ATS-safe: plain text, no tables, no columns, no graphics, no special symbols except standard dashes and bullets (•).
10. Target length: 1 full page (400–600 words). Be concise but impactful.
11. Return ONLY the rewritten resume text. No preamble, no explanations, no markdown wrappers.`;

  const userPrompt = `Here is the original resume to rewrite:
"""
${resumeText}
"""

Rewrite it now as a fully ATS-optimized resume following all the rules above.`;

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 3500
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter Optimize Error:', error);
      throw new Error('Resume optimization failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192
      }
    });

    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini Optimize Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key.');
    }
    throw new Error('Resume optimization failed. ' + error.message);
  }
}

const tailorSchema = {
  type: 'object',
  properties: {
    tailoredResume: {
      type: 'string',
      description: 'The complete rewritten resume in plain text format, perfectly tailored to the provided Job Description (JD). Naturally integrate skills, emphasize relevant accomplishments, and format cleanly.'
    },
    matchScore: {
      type: 'integer',
      description: 'An estimated match rating between the tailored resume and the job description, from 0 to 100.'
    },
    keyTailoringInsights: {
      type: 'array',
      items: { type: 'string' },
      description: 'A list of 3-4 key changes and adjustments made to align the resume with the JD.'
    },
    matchedSkills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Relevant skills/keywords from the job description that were successfully integrated into the resume.'
    },
    missingSkillsRecommended: {
      type: 'array',
      items: { type: 'string' },
      description: 'Important skills from the job description that are recommended to be added (but were missing or weak in the original).'
    }
  },
  required: [
    'tailoredResume',
    'matchScore',
    'keyTailoringInsights',
    'matchedSkills',
    'missingSkillsRecommended'
  ]
};

/**
 * Tailors a resume text specifically to a provided Job Description using Gemini.
 * @param {string} resumeText - Raw text of the CV.
 * @param {string} jobDescription - Target Job Description / requirements.
 * @param {string} [customApiKey] - Optional user supplied API key.
 * @returns {Promise<object>} - Structured JSON analysis containing tailored resume and insights.
 */
export async function tailorResumeWithGemini(resumeText, jobDescription, customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemPrompt = `You are an elite corporate resume writer, talent acquisition specialist, and hiring consultant.
  Your task is to completely rewrite and optimize the candidate's CV so it matches the provided Job Description (JD) / Target Role guidelines perfectly.
  
  RULES:
  1. Strictly preserve all factual information from the original resume — do NOT invent companies, titles, dates, or degrees.
  2. Naturally inject matched skills and primary keywords from the JD into the summary, skills list, and experience bullets.
  3. Re-phrase work experience highlights to emphasize contributions and achievements that directly match the responsibilities requested in the JD.
  4. Ensure a premium, ATS-compliant plain-text output structure:
     PROFESSIONAL SUMMARY
     SKILLS
     EXPERIENCE
     EDUCATION
  5. Provide an estimated match score (0-100), key tailoring insights, matched skills, and recommended missing skills.
  6. You MUST strictly return your response in the specified JSON structure. Do not wrap it in any HTML or markdown, only raw JSON matching the schema.`;

  const userPrompt = `Target Job Description / Role Guidelines:
  """
  ${jobDescription}
  """
  
  Candidate's Original Resume Text:
  """
  ${resumeText}
  """
  
  Tailor and optimize this resume now.`;

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: `${systemPrompt}\nYou MUST strictly respond with a JSON object that conforms to this JSON schema:\n${JSON.stringify(tailorSchema, null, 2)}` },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.25,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      return JSON.parse(result.choices[0].message.content.trim());
    } catch (error) {
      console.error('OpenRouter Tailor Error:', error);
      throw new Error('Resume tailoring failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: tailorSchema,
        temperature: 0.25
      }
    });

    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Gemini Tailor Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key.');
    }
    throw new Error('Resume tailoring failed. ' + error.message);
  }
}

const prepSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'The category of the question: Technical, Behavioral, HR, or Situational.' },
          companySource: { type: 'string', description: 'The corporate source style of the question: Google, Amazon, McKinsey, Goldman Sachs, Deloitte, PwC, EY, KPMG.' },
          question: { type: 'string', description: 'Candid, customized interview question tailored directly to the candidate\'s resume background.' },
          answer: { type: 'string', description: 'An extremely concise, high-impact, professional model answer (strictly under 45 words) following optimal frameworks like STAR.' },
          tip: { type: 'string', description: 'A highly concise recruiter insider tip (strictly under 25 words) highlighting a key evaluation point.' }
        },
        required: ['category', 'companySource', 'question', 'answer', 'tip']
      },
      description: 'List of exactly 10 premium interview questions tailored to the candidate\'s resume.'
    }
  },
  required: ['questions']
};

/**
 * Generates tailored interview questions based on the candidate's resume text using Gemini.
 * @param {string} resumeText - Raw text of the CV.
 * @param {string} [customApiKey] - Optional user supplied API key.
 * @returns {Promise<object>} - Structured JSON analysis containing tailored questions and model answers.
 */
export async function generatePrepQuestionsWithGemini(resumeText, customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemPrompt = `You are a premier Talent Acquisition Partner, Executive Coach, and Interview Board Panelist for Fortune 500 tech companies (like Google, Amazon, Microsoft) and Big 4 advisory networks (like Deloitte, PwC).
  Your task is to scan the candidate's resume and generate exactly 10 customized, high-value interview questions (covering 3 Technical, 3 Behavioral, 2 HR, and 2 Situational contexts) they are highly likely to face from HRs and hiring managers.
  
  For each question, provide:
  1. A target corporate style category source (e.g. Google, Amazon, McKinsey, Deloitte, PwC). Sourced questions should feel authentic to those organizations.
  2. The question type (Behavioral, Technical, HR, Situational).
  3. An extremely concise, highly polished AI model answer (keep it high-impact and strictly under 45 words, following the STAR method where appropriate).
  4. A brief, punchy insider recruiter tip (strictly under 25 words) outlining exactly what hiring panels analyze.
  
  CRITICAL: Keep all answers and tips extremely concise, clear, and punchy. The entire JSON response MUST be compact to ensure it completes fully without truncation under strict token limits.
  You MUST strictly return your response in the specified JSON structure. Do not wrap it in any HTML or markdown, only raw JSON matching the schema.`;

  const userPrompt = `Here is the candidate's resume text:
  """
  ${resumeText}
  """
  
  Scan this resume and generate the structured interview preparation scorecard now.`;

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: `${systemPrompt}\nYou MUST strictly respond with a JSON object that conforms to this JSON schema:\n${JSON.stringify(prepSchema, null, 2)}` },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1600,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      return JSON.parse(result.choices[0].message.content.trim());
    } catch (error) {
      console.error('OpenRouter Prep Error:', error);
      throw new Error('Interview prep questions generation failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: prepSchema,
        temperature: 0.3
      }
    });

    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Gemini Prep Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key.');
    }
    throw new Error('Interview prep questions generation failed. ' + error.message);
  }
}

/**
 * Refines a cover letter text using Gemini AI for ATS compliance, tone, and impact.
 * @param {string} coverLetterText - The raw cover letter to be refined.
 * @param {string} jobTitle - The target job title.
 * @param {string} companyName - The target company name.
 * @param {string} [customApiKey] - Optional user-supplied API key.
 * @returns {Promise<string>} - The refined cover letter as plain text.
 */
export async function refineCoverLetterWithGemini(coverLetterText, jobTitle, companyName, customApiKey = null, userInstructions = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const systemPrompt = `You are an elite career coach, executive communication specialist, and Fortune 500 hiring expert.
Your task is to refine the provided cover letter or resume to make it compelling, ATS-optimized, and highly professional.

CRITICAL INSTRUCTIONS:
1. The input content might be in raw HTML format. If the input is HTML, you MUST preserve all HTML tags, structure, CSS inline styles, and layout EXACTLY as they are. ONLY refine or rewrite the text content inside the HTML tags. Do NOT strip or replace the HTML tags.
2. Return ONLY the refined content (HTML or plain text depending on input). Do NOT wrap in \`\`\`html or \`\`\` markdown code blocks. No explanations, no preamble, no markdown formatting.
3. Preserve all factual information — do NOT invent new achievements, companies, or roles unless the user explicitly requests new content generation.
4. Strengthen the opening hook and value propositions. Use powerful, active verbs.
5. If user instructions/prompt are provided, prioritize adjusting the text according to those specific instructions (e.g., changing tone, highlighting skills, rewriting sections, or generating new details).
6. Ensure the letter speaks directly to the role of "${jobTitle}" at "${companyName}" if provided.
7. Keep tone professional but human — show genuine enthusiasm.
8. Keep length appropriate (250–500 words maximum for letters).`;

  let userPrompt = `Here is the document content to refine:
"""
${coverLetterText}
"""`;

  if (userInstructions) {
    userPrompt += `\n\nUSER INSTRUCTIONS / PROMPT FOR REFINEMENT:\n"${userInstructions}"\n\nApply the above instructions carefully when refining the document.`;
  } else {
    userPrompt += `\n\nRefine it now for the ${jobTitle} role at ${companyName}. Make it polished, ATS-ready, and compelling.`;
  }

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.35,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter Cover Letter Refine Error:', error);
      throw new Error('Cover letter refinement failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 4096
      }
    });

    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini Cover Letter Refine Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key.');
    }
    throw new Error('Cover letter refinement failed. ' + error.message);
  }
}

// JSON Schema for structured LinkedIn profile evaluation output
const linkedinSchema = {
  type: 'object',
  properties: {
    score: { 
      type: 'integer', 
      description: 'Overall LinkedIn profile optimization score from 0 to 100.' 
    },
    summary: { 
      type: 'string', 
      description: 'A concise summary of profile strengths, formatting, and overall impression.' 
    },
    headline: {
      type: 'object',
      properties: {
        current: { type: 'string', description: 'The current headline detected from the input profile.' },
        feedback: { type: 'string', description: 'Constructive feedback on how to improve the headline for recruiter searches.' },
        suggestions: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: '3 optimized headline suggestions tailored to their target role and industry.' 
        }
      },
      required: ['current', 'feedback', 'suggestions']
    },
    about: {
      type: 'object',
      properties: {
        feedback: { type: 'string', description: 'Detailed feedback on the current About/Summary section.' },
        improvedText: { type: 'string', description: 'A fully written, high-impact, professionally formatted About section in first-person.' }
      },
      required: ['feedback', 'improvedText']
    },
    experience: {
      type: 'object',
      properties: {
        feedback: { type: 'string', description: 'Feedback on the experience description (formatting, action verbs, achievements).' },
        tips: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: '3 specific tips to rewrite experience bullets with quantified metrics.' 
        }
      },
      required: ['feedback', 'tips']
    },
    skillsAndKeywords: {
      type: 'object',
      properties: {
        matched: { type: 'array', items: { type: 'string' }, description: 'Relevant industry skills/keywords found in the profile text.' },
        missing: { type: 'array', items: { type: 'string' }, description: 'Highly recommended skills/keywords missing for their target role.' }
      },
      required: ['matched', 'missing']
    },
    generalTips: {
      type: 'array',
      items: { type: 'string' },
      description: '3-4 actionable tips regarding profile/banner images, custom URLs, active engagement, or networking.'
    }
  },
  required: ['score', 'summary', 'headline', 'about', 'experience', 'skillsAndKeywords', 'generalTips']
};

/**
 * Uses Gemini API to analyze a LinkedIn profile's text.
 * @param {string} profileText - Raw text copied from the LinkedIn profile.
 * @param {string} [customApiKey] - Optional user-supplied API key.
 * @returns {Promise<object>} - Parsed structured JSON feedback matching linkedinSchema.
 */
export async function analyzeLinkedInProfileWithGemini(profileText, customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please supply an API key in your request header or ask the administrator to configure the server environment variable.'
    );
  }

  const isOpenRouter = apiKey.startsWith('sk-or-');

  if (isOpenRouter) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an elite corporate Recruiter, LinkedIn Profile Branding Consultant, and social recruiting optimization specialist.
          Your task is to conduct an extremely thorough, candid, and high-value assessment of the candidate's LinkedIn profile text.
          Provide realistic scores out of 100.
          You MUST strictly respond with a JSON object that conforms to this JSON schema:
          ${JSON.stringify(linkedinSchema, null, 2)}
          Make sure you return valid, parsable JSON. Do not wrap it in any HTML or markdown backticks, only return raw JSON matching the schema structure.`
        },
        {
          role: 'user',
          content: `Analyze this LinkedIn profile and provide optimization feedback. Measure its searchability, look for headline gaps, evaluate the summary hook, and suggest improvements.
          
          LinkedIn Profile Text:
          """
          ${profileText}
          """`
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://cvmind.ai',
          'X-Title': 'CVMind AI'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.25,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw new Error('No choices returned by OpenRouter API.');
      }

      const responseText = result.choices[0].message.content.trim();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('OpenRouter LinkedIn Analysis Error:', error);
      throw new Error('LinkedIn analysis failed. ' + error.message);
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an elite corporate Recruiter, LinkedIn Profile Branding Consultant, and social recruiting optimization specialist.
      Your task is to conduct an extremely thorough, candid, and high-value assessment of the candidate's LinkedIn profile text.
      Provide realistic scores out of 100.
      You MUST strictly return your response in the specified JSON structure. Do not wrap it in any HTML or markdown, only raw JSON matching the schema.`
    });

    const prompt = `Analyze this LinkedIn profile and provide optimization feedback. Measure its searchability, look for headline gaps, evaluate the summary hook, and suggest improvements.
    
    LinkedIn Profile Text:
    """
    ${profileText}
    """`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: linkedinSchema,
        temperature: 0.25
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini LinkedIn Analysis Error:', error);
    if (error.status === 403 || error.message.includes('API key')) {
      throw new Error('Invalid Gemini API Key. Please verify your API key and try again.');
    }
    throw new Error('LinkedIn analysis failed. ' + error.message);
  }
}

