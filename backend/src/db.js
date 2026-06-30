import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'resumetrics-db.json');

const defaultDb = {
  scans: [],
  contacts: [],
  tailorLogs: [],
  keywordCounts: {},
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// ─── LOCAL JSON DATABASE HELPERS ──────────────────────────────────────────────
function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
  }
}

function readDb() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    const backupPath = `${dbPath}.broken-${Date.now()}`;
    fs.renameSync(dbPath, backupPath);
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    return JSON.parse(JSON.stringify(defaultDb));
  }
}

function writeDb(db) {
  db.meta = {
    ...(db.meta || {}),
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ─── CLOUD MONGODB (MONGOOSE) SETUP ──────────────────────────────────────────
const mongoURI = process.env.MONGODB_URI;

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('MongoDB connected successfully!');
    })
    .catch((err) => {
      console.error('MongoDB connection error. Falling back to Local JSON database. Error:', err.message);
    });
}

// ─── MONGOOSE MODELS ─────────────────────────────────────────────────────────
const scanSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  score: { type: Number, required: true },
  summary: { type: String, default: '' },
  missingKeywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'General inquiry' },
  message: { type: String, required: true },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const fixSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  priorScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Fix = mongoose.models.Fix || mongoose.model('Fix', fixSchema);

const tailorSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  score: { type: Number, required: true },
  jobDescription: { type: String, required: true },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const TailorLog = mongoose.models.TailorLog || mongoose.model('TailorLog', tailorSchema);

const prepLogSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  questionsCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PrepLog = mongoose.models.PrepLog || mongoose.model('PrepLog', prepLogSchema);

const linkedinLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LinkedinLog = mongoose.models.LinkedinLog || mongoose.model('LinkedinLog', linkedinLogSchema);

const linkedinBioLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const LinkedinBioLog = mongoose.models.LinkedinBioLog || mongoose.model('LinkedinBioLog', linkedinBioLogSchema);

const linkedinOutreachLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const LinkedinOutreachLog = mongoose.models.LinkedinOutreachLog || mongoose.model('LinkedinOutreachLog', linkedinOutreachLogSchema);

const careerCoursesLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const CareerCoursesLog = mongoose.models.CareerCoursesLog || mongoose.model('CareerCoursesLog', careerCoursesLogSchema);

const elevatorPitchLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const ElevatorPitchLog = mongoose.models.ElevatorPitchLog || mongoose.model('ElevatorPitchLog', elevatorPitchLogSchema);

const careerRoadmapLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const CareerRoadmapLog = mongoose.models.CareerRoadmapLog || mongoose.model('CareerRoadmapLog', careerRoadmapLogSchema);

const voicePrepLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const VoicePrepLog = mongoose.models.VoicePrepLog || mongoose.model('VoicePrepLog', voicePrepLogSchema);

const portfolioGenLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  theme: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const PortfolioGenLog = mongoose.models.PortfolioGenLog || mongoose.model('PortfolioGenLog', portfolioGenLogSchema);

const linkedinPostLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  topic: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const LinkedinPostLog = mongoose.models.LinkedinPostLog || mongoose.model('LinkedinPostLog', linkedinPostLogSchema);

const jobFinderLogSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  jobsCount: { type: Number, default: 0 },
  jobDescription: { type: String, default: '' },
  jobType: { type: String, default: 'All' },
  createdAt: { type: Date, default: Date.now }
});
const JobFinderLog = mongoose.models.JobFinderLog || mongoose.model('JobFinderLog', jobFinderLogSchema);

const paymentLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, required: true }, // 'card' | 'upi' | 'paypal'
  transactionId: { type: String, required: true },
  status: { type: String, default: 'success' },
  createdAt: { type: Date, default: Date.now }
});
const PaymentLog = mongoose.models.PaymentLog || mongoose.model('PaymentLog', paymentLogSchema);

const whitelistEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const WhitelistEmail = mongoose.models.WhitelistEmail || mongoose.model('WhitelistEmail', whitelistEmailSchema);

const autoApplyAccessSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  grantedAt: { type: Date, default: Date.now }
});
const AutoApplyAccess = mongoose.models.AutoApplyAccess || mongoose.model('AutoApplyAccess', autoApplyAccessSchema);

// ─── PER-FEATURE DAILY LIMITS FOR FREE USERS ─────────────────────────────────
export const FREE_DAILY_LIMITS = {
  'analyze':           3,
  'proofread':         5,
  'prep':              5,
  'linkedin-analyze':  3,
  'linkedin-bio':      3,
  'linkedin-outreach': 5,
  'linkedin-post':     5,
};

const WHITELISTED_EMAILS_HARDCODED = ['riturani2005@gmail.com', 'rajendermishra39@gmail.com'];

export async function isUserPaid(user) {
  // All features are currently free for every user.
  return true;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isGoogleUser: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  usageMap: { type: Map, of: Number, default: new Map() }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const workSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true }, // 'resume' or 'cover-letter'
  templateId: { type: String, required: true },
  htmlContent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Work = mongoose.models.Work || mongoose.model('Work', workSchema);

const loginLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  provider: { type: String, required: true }, // e.g. 'google', 'github', 'password', 'signup'
  createdAt: { type: Date, default: Date.now }
});

const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);

