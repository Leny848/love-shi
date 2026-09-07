import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const isVercel = process.env.VERCEL === '1';
const databaseUrl = process.env.DATABASE_URL;

let dbClient = null;
let dbType = 'sqlite';

// Persistent fallback JSON file for serverless environments when DATABASE_URL is not set
const jsonDbPath = isVercel
  ? '/tmp/datesite_backup.json'
  : path.join(process.cwd(), 'data', 'datesite_backup.json');

// Global memory store across lambda hot invocations
if (!global.datesiteMemoryStore) {
  global.datesiteMemoryStore = {
    users: [],
    proposals: [],
    responses: [],
    notifications: []
  };
}

// Load JSON backup if exists
function loadJsonBackup() {
  try {
    if (fs.existsSync(jsonDbPath)) {
      const data = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
      if (data.proposals && Array.isArray(data.proposals)) {
        global.datesiteMemoryStore = data;
      }
    }
  } catch (e) {
    console.error('Failed to load JSON backup:', e);
  }
}

// Save JSON backup
function saveJsonBackup() {
  try {
    const dir = path.dirname(jsonDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(jsonDbPath, JSON.stringify(global.datesiteMemoryStore, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save JSON backup:', e);
  }
}

loadJsonBackup();

// Initialize Database Connection
if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  dbType = 'postgres';
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  dbClient = pool;
} else {
  dbType = 'sqlite';
  const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'datesite.db');
  dbClient = new Database(dbPath);
  dbClient.pragma('journal_mode = WAL');
}

// Helper to run queries abstraction across SQLite & Postgres
export async function initDb() {
  if (dbType === 'postgres') {
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        recipient_nickname TEXT,
        photo_url TEXT,
        fake_amount TEXT DEFAULT '499',
        pickup_time TEXT DEFAULT '6:00 PM',
        food_options TEXT,
        ps_note TEXT,
        punchline_text TEXT,
        status TEXT DEFAULT 'live',
        views_count INTEGER DEFAULT 0,
        accepts_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
        chosen_date TEXT,
        chosen_time TEXT,
        chosen_food TEXT,
        recipient_message TEXT,
        accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await seedDemoData();
  } else {
    // SQLite
    dbClient.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        recipient_nickname TEXT,
        photo_url TEXT,
        fake_amount TEXT DEFAULT '499',
        pickup_time TEXT DEFAULT '6:00 PM',
        food_options TEXT,
        ps_note TEXT,
        punchline_text TEXT,
        status TEXT DEFAULT 'live',
        views_count INTEGER DEFAULT 0,
        accepts_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposal_id INTEGER,
        chosen_date TEXT,
        chosen_time TEXT,
        chosen_food TEXT,
        recipient_message TEXT,
        accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        proposal_id INTEGER,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await seedDemoData();
    await restoreFromMemoryBackup();
  }
}

// Restore user-created proposals from global memory/JSON backup into SQLite if SQLite table was reset
async function restoreFromMemoryBackup() {
  if (dbType !== 'sqlite') return;
  try {
    for (const u of global.datesiteMemoryStore.users) {
      const existing = dbClient.prepare('SELECT * FROM users WHERE email = ?').get(u.email);
      if (!existing) {
        dbClient.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(u.id, u.name, u.email, u.password_hash);
      }
    }
    for (const p of global.datesiteMemoryStore.proposals) {
      const existing = dbClient.prepare('SELECT * FROM proposals WHERE LOWER(slug) = LOWER(?)').get(p.slug);
      if (!existing) {
        const foodOptionsStr = typeof p.food_options === 'string' ? p.food_options : JSON.stringify(p.food_options);
        dbClient.prepare(
          `INSERT INTO proposals (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          p.user_id, p.title, p.slug, p.recipient_nickname, p.photo_url, p.fake_amount, p.pickup_time, foodOptionsStr, p.ps_note, p.punchline_text, p.status || 'live', p.views_count || 0, p.accepts_count || 0
        );
      }
    }
  } catch (e) {
    console.error('Failed restoring from backup:', e);
  }
}

// Seed initial demo user and proposal if DB is empty
async function seedDemoData() {
  const existingUser = await getUserByEmail('kyle@example.com');
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    let userId;
    if (dbType === 'postgres') {
      const res = await dbClient.query(
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
        ['Kyle', 'kyle@example.com', passwordHash]
      );
      userId = res.rows[0].id;
    } else {
      const stmt = dbClient.prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`);
      const info = stmt.run('Kyle', 'kyle@example.com', passwordHash);
      userId = info.lastInsertRowid;
    }

    const defaultFoodOptions = JSON.stringify([
      { id: 'pizza', emoji: '🍕', label: 'Artisan Pizza', subtitle: 'Wood-fired Margherita & crisp crust', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800' },
      { id: 'sushi', emoji: '🍣', label: 'Fresh Sushi', subtitle: 'Salmon, tuna & artisanal rolls', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800' },
      { id: 'burgers', emoji: '🍔', label: 'Gourmet Burgers', subtitle: 'Juicy Wagyu beef & golden fries', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
      { id: 'pasta', emoji: '🍝', label: 'Italian Pasta', subtitle: 'Truffle tagliatelle & fresh parmesan', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281313?auto=format&fit=crop&q=80&w=800' },
      { id: 'tacos', emoji: '🌮', label: 'Street Tacos', subtitle: 'Corn tortillas, guacamole & lime', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800' },
      { id: 'ramen', emoji: '🍜', label: 'Tonkotsu Ramen', subtitle: 'Rich broth, soft egg & chashu pork', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800' }
    ]);

    const demoProp = {
      user_id: userId,
      title: 'Will you go on a date with me?',
      slug: 'kyle-asks-maya',
      recipient_nickname: 'Maya',
      photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      fake_amount: '499',
      pickup_time: '6:00 PM',
      food_options: defaultFoodOptions,
      ps_note: 'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
      punchline_text: 'card declined (good). see you at 6:00 PM. don’t be late.',
      status: 'live',
      views_count: 3,
      accepts_count: 1
    };

    if (dbType === 'postgres') {
      await dbClient.query(
        `INSERT INTO proposals (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          demoProp.title,
          demoProp.slug,
          demoProp.recipient_nickname,
          demoProp.photo_url,
          demoProp.fake_amount,
          demoProp.pickup_time,
          demoProp.food_options,
          demoProp.ps_note,
          demoProp.punchline_text,
          demoProp.status,
          demoProp.views_count,
          demoProp.accepts_count
        ]
      );
    } else {
      const stmt = dbClient.prepare(
        `INSERT INTO proposals (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        userId,
        demoProp.title,
        demoProp.slug,
        demoProp.recipient_nickname,
        demoProp.photo_url,
        demoProp.fake_amount,
        demoProp.pickup_time,
        demoProp.food_options,
        demoProp.ps_note,
        demoProp.punchline_text,
        demoProp.status,
        demoProp.views_count,
        demoProp.accepts_count
      );
    }

    global.datesiteMemoryStore.users.push({ id: userId, name: 'Kyle', email: 'kyle@example.com', password_hash: passwordHash });
    global.datesiteMemoryStore.proposals.push(demoProp);
    saveJsonBackup();
  }
}

// User methods
export async function createUser(name, email, passwordHash) {
  let userObj;
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, passwordHash]
    );
    userObj = res.rows[0];
  } else {
    const stmt = dbClient.prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`);
    const info = stmt.run(name, email, passwordHash);
    userObj = { id: info.lastInsertRowid, name, email, password_hash: passwordHash };
  }

  global.datesiteMemoryStore.users.push({ id: userObj.id, name, email, password_hash: passwordHash });
  saveJsonBackup();
  return userObj;
}

export async function getUserByEmail(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`);
    const user = stmt.get(cleanEmail);
    if (user) return user;
    return global.datesiteMemoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
  }
}

export async function getUserById(id) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT id, name, email, created_at FROM users WHERE id = $1`, [id]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT id, name, email, created_at FROM users WHERE id = ?`);
    const user = stmt.get(id);
    if (user) return user;
    const found = global.datesiteMemoryStore.users.find(u => u.id == id);
    if (found) return { id: found.id, name: found.name, email: found.email };
    return null;
  }
}

// Proposal methods
export async function getProposalsByUserId(userId) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `SELECT * FROM proposals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM proposals WHERE user_id = ? ORDER BY created_at DESC`);
    const list = stmt.all(userId);
    if (list && list.length > 0) return list;
    return global.datesiteMemoryStore.proposals.filter(p => p.user_id == userId);
  }
}

