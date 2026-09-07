import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Footprints, CreditCard, CheckCircle2, RotateCcw, Clock, Utensils, Send, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RunawayButton } from '../components/RunawayButton';
import { Footer } from '../components/Footer';
import { SoundToggle } from '../components/SoundToggle';
import { InteractiveBackground } from '../components/InteractiveBackground';
import { playPop, playCelebrate, playSuccessChime } from '../utils/sound';

export function PublicProposalPage({ slug }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
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
      <div className="min-h-screen bg-blush-gradient flex items-center justify-center text-slate-500 font-serif text-lg">
        Loading invitation... 💌
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-blush-gradient flex items-center justify-center p-4">
        <div className="bg-white border border-pink-100 rounded-3xl p-8 card-shadow max-w-md text-center">
          <div className="text-4xl mb-3">🌸</div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 mb-2">Invitation Not Found</h1>
          <p className="text-slate-500 text-sm mb-6">{error || "This proposal link doesn't exist or has been paused."}</p>
          <a href="/" className="px-6 py-2.5 bg-rose-500 text-white font-semibold text-xs rounded-full inline-block">
            Go to DateSite Home
          </a>
        </div>
      </div>
    );
  }

  const foodOptions = proposal.food_options || [
    { id: 'pizza', emoji: '🍕', label: 'Pizza' },
    { id: 'sushi', emoji: '🍣', label: 'Sushi' },
    { id: 'burgers', emoji: '🍔', label: 'Burgers' },
    { id: 'pasta', emoji: '🍝', label: 'Pasta' },
    { id: 'tacos', emoji: '🌮', label: 'Tacos' },
    { id: 'ramen', emoji: '🍜', label: 'Ramen' }
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 6));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleRestart = () => {
    setSelectedDate('');
    setSelectedTime(proposal.pickup_time || '6:00 PM');
    setSelectedFood(null);
    setRecipientMessage('');
    setIsCompleted(false);
    setStep(1);
  };

  const handlePayAndAccept = () => {
    playPop();
    setIsProcessing(true);

    fetch(`/api/p/${slug}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chosenDate: selectedDate,
        chosenTime: selectedTime,
        chosenFood: selectedFood,
        recipientMessage
      })
    })
      .then(() => {
        setTimeout(() => {
          setIsProcessing(false);
          setIsCompleted(true);
          playCelebrate();

          confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#a855f7', '#eab308', '#ec4899', '#10b981']
          });
        }, 1200);
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
    const vibeText = selectedFood ? `${selectedFood.emoji} ${selectedFood.label}` : 'Pizza 🍕';
    const textToCopy = `🌸 It's official! Date confirmed with ${proposal.creator_name} for ${dateFormatted} at ${selectedTime || '6:00 PM'} (Vibe: ${vibeText}). Be ready! 🚗💨`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-blush-gradient flex flex-col justify-between items-center py-8 px-4 relative overflow-hidden select-none">
      <SoundToggle />
      <InteractiveBackground />

      {/* Progress Dots */}
      <div className="w-full max-w-xs mx-auto mb-4 flex items-center justify-center gap-1.5 opacity-60">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-rose-500' : i < step ? 'w-2 bg-pink-400' : 'w-2 bg-pink-200/80'
            }`}
          />
        ))}
      </div>

      <main className="w-full flex-1 flex items-center justify-center relative my-auto">
        <AnimatePresence mode="wait">
          {/* SCREEN 1: PROPOSAL */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              <div
                ref={cardRef}
                className="relative bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow overflow-visible"
              >
                <div className="absolute top-4 left-4 text-pink-300 text-sm animate-float">🌸</div>
                <div className="absolute top-4 right-4 text-pink-300 text-sm animate-float" style={{ animationDelay: '1s' }}>🌺</div>

                <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full p-1.5 bg-gradient-to-tr from-pink-300 via-pink-200 to-rose-300 shadow-md">
                  <img
                    src={proposal.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'}
                    alt="Pug Photo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-snug mb-8">
                  <span className="inline-block mr-1 text-xl">🌸</span>
                  {proposal.recipient_nickname ? `${proposal.recipient_nickname}, ${proposal.title.toLowerCase()}` : proposal.title}
                  <span className="inline-block ml-1 text-xl">🌸</span>
                </h1>

                <div className="flex items-center justify-center gap-4 relative min-h-[50px]">
                  <motion.button
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      playCelebrate();
                      handleNext();
                    }}
                    className="px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-base rounded-full shadow-lg shadow-rose-300 transition-all cursor-pointer z-10 pulse-glow"
                  >
                    YES ♥
                  </motion.button>

                  <RunawayButton text="no" cardRef={cardRef} />
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: SHOCK */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg border-2 border-yellow-500 flex flex-col items-center justify-center relative">
                    <div className="flex gap-1.5 mb-1 z-10">
                      <div className="w-3.5 h-3.5 bg-white rounded-full border border-black flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                      <div className="w-3.5 h-3.5 bg-white rounded-full border border-black flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-black rounded-full border border-yellow-200 z-10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
                  WAIT YOU ACTUALLY SAID YES??
                </h1>
                <p className="text-slate-600 text-base mb-8">
                  I was so ready for you to say no
                </p>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    handleNext();
                  }}
                  className="w-full px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-md transition-all cursor-pointer"
                >
                  okay okay! →
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: SCHEDULE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 card-shadow text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-pink-500">
                  <div className="p-2.5 bg-pink-50 rounded-2xl border border-pink-100">
                    <Calendar className="w-6 h-6 text-pink-600" />
                  </div>
                  <Footprints className="w-5 h-5 text-pink-400 animate-bounce" />
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
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
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Pick a Day
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      What Time?
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="" disabled>Select a time slot...</option>
                      {["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM"].map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!selectedDate || !selectedTime}
                      className={`w-full py-3.5 px-6 rounded-full font-semibold text-base transition-all shadow-md ${
                        selectedDate && selectedTime
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 cursor-pointer pulse-glow'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      set the date! ♥
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: FOOD */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                  What are we feeling?
                </h1>
                <p className="text-pink-500 font-medium text-xs tracking-wide uppercase mb-6">
                  pick your vibe
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {foodOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        playPop();
                        setSelectedFood(option);
                        handleNext();
                      }}
                      className="p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border border-pink-100 bg-pink-50/40 hover:border-rose-400 hover:bg-pink-50 shadow-sm active:scale-95"
                    >
                      <span className="text-4xl mb-2">{option.emoji}</span>
                      <span className="text-sm font-semibold text-slate-800">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 5: CONFIRMATION LETTER */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow relative">
                <div className="absolute top-4 right-4 border border-rose-200 bg-rose-50/70 rounded p-1.5 rotate-6 text-[10px] font-mono text-rose-400 select-none">
                  AIR MAIL 💌
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-snug mb-6 mt-2">
                  glad you didn't say no. be ready by {selectedTime || proposal.pickup_time || '6:00 PM'}, {proposal.creator_name} is coming to get you 🚗
                </h1>

                <div className="flex items-center justify-center gap-1 text-rose-400 text-xs mb-6 select-none">
                  <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                </div>

                <p className="italic text-slate-600 text-sm mb-8 leading-relaxed px-2 bg-pink-50/50 py-3 rounded-2xl border border-pink-100/60">
                  "{proposal.ps_note || 'normal people text. I made a website on Replit, during lunch, for you. no big deal.'}"
                </p>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    handleNext();
                  }}
                  className="w-full py-3.5 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-lg shadow-rose-200 transition-all cursor-pointer pulse-glow"
                >
                  ok I accept 💋
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: FAKE PAYWALL & RECAP */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="w-full max-w-md mx-auto p-4"
            >
              {!isCompleted ? (
                <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow">
                  <div className="w-14 h-14 mx-auto mb-4 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-center text-rose-500 shadow-sm">
                    <CreditCard className="w-7 h-7" />
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                    one small fee
                  </h1>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    to confirm your acceptance of this date, please complete the following transaction. totally normal. everyone does this.
                  </p>

                  <div className="bg-gradient-to-b from-pink-50/80 to-rose-50/40 border border-pink-200/80 rounded-2xl p-5 mb-6 text-center shadow-inner">
                    <div className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-1">
                      Date Agreement™
                    </div>
                    <div className="font-serif text-4xl font-extrabold text-slate-900 my-1">
                      ${proposal.fake_amount || '499'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      one-time fee • non-refundable • absolutely worth it
                    </div>
                  </div>

                  {/* Optional Recipient Message Box */}
                  <div className="mb-6 text-left">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Leave a note for {proposal.creator_name} (Optional):
                    </label>
                    <input
                      type="text"
                      value={recipientMessage}
                      onChange={(e) => setRecipientMessage(e.target.value)}
                      placeholder="e.g. Can't wait! See you Friday 💕"
                      className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePayAndAccept}
                    className="w-full py-3.5 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 pulse-glow disabled:opacity-80"
                  >
                    {isProcessing ? 'Processing payment...' : `pay $${proposal.fake_amount || '499'} & confirm 💛`}
                  </button>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                    >
                      go back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#fffdfa] border border-emerald-200/80 rounded-3xl p-8 sm:p-10 text-center card-shadow">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <h1 className="font-serif text-2xl font-bold text-slate-800 mb-2">
                    card declined (good).
                  </h1>
                  <p className="text-slate-700 text-base font-medium mb-6">
                    {proposal.punchline_text || `see you at ${selectedTime || '6:00 PM'}. don’t be late.`}
                  </p>

                  <div className="bg-pink-50/60 border border-pink-200/70 rounded-2xl p-5 mb-6 text-left space-y-3 shadow-inner">
                    <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Official Date Recap 📋</span>
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">CONFIRMED</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                      <span><strong>Date:</strong> {formatDate(selectedDate)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                      <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                      <span><strong>Time:</strong> {selectedTime}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-800 text-sm font-medium">
                      <Utensils className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>
                        <strong>Vibe:</strong> {selectedFood?.emoji} {selectedFood?.label || 'Pizza'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="w-full py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" /> Copied invite text! 💖
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy invite text to clipboard
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleRestart}
                      className="w-full py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Start over
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
