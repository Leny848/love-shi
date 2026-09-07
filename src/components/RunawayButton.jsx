import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playBoing } from '../utils/sound';

const TAUNTS = [
  "Nice try.",
  "Not an option.",
  "Slipped away.",
  "Almost.",
  "Try again."
];

export function RunawayButton({ text = "no", cardRef }) {
  const [position, setPosition] = useState({ x: 0, y: 0, isMoved: false });
  const [taunt, setTaunt] = useState(null);
  const buttonRef = useRef(null);
  const lastMoveTime = useRef(0);

  // Evasive arc slip within a strictly seeable & touchable radius
  const moveButton = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveTime.current < 180) return; // Smooth rate limit
    lastMoveTime.current = now;

    playBoing();

    // Determine strict seeable bounds relative to viewport & container
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 640;

    // Strict seeable & touchable radius limits
    const maxX = Math.max(40, Math.min(110, Math.floor(screenWidth * 0.28)));
    const maxY = Math.max(35, Math.min(75, Math.floor(screenHeight * 0.18)));

    // Generate random angle & distance within seeable bounds
    const angle = Math.random() * Math.PI * 2;
    const rawX = Math.cos(angle) * (50 + Math.random() * (maxX - 40));
    const rawY = Math.sin(angle) * (40 + Math.random() * (maxY - 35));

    // Clamp coordinates strictly within seeable radius
    let newX = Math.max(-maxX, Math.min(maxX, rawX));
    let newY = Math.max(-maxY, Math.min(maxY, rawY));

    // Ensure minimum jump distance so it doesn't stay stationary
    if (Math.abs(newX - position.x) < 40) {
      newX += newX >= 0 ? 45 : -45;
      newX = Math.max(-maxX, Math.min(maxX, newX));
    }
    if (Math.abs(newY - position.y) < 35) {
      newY += newY >= 0 ? 40 : -40;
      newY = Math.max(-maxY, Math.min(maxY, newY));
    }

    setPosition({ x: newX, y: newY, isMoved: true });

    // Quiet taunt whisper
    const randomTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    setTaunt(randomTaunt);
    setTimeout(() => setTaunt(null), 1000);
  }, [position.x, position.y]);

  // Proximity detection for Mouse & Touch events
  useEffect(() => {
    const checkProximity = (clientX, clientY) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distX = clientX - btnCenterX;
      const distY = clientY - btnCenterY;
      const distance = Math.hypot(distX, distY);

      if (distance < 75) {
        moveButton();
      }
    };

    const handleMouseMove = (e) => {
      checkProximity(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        checkProximity(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [moveButton]);

  const handlePointerApproach = () => {
    moveButton();
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveButton();
  };

  return (
    <div className="relative inline-block">
      {/* Quiet Whisper Taunt */}
      <AnimatePresence>
        {taunt && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: -32, scale: 0.9 }}
            className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap bg-black/90 text-amber-200/90 text-[11px] font-serif italic px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md pointer-events-none z-30 shadow-lg"
          >
            {taunt}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        animate={position.isMoved ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        onMouseEnter={handlePointerApproach}
        onTouchStart={handlePointerApproach}
        onClick={handleClick}
        onFocus={handlePointerApproach}
        className="px-5 py-2.5 text-xs tracking-wider uppercase font-semibold text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full transition-colors cursor-pointer select-none z-20 focus:outline-none active:scale-95"
      >
        {text}
      </motion.button>
    </div>
  );
}