export async function getProposalBySlug(rawSlug) {
  if (!rawSlug) return null;
  const cleanSlug = rawSlug.toLowerCase().replace(/^\/p\//, '').split('/')[0].split('?')[0].trim();

  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM proposals WHERE LOWER(slug) = LOWER($1)`, [cleanSlug]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM proposals WHERE LOWER(slug) = LOWER(?)`);
    const found = stmt.get(cleanSlug);
    if (found) return found;

    // Check global memory backup store
    const memFound = global.datesiteMemoryStore.proposals.find(p => p.slug.toLowerCase() === cleanSlug);
    if (memFound) {
      // Re-insert into SQLite DB for next queries
      try {
        const foodOptionsStr = typeof memFound.food_options === 'string' ? memFound.food_options : JSON.stringify(memFound.food_options);
        dbClient.prepare(
          `INSERT OR REPLACE INTO proposals (id, user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          memFound.id || Date.now(), memFound.user_id, memFound.title, memFound.slug, memFound.recipient_nickname, memFound.photo_url, memFound.fake_amount, memFound.pickup_time, foodOptionsStr, memFound.ps_note, memFound.punchline_text, memFound.status || 'live', memFound.views_count || 0, memFound.accepts_count || 0
        );
      } catch (e) {}
      return memFound;
    }
    return null;
  }
}

export async function getProposalById(id) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM proposals WHERE id = $1`, [id]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM proposals WHERE id = ?`);
    const found = stmt.get(id);
    if (found) return found;
    return global.datesiteMemoryStore.proposals.find(p => p.id == id);
  }
}

export async function incrementProposalViews(id) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE proposals SET views_count = views_count + 1 WHERE id = $1`, [id]);
  } else {
    try {
      const stmt = dbClient.prepare(`UPDATE proposals SET views_count = views_count + 1 WHERE id = ?`);
      stmt.run(id);
    } catch (e) {}
    const p = global.datesiteMemoryStore.proposals.find(item => item.id == id);
    if (p) {
      p.views_count = (p.views_count || 0) + 1;
      saveJsonBackup();
    }
  }
}

export async function incrementProposalAccepts(id) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE proposals SET accepts_count = accepts_count + 1 WHERE id = $1`, [id]);
  } else {
    try {
      const stmt = dbClient.prepare(`UPDATE proposals SET accepts_count = accepts_count + 1 WHERE id = ?`);
      stmt.run(id);
    } catch (e) {}
    const p = global.datesiteMemoryStore.proposals.find(item => item.id == id);
    if (p) {
      p.accepts_count = (p.accepts_count || 0) + 1;
      saveJsonBackup();
    }
  }
}

export async function createProposal(userId, proposalData) {
  const {
    title,
    slug,
    recipient_nickname,
    photo_url,
    fake_amount,
    pickup_time,
    food_options,
    ps_note,
    punchline_text,
    status
  } = proposalData;

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  const foodOptionsStr = typeof food_options === 'string' ? food_options : JSON.stringify(food_options);

  let newProp;
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO proposals 
       (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId,
        title || 'Will you go on a date with me?',
        cleanSlug,
        recipient_nickname || '',
        photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
        fake_amount || '499',
        pickup_time || '6:00 PM',
        foodOptionsStr,
        ps_note || 'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
        punchline_text || `card declined (good). see you at ${pickup_time || '6:00 PM'}. don’t be late.`,
        status || 'live'
      ]
    );
    newProp = res.rows[0];
  } else {
    const stmt = dbClient.prepare(
      `INSERT INTO proposals 
       (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      userId,
      title || 'Will you go on a date with me?',
      cleanSlug,
      recipient_nickname || '',
      photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      fake_amount || '499',
      pickup_time || '6:00 PM',
      foodOptionsStr,
      ps_note || 'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
      punchline_text || `card declined (good). see you at ${pickup_time || '6:00 PM'}. don’t be late.`,
      status || 'live'
    );
    newProp = {
      id: info.lastInsertRowid,
      user_id: userId,
      title: title || 'Will you go on a date with me?',
      slug: cleanSlug,
      recipient_nickname: recipient_nickname || '',
      photo_url: photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      fake_amount: fake_amount || '499',
      pickup_time: pickup_time || '6:00 PM',
      food_options: foodOptionsStr,
      ps_note: ps_note || 'normal people text.',
      punchline_text: punchline_text || `card declined (good). see you at ${pickup_time || '6:00 PM'}. don’t be late.`,
      status: status || 'live',
      views_count: 0,
      accepts_count: 0
    };
  }

  global.datesiteMemoryStore.proposals.push(newProp);
  saveJsonBackup();
  return newProp;
}

