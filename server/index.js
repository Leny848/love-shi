import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  initDb,
  createUser,
  getUserByEmail,
  getUserById,
  getProposalsByUserId,
  getProposalBySlug,
  getProposalById,
  incrementProposalViews,
  incrementProposalAccepts,
  createProposal,
  updateProposal,
  deleteProposal,
  createResponse,
  getResponsesByProposalId,
  createNotification,
  getNotificationsByUserId,
  markNotificationsRead
} from './db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'datesite_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize DB on server start
let dbReady = false;
async function ensureDb() {
  if (!dbReady) {
    await initDb();
    dbReady = true;
  }
}
app.use(async (req, res, next) => {
  await ensureDb();
  next();
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Rate limiter helper for public response submissions (simple IP memory map)
const ipSubmissionMap = new Map();
function rateLimitSubmit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const lastTime = ipSubmissionMap.get(ip) || 0;
  if (now - lastTime < 5000) { // 5 second rate limit
    return res.status(429).json({ error: 'Please wait a moment before submitting again.' });
  }
  ipSubmissionMap.set(ip, now);
  next();
}

// -----------------------------------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------------------------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = await getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(name.trim(), email.toLowerCase().trim(), passwordHash);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sign up', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in', details: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// PROPOSAL MANAGEMENT ROUTES (PROTECTED)
// -----------------------------------------------------------------------------
app.get('/api/proposals', authenticateToken, async (req, res) => {
  try {
    const proposals = await getProposalsByUserId(req.user.id);
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proposals', details: err.message });
  }
});

app.get('/api/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const proposal = await getProposalById(req.params.id);
    if (!proposal || proposal.user_id != req.user.id) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const responses = await getResponsesByProposalId(proposal.id);
    res.json({ proposal, responses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proposal detail', details: err.message });
  }
});

app.post('/api/proposals', authenticateToken, async (req, res) => {
  try {
    const { title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug is required' });

    // Check slug uniqueness
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const existing = await getProposalBySlug(cleanSlug);
    if (existing) {
      return res.status(400).json({ error: 'This share link slug is already taken. Please pick another unique slug.' });
    }

    const proposal = await createProposal(req.user.id, {
      title,
      slug: cleanSlug,
      recipient_nickname,
      photo_url,
      fake_amount,
      pickup_time,
      food_options,
      ps_note,
      punchline_text,
      status
    });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create proposal', details: err.message });
  }
});

app.put('/api/proposals/:id', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.body;
    if (slug) {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const existing = await getProposalBySlug(cleanSlug);
      if (existing && existing.id != req.params.id) {
        return res.status(400).json({ error: 'This share link slug is already taken by another proposal.' });
      }
      req.body.slug = cleanSlug;
    }

    const proposal = await updateProposal(req.params.id, req.user.id, req.body);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found or access denied' });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update proposal', details: err.message });
  }
});

app.delete('/api/proposals/:id', authenticateToken, async (req, res) => {
  try {
    await deleteProposal(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete proposal', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC PROPOSAL FLOW ROUTES (NO AUTH REQUIRED)
// -----------------------------------------------------------------------------
app.get('/api/p/:slug', async (req, res) => {
  try {
    const proposal = await getProposalBySlug(req.params.slug.toLowerCase());
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (proposal.status === 'paused') {
      return res.status(403).json({ error: 'This date invitation is currently paused by the creator.' });
    }

    // Increment view count asynchronously
    await incrementProposalViews(proposal.id);

    // Fetch creator name for letter
    const creator = await getUserById(proposal.user_id);

    res.json({
      proposal: {
        ...proposal,
        creator_name: creator ? creator.name : 'Your Secret Admirer',
        food_options: typeof proposal.food_options === 'string' ? JSON.parse(proposal.food_options) : proposal.food_options
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load public proposal', details: err.message });
  }
});

app.post('/api/p/:slug/respond', rateLimitSubmit, async (req, res) => {
  try {
    const proposal = await getProposalBySlug(req.params.slug.toLowerCase());
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    const { chosenDate, chosenTime, chosenFood, recipientMessage } = req.body;

    // Save response
    const response = await createResponse(
      proposal.id,
      chosenDate || '',
      chosenTime || proposal.pickup_time || '6:00 PM',
      chosenFood ? (typeof chosenFood === 'object' ? `${chosenFood.emoji || ''} ${chosenFood.label || ''}` : chosenFood) : 'Pizza 🍕',
      recipientMessage || ''
    );

    // Increment accept count
    await incrementProposalAccepts(proposal.id);

    // Create Notification for proposal creator
    const recipientName = proposal.recipient_nickname ? proposal.recipient_nickname : 'Someone';
    const notifMsg = `🎉 ${recipientName} accepted your date proposal! (${chosenDate || 'Upcoming'} at ${chosenTime || '6:00 PM'}, Vibe: ${chosenFood?.label || 'Food'})`;
    await createNotification(proposal.user_id, proposal.id, notifMsg);

    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit response', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// NOTIFICATIONS ROUTES (PROTECTED)
// -----------------------------------------------------------------------------
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await getNotificationsByUserId(req.user.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

app.post('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await markNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications read', details: err.message });
  }
});

export default app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 DateSite Server running on http://localhost:${PORT}`);
  });
}
