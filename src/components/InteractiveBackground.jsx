import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function InteractiveBackground() {
  const [bursts, setBursts] = useState([]);

  // Spawn mini floating heart burst at click position
  const handleGlobalClick = (e) => {
    // Only spawn burst if clicking directly on background/decorative element
    const newBurst = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      emoji: ["💖", "🌸", "✨", "🐾", "💘"][Math.floor(Math.random() * 5)]
    };

    setBursts((prev) => [...prev.slice(-10), newBurst]);

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Background ambient floating elements */}
      <div className="absolute top-10 left-[8%] text-pink-300/40 text-3xl animate-float" style={{ animationDuration: '4s' }}>
        💖
      </div>
      <div className="absolute top-1/4 right-[10%] text-rose-300/40 text-2xl animate-float" style={{ animationDelay: '1.2s', animationDuration: '5s' }}>
        🌸
      </div>
      <div className="absolute bottom-24 left-[12%] text-pink-300/40 text-2xl animate-float" style={{ animationDelay: '2.4s', animationDuration: '4.5s' }}>
        🐾
      </div>
      <div className="absolute bottom-1/3 right-[15%] text-rose-300/35 text-3xl animate-float" style={{ animationDelay: '0.8s', animationDuration: '6s' }}>
        ✨
      </div>
      <div className="absolute top-1/2 left-[5%] text-pink-300/30 text-xl animate-float" style={{ animationDelay: '3s', animationDuration: '5.5s' }}>
        💌
      </div>
      <div className="absolute top-[15%] right-[25%] text-pink-300/30 text-2xl animate-float" style={{ animationDelay: '1.8s', animationDuration: '4.2s' }}>
        🌺
      </div>

      {/* Click Burst Emojis */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 1, scale: 0.5, x: burst.x - 12, y: burst.y - 12 }}
            animate={{ opacity: 0, scale: 1.5, y: burst.y - 60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed text-2xl pointer-events-none z-50"
          >
            {burst.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
