import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Link as LinkIcon,
  Eye,
  CheckCircle2,
  Bell,
  LogOut,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Sparkles,
  MessageSquare,
  Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config';
import { ProposalModal } from '../components/ProposalModal';
import { ProposalDetailModal } from '../components/ProposalDetailModal';
import { playPop, playCelebrate } from '../utils/sound';

export function DashboardPage() {
  const { user, token, logout } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Popovers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [viewingDetailId, setViewingDetailId] = useState(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Copy feedback map
  const [copiedMap, setCopiedMap] = useState({});

  const fetchDashboardData = () => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/proposals', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
    ])
      .then(([proposalData, notifData]) => {
        setProposals(proposalData.proposals || []);
        setNotifications(notifData.notifications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkNotifsRead = () => {
    playPop();
    fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    });
  };

  const handleCopyLink = (slug) => {
    playPop();
    const fullUrl = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedMap((prev) => ({ ...prev, [slug]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [slug]: false }));
    }, 2000);
  };

  const handleDeleteProposal = (id) => {
    if (!window.confirm('Are you sure you want to delete this private proposal link?')) return;
    playPop();
    fetch(`/api/proposals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setProposals((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const totalViews = proposals.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const totalAccepts = proposals.reduce((sum, p) => sum + (p.accepts_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0b0c] text-slate-100 pb-20 relative bg-grain">
      {/* Studio Header Bar */}
      <header className="bg-[#141012]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-serif text-xl font-bold tracking-wide text-white">{CONFIG.appName}</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              STUDIO
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  playPop();
                  setShowNotifMenu(!showNotifMenu);
                }}
                className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-[#171315] border border-amber-500/30 rounded-2xl shadow-2xl p-4 z-40 text-left"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-amber-300">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotifsRead}
                          className="text-[10px] text-amber-400 font-semibold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-xs text-slate-500 text-center py-4">No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs ${
                              n.is_read
                                ? 'bg-white/5 text-slate-400'
                                : 'bg-amber-500/10 text-amber-100 font-medium border border-amber-500/30'
                            }`}
                          >
                            {n.message}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="hidden sm:inline text-xs font-medium text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              👋 {user?.name || 'Creator'}
            </span>

            <button
              type="button"
              onClick={() => {
                playPop();
                logout();
              }}
              title="Logout"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Banner Header */}
        <div className="bg-[#141012]/90 border border-amber-500/20 rounded-3xl p-6 sm:p-8 card-dark-shadow mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block mb-1">
              CAMPAIGN DASHBOARD
            </span>
            <h1 className="font-serif text-3xl font-bold text-slate-100 tracking-tight mb-2">
              Private Proposals 🍷
            </h1>
            <p className="text-slate-400 text-xs max-w-lg">
              Design cinematic date proposal stories, set custom private fees, share your unique link, and get notified when she accepts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playPop();
              setShowCreateModal(true);
            }}
            className="px-6 py-3.5 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 gold-glow hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Proposal Link</span>
          </button>
        </div>

        {/* Studio Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#141012]/80 border border-white/10 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Stories</div>
              <div className="text-2xl font-bold text-slate-100 font-serif">{proposals.length}</div>
            </div>
          </div>

          <div className="bg-[#141012]/80 border border-white/10 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Story Views</div>
              <div className="text-2xl font-bold text-slate-100 font-serif">{totalViews}</div>
            </div>
          </div>

          <div className="bg-[#141012]/80 border border-emerald-500/20 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Accepted Invites</div>
              <div className="text-2xl font-bold text-slate-100 font-serif">{totalAccepts}</div>
            </div>
          </div>
        </div>

        {/* Proposals List — Large Cinematic Poster Gallery Grid */}
        <div className="space-y-4 text-left">
          <h2 className="font-serif text-xl font-bold text-slate-100">Proposal Gallery</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">Loading proposal posters...</div>
          ) : proposals.length === 0 ? (
            <div className="bg-[#141012]/60 border border-white/10 rounded-3xl p-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="font-serif text-lg font-bold text-slate-200 mb-1">No proposals created yet</p>
              <p className="text-xs text-slate-400 mb-6">Create your first cinematic date invitation link!</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
              >
                Build Proposal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((prop) => (
                <motion.div
                  key={prop.id}
                  whileHover={{ y: -4 }}
                  className="bg-[#141012] border border-amber-500/20 rounded-3xl overflow-hidden card-dark-shadow flex flex-col justify-between group"
                >
                  {/* Poster Image Cover */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={prop.photo_url || CONFIG.defaultPhotoUrl}
                      alt="Poster Cover"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141012] via-[#141012]/40 to-transparent p-4 flex flex-col justify-between">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            prop.status === 'live'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md'
                              : prop.status === 'paused'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md'
                              : 'bg-white/10 text-slate-400 backdrop-blur-md'
                          }`}
                        >
                          {prop.status}
                        </span>

                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                          ${prop.fake_amount || '499'}
                        </span>
                      </div>

                      {/* Recipient Nickname */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 block mb-0.5">
                          {prop.recipient_nickname ? `FOR ${prop.recipient_nickname.toUpperCase()}` : 'PRIVATE INVITATION'}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                          "{prop.title}"
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="text-xs text-slate-400 font-mono mb-4 bg-white/5 p-2 rounded-xl border border-white/5 truncate">
                      /p/{prop.slug}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-5 border-b border-white/5 pb-3">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> {prop.views_count || 0} views
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {prop.accepts_count || 0} accepts
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(prop.slug)}
                        className="flex-1 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedMap[prop.slug] ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Link
                          </>
                        )}
                      </button>

                      <a
                        href={`/p/${prop.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                        title="Preview public story"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setViewingDetailId(prop.id);
                        }}
                        className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
                        title="View responses"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setEditingProposal(prop);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        title="Edit proposal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProposal(prop.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Delete proposal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Tiny Credit in Dashboard Footer Only */}
      <footer className="mt-16 text-center text-xs text-slate-500">
        <span className="font-serif italic">SoftYes Studio</span> • Built on Replit
      </footer>

      {/* Proposal Editor Split-View Modal */}
      {(showCreateModal || editingProposal) && (
        <ProposalModal
          proposal={editingProposal}
          token={token}
          onClose={() => {
            setShowCreateModal(false);
            setEditingProposal(null);
          }}
          onSaved={() => fetchDashboardData()}
        />
      )}

      {/* Proposal Responses Modal */}
      {viewingDetailId && (
        <ProposalDetailModal
          proposalId={viewingDetailId}
          token={token}
          onClose={() => setViewingDetailId(null)}
        />
      )}
    </div>
  );
}
