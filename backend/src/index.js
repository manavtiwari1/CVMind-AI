import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { parsePdf, parseDocx, parseTxt } from './services/parser.js';
import { analyzeResumeWithGemini, chatWithCVMind, optimizeResumeWithGemini, tailorResumeWithGemini, generatePrepQuestionsWithGemini } from './services/gemini.js';
import { getAdminStats, saveContactMessage, saveScan, saveFix, saveTailorLog, savePrepLog, findUserByEmail, createUser } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

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

// GitHub Auth Verification Route
apiRouter.post('/api/auth/github', async (req, res) => {
  const { code } = req.body || {};

  if (!code) {
    return res.status(400).json({ error: 'OAuth authorization code is required.' });
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData);
      return res.status(400).json({ 
        error: tokenData.error_description || tokenData.error || 'GitHub token exchange failed.' 
      });
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'No access token returned from GitHub.' });
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'CVMind-AI'
      }
    });

    const userData = await userResponse.json();
    if (!userResponse.ok) {
      console.error('GitHub user profile error:', userData);
      return res.status(400).json({ error: 'Failed to fetch user profile from GitHub.' });
    }

    // 3. Fetch user email (often null or private in public user profile)
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'CVMind-AI'
        }
      });
      const emails = await emailResponse.json();
      if (emailResponse.ok && Array.isArray(emails)) {
        // Find primary verified email, fallback to first email
        const primaryEmail = emails.find(e => e.primary && e.verified);
        email = primaryEmail ? primaryEmail.email : (emails[0] ? emails[0].email : null);
      }
    }

    if (!email) {
      // Fallback: create a dummy unique email if GitHub doesn't return any email
      email = `${userData.login || 'github_user'}@github.invalid`;
    }

    let user = await findUserByEmail(email);
    if (!user) {
      // Auto-create user with a secure hashed dummy password
      const salt = await bcrypt.genSalt(10);
      const mockPasswordHash = await bcrypt.hash('oauth-github-' + Math.random().toString(36), salt);
      user = await createUser({
        email,
        name: userData.name || userData.login || email.split('@')[0],
        password: mockPasswordHash
      });
    }

    return res.json({
      success: true,
      message: 'Sign in with GitHub successful!',
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatar: userData.avatar_url || ''
      }
    });
  } catch (err) {
    console.error('GitHub Sign In Error:', err);
    return res.status(500).json({ error: 'GitHub authentication failed. Please try again.' });
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
      error: error.message || 'Unable to answer right now.'
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
      error: error.message || 'An error occurred during resume analysis.' 
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
      error: error.message || 'Resume optimization failed.'
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
      error: error.message || 'Resume tailoring failed.'
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
      error: error.message || 'Interview prep questions generation failed.'
    });
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
