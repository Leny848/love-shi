import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config';
import { playPop, playCelebrate } from '../utils/sound';

export function AuthPage({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    playPop();

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      playCelebrate();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#141012]/95 border border-amber-500/20 rounded-3xl p-8 sm:p-10 card-dark-shadow text-center backdrop-blur-xl"
      >
        {/* Brand Icon */}
        <div className="w-14 h-14 mx-auto mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
          <Flame className="w-7 h-7 animate-pulse text-amber-400" />
        </div>

        {/* Brand Wordmark & Title */}
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
          {CONFIG.appName}
        </span>
        <h1 className="font-serif text-3xl font-bold text-slate-100 tracking-tight mb-2">
          {isSignup ? 'Create Studio Account' : 'Creator Studio Login'}
        </h1>
        <p className="text-slate-400 text-xs mb-6">
          {isSignup
            ? 'Build cinematic date proposal links & track recipient responses'
            : 'Sign in to manage your private proposal links and responses'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignup && (
            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1 ml-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kyle"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 gold-glow hover:opacity-95"
          >
            <span>{isSignup ? 'Create Studio Account' : 'Sign In to Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
          {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsSignup(!isSignup);
            }}
            className="text-amber-400 font-semibold hover:underline cursor-pointer ml-1"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
