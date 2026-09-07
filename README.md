# 🌸 DateSite — Multi-User Date Proposal Platform

**DateSite** is a playful, multi-user web platform where users can sign up, build personalized date-invitation links with custom fake payment fees, share a unique public link (`/p/:slug`), and receive live dashboard notifications when someone accepts!

---

## ⚡ Key Features

- 🔑 **User Auth**: Email + Password authentication with JWT sessions.
- 🎨 **Custom Proposals**: Set custom titles, recipient nicknames, pug photo URLs, pickup line times, custom fake fee amounts ($20, $499, etc.), and P.S. notes.
- 🔗 **Unique Share Links**: Public `/p/:slug` invitation pages that require no login for recipients.
- 💌 **Acceptance & Messages**: Recipient can pick date, time, food vibe, and leave an optional message.
- 📊 **Creator Dashboard**: View live stats (views, accepts), responses list, notification badges, status toggles (Live/Draft/Paused), and one-click copy links.
- 🔊 **Web Audio Synthesizer**: Built-in sound effects (pops, runaway boing, celebration chimes) with top-right sound toggle.
- 📁 **Database**: Supports PostgreSQL (`DATABASE_URL`) with automatic fallback to SQLite/local storage.

---

## 🚀 Pre-Seeded Demo Account

You can sign in immediately using the pre-seeded demo account:

- **Email**: `kyle@example.com`
- **Password**: `password123`
- **Demo Link**: `http://localhost:5173/p/kyle-asks-maya`

---

## 🛠️ Environment Variables

Create a `.env` file or configure in your deployment dashboard:

```env
# Optional: PostgreSQL Connection String (Vercel Postgres / Supabase / Neon)
# Defaults to SQLite if not provided
DATABASE_URL="postgres://user:password@host:5432/dbname"

# Secret used to sign JWT authentication tokens
JWT_SECRET="datesite_super_secret_jwt_key_2026"
```

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Express API server & Vite development frontend
npm run dev
```

---

## ☁️ Deployment

### Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repository ([`https://github.com/Leny848/love-shi.git`](https://github.com/Leny848/love-shi.git)) to Vercel. Vercel automatically deploys the frontend and serverless API endpoints via `vercel.json`!
