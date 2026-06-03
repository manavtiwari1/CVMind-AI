import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { parsePdf, parseDocx, parseTxt } from './services/parser.js';
import { analyzeResumeWithGemini, chatWithCVMind, optimizeResumeWithGemini, tailorResumeWithGemini, generatePrepQuestionsWithGemini, refineCoverLetterWithGemini, analyzeLinkedInProfileWithGemini, evaluatePrepAnswerWithGemini, generateLinkedinBioWithGemini, generateLinkedinOutreachWithGemini, generateCareerCoursesWithGemini, generateElevatorPitchWithGemini, generateCareerRoadmapWithGemini } from './services/gemini.js';
import { getAdminStats, saveContactMessage, saveScan, saveFix, saveTailorLog, savePrepLog, findUserByEmail, createUser, saveLoginLog, saveWork, getUserWorks, deleteUserWork, updateUserProfile, updateUserPassword, findUserById, saveUserResetToken, findUserByResetToken, saveLinkedinLog, saveLinkedinBioLog, saveLinkedinOutreachLog, saveCareerCoursesLog, saveElevatorPitchLog, saveCareerRoadmapLog, getWorkById } from './db.js';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend Client
const resend = new Resend(process.env.RESEND_API_KEY || 're_ZUsGhSqZ_N1wr7tKSbze1ySxbbr66C4pg');

// Enable CORS for all requests, allow credentials and specific headers
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-gemini-key', 'x-admin-secret']
}));

app.use(express.json());

const apiRouter = express.Router();

// In-memory file upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are supported.'));
    }
  }
});

// Root Health Check Route
apiRouter.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'CVMind AI Backend API is running smoothly.',
    timestamp: new Date()
  });
});

// Admin Authentication Login Route
apiRouter.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const targetUsername = process.env.ADMIN_USERNAME || 'admin';
  const targetPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const configuredSecret = process.env.ADMIN_SECRET || 'admin123';

  if (username === targetUsername && password === targetPassword) {
    return res.json({
      success: true,
      message: 'Login successful.',
      secret: configuredSecret
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid username or password.'
  });
});

// User Sign Up Route
apiRouter.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in.' });
    }

    // Hash the password securely with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      email,
      name,
      password: hashedPassword
    });

    await saveLoginLog({ email: newUser.email, name: newUser.name, provider: 'signup' });

    return res.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Sign Up Error:', err);
    return res.status(500).json({ error: err.message || 'An error occurred during account creation.' });
  }
});

// User Sign In Route
apiRouter.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare bcrypt hashes
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await saveLoginLog({ email: user.email, name: user.name, provider: 'password' });

    return res.json({
      success: true,
      message: 'Sign in successful!',
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Sign In Error:', err);
    return res.status(500).json({ error: err.message || 'An error occurred during sign in.' });
  }
});

// User Forgot Password Route
apiRouter.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      // Industry-standard secure response to prevent user enumeration attacks
      return res.json({
        success: true,
        message: 'A secure password reset link has been dispatched to your email address.'
      });
    }

    // 1. Generate unique recovery token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const host = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${host}/?resetToken=${resetToken}&email=${encodeURIComponent(user.email)}`;

    // Save reset token in DB with 1 hour expiration
    await saveUserResetToken(user.email, resetToken, Date.now() + 3600000);

    // 2. Dispatch email using Resend and user's verified manavtiwari.in domain
    const { data, error } = await resend.emails.send({
      from: 'CVMind AI <no-reply@manavtiwari.in>',
      to: [email],
      subject: 'Reset your CVMind AI Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2997ff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">CVMind AI</h2>
            <span style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Password Recovery Portal</span>
          </div>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 15px;">Hi <strong>${user.name}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">We received a secure request to reset your CVMind AI account password. Click the button below to set a new password. This link is valid for **1 hour**:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #2997ff 0%, #bf5af2 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(41, 151, 255, 0.25);">Reset My Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 25px;">If you did not make this request, you can safely ignore this email. Your account credentials remain completely secure.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
            Designed & engineered by Manav Tiwari.<br />
            © ${new Date().getFullYear()} CVMind AI. Secure applicant tracking systems and resume optimization.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Dispatch Error:', error);
      return res.status(500).json({ error: 'Failed to send secure reset email. Please contact support.' });
    }

    console.log(`[PASSWORD RESET] Live email sent using Resend. ID: ${data?.id} for user: ${user.name}`);

    return res.json({
      success: true,
      message: 'A secure password reset link has been dispatched to your email address.'
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ error: err.message || 'An error occurred while requesting password reset.' });
  }
});

