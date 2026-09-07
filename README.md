# 🍷 SoftYes — Private Date Proposals for One Person

**SoftYes** is a luxury multi-user web app built for creating private date proposals. Designed with a night-out luxury aesthetic (espresso tones, candlelight warmth, molten champagne gold, and cinematic photography), creators can customize proposal stories, set custom fake fee amounts, share private `/p/:slug` links, and view responses in a dark studio dashboard.

---

## ✨ Features

- 🍷 **Night-Out Luxury Aesthetic**: Deep espresso (`#0f0d0e`), candlelight gold accents (`#e5c158`), subtle film grain, and editorial serif headlines (*Playfair Display* / *Cormorant Garamond*).
- 🎬 **6-Scene Cinematic Story Experience (`/p/:slug`)**:
  1. **The Ask**: Full-bleed photo, customizable question, gold YES pill & arc-slip ghost NO button.
  2. **The Flinch**: Dark room candle flame, "You actually said yes."
  3. **When**: Custom calendar & time selector (12:00 - 22:30).
  4. **The Table**: High-end photography mood cards (Late Dinner, Cocktails & Talk, Rooftop & Walk, Sweets & Midnight).
  5. **The Note**: Dark paper letter with custom P.S. note & recipient note box.
  6. **Private Reservation Ticket**: Creator-set fake amount ($499, $150, etc.), theatrical line items, decline joke & date recap.
- 🎨 **Creator Studio & Split-View Editor**:
  - Home: Poster gallery of active proposal campaigns (views count, accepts count, status tags).
  - Split-view editor: Form fields on the left with phone-sized live preview on the right.
  - In-app notification bell with unread badge counter.
- 🔊 **Synthesized Web Audio**: Built-in sound effects (pops, boing evasion, celebration chimes) with top-right sound toggle.
- 📁 **Database**: Supports PostgreSQL (`DATABASE_URL`) with automatic fallback to SQLite/local JSON storage.

---

## 🔑 Pre-Seeded Demo Account

Log in immediately with the pre-seeded demo account:

- **Email**: `kyle@example.com`
- **Password**: `password123`
- **Demo Story Link**: `http://localhost:5173/p/kyle-asks-maya`

---

## 🛠️ Environment Variables

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

## ☁️ Deployment on Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repository ([`https://github.com/Leny848/love-shi.git`](https://github.com/Leny848/love-shi.git)) to Vercel.