export async function saveLoginLog({ email, name, provider }) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  const cleanProvider = String(provider || 'password').trim().toLowerCase();

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    LoginLog.create({
      email: cleanEmail,
      name: cleanName,
      provider: cleanProvider
    }).catch(err => console.error('MongoDB saveLoginLog error:', err));
    return;
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.loginLogs) db.loginLogs = [];
  db.loginLogs.unshift({
    id: randomUUID(),
    email: cleanEmail,
    name: cleanName,
    provider: cleanProvider,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function findUserByEmail(email) {
  await ensureMongoConnection();
  const searchEmail = String(email || '').trim().toLowerCase();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await User.findOne({ email: searchEmail });
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.users) db.users = [];
  return db.users.find(u => u.email === searchEmail) || null;
}

export async function createUser({ email, name, password, isGoogleUser = false }) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    const newUser = new User({
      email: cleanEmail,
      name: cleanName,
      password,
      isGoogleUser
    });
    await newUser.save();
    return {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      isGoogleUser: newUser.isGoogleUser,
      createdAt: newUser.createdAt
    };
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.users) db.users = [];

  const existingUser = db.users.find(u => u.email === cleanEmail);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: randomUUID(),
    email: cleanEmail,
    name: cleanName,
    password,
    isGoogleUser,
    createdAt: new Date().toISOString()
  };

  db.users.unshift(newUser);
  writeDb(db);
  return newUser;
}


