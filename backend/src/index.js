import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { parsePdf, parseDocx, parseTxt } from './services/parser.js';
import { analyzeResumeWithGemini, chatWithCVMind, optimizeResumeWithGemini } from './services/gemini.js';
import { getAdminStats, saveContactMessage, saveScan } from './db.js';

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
