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

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

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

export async function createUser({ email, name, password }) {
  await ensureMongoConnection();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();

  // 1. MongoDB Mode
  if (mongoURI && mongoose.connection.readyState === 1) {
    const newUser = new User({
      email: cleanEmail,
      name: cleanName,
      password
    });
    await newUser.save();
    return {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
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
      
      const totalScans = await Scan.countDocuments();
      const totalContacts = await Contact.countDocuments();
      const totalFixes = await Fix.countDocuments();
      const totalTailors = await TailorLog.countDocuments();
      const totalPreps = await PrepLog.countDocuments();
      const totalLogins = await LoginLog.countDocuments();
      
      const totalScoreSum = scans.reduce((sum, scan) => sum + Number(scan.score || 0), 0);
      const averageScore = totalScans > 0 ? Number((totalScoreSum / Math.min(totalScans, 100)).toFixed(1)) : 0;
      
      const scoreDistAggregate = await Scan.aggregate([
        {
          $group: {
            _id: null,
            high: { $sum: { $cond: [{ $gte: ["$score", 8] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $and: [{ $gte: ["$score", 6] }, { $lt: ["$score", 8] }] }, 1, 0] } },
            low: { $sum: { $cond: [{ $lt: ["$score", 6] }, 1, 0] } }
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

      return {
        totalScans,
        averageScore,
        scoreDistribution,
        keywordTrends,
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
  const totalScoreSum = scans.reduce((sum, scan) => sum + Number(scan.score || 0), 0);
  const totalScans = scans.length;

  const scoreDistribution = scans.reduce(
    (acc, scan) => {
      const score = Number(scan.score || 0);
      if (score >= 8) acc.high += 1;
      else if (score >= 6) acc.medium += 1;
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
    recentScans: scans.slice(0, 8),
    contactMessages: contacts.slice(0, 8),
    recentFixes: fixes.slice(0, 10),
    recentTailors: tailorLogs.slice(0, 15),
    recentPreps: prepLogs.slice(0, 15),
    recentLogins: loginLogs.slice(0, 20),
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
