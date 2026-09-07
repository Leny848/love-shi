import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';
import { RunawayButton } from './RunawayButton';
import { playCelebrate } from '../utils/sound';

export function Screen1Proposal({ onNext }) {
  const cardRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div 
        ref={cardRef}
        className="relative bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow overflow-visible"
      >
        {/* Decorative corner marks */}
        <div className="absolute top-4 left-4 text-pink-300 text-sm select-none animate-float">🌸</div>
        <div className="absolute top-4 right-4 text-pink-300 text-sm select-none animate-float" style={{ animationDelay: '1s' }}>🌺</div>
        <div className="absolute bottom-4 left-4 text-pink-300 text-sm select-none animate-float" style={{ animationDelay: '1.5s' }}>🐾</div>
        <div className="absolute bottom-4 right-4 text-pink-300 text-sm select-none animate-float" style={{ animationDelay: '0.5s' }}>💖</div>

        {/* Circular Pug Photo */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full p-1.5 bg-gradient-to-tr from-pink-300 via-pink-200 to-rose-300 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
            {!imgError ? (
              <img
                src={CONFIG.photoUrl}
                alt={CONFIG.photoAlt}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-full transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              /* High quality fallback SVG illustration of cute dressed pug if external image fails */
              <div className="flex flex-col items-center justify-center p-2 text-pink-700">
                <span className="text-5xl">🐶👔</span>
                <span className="text-[10px] font-semibold mt-1">Dressed Pug</span>
              </div>
            )}
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-snug mb-8">
          <span className="inline-block mr-1 text-xl sm:text-2xl">🌸</span>
          {CONFIG.proposalTitle}
          <span className="inline-block ml-1 text-xl sm:text-2xl">🌸</span>
        </h1>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 relative min-h-[50px]">
          {/* YES Button */}
          <motion.button
            whileHover={{ scale: 1.07, rotate: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playCelebrate();
              onNext();
            }}
            className="px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-base rounded-full shadow-lg shadow-rose-300/80 hover:shadow-rose-400/90 transition-all pulse-glow cursor-pointer z-10 flex items-center gap-1.5"
          >
            <span>{CONFIG.yesBtnText}</span>
          </motion.button>

          {/* Runaway NO Button */}
          <RunawayButton text={CONFIG.noBtnText} cardRef={cardRef} />
        </div>
      </div>
    </motion.div>
  );
}
