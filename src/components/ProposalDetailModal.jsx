import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Utensils, Heart, Eye, CheckCircle2, MessageSquare } from 'lucide-react';
import { playPop } from '../utils/sound';

export function ProposalDetailModal({ proposalId, token, onClose }) {
  const [proposal, setProposal] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/proposals/${proposalId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load proposal details');
        return res.json();
      })
      .then((data) => {
        setProposal(data.proposal);
        setResponses(data.responses || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [proposalId, token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#141012] border border-amber-500/30 rounded-3xl p-6 sm:p-8 card-dark-shadow relative my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={() => {
            playPop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">Loading details...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400 text-sm font-medium">{error}</div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1 text-amber-400">
              <Heart className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h2 className="font-serif text-2xl font-bold text-slate-100">
                {proposal.recipient_nickname ? `${proposal.recipient_nickname}'s Responses` : 'Proposal Responses'}
              </h2>
            </div>
            <p className="text-slate-400 text-xs mb-4 font-mono">/p/{proposal.slug}</p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Views</div>
                  <div className="text-lg font-bold text-slate-100">{proposal.views_count}</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Accepts</div>
                  <div className="text-lg font-bold text-slate-100">{proposal.accepts_count}</div>
                </div>
              </div>
            </div>

            {/* Responses List */}
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
              Accepted Responses ({responses.length})
            </h3>

            {responses.length === 0 ? (
              <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-xs">
                No accepts received yet! Share your private link to get a response. 🕯️
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((resp) => (
                  <div
                    key={resp.id}
                    className="p-4 bg-white/5 border border-amber-500/20 rounded-2xl shadow-sm space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accepted!
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{formatDate(resp.accepted_at)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{resp.chosen_date || 'Upcoming'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{resp.chosen_time || '20:00'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-200 col-span-2">
                        <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Mood: {resp.chosen_food || 'Late Dinner'}</span>
                      </div>
                    </div>

                    {resp.recipient_message && (
                      <div className="mt-2 p-2.5 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-300 italic">
                        <span className="font-semibold not-italic text-amber-400 block mb-0.5">
                          Recipient Note:
                        </span>
                        "{resp.recipient_message}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
