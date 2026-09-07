import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Image, Link, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { playPop, playSuccessChime } from '../utils/sound';

export function ProposalModal({ proposal, token, onClose, onSaved }) {
  const isEditing = Boolean(proposal && proposal.id);

  const [title, setTitle] = useState(proposal?.title || 'Will you go on a date with me?');
  const [recipientNickname, setRecipientNickname] = useState(proposal?.recipient_nickname || '');
  const [slug, setSlug] = useState(proposal?.slug || '');
  const [photoUrl, setPhotoUrl] = useState(
    proposal?.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'
  );
  const [fakeAmount, setFakeAmount] = useState(proposal?.fake_amount || '499');
  const [pickupTime, setPickupTime] = useState(proposal?.pickup_time || '6:00 PM');
  const [psNote, setPsNote] = useState(
    proposal?.ps_note || 'normal people text. I made a website on Replit, during lunch, for you. no big deal.'
  );
  const [punchlineText, setPunchlineText] = useState(
    proposal?.punchline_text || 'card declined (good). see you at 6:00 PM. don’t be late.'
  );
  const [status, setStatus] = useState(proposal?.status || 'live');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug when recipient nickname changes if creating new proposal
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#fffdfa] border border-pink-100 rounded-3xl p-6 sm:p-8 card-shadow relative my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 text-rose-500">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-serif text-2xl font-bold text-slate-800">
            {isEditing ? 'Edit Proposal' : 'Build New Date Proposal'}
          </h2>
        </div>
        <p className="text-slate-500 text-xs mb-6">
          Customize your text, pug photo, fake price joke, and unique share link slug.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Recipient Nickname */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Recipient Nickname (Optional)
            </label>
            <input
              type="text"
              value={recipientNickname}
              onChange={(e) => setRecipientNickname(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Proposal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Proposal Headline / Question
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Will you go on a date with me?"
              required
              className="w-full px-3.5 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Custom Share Link Slug
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kyle-asks-maya"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Share link format: <code className="text-rose-600 font-mono">/p/{slug || 'your-slug'}</code>
            </span>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Photo URL (Pug photo default)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Grid for Amount & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Fake Date Fee ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fakeAmount}
                  onChange={(e) => setFakeAmount(e.target.value)}
                  placeholder="499"
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Default Pickup Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="6:00 PM"
                  required
                  className="w-full pl-8 pr-3 py-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Custom P.S. Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Custom P.S. Text (Letter Screen)
            </label>
            <textarea
              rows={2}
              value={psNote}
              onChange={(e) => setPsNote(e.target.value)}
              placeholder="normal people text. I made a website for you. no big deal."
              className="w-full px-3.5 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Custom Punchline Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Custom Punchline Subtext
            </label>
            <input
              type="text"
              value={punchlineText}
              onChange={(e) => setPunchlineText(e.target.value)}
              placeholder="card declined (good). see you at 6:00 PM. don’t be late."
              className="w-full px-3.5 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Status selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="live">Live 🟢</option>
              <option value="draft">Draft ⚪</option>
              <option value="paused">Paused 🟠</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Proposal Link'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