// User Password Reset via Token Route
apiRouter.post('/api/auth/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body || {};

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Email, token, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = await findUserByResetToken(token);
    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Password reset link is invalid or has expired.' });
    }

    // Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save the new password and clear the reset token fields
    await updateUserPassword(user.id || user._id, hashedPassword);
    await saveUserResetToken(user.email, '', null);

    // Save password-reset audit log to backend database
    await saveLoginLog({ email: user.email, name: user.name, provider: 'password-reset' });

    return res.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset Password API Error:', err);
    return res.status(500).json({ error: err.message || 'An error occurred while resetting password.' });
  }
});

// Google Auth Verification Route
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

apiRouter.post('/api/auth/google', async (req, res) => {
  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'OAuth ID token is required.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token payload.' });
    }
    
    const { email, name, picture } = payload;

    let user = await findUserByEmail(email);
    if (!user) {
      // Auto-create Google user with dynamic unique mock password hash
      const salt = await bcrypt.genSalt(10);
      const mockPasswordHash = await bcrypt.hash('oauth-google-' + Math.random().toString(36), salt);
      user = await createUser({
        email,
        name: name || email.split('@')[0],
        password: mockPasswordHash
      });
    }

    await saveLoginLog({ email: user.email, name: user.name, provider: 'google' });

    return res.json({
      success: true,
      message: 'Sign in with Google successful!',
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatar: picture || ''
      }
    });
  } catch (err) {
    console.error('Google Sign In Error:', err);
    return res.status(400).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// Admin Analytics Stats Secure Route
apiRouter.post('/api/admin/stats', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'] || req.body.secret || null;
  const configuredSecret = process.env.ADMIN_SECRET || 'admin123';

  if (!adminSecret || adminSecret !== configuredSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin secret key.' });
  }

  try {
    const statsData = await getAdminStats();
    return res.json({
      success: true,
      data: statsData
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Stats query failed.' });
  }
});

apiRouter.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailLooksValid) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const contact = saveContactMessage({
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject || '').trim(),
    message: String(message).trim()
  });

  return res.json({
    success: true,
    data: {
      id: contact.id,
      createdAt: contact.createdAt
    }
  });
});

