import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle2, RotateCcw, Calendar, Clock, Utensils, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONFIG } from '../config';
import { playCelebrate, playPop } from '../utils/sound';

export function Screen6Paywall({ selectedDate, selectedTime, selectedFood, onGoBack, onRestart }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayTime = selectedTime || CONFIG.defaultTime;

  // Format date nicely (e.g. 2026-09-12 -> Saturday, Sep 12)
  const formatDate = (dateStr) => {
    if (!dateStr) return "Upcoming Date";
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handlePay = () => {
    playPop();
    setIsProcessing(true);

    // Fake 1.5s processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      playCelebrate();

      // Final celebratory confetti burst!
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#a855f7', '#eab308', '#ec4899', '#10b981']
      });
    }, 1500);
  };

  const handleCopySummary = () => {
    playPop();
    const dateFormatted = formatDate(selectedDate);
    const vibeText = selectedFood ? `${selectedFood.emoji} ${selectedFood.label}` : 'Pizza 🍕';
    const textToCopy = `🌸 It's official! Date confirmed for ${dateFormatted} at ${displayTime} (Vibe: ${vibeText}). Be ready! 🚗💨`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4 relative z-10"
    >
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          /* INITIAL PAYWALL SCREEN */
          <motion.div
            key="paywall"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow"
          >
            {/* Tiny Card / Envelope Icon */}
            <div className="w-14 h-14 mx-auto mb-4 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-center text-rose-500 shadow-sm">
              <CreditCard className="w-7 h-7" />
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2">
              {CONFIG.paywallHeadline}
            </h1>

            {/* Body */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              {CONFIG.paywallBody}
            </p>

            {/* Inner Box: Price Ticket */}
            <div className="bg-gradient-to-b from-pink-50/80 to-rose-50/40 border border-pink-200/80 rounded-2xl p-5 mb-6 text-center shadow-inner relative overflow-hidden">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-1">
                {CONFIG.priceTitle}
              </div>
              <div className="font-serif text-4xl sm:text-5xl font-extrabold text-slate-900 my-1">
                {CONFIG.price}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {CONFIG.priceSubtitle}
              </div>
            </div>

            {/* Pay Button */}
            <motion.button
              type="button"
              disabled={isProcessing}
              whileHover={!isProcessing ? { scale: 1.03 } : {}}
              whileTap={!isProcessing ? { scale: 0.97 } : {}}
              onClick={handlePay}
              className="w-full py-3.5 px-6 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-base rounded-full shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80 pulse-glow"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing payment...</span>
                </>
              ) : (
                <span>{CONFIG.payBtnText}</span>
              )}
            </motion.button>

            {/* Go back link */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  onGoBack();
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium underline transition-colors cursor-pointer"
              >
                {CONFIG.goBackText}
              </button>
            </div>
          </motion.div>
        ) : (
          /* FINAL PUNCHLINE & RECAP SCREEN */
          <motion.div
            key="punchline"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#fffdfa] border border-emerald-200/80 rounded-3xl p-8 sm:p-10 text-center card-shadow relative overflow-hidden"
          >
            {/* Status Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Punchline Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-2">
              {CONFIG.punchlineHeadline}
            </h1>

            {/* Subtext */}
            <p className="text-slate-700 text-base sm:text-lg font-medium mb-6">
              {CONFIG.getPunchlineSubtext(displayTime)}
            </p>

            {/* Date Details Recap Card */}
            <div className="bg-pink-50/60 border border-pink-200/70 rounded-2xl p-5 mb-6 text-left space-y-3 shadow-inner">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Official Date Recap 📋</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">CONFIRMED</span>
              </div>
              
              <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                <span><strong className="text-slate-900">Date:</strong> {formatDate(selectedDate)}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <span><strong className="text-slate-900">Time:</strong> {displayTime}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                <Utensils className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  <strong className="text-slate-900">Vibe:</strong> {selectedFood?.emoji} {selectedFood?.label || "Pizza"}
                </span>
              </div>
            </div>

            {/* Action options */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied text invitation! 💖</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy invite text to clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  onRestart();
                }}
                className="w-full py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start over from beginning</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
