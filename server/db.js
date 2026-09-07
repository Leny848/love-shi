import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const isVercel = process.env.VERCEL === '1';
const databaseUrl = process.env.DATABASE_URL;

let dbClient = null;
let dbType = 'sqlite';

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
      { id: 'pizza', emoji: '🍕', label: 'Pizza' },
      { id: 'sushi', emoji: '🍣', label: 'Sushi' },
      { id: 'burgers', emoji: '🍔', label: 'Burgers' },
      { id: 'pasta', emoji: '🍝', label: 'Pasta' },
      { id: 'tacos', emoji: '🌮', label: 'Tacos' },
      { id: 'ramen', emoji: '🍜', label: 'Ramen' }
    ]);

    if (dbType === 'postgres') {
      await dbClient.query(
        `INSERT INTO proposals (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          'Will you go on a date with me?',
          'kyle-asks-maya',
          'Maya',
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
          '499',
          '6:00 PM',
          defaultFoodOptions,
          'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
          'card declined (good). see you at 6:00 PM. don’t be late.',
          'live',
          3,
          1
        ]
      );
    } else {
      const stmt = dbClient.prepare(
        `INSERT INTO proposals (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status, views_count, accepts_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        userId,
        'Will you go on a date with me?',
        'kyle-asks-maya',
        'Maya',
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
        '499',
        '6:00 PM',
        defaultFoodOptions,
        'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
        'card declined (good). see you at 6:00 PM. don’t be late.',
        'live',
        3,
        1
      );
    }
  }
}

// User methods
export async function createUser(name, email, passwordHash) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, passwordHash]
    );
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`);
    const info = stmt.run(name, email, passwordHash);
    return { id: info.lastInsertRowid, name, email };
  }
}

export async function getUserByEmail(email) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM users WHERE email = ?`);
    return stmt.get(email);
  }
}

export async function getUserById(id) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT id, name, email, created_at FROM users WHERE id = $1`, [id]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT id, name, email, created_at FROM users WHERE id = ?`);
    return stmt.get(id);
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
    return stmt.all(userId);
  }
}

export async function getProposalBySlug(slug) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM proposals WHERE slug = $1`, [slug]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM proposals WHERE slug = ?`);
    return stmt.get(slug);
  }
}

export async function getProposalById(id) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(`SELECT * FROM proposals WHERE id = $1`, [id]);
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`SELECT * FROM proposals WHERE id = ?`);
    return stmt.get(id);
  }
}

export async function incrementProposalViews(id) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE proposals SET views_count = views_count + 1 WHERE id = $1`, [id]);
  } else {
    const stmt = dbClient.prepare(`UPDATE proposals SET views_count = views_count + 1 WHERE id = ?`);
    stmt.run(id);
  }
}

export async function incrementProposalAccepts(id) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE proposals SET accepts_count = accepts_count + 1 WHERE id = $1`, [id]);
  } else {
    const stmt = dbClient.prepare(`UPDATE proposals SET accepts_count = accepts_count + 1 WHERE id = ?`);
    stmt.run(id);
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

  const foodOptionsStr = typeof food_options === 'string' ? food_options : JSON.stringify(food_options);

  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO proposals 
       (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId,
        title || 'Will you go on a date with me?',
        slug,
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
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(
      `INSERT INTO proposals 
       (user_id, title, slug, recipient_nickname, photo_url, fake_amount, pickup_time, food_options, ps_note, punchline_text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      userId,
      title || 'Will you go on a date with me?',
      slug,
      recipient_nickname || '',
      photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      fake_amount || '499',
      pickup_time || '6:00 PM',
      foodOptionsStr,
      ps_note || 'normal people text. I made a website on Replit, during lunch, for you. no big deal.',
      punchline_text || `card declined (good). see you at ${pickup_time || '6:00 PM'}. don’t be late.`,
      status || 'live'
    );
    return getProposalById(info.lastInsertRowid);
  }
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

  const foodOptionsStr = typeof food_options === 'string' ? food_options : JSON.stringify(food_options);

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
        slug || existing.slug,
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
    return res.rows[0];
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
      slug || existing.slug,
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
    return getProposalById(id);
  }
}

export async function deleteProposal(id, userId) {
  if (dbType === 'postgres') {
    await dbClient.query(`DELETE FROM proposals WHERE id = $1 AND user_id = $2`, [id, userId]);
  } else {
    const stmt = dbClient.prepare(`DELETE FROM proposals WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }
}

// Response & Notification methods
export async function createResponse(proposalId, chosenDate, chosenTime, chosenFood, recipientMessage) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO responses (proposal_id, chosen_date, chosen_time, chosen_food, recipient_message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [proposalId, chosenDate, chosenTime, chosenFood, recipientMessage || '']
    );
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(
      `INSERT INTO responses (proposal_id, chosen_date, chosen_time, chosen_food, recipient_message)
       VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(proposalId, chosenDate, chosenTime, chosenFood, recipientMessage || '');
    return { id: info.lastInsertRowid, proposal_id: proposalId, chosen_date: chosenDate, chosen_time: chosenTime, chosen_food: chosenFood, recipient_message: recipientMessage };
  }
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
    return stmt.all(proposalId);
  }
}

export async function createNotification(userId, proposalId, message) {
  if (dbType === 'postgres') {
    const res = await dbClient.query(
      `INSERT INTO notifications (user_id, proposal_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [userId, proposalId, message]
    );
    return res.rows[0];
  } else {
    const stmt = dbClient.prepare(`INSERT INTO notifications (user_id, proposal_id, message) VALUES (?, ?, ?)`);
    const info = stmt.run(userId, proposalId, message);
    return { id: info.lastInsertRowid, user_id: userId, proposal_id: proposalId, message, is_read: 0 };
  }
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
    return stmt.all(userId);
  }
}

export async function markNotificationsRead(userId) {
  if (dbType === 'postgres') {
    await dbClient.query(`UPDATE notifications SET is_read = 1 WHERE user_id = $1`, [userId]);
  } else {
    const stmt = dbClient.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`);
    stmt.run(userId);
  }
}
