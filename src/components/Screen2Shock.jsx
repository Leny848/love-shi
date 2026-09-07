import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CONFIG } from '../config';
import { playPop, playCelebrate } from '../utils/sound';

export function Screen2Shock({ onNext }) {
  useEffect(() => {
    playCelebrate();
    // Soft confetti burst when entering Screen 2
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f43f5e', '#ec4899', '#fef08a', '#c084fc']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ff80bf', '#ffd700', '#ff6699']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#e879f9', '#f472b6']
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4 relative z-10"
    >
      <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow relative overflow-hidden">
        {/* Soft floating background dots */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-6 left-10 w-3 h-3 rounded-full bg-rose-400 animate-ping"></div>
          <div className="absolute bottom-12 right-12 w-4 h-4 rounded-full bg-yellow-400 animate-pulse"></div>
          <div className="absolute top-1/2 left-4 w-2 h-2 rounded-full bg-purple-400"></div>
        </div>

        {/* Red rounded square icon with yellow sponge object */}
        <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 transform -rotate-3 hover:rotate-0 transition-transform">
          {/* Yellow sponge representation with shocked eyes */}
          <div className="w-16 h-16 bg-yellow-400 rounded-lg border-2 border-yellow-500 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
            {/* Sponge texture dots */}
            <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-yellow-500/60 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-yellow-500/60 rounded-full"></div>
            <div className="absolute top-3 right-1 w-1 h-1 bg-yellow-500/60 rounded-full"></div>
            
            {/* Shocked Sponge face */}
            <div className="flex gap-1.5 mb-1 z-10">
              <div className="w-3.5 h-3.5 bg-white rounded-full border border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
              <div className="w-3.5 h-3.5 bg-white rounded-full border border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
            </div>
            <div className="w-4 h-4 bg-black rounded-full border border-yellow-200 z-10 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug mb-3">
          {CONFIG.shockTitle}
        </h1>

        {/* Subtext */}
        <p className="text-slate-600 text-base sm:text-lg mb-8 font-normal">
          {CONFIG.shockSubtext}
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playPop();
            onNext();
          }}
          className="w-full sm:w-auto px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          {CONFIG.shockBtnText}
        </motion.button>
      </div>
    </motion.div>
  );
}