export async function updateProposal(id, userId, proposalData) {
  const existing = await getProposalById(id);
  if (!existing || existing.user_id != userId) return null;

  const {
    title,
    slug,
    recipient_nickname,
    photo_url,
    fake_amount,
    pickup_time,
    food_options,
    ps_note,
    punchline_text,
    status
  } = proposalData;

  const cleanSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : existing.slug;
  const foodOptionsStr = typeof food_options === 'string' ? food_options : JSON.stringify(food_options);

  let updatedProp;
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `UPDATE proposals SET
        title = $1,
        slug = $2,
        recipient_nickname = $3,
        photo_url = $4,
        fake_amount = $5,
        pickup_time = $6,
        food_options = $7,
        ps_note = $8,
        punchline_text = $9,
        status = $10
       WHERE id = $11 AND user_id = $12 RETURNING *`,
      [
        title || existing.title,
        cleanSlug,
        recipient_nickname ?? existing.recipient_nickname,
        photo_url || existing.photo_url,
        fake_amount || existing.fake_amount,
        pickup_time || existing.pickup_time,
        foodOptionsStr || existing.food_options,
        ps_note || existing.ps_note,
        punchline_text || existing.punchline_text,
        status || existing.status,
        id,
        userId
      ]
    );
    updatedProp = res.rows[0];
  } else {
    const stmt = dbClient.prepare(
      `UPDATE proposals SET
        title = ?,
        slug = ?,
        recipient_nickname = ?,
        photo_url = ?,
        fake_amount = ?,
        pickup_time = ?,
        food_options = ?,
        ps_note = ?,
        punchline_text = ?,
        status = ?
       WHERE id = ? AND user_id = ?`
    );
    stmt.run(
      title || existing.title,
      cleanSlug,
      recipient_nickname ?? existing.recipient_nickname,
      photo_url || existing.photo_url,
      fake_amount || existing.fake_amount,
      pickup_time || existing.pickup_time,
      foodOptionsStr || existing.food_options,
      ps_note || existing.ps_note,
      punchline_text || existing.punchline_text,
      status || existing.status,
      id,
      userId
    );
    updatedProp = await getProposalById(id);
  }

  const idx = global.datesiteMemoryStore.proposals.findIndex(p => p.id == id);
  if (idx !== -1) {
    global.datesiteMemoryStore.proposals[idx] = { ...global.datesiteMemoryStore.proposals[idx], ...updatedProp };
    saveJsonBackup();
  }

  return updatedProp;
}

