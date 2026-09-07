import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';
import { playPop } from '../utils/sound';

export function Screen4Food({ selectedFood, onSelectFood }) {
  const [hoveredId, setHoveredId] = useState(null);

  const handleTileClick = (option) => {
    playPop();
    onSelectFood(option);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 text-center card-shadow">
        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-1">
          {CONFIG.foodTitle}
        </h1>
        <p className="text-pink-500 font-medium text-sm tracking-wide uppercase mb-6">
          {CONFIG.foodSubtitle}
        </p>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CONFIG.foodOptions.map((option) => {
            const isSelected = selectedFood?.id === option.id;
            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setHoveredId(option.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleTileClick(option)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 shadow-md ring-2 ring-rose-300'
                    : 'border-pink-100 bg-pink-50/40 hover:border-pink-300 hover:bg-pink-50 shadow-sm'
                }`}
              >
                <span className="text-4xl mb-2 transition-transform duration-200 group-hover:scale-110">
                  {option.emoji}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
