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

  // Elegant arc movement
  const moveButton = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveTime.current < 200) return; // Smooth rate limit
    lastMoveTime.current = now;

    playBoing();

    // Calculate arc offset
    let maxDist = 140;
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * maxDist;

    let newX = Math.cos(angle) * distance;
    let newY = Math.sin(angle) * distance;

    // Ensure min jump distance
    if (Math.abs(newX - position.x) < 50) {
      newX += newX >= 0 ? 60 : -60;
    }
    if (Math.abs(newY - position.y) < 50) {
      newY += newY >= 0 ? 60 : -60;
    }

    setPosition({ x: newX, y: newY, isMoved: true });

    // Quiet taunt popup
    const randomTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    setTaunt(randomTaunt);
    setTimeout(() => setTaunt(null), 1000);
  }, [position.x, position.y]);

  // Proximity detection: smooth arc slip when mouse within 85px
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - btnCenterX;
      const distY = e.clientY - btnCenterY;
      const distance = Math.hypot(distX, distY);

      if (distance < 85) {
        moveButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
            className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap bg-black/80 text-amber-200/90 text-[11px] font-serif italic px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md pointer-events-none z-30 shadow-lg"
          >
            {taunt}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        animate={position.isMoved ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        onMouseEnter={handlePointerApproach}
        onTouchStart={handlePointerApproach}
        onClick={handleClick}
        onFocus={handlePointerApproach}
        className="px-5 py-2.5 text-xs tracking-wider uppercase font-semibold text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full transition-colors cursor-pointer select-none z-20 focus:outline-none"
      >
        {text}
      </motion.button>
    </div>
  );
}
