import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Footprints } from 'lucide-react';
import { CONFIG } from '../config';
import { playSuccessChime } from '../utils/sound';

export function Screen3Schedule({ selectedDate, selectedTime, onSaveSchedule }) {
  const [date, setDate] = useState(selectedDate || '');
  const [time, setTime] = useState(selectedTime || '');

  // Today in YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && time) {
      playSuccessChime();
      onSaveSchedule(date, time);
    }
  };

  const isFormValid = Boolean(date && time);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 card-shadow text-center">
        {/* Top Header Icons */}
        <div className="flex items-center justify-center gap-2 mb-4 text-pink-500">
          <div className="p-2.5 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
            <Calendar className="w-6 h-6 text-pink-600" />
          </div>
          <Footprints className="w-5 h-5 text-pink-400 animate-bounce" />
          <Footprints className="w-4 h-4 text-pink-300 transform rotate-12" />
        </div>

        {/* Headline */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-6">
          {CONFIG.scheduleTitle}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Pick a Day */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">
              {CONFIG.scheduleDateLabel}
            </label>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all cursor-pointer"
                required
              />
            </div>
          </div>

          {/* What Time? */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">
              {CONFIG.scheduleTimeLabel}
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all cursor-pointer appearance-none"
              required
            >
              <option value="" disabled>Select a time slot...</option>
              {CONFIG.timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={!isFormValid}
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              className={`w-full py-3.5 px-6 rounded-full font-semibold text-base transition-all shadow-md ${
                isFormValid
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 cursor-pointer pulse-glow'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {CONFIG.scheduleBtnText}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
