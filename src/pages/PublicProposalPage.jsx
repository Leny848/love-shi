import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Utensils, CheckCircle2, RotateCcw, Copy, Check, Sparkles, Flame, MessageCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RunawayButton } from '../components/RunawayButton';
import { Footer } from '../components/Footer';
import { SoundToggle } from '../components/SoundToggle';
import { InteractiveBackground } from '../components/InteractiveBackground';
import { CONFIG } from '../config';
import { playPop, playCelebrate, playSuccessChime } from '../utils/sound';

export function PublicProposalPage({ slug }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scene, setScene] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [recipientMessage, setRecipientMessage] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    fetch(`/api/p/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Proposal not found or paused.');
        return res.json();
      })
      .then((data) => {
        setProposal(data.proposal);
        if (data.proposal?.pickup_time) {
          setSelectedTime(data.proposal.pickup_time);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0b0c] flex items-center justify-center text-amber-200/80 font-serif text-lg tracking-wider">
        SoftYes — Loading private proposal... 🕯️
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#0d0b0c] flex items-center justify-center p-4">
        <div className="bg-[#151214] border border-amber-500/20 rounded-3xl p-8 card-dark-shadow max-w-md text-center">
          <div className="text-3xl mb-3">🕯️</div>
          <h1 className="font-serif text-2xl font-bold text-slate-100 mb-2">Proposal Unavailable</h1>
          <p className="text-slate-400 text-sm mb-6">{error || "This link doesn't exist or has been set to private."}</p>
          <a
            href="/"
            className="px-6 py-2.5 bg-gold-gradient text-slate-950 font-bold text-xs rounded-full inline-block uppercase tracking-wider"
          >
            Go to SoftYes
          </a>
        </div>
      </div>
    );
  }

  const moods = proposal.food_options || CONFIG.defaultMoods;

  const handleNext = () => setScene((prev) => Math.min(prev + 1, 6));
  const handlePrev = () => setScene((prev) => Math.max(prev - 1, 1));
  const handleRestart = () => {
    setSelectedDate('');
    setSelectedTime(proposal.pickup_time || '20:00');
    setSelectedMood(null);
    setRecipientMessage('');
    setIsCompleted(false);
    setScene(1);
  };

  const handleConfirmReservation = () => {
    playPop();
    setIsProcessing(true);

    fetch(`/api/p/${slug}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chosenDate: selectedDate,
        chosenTime: selectedTime,
        chosenFood: selectedMood,
        recipientMessage
      })
    })
      .then(() => {
        setTimeout(() => {
          setIsProcessing(false);
          setIsCompleted(true);
          playCelebrate();

          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#e5c158', '#d4af37', '#ffffff', '#f43f5e']
          });
        }, 1300);
      })
      .catch((err) => {
        console.error(err);
        setIsProcessing(false);
        setIsCompleted(true);
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Upcoming Date';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleCopySummary = () => {
    playPop();
    const dateFormatted = formatDate(selectedDate);
    const moodText = selectedMood ? `${selectedMood.emoji || ''} ${selectedMood.label || selectedMood.title || ''}` : 'Late Dinner 🥂';
    const textToCopy = `🌸 Private Date Confirmed with ${proposal.creator_name} for ${dateFormatted} at ${selectedTime || '20:00'} (Mood: ${moodText}). Be ready! 🚗💨`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Available 30-min times from 12:00 to 22:30
  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
  ];

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] relative overflow-x-hidden overflow-y-auto bg-[#0d0b0c] text-slate-100 select-none">
      <SoundToggle />
      <InteractiveBackground />

      <AnimatePresence mode="wait">
        {/* =================================================================== */}
        {/* SCENE 1: THE ASK (Cinematic Full-Bleed Photo + Gold Yes & Arc Ghost No) */}
        {/* =================================================================== */}
        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full relative flex flex-col justify-end p-4 sm:p-12 z-10 overflow-hidden"
          >
            {/* Cinematic Full-Bleed Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={proposal.photo_url || CONFIG.defaultPhotoUrl}
                alt="Cinematic Background"
                className="w-full h-full object-cover transform scale-105 transition-transform duration-1000"
              />
              {/* Dark Warm Gradient Overlay on Lower Third */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0e] via-[#0f0d0e]/80 to-black/30" />
            </div>

            {/* Foreground Story Card */}
            <div ref={cardRef} className="relative z-10 max-w-xl mx-auto w-full text-center mb-6 sm:mb-10 px-2">
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest text-amber-300/90 font-semibold mb-2 sm:mb-3 bg-black/40 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
                {proposal.recipient_nickname ? `For ${proposal.recipient_nickname}` : 'Private Invitation'}
              </span>

              <h1 className="font-serif text-2xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6 sm:mb-8 drop-shadow-md px-2">
                "{proposal.title}"
              </h1>

              {/* Two Controls Only: Solid Gold YES & Evasive NO */}
              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 relative min-h-[64px] pb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playCelebrate();
                    handleNext();
                  }}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gold-gradient text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full gold-glow transition-all cursor-pointer z-10 shadow-2xl shrink-0"
                >
                  YES ♥
                </motion.button>

                <RunawayButton text="no" cardRef={cardRef} />
              </div>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCENE 2: THE FLINCH (Match flame / candle, "You actually said yes.") */}
        {/* =================================================================== */}
        {scene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-6 z-10 relative"
          >
            <div className="bg-[#141012]/90 border border-amber-500/20 rounded-3xl p-8 sm:p-12 text-center max-w-md w-full card-dark-shadow backdrop-blur-xl">
              {/* Soft Candlelight Flame Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
                <Flame className="w-8 h-8 animate-pulse text-amber-400" />
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight mb-3">
                You actually said yes.
              </h1>
              <p className="text-slate-400 font-serif italic text-base sm:text-lg mb-8 text-amber-200/80">
                "I had a whole speech ready for no."
              </p>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  handleNext();
                }}
                className="w-full py-3.5 px-8 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer hover:opacity-95"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCENE 3: WHEN (Custom Date & Time Picker 12:00 - 22:30) */}
        {/* =================================================================== */}
        {scene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-6 z-10 relative"
          >
            <div className="bg-[#141012]/90 border border-amber-500/20 rounded-3xl p-8 sm:p-10 text-center max-w-md w-full card-dark-shadow backdrop-blur-xl">
              <div className="flex items-center justify-center gap-2 mb-4 text-amber-400">
                <Calendar className="w-6 h-6" />
                <Clock className="w-5 h-5 text-amber-300" />
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 mb-6">
                So… when are you free?
              </h1>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedDate && selectedTime) {
                    playSuccessChime();
                    handleNext();
                  }
                }}
                className="space-y-5 text-left"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1.5 ml-1">
                    Select a Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 font-medium focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1.5 ml-1">
                    Select a Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#1c1719] border border-white/10 rounded-xl text-slate-100 font-medium focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Choose a time slot...</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <p className="text-center italic text-xs text-amber-200/60 font-serif">
                  "I’ll be on time."
                </p>

                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                    selectedDate && selectedTime
                      ? 'bg-gold-gradient text-slate-950 gold-glow cursor-pointer'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Set the Date ♥
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCENE 4: THE TABLE (Mood Cards with Dark Photography) */}
        {/* =================================================================== */}
        {scene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col items-center justify-center p-6 z-10 relative max-w-2xl mx-auto overflow-y-auto"
          >
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest text-amber-300/80 font-semibold block mb-1">
                The Table
              </span>
              <h1 className="font-serif text-3xl font-bold text-slate-100">
                What are we feeling?
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {moods.map((mood) => (
                <motion.button
                  key={mood.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    playPop();
                    setSelectedMood(mood);
                    handleNext();
                  }}
                  className="relative h-44 rounded-2xl overflow-hidden text-left border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer group card-dark-shadow"
                >
                  <img
                    src={mood.image || CONFIG.defaultPhotoUrl}
                    alt={mood.label || mood.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
                    <span className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {mood.label || mood.title}
                    </span>
                    {mood.subtitle && (
                      <span className="text-xs text-slate-300 font-light mt-0.5">
                        {mood.subtitle}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCENE 5: THE NOTE (Letter on Dark Paper) */}
        {/* =================================================================== */}
        {scene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-6 z-10 relative"
          >
            <div className="bg-[#141012]/95 border border-amber-500/20 rounded-3xl p-8 sm:p-10 text-center max-w-md w-full card-dark-shadow backdrop-blur-xl">
              <div className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mb-4">
                CONFIDENTIAL NOTE 💌
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100 leading-snug mb-6">
                Glad you said yes. Be ready by {selectedTime || proposal.pickup_time || '20:00'}, {proposal.creator_name} is coming to get you 🚗
              </h1>

              <p className="italic text-slate-300 font-serif text-sm mb-6 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                "{proposal.ps_note || 'I made a private website for you. No big deal, but I’ll be waiting.'}"
              </p>

              {/* Optional Recipient Message Line */}
              <div className="mb-6 text-left">
                <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1 ml-1">
                  Tell him something:
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={recipientMessage}
                    onChange={(e) => setRecipientMessage(e.target.value)}
                    placeholder="e.g. Can't wait! See you Friday 💕"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  handleNext();
                }}
                className="w-full py-3.5 px-8 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer gold-glow"
              >
                I accept 💋
              </button>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* SCENE 6: THE JOKE INVOICE / RESERVATION TICKET */}
        {/* =================================================================== */}
        {scene === 6 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-6 z-10 relative"
          >
            {!isCompleted ? (
              <div className="bg-[#141012]/95 border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center max-w-md w-full card-dark-shadow backdrop-blur-xl">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                  PRIVATE RESERVATION
                </span>
                <h1 className="font-serif text-3xl font-bold text-slate-100 mb-6">
                  One small fee
                </h1>

                {/* Private Reservation Card */}
                <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-5 mb-6 text-left space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-amber-300 border-b border-white/10 pb-2">
                    <span>RESERVATION TICKET</span>
                    <span>#{proposal.slug.slice(0, 8).toUpperCase()}</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Table for Two</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Nerve & Timing</span>
                    <span>Priceless</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
                    <span>One-time Fee</span>
                    <span>${proposal.fake_amount || '499'}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-serif font-bold text-white pt-1">
                    <span>Total Amount</span>
                    <span className="text-amber-300 text-lg">${proposal.fake_amount || '499'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmReservation}
                  className="w-full py-3.5 px-6 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer gold-glow disabled:opacity-80"
                >
                  {isProcessing ? 'Processing reservation...' : 'Confirm Reservation 💛'}
                </button>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
                  >
                    go back
                  </button>
                </div>
              </div>
            ) : (
              /* FINAL RECAP FRAME */
              <div className="bg-[#141012]/95 border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center max-w-md w-full card-dark-shadow backdrop-blur-xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h1 className="font-serif text-3xl font-bold text-slate-100 mb-2">
                  Declined. Good.
                </h1>
                <p className="text-amber-200/90 font-serif italic text-base mb-6">
                  {proposal.punchline_text || `See you at ${selectedTime || '20:00'}. Don't be late.`}
                </p>

                {/* Recap Card */}
                <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-5 mb-6 text-left space-y-3 text-xs">
                  <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest border-b border-white/10 pb-1.5 flex justify-between">
                    <span>DATE RECAP</span>
                    <span className="text-emerald-400 font-bold">CONFIRMED</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-200">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Date:</strong> {formatDate(selectedDate)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Time:</strong> {selectedTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-200">
                    <Utensils className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Mood:</strong> {selectedMood?.label || selectedMood?.title || 'Late Dinner'}
                    </span>
                  </div>

                  {recipientMessage && (
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 italic text-slate-300 mt-2">
                      <span className="not-italic text-amber-400 font-semibold block mb-0.5">Your Note:</span>
                      "{recipientMessage}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full py-3 px-6 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied invite text! 💖
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy invite summary
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full py-2.5 px-6 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-full cursor-pointer flex items-center justify-center gap-2 border border-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start over
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