// Await active MongoDB connection during startup to prevent race condition fallback
async function ensureMongoConnection() {
  if (mongoURI && mongoose.connection.readyState === 2) {
    let attempts = 0;
    while (mongoose.connection.readyState === 2 && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }
}

// ─── HYBRID DATABASE EXPORTS ──────────────────────────────────────────────────

export async function saveScan({ fileName, fileType, fileSize, evaluation }) {
  await ensureMongoConnection();
  const score = Number(evaluation?.score || 0);
  const missing = Array.isArray(evaluation?.atsKeywords?.missing)
    ? evaluation.atsKeywords.missing
    : [];

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    Scan.create({
      fileName,
      fileType,
      fileSize,
      score,
      summary: evaluation?.summary || '',
      missingKeywords: missing
    }).catch(err => console.error('MongoDB saveScan error:', err));
    return;
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  db.scans.unshift({
    id: randomUUID(),
    fileName,
    fileType,
    fileSize,
    score,
    summary: evaluation?.summary || '',
    missingKeywords: missing,
    createdAt: new Date().toISOString()
  });

  missing.forEach((keyword) => {
    const cleanKeyword = String(keyword || '').trim();
    if (cleanKeyword) {
      db.keywordCounts[cleanKeyword] = (db.keywordCounts[cleanKeyword] || 0) + 1;
    }
  });

  writeDb(db);
}

export async function saveContactMessage({ name, email, subject, message }) {
  await ensureMongoConnection();
  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    const contact = new Contact({
      name,
      email,
      subject: subject || 'General inquiry',
      message,
      status: 'new'
    });
    contact.save().catch(err => console.error('MongoDB saveContactMessage error:', err));
    return {
      id: contact._id,
      createdAt: contact.createdAt
    };
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  const contact = {
    id: randomUUID(),
    name,
    email,
    subject: subject || 'General inquiry',
    message,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  db.contacts.unshift(contact);
  writeDb(db);
  return contact;
}

export async function saveFix({ fileName, priorScore }) {
  await ensureMongoConnection();
  const score = Number(priorScore || 0);

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    Fix.create({
      fileName,
      priorScore: score
    }).catch(err => console.error('MongoDB saveFix error:', err));
    return;
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  if (!db.fixes) db.fixes = [];
  db.fixes.unshift({
    id: randomUUID(),
    fileName,
    priorScore: score,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
}

export async function saveTailorLog({ fileName, fileSize, score, jobDescription, matchedSkills, missingSkills }) {
  await ensureMongoConnection();
  const scoreVal = Number(score || 0);
  const sizeVal = Number(fileSize || 0);

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    TailorLog.create({
      fileName,
      fileSize: sizeVal,
      score: scoreVal,
      jobDescription,
      matchedSkills: matchedSkills || [],
      missingSkills: missingSkills || []
    }).catch(err => console.error('MongoDB saveTailorLog error:', err));
    return;
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  if (!db.tailorLogs) db.tailorLogs = [];
  db.tailorLogs.unshift({
    id: randomUUID(),
    fileName,
    fileSize: sizeVal,
    score: scoreVal,
    jobDescription,
    matchedSkills: matchedSkills || [],
    missingSkills: missingSkills || [],
    createdAt: new Date().toISOString()
  });

  writeDb(db);
}

export async function savePrepLog({ fileName, fileSize, questionsCount }) {
  await ensureMongoConnection();
  const sizeVal = Number(fileSize || 0);
  const countVal = Number(questionsCount || 0);

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    PrepLog.create({
      fileName,
      fileSize: sizeVal,
      questionsCount: countVal
    }).catch(err => console.error('MongoDB savePrepLog error:', err));
    return;
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  if (!db.prepLogs) db.prepLogs = [];
  db.prepLogs.unshift({
    id: randomUUID(),
    fileName,
    fileSize: sizeVal,
    questionsCount: countVal,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
}

export async function saveLinkedinLog({ email, score }) {
  await ensureMongoConnection();
  const scoreVal = Number(score || 0);

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    LinkedinLog.create({
      email: email || '',
      score: scoreVal
    }).catch(err => console.error('MongoDB saveLinkedinLog error:', err));
    return;
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.linkedinLogs) db.linkedinLogs = [];
  db.linkedinLogs.unshift({
    id: randomUUID(),
    email: email || '',
    score: scoreVal,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveLinkedinBioLog({ email, jobTitle }) {
  await ensureMongoConnection();

  // 1. MongoDB Mode (Non-blocking)
  if (mongoURI && mongoose.connection.readyState === 1) {
    LinkedinBioLog.create({
      email: email || '',
      jobTitle: jobTitle || ''
    }).catch(err => console.error('MongoDB saveLinkedinBioLog error:', err));
    return;
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.linkedinBioLogs) db.linkedinBioLogs = [];
  db.linkedinBioLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobTitle: jobTitle || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveLinkedinOutreachLog({ email, jobTitle }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    LinkedinOutreachLog.create({ email: email || '', jobTitle: jobTitle || '' }).catch(err => console.error('MongoDB saveLinkedinOutreachLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.linkedinOutreachLogs) db.linkedinOutreachLogs = [];
  db.linkedinOutreachLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobTitle: jobTitle || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveCareerCoursesLog({ email, jobTitle }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    CareerCoursesLog.create({ email: email || '', jobTitle: jobTitle || '' }).catch(err => console.error('MongoDB saveCareerCoursesLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.careerCoursesLogs) db.careerCoursesLogs = [];
  db.careerCoursesLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobTitle: jobTitle || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveElevatorPitchLog({ email, jobTitle }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    ElevatorPitchLog.create({ email: email || '', jobTitle: jobTitle || '' }).catch(err => console.error('MongoDB saveElevatorPitchLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.elevatorPitchLogs) db.elevatorPitchLogs = [];
  db.elevatorPitchLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobTitle: jobTitle || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveCareerRoadmapLog({ email }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    CareerRoadmapLog.create({ email: email || '' }).catch(err => console.error('MongoDB saveCareerRoadmapLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.careerRoadmapLogs) db.careerRoadmapLogs = [];
  db.careerRoadmapLogs.unshift({
    id: randomUUID(),
    email: email || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveVoicePrepLog({ email, jobTitle, score }) {
  await ensureMongoConnection();
  const scoreVal = Number(score || 0);
  if (mongoURI && mongoose.connection.readyState === 1) {
    VoicePrepLog.create({ email: email || '', jobTitle: jobTitle || '', score: scoreVal }).catch(err => console.error('MongoDB saveVoicePrepLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.voicePrepLogs) db.voicePrepLogs = [];
  db.voicePrepLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobTitle: jobTitle || '',
    score: scoreVal,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function savePortfolioGenLog({ email, theme }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    PortfolioGenLog.create({ email: email || '', theme: theme || '' }).catch(err => console.error('MongoDB savePortfolioGenLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.portfolioGenLogs) db.portfolioGenLogs = [];
  db.portfolioGenLogs.unshift({
    id: randomUUID(),
    email: email || '',
    theme: theme || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveLinkedinPostLog({ email, topic }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    LinkedinPostLog.create({ email: email || '', topic: topic || '' }).catch(err => console.error('MongoDB saveLinkedinPostLog error:', err));
    return;
  }
  const db = readDb();
  if (!db.linkedinPostLogs) db.linkedinPostLogs = [];
  db.linkedinPostLogs.unshift({
    id: randomUUID(),
    email: email || '',
    topic: topic || '',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function saveJobFinderLog({ email, jobsCount, jobDescription, jobType }) {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    JobFinderLog.create({
      email: email || '',
      jobsCount: Number(jobsCount || 0),
      jobDescription: jobDescription || '',
      jobType: jobType || 'All'
    }).catch(err => console.error('MongoDB saveJobFinderLog error:', err));
    return;
  }
  db.jobFinderLogs.unshift({
    id: randomUUID(),
    email: email || '',
    jobsCount: Number(jobsCount || 0),
    jobDescription: jobDescription || '',
    jobType: jobType || 'All',
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function savePaymentLog({ email, amount, paymentMethod, transactionId, status }) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (mongoURI && mongoose.connection.readyState === 1) {
    await PaymentLog.create({
      email: cleanEmail,
      amount: Number(amount || 200),
      paymentMethod,
      transactionId,
      status
    });
    return;
  }

  const db = readDb();
  if (!db.paymentLogs) db.paymentLogs = [];
  db.paymentLogs.unshift({
    id: randomUUID(),
    email: cleanEmail,
    amount: Number(amount || 200),
    paymentMethod,
    transactionId,
    status,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function getWhitelistedEmails() {
  await ensureMongoConnection();
  let dbList = [];
  if (mongoURI && mongoose.connection.readyState === 1) {
    dbList = await WhitelistEmail.find().sort({ createdAt: -1 });
  } else {
    const db = readDb();
    if (!db.whitelistedEmails) db.whitelistedEmails = [];
    dbList = db.whitelistedEmails;
  }

  const mergedList = dbList.map(item => {
    const emailStr = typeof item === 'string' ? item : item.email;
    const dateVal = typeof item === 'string' ? new Date().toISOString() : item.createdAt || new Date().toISOString();
    return {
      email: emailStr,
      createdAt: dateVal,
      source: 'database'
    };
  });

  // Add env whitelisted users
  let envWhitelist = {};
  try {
    if (process.env.WHITELISTED_USERS) {
      envWhitelist = JSON.parse(process.env.WHITELISTED_USERS);
    }
  } catch {}
  Object.keys(envWhitelist).forEach(email => {
    const lowerEmail = email.toLowerCase();
    if (!mergedList.some(x => x.email === lowerEmail)) {
      mergedList.push({
        email: lowerEmail,
        createdAt: new Date().toISOString(),
        source: 'env'
      });
    }
  });

  // Add hardcoded users
  WHITELISTED_EMAILS_HARDCODED.forEach(email => {
    const lowerEmail = email.toLowerCase();
    if (!mergedList.some(x => x.email === lowerEmail)) {
      mergedList.push({
        email: lowerEmail,
        createdAt: new Date().toISOString(),
        source: 'hardcoded'
      });
    }
  });

  return mergedList;
}

export async function addWhitelistedEmail(email) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email is required');

  if (mongoURI && mongoose.connection.readyState === 1) {
    try {
      const existing = await WhitelistEmail.findOne({ email: cleanEmail });
      if (existing) return existing;
      const newEntry = new WhitelistEmail({ email: cleanEmail });
      await newEntry.save();
      return newEntry;
    } catch (err) {
      throw new Error(err.message || 'Failed to add whitelisted email in MongoDB');
    }
  }

  const db = readDb();
  if (!db.whitelistedEmails) db.whitelistedEmails = [];
  const existing = db.whitelistedEmails.find(x => (typeof x === 'string' ? x : x.email) === cleanEmail);
  if (existing) return existing;
  const newEntry = {
    id: randomUUID(),
    email: cleanEmail,
    createdAt: new Date().toISOString()
  };
  db.whitelistedEmails.unshift(newEntry);
  writeDb(db);
  return newEntry;
}

export async function deleteWhitelistedEmail(email) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email is required');

  if (mongoURI && mongoose.connection.readyState === 1) {
    return await WhitelistEmail.deleteOne({ email: cleanEmail });
  }

  const db = readDb();
  if (!db.whitelistedEmails) db.whitelistedEmails = [];
  db.whitelistedEmails = db.whitelistedEmails.filter(x => (typeof x === 'string' ? x : x.email) !== cleanEmail);
  writeDb(db);
  return { deletedCount: 1 };
}

export async function checkJobFinderAccess(email) {
  // Job Finder is currently open to everyone.
  return true;
}

export async function getWorkById(workId) {

  await ensureMongoConnection();
  const cleanWorkId = String(workId || '').trim();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await Work.findById(cleanWorkId);
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.works) db.works = [];
  return db.works.find(w => w.id === cleanWorkId || w._id === cleanWorkId) || null;
}



export async function getAdminStats() {
  await ensureMongoConnection();
  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    try {
      const scans = await Scan.find().sort({ createdAt: -1 }).limit(100);
      const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
      const fixes = await Fix.find().sort({ createdAt: -1 }).limit(100);
      const tailorLogs = await TailorLog.find().sort({ createdAt: -1 }).limit(100);
      const prepLogs = await PrepLog.find().sort({ createdAt: -1 }).limit(100);
      const loginLogs = await LoginLog.find().sort({ createdAt: -1 }).limit(100);
      const linkedinLogs = await LinkedinLog.find().sort({ createdAt: -1 }).limit(100);
      const linkedinBioLogs = await LinkedinBioLog.find().sort({ createdAt: -1 }).limit(100);
      const linkedinOutreachLogs = await LinkedinOutreachLog.find().sort({ createdAt: -1 }).limit(100);
      const careerCoursesLogs = await CareerCoursesLog.find().sort({ createdAt: -1 }).limit(100);
      const elevatorPitchLogs = await ElevatorPitchLog.find().sort({ createdAt: -1 }).limit(100);
      const careerRoadmapLogs = await CareerRoadmapLog.find().sort({ createdAt: -1 }).limit(100);
      const voicePrepLogs = await VoicePrepLog.find().sort({ createdAt: -1 }).limit(100);
      const portfolioGenLogs = await PortfolioGenLog.find().sort({ createdAt: -1 }).limit(100);
      const linkedinPostLogs = await LinkedinPostLog.find().sort({ createdAt: -1 }).limit(100);
      const jobFinderLogs = await JobFinderLog.find().sort({ createdAt: -1 }).limit(100);
      const paymentLogs = await PaymentLog.find().sort({ createdAt: -1 }).limit(100);
      const resumes = await Work.find({ type: 'resume' }).sort({ updatedAt: -1 }).limit(100);
      const coverLetters = await Work.find({ type: 'cover-letter' }).sort({ updatedAt: -1 }).limit(100);
      
      const totalScans = await Scan.countDocuments();
      const totalContacts = await Contact.countDocuments();
      const totalFixes = await Fix.countDocuments();
      const totalTailors = await TailorLog.countDocuments();
      const totalPreps = await PrepLog.countDocuments();
      const totalLogins = await LoginLog.countDocuments();
      const totalLinkedins = await LinkedinLog.countDocuments();
      const totalLinkedinBios = await LinkedinBioLog.countDocuments();
      const totalLinkedinOutreachs = await LinkedinOutreachLog.countDocuments();
      const totalCareerCourses = await CareerCoursesLog.countDocuments();
      const totalElevatorPitches = await ElevatorPitchLog.countDocuments();
      const totalCareerRoadmaps = await CareerRoadmapLog.countDocuments();
      const totalVoicePreps = await VoicePrepLog.countDocuments();
      const totalPortfolioGens = await PortfolioGenLog.countDocuments();
      const totalLinkedinPosts = await LinkedinPostLog.countDocuments();
      const totalJobFinders = await JobFinderLog.countDocuments();
      const totalPayments = await PaymentLog.countDocuments();
      const totalResumes = await Work.countDocuments({ type: 'resume' });
      const totalCoverLetters = await Work.countDocuments({ type: 'cover-letter' });
      
      const totalScoreSum = scans.reduce((sum, scan) => sum + Number(scan.score || 0), 0);
      const averageScore = totalScans > 0 ? Number((totalScoreSum / Math.min(totalScans, 100)).toFixed(1)) : 0;
      
      const scoreDistAggregate = await Scan.aggregate([
        {
          $group: {
            _id: null,
            high: { $sum: { $cond: [{ $gte: ["$score", 80] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $and: [{ $gte: ["$score", 60] }, { $lt: ["$score", 80] }] }, 1, 0] } },
            low: { $sum: { $cond: [{ $lt: ["$score", 60] }, 1, 0] } }
          }
        }
      ]);
      
      const scoreDistribution = scoreDistAggregate[0] || { low: 0, medium: 0, high: 0 };
      if (scoreDistribution._id !== undefined) delete scoreDistribution._id;

      // Group by lowercase keyword and count
      const keywordTrendsAggregate = await Scan.aggregate([
        { $unwind: "$missingKeywords" },
        { 
          $group: { 
            _id: { $toLower: { $trim: { input: "$missingKeywords" } } }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { keyword: "$_id", count: 1, _id: 0 } }
      ]);
      const keywordTrends = keywordTrendsAggregate;

      const userIds = [...new Set([...resumes.map(r => r.userId), ...coverLetters.map(c => c.userId)])];
      const users = await User.find({ _id: { $in: userIds } });
      const userMap = {};
      users.forEach(u => {
        userMap[String(u._id)] = { name: u.name, email: u.email };
      });

      return {
        totalScans,
        averageScore,
        scoreDistribution,
        keywordTrends,
        totalResumes,
        totalCoverLetters,
        totalLinkedins,
        recentLinkedins: linkedinLogs.slice(0, 15).map(l => ({
          id: l._id,
          email: l.email,
          score: l.score,
          createdAt: l.createdAt
        })),
        recentScans: scans.slice(0, 8).map(s => ({
          id: s._id,
          fileName: s.fileName,
          score: s.score,
          createdAt: s.createdAt,
          missingKeywords: s.missingKeywords
        })),
        contactMessages: contacts.slice(0, 8).map(c => ({
          id: c._id,
          name: c.name,
          email: c.email,
          subject: c.subject,
          message: c.message,
          createdAt: c.createdAt
        })),
        recentFixes: fixes.slice(0, 10).map(f => ({
          id: f._id,
          fileName: f.fileName,
          priorScore: f.priorScore,
          createdAt: f.createdAt
        })),
        totalFixes,
        totalContacts,
        recentTailors: tailorLogs.slice(0, 15).map(t => ({
          id: t._id,
          fileName: t.fileName,
          fileSize: t.fileSize,
          score: t.score,
          jobDescription: t.jobDescription,
          matchedSkills: t.matchedSkills,
          missingSkills: t.missingSkills,
          createdAt: t.createdAt
        })),
        totalTailors,
        recentPreps: prepLogs.slice(0, 15).map(p => ({
          id: p._id,
          fileName: p.fileName,
          fileSize: p.fileSize,
          questionsCount: p.questionsCount,
          createdAt: p.createdAt
        })),
        totalPreps,
        recentLogins: loginLogs.slice(0, 20).map(l => ({
          id: l._id,
          email: l.email,
          name: l.name,
          provider: l.provider,
          createdAt: l.createdAt
        })),
        totalLogins,
        recentResumes: resumes.map(r => ({
          id: r._id,
          title: r.title,
          templateId: r.templateId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: userMap[String(r.userId)] || { name: 'Unknown User', email: 'N/A' }
        })),
        recentCoverLetters: coverLetters.map(c => ({
          id: c._id,
          title: c.title,
          templateId: c.templateId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          user: userMap[String(c.userId)] || { name: 'Unknown User', email: 'N/A' }
        })),
        totalLinkedinBios,
        recentLinkedinBios: linkedinBioLogs.slice(0, 15).map(b => ({
          id: b._id,
          email: b.email,
          jobTitle: b.jobTitle,
          createdAt: b.createdAt
        })),
        totalLinkedinOutreachs,
        recentLinkedinOutreachs: linkedinOutreachLogs.slice(0, 15).map(o => ({
          id: o._id,
          email: o.email,
          jobTitle: o.jobTitle,
          createdAt: o.createdAt
        })),
        totalCareerCourses,
        recentCareerCourses: careerCoursesLogs.slice(0, 15).map(cc => ({
          id: cc._id,
          email: cc.email,
          jobTitle: cc.jobTitle,
          createdAt: cc.createdAt
        })),
        totalElevatorPitches,
        recentElevatorPitches: elevatorPitchLogs.slice(0, 15).map(ep => ({
          id: ep._id,
          email: ep.email,
          jobTitle: ep.jobTitle,
          createdAt: ep.createdAt
        })),
        totalCareerRoadmaps,
        recentCareerRoadmaps: careerRoadmapLogs.slice(0, 15).map(cr => ({
          id: cr._id,
          email: cr.email,
          createdAt: cr.createdAt
        })),
        totalVoicePreps,
        recentVoicePreps: voicePrepLogs.slice(0, 15).map(vp => ({
          id: vp._id,
          email: vp.email,
          jobTitle: vp.jobTitle,
          score: vp.score,
          createdAt: vp.createdAt
        })),
        totalPortfolioGens,
        recentPortfolioGens: portfolioGenLogs.slice(0, 15).map(pg => ({
          id: pg._id,
          email: pg.email,
          theme: pg.theme,
          createdAt: pg.createdAt
        })),
        totalLinkedinPosts,
        recentLinkedinPosts: linkedinPostLogs.slice(0, 15).map(lp => ({
          id: lp._id,
          email: lp.email,
          topic: lp.topic,
          createdAt: lp.createdAt
        })),
        totalJobFinders,
        recentJobFinders: jobFinderLogs.slice(0, 15).map(jf => ({
          id: jf._id,
          email: jf.email,
          jobsCount: jf.jobsCount,
          jobDescription: jf.jobDescription,
          jobType: jf.jobType,
          createdAt: jf.createdAt
        })),
        totalPayments,
        recentPayments: paymentLogs.slice(0, 50).map(p => ({
          id: p._id,
          email: p.email,
          amount: p.amount,
          currency: p.currency,
          paymentMethod: p.paymentMethod,
          transactionId: p.transactionId,
          status: p.status,
          createdAt: p.createdAt
        })),
        database: {
          path: 'Cloud MongoDB Cluster0 (Atlas)',
          updatedAt: new Date().toISOString()
        }
      };
    } catch (err) {
      console.error('MongoDB getAdminStats error, falling back to local:', err);
    }
  }

  // 2. Local JSON DB Mode (Fallback)
  const db = readDb();
  const scans = Array.isArray(db.scans) ? db.scans : [];
  const contacts = Array.isArray(db.contacts) ? db.contacts : [];
  const fixes = Array.isArray(db.fixes) ? db.fixes : [];
  const tailorLogs = Array.isArray(db.tailorLogs) ? db.tailorLogs : [];
  const prepLogs = Array.isArray(db.prepLogs) ? db.prepLogs : [];
  const loginLogs = Array.isArray(db.loginLogs) ? db.loginLogs : [];
  const linkedinLogs = Array.isArray(db.linkedinLogs) ? db.linkedinLogs : [];
  const linkedinBioLogs = Array.isArray(db.linkedinBioLogs) ? db.linkedinBioLogs : [];
  const linkedinOutreachLogs = Array.isArray(db.linkedinOutreachLogs) ? db.linkedinOutreachLogs : [];
  const careerCoursesLogs = Array.isArray(db.careerCoursesLogs) ? db.careerCoursesLogs : [];
  const elevatorPitchLogs = Array.isArray(db.elevatorPitchLogs) ? db.elevatorPitchLogs : [];
  const careerRoadmapLogs = Array.isArray(db.careerRoadmapLogs) ? db.careerRoadmapLogs : [];
  const voicePrepLogs = Array.isArray(db.voicePrepLogs) ? db.voicePrepLogs : [];
  const portfolioGenLogs = Array.isArray(db.portfolioGenLogs) ? db.portfolioGenLogs : [];
  const linkedinPostLogs = Array.isArray(db.linkedinPostLogs) ? db.linkedinPostLogs : [];
  const jobFinderLogs = Array.isArray(db.jobFinderLogs) ? db.jobFinderLogs : [];
  const paymentLogs = Array.isArray(db.paymentLogs) ? db.paymentLogs : [];

  const totalScoreSum = scans.reduce((sum, scan) => sum + Number(scan.score || 0), 0);
  const totalScans = scans.length;
  const totalLinkedins = linkedinLogs.length;
  const totalLinkedinBios = linkedinBioLogs.length;
  const totalLinkedinOutreachs = linkedinOutreachLogs.length;
  const totalCareerCourses = careerCoursesLogs.length;
  const totalElevatorPitches = elevatorPitchLogs.length;
  const totalCareerRoadmaps = careerRoadmapLogs.length;
  const totalVoicePreps = voicePrepLogs.length;
  const totalPortfolioGens = portfolioGenLogs.length;
  const totalLinkedinPosts = linkedinPostLogs.length;
  const totalJobFinders = jobFinderLogs.length;
  const totalPayments = paymentLogs.length;

  const works = Array.isArray(db.works) ? db.works : [];
  const resumes = works.filter(w => w.type === 'resume');
  const coverLetters = works.filter(w => w.type === 'cover-letter');
  const totalResumes = resumes.length;
  const totalCoverLetters = coverLetters.length;

  const userMap = {};
  const localUsers = Array.isArray(db.users) ? db.users : [];
  localUsers.forEach(u => {
    const id = String(u.id || u._id);
    userMap[id] = { name: u.name, email: u.email };
  });

  const scoreDistribution = scans.reduce(
    (acc, scan) => {
      const score = Number(scan.score || 0);
      if (score >= 80) acc.high += 1;
      else if (score >= 60) acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  const keywordTrends = Object.entries(db.keywordCounts || {})
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalScans,
    averageScore: totalScans > 0 ? Number((totalScoreSum / totalScans).toFixed(1)) : 0,
    scoreDistribution,
    keywordTrends,
    totalResumes,
    totalCoverLetters,
    totalLinkedins,
    totalLinkedinBios,
    totalLinkedinOutreachs,
    totalCareerCourses,
    totalElevatorPitches,
    totalCareerRoadmaps,
    totalVoicePreps,
    totalPortfolioGens,
    totalLinkedinPosts,
    totalJobFinders,
    totalPayments,
    recentLinkedins: linkedinLogs.slice(0, 15),
    recentLinkedinBios: linkedinBioLogs.slice(0, 15),
    recentLinkedinOutreachs: linkedinOutreachLogs.slice(0, 15),
    recentCareerCourses: careerCoursesLogs.slice(0, 15),
    recentElevatorPitches: elevatorPitchLogs.slice(0, 15),
    recentCareerRoadmaps: careerRoadmapLogs.slice(0, 15),
    recentVoicePreps: voicePrepLogs.slice(0, 15),
    recentPortfolioGens: portfolioGenLogs.slice(0, 15),
    recentLinkedinPosts: linkedinPostLogs.slice(0, 15),
    recentJobFinders: jobFinderLogs.slice(0, 15),
    recentPayments: paymentLogs.slice(0, 50),
    recentScans: scans.slice(0, 8),
    contactMessages: contacts.slice(0, 8),
    recentFixes: fixes.slice(0, 10),
    recentTailors: tailorLogs.slice(0, 15),
    recentPreps: prepLogs.slice(0, 15),
    recentLogins: loginLogs.slice(0, 20),
    recentResumes: resumes.slice(0, 100).map(r => ({
      id: r.id || r._id,
      title: r.title,
      templateId: r.templateId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: userMap[String(r.userId)] || { name: 'Unknown User', email: 'N/A' }
    })),
    recentCoverLetters: coverLetters.slice(0, 100).map(c => ({
      id: c.id || c._id,
      title: c.title,
      templateId: c.templateId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: userMap[String(c.userId)] || { name: 'Unknown User', email: 'N/A' }
    })),
    totalFixes: fixes.length,
    totalContacts: contacts.length,
    totalTailors: tailorLogs.length,
    totalPreps: prepLogs.length,
    totalLogins: loginLogs.length,
    database: {
      path: dbPath,
      updatedAt: db.meta?.updatedAt || null
    }
  };
}

export async function saveWork({ userId, title, type, templateId, htmlContent, workId = null }) {
  await ensureMongoConnection();
  const cleanUserId = String(userId || '').trim();
  const cleanTitle = String(title || 'Untitled Work').trim();
  
  if (mongoURI && mongoose.connection.readyState === 1) {
    if (workId) {
      try {
        const updated = await Work.findOneAndUpdate(
          { _id: workId, userId: cleanUserId },
          { title: cleanTitle, type, templateId, htmlContent, updatedAt: Date.now() },
          { returnDocument: 'after' }
        );
        if (updated) return updated;
      } catch (err) {
        console.error('MongoDB updateWork error, creating new:', err);
      }
    }
    const newWork = new Work({ userId: cleanUserId, title: cleanTitle, type, templateId, htmlContent });
    await newWork.save();
    return newWork;
  }

  const db = readDb();
  if (!db.works) db.works = [];
  if (workId) {
    const existing = db.works.find(w => w.id === workId && w.userId === cleanUserId);
    if (existing) {
      existing.title = cleanTitle;
      existing.type = type;
      existing.templateId = templateId;
      existing.htmlContent = htmlContent;
      existing.updatedAt = new Date().toISOString();
      writeDb(db);
      return existing;
    }
  }
  const newWork = {
    id: randomUUID(),
    userId: cleanUserId,
    title: cleanTitle,
    type,
    templateId,
    htmlContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.works.unshift(newWork);
  writeDb(db);
  return newWork;
}

export async function getUserWorks(userId) {
  await ensureMongoConnection();
  const cleanUserId = String(userId || '').trim();
  
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await Work.find({ userId: cleanUserId }).sort({ updatedAt: -1 });
  }
  const db = readDb();
  if (!db.works) db.works = [];
  return db.works.filter(w => w.userId === cleanUserId);
}

export async function deleteUserWork(workId, userId) {
  await ensureMongoConnection();
  const cleanUserId = String(userId || '').trim();
  const cleanWorkId = String(workId || '').trim();
  
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await Work.deleteOne({ _id: cleanWorkId, userId: cleanUserId });
  }
  const db = readDb();
  if (!db.works) db.works = [];
  db.works = db.works.filter(w => !(w.id === cleanWorkId && w.userId === cleanUserId));
  writeDb(db);
  return { deletedCount: 1 };
}

export async function updateUserProfile({ userId, name, email, address, avatar = null }) {
  await ensureMongoConnection();
  const cleanUserId = String(userId || '').trim();
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanAddress = String(address || '').trim();
  
  if (mongoURI && mongoose.connection.readyState === 1) {
    const user = await User.findById(cleanUserId);
    if (!user) throw new Error('User not found');
    user.name = cleanName;
    user.email = cleanEmail;
    user.address = cleanAddress;
    if (avatar !== null) {
      user.avatar = avatar;
    }
    await user.save();
    return user;
  }
  
  const db = readDb();
  if (!db.users) db.users = [];
  const u = db.users.find(x => x.id === cleanUserId || x._id === cleanUserId);
  if (!u) throw new Error('User not found');
  u.name = cleanName;
  u.email = cleanEmail;
  u.address = cleanAddress;
  if (avatar !== null) {
    u.avatar = avatar;
  }
  writeDb(db);
  return u;
}

export async function updateUserPassword(userId, newPasswordHash) {
  await ensureMongoConnection();
  const cleanUserId = String(userId || '').trim();
  
  if (mongoURI && mongoose.connection.readyState === 1) {
    const user = await User.findById(cleanUserId);
    if (!user) throw new Error('User not found');
    user.password = newPasswordHash;
    user.isGoogleUser = false;
    await user.save();
    return user;
  }
  
  const db = readDb();
  if (!db.users) db.users = [];
  const u = db.users.find(x => x.id === cleanUserId || x._id === cleanUserId);
  if (!u) throw new Error('User not found');
  u.password = newPasswordHash;
  u.isGoogleUser = false;
  writeDb(db);
  return u;
}

// ─── USAGE LIMIT HELPERS ──────────────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

/**
 * Check if userId may use `feature`, and if so increment their count.
 * Returns { allowed, used, limit, remaining }.
 * Paid users always return allowed=true with remaining=999.
 */
export async function checkAndIncrementUsage(userId, feature) {
  // Usage limits are currently disabled for all features.
  return { allowed: true, used: 0, limit: 0, remaining: 999 };
}

/**
 * Return today's usage counts for all features for a user (for displaying in UI).
 */
export async function getUserUsageToday(userId) {
  const result = {};
  for (const feature of Object.keys(FREE_DAILY_LIMITS)) {
    result[feature] = { limit: 0, used: 0, remaining: 999 };
  }
  return result;
}

export async function findUserById(userId) {
  await ensureMongoConnection();
  const searchId = String(userId || '').trim();
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await User.findById(searchId);
  }
  const db = readDb();
  if (!db.users) db.users = [];
  return db.users.find(u => u.id === searchId || u._id === searchId) || null;
}

export async function saveUserResetToken(email, token, expiresMs) {
  await ensureMongoConnection();
  const searchEmail = String(email || '').trim().toLowerCase();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: searchEmail });
    if (!user) throw new Error('User not found');
    user.resetPasswordToken = token || '';
    user.resetPasswordExpires = (expiresMs != null && expiresMs > 0) ? new Date(expiresMs) : null;
    await user.save();
    return user;
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.users) db.users = [];
  const u = db.users.find(x => x.email === searchEmail);
  if (!u) throw new Error('User not found');
  u.resetPasswordToken = token || '';
  u.resetPasswordExpires = (expiresMs != null && expiresMs > 0) ? new Date(expiresMs).toISOString() : null;
  writeDb(db);
  return u;
}

export async function getAutoApplyAccessList() {
  await ensureMongoConnection();
  if (mongoURI && mongoose.connection.readyState === 1) {
    const list = await AutoApplyAccess.find().sort({ grantedAt: -1 });
    return list.map(e => ({ email: e.email, grantedAt: e.grantedAt }));
  }
  const db = readDb();
  return (db.autoApplyAccess || []);
}

export async function grantAutoApplyAccess(email) {
  await ensureMongoConnection();
  const clean = String(email || '').trim().toLowerCase();
  if (!clean) throw new Error('Email is required');
  if (mongoURI && mongoose.connection.readyState === 1) {
    const existing = await AutoApplyAccess.findOne({ email: clean });
    if (existing) return existing;
    const entry = new AutoApplyAccess({ email: clean });
    await entry.save();
    return entry;
  }
  const db = readDb();
  if (!db.autoApplyAccess) db.autoApplyAccess = [];
  if (db.autoApplyAccess.find(x => x.email === clean)) return;
  db.autoApplyAccess.unshift({ email: clean, grantedAt: new Date().toISOString() });
  writeDb(db);
}

export async function revokeAutoApplyAccess(email) {
  await ensureMongoConnection();
  const clean = String(email || '').trim().toLowerCase();
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await AutoApplyAccess.deleteOne({ email: clean });
  }
  const db = readDb();
  db.autoApplyAccess = (db.autoApplyAccess || []).filter(x => x.email !== clean);
  writeDb(db);
}

export async function hasAutoApplyAccess(email) {
  await ensureMongoConnection();
  const clean = String(email || '').trim().toLowerCase();
  if (mongoURI && mongoose.connection.readyState === 1) {
    const found = await AutoApplyAccess.findOne({ email: clean });
    return !!found;
  }
  const db = readDb();
  return (db.autoApplyAccess || []).some(x => x.email === clean);
}

export async function findUserByResetToken(token) {
  await ensureMongoConnection();
  const searchToken = String(token || '').trim();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    return await User.findOne({
      resetPasswordToken: searchToken,
      resetPasswordExpires: { $gt: new Date() }
    });
  }

  // 2. Local JSON DB Fallback
  const db = readDb();
  if (!db.users) db.users = [];
  const u = db.users.find(x => x.resetPasswordToken === searchToken);
  if (!u) return null;
  
  // Check expiry
  const expires = new Date(u.resetPasswordExpires).getTime();
  if (expires < Date.now()) return null;
  
  return u;
}

