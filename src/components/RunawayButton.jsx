import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playBoing } from '../utils/sound';

const TAUNTS = [
  "Nice try! 😜",
  "Too slow! 💨",
  "Nope! 🙈",
  "Almost! 🏃‍♂️",
  "Can't touch this! 🎶",
  "Try again! 🌸",
  "Not an option! 😉",
  "Oop! Missed me! ⚡",
  "Catch me if you can! 🚀"
];

export function RunawayButton({ text = "no", cardRef }) {
  const [position, setPosition] = useState({ x: 0, y: 0, isMoved: false });
  const [taunt, setTaunt] = useState(null);
  const buttonRef = useRef(null);
  const lastMoveTime = useRef(0);

  // Move the button to a random position around the card
  const moveButton = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveTime.current < 150) return; // rate limit jump bursts
    lastMoveTime.current = now;

    // Play playful boing sound
    playBoing();

    let cardBounds = { width: 340, height: 400 };
    if (cardRef && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      cardBounds = { width: rect.width, height: rect.height };
    }

    // Range of jump offset relative to original button spot
    const maxX = Math.min(cardBounds.width * 0.42, 160);
    const maxY = Math.min(cardBounds.height * 0.42, 180);

    // Pick random coordinates
    let newX = (Math.random() - 0.5) * maxX * 2;
    let newY = (Math.random() - 0.5) * maxY * 2;

    // Ensure it jumps a minimum distance away from current position
    if (Math.abs(newX - position.x) < 60) {
      newX += newX >= 0 ? 80 : -80;
    }
    if (Math.abs(newY - position.y) < 60) {
      newY += newY >= 0 ? 80 : -80;
    }

    setPosition({ x: newX, y: newY, isMoved: true });

    // Show funny taunt message briefly
    const randomTaunt = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
    setTaunt(randomTaunt);
    setTimeout(() => setTaunt(null), 1200);
  }, [cardRef, position.x, position.y]);

  // Proximity detection: if cursor gets close (< 90px), jump!
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - btnCenterX;
      const distY = e.clientY - btnCenterY;
      const distance = Math.hypot(distX, distY);

      if (distance < 90) {
        moveButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [moveButton]);

  // Handle direct pointer/touch approaching
  const handlePointerApproach = (e) => {
    moveButton();
  };

  // If clicked, treat as a miss and jump away!
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveButton();
  };

  return (
    <div className="relative inline-block">
      {/* Taunt text popup */}
      <AnimatePresence>
        {taunt && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: -36, scale: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap bg-purple-950/90 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none z-30 shadow-md border border-purple-400/30"
          >
            {taunt}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        animate={position.isMoved ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
        onMouseEnter={handlePointerApproach}
        onTouchStart={handlePointerApproach}
        onClick={handleClick}
        onFocus={handlePointerApproach}
        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-colors cursor-pointer select-none z-20 focus:outline-none"
      >
        {text}
      </motion.button>
    </div>
  );
}

