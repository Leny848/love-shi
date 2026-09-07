import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Image as ImageIcon, Link as LinkIcon, DollarSign, Clock, MessageSquare, Smartphone, Eye } from 'lucide-react';
import { CONFIG } from '../config';
import { playPop, playSuccessChime } from '../utils/sound';

export function ProposalModal({ proposal, token, onClose, onSaved }) {
  const isEditing = Boolean(proposal && proposal.id);

  const [title, setTitle] = useState(proposal?.title || CONFIG.defaultQuestion);
  const [recipientNickname, setRecipientNickname] = useState(proposal?.recipient_nickname || '');
  const [slug, setSlug] = useState(proposal?.slug || '');
  const [photoUrl, setPhotoUrl] = useState(proposal?.photo_url || CONFIG.defaultPhotoUrl);
  const [fakeAmount, setFakeAmount] = useState(proposal?.fake_amount || CONFIG.defaultFakeAmount);
  const [pickupTime, setPickupTime] = useState(proposal?.pickup_time || CONFIG.defaultPickupTime);
  const [psNote, setPsNote] = useState(proposal?.ps_note || CONFIG.defaultPsNote);
  const [punchlineText, setPunchlineText] = useState(proposal?.punchline_text || CONFIG.defaultPunchlineText);
  const [status, setStatus] = useState(proposal?.status || 'live');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug when recipient nickname changes if new proposal
  useEffect(() => {
    if (!isEditing && recipientNickname && !slug) {
      const generated = `asks-${recipientNickname.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      setSlug(generated);
    }
  }, [recipientNickname, isEditing, slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    playPop();

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const payload = {
      title,
      slug: cleanSlug,
      recipient_nickname: recipientNickname,
      photo_url: photoUrl,
      fake_amount: fakeAmount,
      pickup_time: pickupTime,
      food_options: proposal?.food_options || CONFIG.defaultMoods,
      ps_note: psNote,
      punchline_text: punchlineText,
      status
    };

    try {
      const url = isEditing ? `/api/proposals/${proposal.id}` : '/api/proposals';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save proposal');

      playSuccessChime();
      onSaved(data.proposal);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#141012] border border-amber-500/30 rounded-3xl p-6 sm:p-8 card-dark-shadow relative my-8 max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            {isEditing ? 'Proposal Studio Editor' : 'Build New Private Proposal'}
          </h2>
        </div>
        <p className="text-slate-400 text-xs mb-6">
          Live split view: edit fields on the left and preview the phone experience on the right.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Live Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Recipient Nickname
              </label>
              <input
                type="text"
                value={recipientNickname}
                onChange={(e) => setRecipientNickname(e.target.value)}
                placeholder="e.g. Maya"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Proposal Headline / Question
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Will you go on a date with me?"
                required
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Share Link Slug
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kyle-asks-maya"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                /p/{slug || 'your-slug'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Photo URL (Cinematic Portrait / Still Life)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                  Fake Fee ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fakeAmount}
                    onChange={(e) => setFakeAmount(e.target.value)}
                    placeholder="499"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                  Pickup Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    placeholder="20:00"
                    required
                    className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Custom P.S. Note
              </label>
              <textarea
                rows={2}
                value={psNote}
                onChange={(e) => setPsNote(e.target.value)}
                placeholder="I made a private website for you..."
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Custom Punchline Subtext
              </label>
              <input
                type="text"
                value={punchlineText}
                onChange={(e) => setPunchlineText(e.target.value)}
                placeholder="Declined. Good. See you at 20:00..."
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-200/80 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1c1719] border border-white/10 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="live">Live 🟢</option>
                <option value="draft">Draft ⚪</option>
                <option value="paused">Paused 🟠</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg cursor-pointer gold-glow hover:opacity-95"
              >
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Proposal Link'}
              </button>
            </div>
          </form>

          {/* Right Column: Phone-Sized Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start sticky top-4">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-3">
              <Smartphone className="w-4 h-4" /> Live Mobile Story Preview
            </div>

            <div className="w-[280px] h-[540px] bg-[#0d0b0c] border-[6px] border-[#251f22] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-end p-4 text-center">
              {/* Photo Background */}
              <div className="absolute inset-0 z-0">
                <img
                  src={photoUrl || CONFIG.defaultPhotoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0e] via-[#0f0d0e]/80 to-black/30" />
              </div>

              {/* Story Content */}
              <div className="relative z-10 text-center mb-6">
                <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold block mb-1">
                  {recipientNickname ? `For ${recipientNickname}` : 'Private Invitation'}
                </span>

                <h3 className="font-serif text-lg font-bold text-white mb-4 line-clamp-3">
                  "{title || 'Will you go on a date with me?'}"
                </h3>

                <div className="flex items-center justify-center gap-2">
                  <div className="px-4 py-1.5 bg-gold-gradient text-slate-950 text-[10px] font-bold uppercase rounded-full shadow">
                    YES ♥
                  </div>
                  <div className="px-3 py-1 bg-white/10 text-slate-300 text-[9px] uppercase rounded-full border border-white/10">
                    no
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