apiRouter.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;
    const reply = await chatWithCVMind(message, history, customApiKey);

    return res.json({
      success: true,
      data: {
        reply
      }
    });
  } catch (error) {
    return res.status(400).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// Resume Analysis Endpoint
apiRouter.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { file } = req;
    
    // Check if file was uploaded
    if (!file) {
      return res.status(400).json({ 
        error: 'No resume file uploaded. Please upload a PDF, DOCX, or TXT file.' 
      });
    }

    // Extract custom API key from custom header if present
    const customApiKey = req.headers['x-gemini-key'] || null;

    let extractedText = '';

    // Route text parsing based on MIME type
    if (file.mimetype === 'application/pdf') {
      extractedText = await parsePdf(file.buffer);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await parseDocx(file.buffer);
    } else if (file.mimetype === 'text/plain') {
      extractedText = parseTxt(file.buffer);
    } else {
      return res.status(400).json({ 
        error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' 
      });
    }

    // Verify extracted text is not empty or too short
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        error: 'Resume text extraction returned empty or insufficient text. Please verify the document has readable text.'
      });
    }

    // Analyze with Gemini
    const evaluation = await analyzeResumeWithGemini(extractedText, customApiKey);

    // Persist admin analytics after successful parsing.
    if (evaluation && evaluation.score) {
      saveScan({
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        evaluation
      });
    }

    // Return the detailed analysis + original text (needed for AI optimizer)
    return res.json({
      success: true,
      data: evaluation,
      resumeText: extractedText
    });

  } catch (error) {
    console.error('API Error during analysis:', error);
    
    // Handle Multer limits or file type errors specifically
    if (error.message.includes('Limit') || error.message.includes('file type')) {
      return res.status(400).json({ error: error.message });
    }

    // Handle generic errors
    return res.status(500).json({ 
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// AI Resume Optimizer Endpoint
apiRouter.post('/api/optimize', async (req, res) => {
  try {
    const { resumeText, analysisResult } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Resume text is required and must be at least 50 characters.' });
    }

    if (!analysisResult || typeof analysisResult !== 'object') {
      return res.status(400).json({ error: 'Analysis result is required.' });
    }

    const optimizedResume = await optimizeResumeWithGemini(resumeText, analysisResult, customApiKey);

    // Record the optimization fix safely in admin diagnostics
    try {
      const fileName = req.body.fileName || analysisResult.fileName || 'Unknown Resume';
      const priorScore = Number(analysisResult.score || 0);
      await saveFix({ fileName, priorScore });
    } catch (dbErr) {
      console.error('Error saving optimization fix log:', dbErr);
    }

    return res.json({
      success: true,
      data: { optimizedResume }
    });
  } catch (error) {
    console.error('Optimize API Error:', error);
    return res.status(500).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// AI Resume Tailoring Endpoint
apiRouter.post('/api/tailor', upload.single('resume'), async (req, res) => {
  try {
    const { file } = req;
    const { jobDescription } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please upload a PDF, DOCX, or TXT file.' });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 15) {
      return res.status(400).json({ error: 'Job Description is required and must be at least 15 characters.' });
    }

    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      extractedText = await parsePdf(file.buffer);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await parseDocx(file.buffer);
    } else if (file.mimetype === 'text/plain') {
      extractedText = parseTxt(file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Unable to extract text from the uploaded resume.' });
    }

    const result = await tailorResumeWithGemini(extractedText, jobDescription, customApiKey);

    // Record the tailoring event in MongoDB / Local DB
    saveTailorLog({
      fileName: file.originalname,
      fileSize: file.size,
      score: result.matchScore,
      jobDescription: jobDescription,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkillsRecommended
    }).catch(err => console.error('Error logging tailoring scan:', err));

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Tailor API Error:', error);
    return res.status(500).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// AI Interview Prep Endpoint
apiRouter.post('/api/prep', upload.single('resume'), async (req, res) => {
  try {
    const { file } = req;
    const { resumeText } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    let textToAnalyze = '';
    let fileName = 'Direct Input';
    let fileSize = 0;

    if (file) {
      fileName = file.originalname;
      fileSize = file.size;
      if (file.mimetype === 'application/pdf') {
        textToAnalyze = await parsePdf(file.buffer);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        textToAnalyze = await parseDocx(file.buffer);
      } else if (file.mimetype === 'text/plain') {
        textToAnalyze = parseTxt(file.buffer);
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
      }
    } else if (resumeText && typeof resumeText === 'string' && resumeText.trim().length >= 50) {
      textToAnalyze = resumeText;
      fileName = req.body.fileName || 'Cached Resume';
      fileSize = Number(req.body.fileSize || resumeText.length);
    } else {
      return res.status(400).json({ error: 'No resume file uploaded or text provided. Please upload a PDF, DOCX, or TXT file, or provide your parsed resume text.' });
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      return res.status(400).json({ error: 'Unable to extract text from the resume. Please check if the file contains readable text.' });
    }

    const result = await generatePrepQuestionsWithGemini(textToAnalyze, customApiKey);

    // Save logs to MongoDB / Local DB
    if (result && result.questions) {
      savePrepLog({
        fileName: fileName,
        fileSize: fileSize,
        questionsCount: result.questions.length
      }).catch(err => console.error('Error logging prep action:', err));
    }

    return res.json({
      success: true,
      data: result,
      resumeText: textToAnalyze
    });
  } catch (error) {
    console.error('Prep API Error:', error);
    return res.status(500).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// AI Prep Evaluate Answer Endpoint
apiRouter.post('/api/prep/evaluate', async (req, res) => {
  try {
    const { question, userAnswer, resumeText } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and User Answer are required.' });
    }

    const result = await evaluatePrepAnswerWithGemini({
      question,
      userAnswer,
      resumeText,
      customApiKey
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Prep Evaluate API Error:', error);
    return res.status(500).json({
      error: error.message || 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});


// AI Cover Letter Refine Endpoint
apiRouter.post('/api/cover-letter/refine', async (req, res) => {
  try {
    const { coverLetterText, jobTitle, companyName, instructions } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!coverLetterText || typeof coverLetterText !== 'string' || coverLetterText.trim().length < 5) {
      return res.status(400).json({ error: 'Document content is required and must be valid.' });
    }

    const refinedLetter = await refineCoverLetterWithGemini(
      coverLetterText,
      jobTitle || 'Professional',
      companyName || 'Target Company',
      customApiKey,
      instructions
    );

    return res.json({
      success: true,
      data: { refinedLetter }
    });
  } catch (error) {
    console.error('Cover Letter Refine API Error:', error);
    return res.status(500).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// LinkedIn Profile Optimizer Endpoint
apiRouter.post('/api/linkedin/analyze', upload.single('linkedinPdf'), async (req, res) => {
  try {
    const { file } = req;
    const { email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!file) {
      return res.status(400).json({ error: 'No LinkedIn PDF file uploaded. Please upload a PDF file.' });
    }

    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      extractedText = await parsePdf(file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a PDF exported from LinkedIn.' });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ error: 'Unable to extract text from the uploaded PDF. Please make sure the PDF has readable text.' });
    }

    const evaluation = await analyzeLinkedInProfileWithGemini(extractedText, customApiKey);

    // Save logs to MongoDB / Local JSON DB
    if (evaluation && evaluation.score !== undefined) {
      await saveLinkedinLog({ email: email || '', score: evaluation.score });
    }

    let savedWork = null;
    if (userId) {
      const payload = {
        profileText: extractedText,
        evaluation
      };
      savedWork = await saveWork({
        userId,
        title: `LinkedIn Optimizer - ${new Date().toLocaleDateString()}`,
        type: 'linkedin',
        templateId: 'linkedin-opt',
        htmlContent: JSON.stringify(payload)
      });
    }

    return res.json({
      success: true,
      data: evaluation,
      work: savedWork
    });
  } catch (error) {
    console.error('LinkedIn Optimize API Error:', error);
    return res.status(500).json({
      error: 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// LinkedIn Profile Bio & Banner Generator Endpoint
apiRouter.post('/api/linkedin/bio', async (req, res) => {
  try {
    const { skills, jobTitle, resumeText, email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!jobTitle) {
      return res.status(400).json({ error: 'Job Title is required.' });
    }

    const result = await generateLinkedinBioWithGemini({
      skills,
      jobTitle,
      resumeText,
      customApiKey
    });

    // Save log
    await saveLinkedinBioLog({
      email: email || '',
      jobTitle: jobTitle
    });

    let savedWork = null;
    if (userId) {
      savedWork = await saveWork({
        userId,
        title: `LinkedIn Assets - ${jobTitle}`,
        type: 'linkedin-bio',
        templateId: 'linkedin-bio-gen',
        htmlContent: JSON.stringify({
          skills,
          jobTitle,
          resumeText,
          result
        })
      });
    }

    return res.json({
      success: true,
      data: result,
      work: savedWork
    });
  } catch (error) {
    console.error('LinkedIn Bio Generator API Error:', error);
    return res.status(500).json({
      error: error.message || 'try again after sometime or mail to contact@manavtiwari.in for this error'
    });
  }
});

// LinkedIn Outreach & DM Writer Endpoint
apiRouter.post('/api/linkedin/outreach', async (req, res) => {
  try {
    const { jobTitle, companyName, context, targetName, email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!jobTitle) {
      return res.status(400).json({ error: 'Job Title is required.' });
    }

    const result = await generateLinkedinOutreachWithGemini({
      jobTitle,
      companyName,
      context,
      targetName,
      customApiKey
    });

    await saveLinkedinOutreachLog({
      email: email || '',
      jobTitle: jobTitle
    });

    let savedWork = null;
    if (userId) {
      savedWork = await saveWork({
        userId,
        title: `LinkedIn Outreach - ${jobTitle} (${companyName || 'General'})`,
        type: 'linkedin-outreach',
        templateId: 'linkedin-outreach-gen',
        htmlContent: JSON.stringify({
          jobTitle,
          companyName,
          context,
          targetName,
          result
        })
      });
    }

    return res.json({
      success: true,
      data: result,
      work: savedWork
    });
  } catch (error) {
    console.error('LinkedIn Outreach API Error:', error);
    return res.status(500).json({
      error: error.message || 'AI Generation failed. Please try again later.'
    });
  }
});

// Skill Gap & Course Recommendation Endpoint
apiRouter.post('/api/career/courses', async (req, res) => {
  try {
    const { targetJob, skills, resumeText, email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!targetJob) {
      return res.status(400).json({ error: 'Target Job is required.' });
    }

    const result = await generateCareerCoursesWithGemini({
      targetJob,
      skills,
      resumeText,
      customApiKey
    });

    await saveCareerCoursesLog({
      email: email || '',
      jobTitle: targetJob
    });

    let savedWork = null;
    if (userId) {
      savedWork = await saveWork({
        userId,
        title: `Career Courses - ${targetJob}`,
        type: 'career-courses',
        templateId: 'career-courses-gen',
        htmlContent: JSON.stringify({
          targetJob,
          skills,
          resumeText,
          result
        })
      });
    }

    return res.json({
      success: true,
      data: result,
      work: savedWork
    });
  } catch (error) {
    console.error('Career Courses API Error:', error);
    return res.status(500).json({
      error: error.message || 'AI Generation failed. Please try again later.'
    });
  }
});

// Elevator Pitch Builder Endpoint
apiRouter.post('/api/career/pitch', async (req, res) => {
  try {
    const { jobTitle, details, resumeText, email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!jobTitle) {
      return res.status(400).json({ error: 'Job Title is required.' });
    }

    const result = await generateElevatorPitchWithGemini({
      jobTitle,
      details,
      resumeText,
      customApiKey
    });

    await saveElevatorPitchLog({
      email: email || '',
      jobTitle: jobTitle
    });

    let savedWork = null;
    if (userId) {
      savedWork = await saveWork({
        userId,
        title: `Elevator Pitch - ${jobTitle}`,
        type: 'elevator-pitch',
        templateId: 'elevator-pitch-gen',
        htmlContent: JSON.stringify({
          jobTitle,
          details,
          resumeText,
          result
        })
      });
    }

    return res.json({
      success: true,
      data: result,
      work: savedWork
    });
  } catch (error) {
    console.error('Elevator Pitch API Error:', error);
    return res.status(500).json({
      error: error.message || 'AI Generation failed. Please try again later.'
    });
  }
});

// Career Roadmap Endpoint
apiRouter.post('/api/career/roadmap', async (req, res) => {
  try {
    const { currentRole, targetRole, years, resumeText, email, userId } = req.body || {};
    const customApiKey = req.headers['x-gemini-key'] || null;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target Role is required.' });
    }

    const result = await generateCareerRoadmapWithGemini({
      currentRole,
      targetRole,
      years,
      resumeText,
      customApiKey
    });

    await saveCareerRoadmapLog({
      email: email || ''
    });

    let savedWork = null;
    if (userId) {
      savedWork = await saveWork({
        userId,
        title: `Career Roadmap - ${targetRole}`,
        type: 'career-roadmap',
        templateId: 'career-roadmap-gen',
        htmlContent: JSON.stringify({
          currentRole,
          targetRole,
          years,
          resumeText,
          result
        })
      });
    }

    return res.json({
      success: true,
      data: result,
      work: savedWork
    });
  } catch (error) {
    console.error('Career Roadmap API Error:', error);
    return res.status(500).json({
      error: error.message || 'AI Generation failed. Please try again later.'
    });
  }
});

// Public Shareable Resume Portfolio Endpoint
apiRouter.get('/api/portfolio/:workId', async (req, res) => {
  const { workId } = req.params;
  try {
    const work = await getWorkById(workId);
    if (!work) {
      return res.status(404).json({ error: 'Portfolio resume not found.' });
    }
    return res.json({
      success: true,
      data: {
        title: work.title,
        type: work.type,
        templateId: work.templateId,
        htmlContent: work.htmlContent,
        updatedAt: work.updatedAt || work.createdAt
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch portfolio.' });
  }
});


// ─── USER WORK & PROFILE ENDPOINTS ───────────────────────────────────────────
apiRouter.post('/api/user/work', async (req, res) => {
  const { userId, title, type, templateId, htmlContent, workId } = req.body || {};
  if (!userId || !title || !type || !templateId || !htmlContent) {
    return res.status(400).json({ error: 'Missing required work fields.' });
  }
  try {
    const saved = await saveWork({ userId, title, type, templateId, htmlContent, workId });
    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Save work error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save work.' });
  }
});

apiRouter.get('/api/user/work/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const works = await getUserWorks(userId);
    return res.json({ success: true, data: works });
  } catch (error) {
    console.error('Get user works error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch works.' });
  }
});

apiRouter.delete('/api/user/work/:userId/:workId', async (req, res) => {
  const { userId, workId } = req.params;
  try {
    await deleteUserWork(workId, userId);
    return res.json({ success: true, message: 'Work deleted successfully.' });
  } catch (error) {
    console.error('Delete work error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete work.' });
  }
});

apiRouter.post('/api/user/profile', async (req, res) => {
  const { userId, name, email, address, avatar } = req.body || {};
  if (!userId || !name || !email) {
    return res.status(400).json({ error: 'User ID, name, and email are required.' });
  }
  try {
    const updated = await updateUserProfile({ userId, name, email, address, avatar });
    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updated.id || updated._id,
        name: updated.name,
        email: updated.email,
        address: updated.address || '',
        avatar: updated.avatar || ''
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

apiRouter.post('/api/user/password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body || {};
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'User ID, current password, and new password are required.' });
  }
  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Check if user is a Google auth user who doesn't have a normal password
    if (user.password && user.password.startsWith('oauth-google-')) {
      // Allow Google users to set password directly, or check if they want to proceed
      // For Google users, currentPassword can be bypassed if they didn't have a real one, but to keep it simple,
      // let's let them enter any currentPassword or check if password is correct.
      // We will allow Google users to set password without verifying currentPassword if it starts with oauth-google-.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await updateUserPassword(userId, hashedPassword);
      return res.json({ success: true, message: 'Password set successfully!' });
    }

    // Compare bcrypt hashes
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }
    
    // Hash and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUserPassword(userId, hashedPassword);
    
    return res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
});

app.use('/_/backend', apiRouter);
app.use('/', apiRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error.'
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
