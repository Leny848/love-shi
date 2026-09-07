/**
 * -----------------------------------------------------------------------------
 * 💖 DATE INVITATION CONFIGURATION 💖
 * -----------------------------------------------------------------------------
 * Personalize your invitation site in 30 seconds!
 * Change any text, images, times, or options below.
 * -----------------------------------------------------------------------------
 */

export const CONFIG = {
  // --- SCREEN 1: PROPOSAL ---
  // Replace photoUrl with your own image link or path (e.g. "/my-photo.png")
  photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
  photoAlt: "Cute pug dressed up and ready for a date",
  proposalTitle: "Will you go on a date with me?",
  yesBtnText: "YES ♥",
  noBtnText: "no",

  // --- SCREEN 2: SHOCK ---
  shockTitle: "WAIT YOU ACTUALLY SAID YES??",
  shockSubtext: "I was so ready for you to say no",
  shockBtnText: "okay okay! →",

  // --- SCREEN 3: SCHEDULE ---
  scheduleTitle: "So… when are you free?",
  scheduleDateLabel: "Pick a Day",
  scheduleTimeLabel: "What Time?",
  scheduleBtnText: "set the date! ♥",
  defaultTime: "6:00 PM",
  
  // Available 30-minute time slots from 12:00 PM to 6:30 PM
  timeSlots: [
    "12:00 PM", "12:30 PM",
    "1:00 PM",  "1:30 PM",
    "2:00 PM",  "2:30 PM",
    "3:00 PM",  "3:30 PM",
    "4:00 PM",  "4:30 PM",
    "5:00 PM",  "5:30 PM",
    "6:00 PM",  "6:30 PM"
  ],

  // --- SCREEN 4: FOOD / VIBE ---
  foodTitle: "What are we feeling?",
  foodSubtitle: "pick your vibe",
  foodOptions: [
    { id: "pizza", emoji: "🍕", label: "Pizza" },
    { id: "sushi", emoji: "🍣", label: "Sushi" },
    { id: "burgers", emoji: "🍔", label: "Burgers" },
    { id: "pasta", emoji: "🍝", label: "Pasta" },
    { id: "tacos", emoji: "🌮", label: "Tacos" },
    { id: "ramen", emoji: "🍜", label: "Ramen" },
  ],

  // --- SCREEN 5: CONFIRMATION LETTER ---
  // Dynamic phrase generator using the selected time
  getPickupText: (time) => `glad you didn't say no. be ready by ${time || "6:00 PM"}, I'm coming to get you 🚗`,
  psNote: "normal people text. I made a website on Replit, during lunch, for you. no big deal.",
  confirmBtnText: "ok I accept 💋",

  // --- SCREEN 6: FAKE PAYWALL PUNCHLINE ---
  paywallHeadline: "one small fee",
  paywallBody: "to confirm your acceptance of this date, please complete the following transaction. totally normal. everyone does this.",
  priceTitle: "Date Agreement™",
  price: "$499",
  priceSubtitle: "one-time fee • non-refundable • absolutely worth it",
  payBtnText: "pay $499 & confirm 💛",
  goBackText: "go back",

  // --- FINAL JOKE / RECAP PUNCHLINE ---
  punchlineHeadline: "card declined (good).",
  getPunchlineSubtext: (time) => `see you at ${time || "6:00 PM"}. don’t be late.`,

  // --- FOOTER ---
  footerText: "built on Replit",
  footerUrl: "https://replit.com",
};
