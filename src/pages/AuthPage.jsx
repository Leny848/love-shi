import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  const fillDemo = () => {
    setIsSignup(false);
    setEmail('kyle@example.com');
    setPassword('password123');
    playPop();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-8 sm:p-10 card-shadow text-center"
      >
        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
          <Heart className="w-7 h-7 fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold text-slate-800 tracking-tight mb-2">
          {isSignup ? 'Create DateSite Account' : 'Welcome to DateSite'}
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {isSignup
            ? 'Build your own custom date proposal link & track responses'
            : 'Sign in to manage your proposal links and view responses'}
        </p>

        {/* Demo Account Button */}
        {!isSignup && (
          <div className="mb-6 p-3 bg-pink-50/70 border border-pink-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-pink-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Demo Account pre-seeded
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 ml-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kyle"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base rounded-full shadow-lg shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="mt-6 pt-4 border-t border-pink-100 text-xs text-slate-500">
          {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsSignup(!isSignup);
            }}
            className="text-rose-600 font-semibold hover:underline cursor-pointer ml-1"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
