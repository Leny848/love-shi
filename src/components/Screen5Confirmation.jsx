import React from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';
import { playPop } from '../utils/sound';

export function Screen5Confirmation({ selectedTime, onNext }) {
  const displayTime = selectedTime || CONFIG.defaultTime;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow relative overflow-hidden">
        {/* Letter aesthetic background subtle stamp */}
        <div className="absolute top-4 right-4 border border-rose-200 bg-rose-50/70 rounded p-1.5 rotate-6 text-[10px] font-mono text-rose-400 select-none">
          AIR MAIL 💌
        </div>

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-snug mb-6 mt-2">
          {CONFIG.getPickupText(displayTime)}
        </h1>

        {/* Divider hearts */}
        <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs mb-6 select-none">
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
        </div>

        {/* Italic P.S. Note */}
        <p className="italic text-slate-600 text-sm sm:text-base mb-8 leading-relaxed px-2 bg-pink-50/50 py-3 rounded-2xl border border-pink-100/60">
          "{CONFIG.psNote}"
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playPop();
            onNext();
          }}
          className="w-full py-3.5 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-lg shadow-rose-200 transition-all cursor-pointer pulse-glow"
        >
          {CONFIG.confirmBtnText}
        </motion.button>
      </div>
    </motion.div>
  );
}
