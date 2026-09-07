# 🌸 Date Invitation Web App

A playful, interactive, multi-step date invitation web application designed with a soft blush pink aesthetic, playful animations, a runaway "No" button, and a fake $499 payment punchline.

---

## ⚡ Quick Customization (In 30 Seconds)

All text, images, times, food options, and joke copy are centralized in a single configuration file:

📁 **`src/config.js`**

Open `src/config.js` to change any aspect of the app.

---

### 1. 🐶 How to Replace the Pug Photo

1. Open `src/config.js`.
2. Locate `photoUrl`:
   ```javascript
   photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
   ```
3. Replace the URL with your own image URL (or place an image inside the `public/` directory, e.g., `/my-photo.jpg`, and set `photoUrl: "/my-photo.jpg"`).

---

### 2. ✏️ How to Change the Name & Copy

Inside `src/config.js`, you can modify all text strings:

```javascript
export const CONFIG = {
  // Proposal Screen
  proposalTitle: "Will you go on a date with me?",
  yesBtnText: "YES ♥",
  noBtnText: "no",

  // Shock Screen
  shockTitle: "WAIT YOU ACTUALLY SAID YES??",
  shockSubtext: "I was so ready for you to say no",

  // Confirmation & Pickup Text
  getPickupText: (time) => `glad you didn't say no. be ready by ${time || "6:00 PM"}, I'm coming to get you 🚗`,
  psNote: "normal people text. I made a website on Replit, during lunch, for you. no big deal.",

  // Fake Paywall Punchline
  price: "$499",
  punchlineHeadline: "card declined (good).",
  getPunchlineSubtext: (time) => `see you at ${time || "6:00 PM"}. don’t be late.`,
};
```

---

### 3. 🚀 How to Deploy on Replit

1. Create a new Repl on **[Replit](https://replit.com)**:
   - Select **Vite (React)** or **React** template.
2. Upload/Push all files from this project into your Repl repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Click **Deploy** in the top right of Replit (or use static site hosting) to share your live website link!

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
```