export async function deleteProposal(id, userId) {
  if (dbType === 'postgres') {
    await dbClient.query(`DELETE FROM proposals WHERE id = $1 AND user_id = $2`, [id, userId]);
  } else {
    const stmt = dbClient.prepare(`DELETE FROM proposals WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }
  global.datesiteMemoryStore.proposals = global.datesiteMemoryStore.proposals.filter(p => p.id != id);
  saveJsonBackup();
}

// Response & Notification methods
export async function createResponse(proposalId, chosenDate, chosenTime, chosenFood, recipientMessage) {
  let respObj;
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO responses (proposal_id, chosen_date, chosen_time, chosen_food, recipient_message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [proposalId, chosenDate, chosenTime, chosenFood, recipientMessage || '']
    );
    respObj = res.rows[0];
  } else {
    const stmt = dbClient.prepare(
      `INSERT INTO responses (proposal_id, chosen_date, chosen_time, chosen_food, recipient_message)
       VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(proposalId, chosenDate, chosenTime, chosenFood, recipientMessage || '');
    respObj = { id: info.lastInsertRowid, proposal_id: proposalId, chosen_date: chosenDate, chosen_time: chosenTime, chosen_food: chosenFood, recipient_message: recipientMessage };
  }

  global.datesiteMemoryStore.responses.push(respObj);
  saveJsonBackup();
  return respObj;
}

export async function getResponsesByProposalId(proposalId) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `SELECT * FROM responses WHERE proposal_id = $1 ORDER BY accepted_at DESC`,
      [proposalId]
    );
    return res.rows;
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM responses WHERE proposal_id = ? ORDER BY accepted_at DESC`);
    const list = stmt.all(proposalId);
    if (list && list.length > 0) return list;
    return global.datesiteMemoryStore.responses.filter(r => r.proposal_id == proposalId);
  }
}

export async function createNotification(userId, proposalId, message) {
  let notifObj;
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO notifications (user_id, proposal_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [userId, proposalId, message]
    );
    notifObj = res.rows[0];
  } else {
    const stmt = dbClient.prepare(`INSERT INTO notifications (user_id, proposal_id, message) VALUES (?, ?, ?)`);
    const info = stmt.run(userId, proposalId, message);
    notifObj = { id: info.lastInsertRowid, user_id: userId, proposal_id: proposalId, message, is_read: 0 };
  }

  global.datesiteMemoryStore.notifications.push(notifObj);
  saveJsonBackup();
  return notifObj;
}

export async function getNotificationsByUserId(userId) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return res.rows;
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`);
    const list = stmt.all(userId);
    if (list && list.length > 0) return list;
    return global.datesiteMemoryStore.notifications.filter(n => n.user_id == userId);
  }
}

export async function markNotificationsRead(userId) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE notifications SET is_read = 1 WHERE user_id = $1`, [userId]);
  } else {
    const stmt = dbClient.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`);
    stmt.run(userId);
  }
  global.datesiteMemoryStore.notifications.forEach(n => {
    if (n.user_id == userId) n.is_read = 1;
  });
  saveJsonBackup();
}
