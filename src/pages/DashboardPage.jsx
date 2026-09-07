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
  Heart,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

  // Copy feedback tracking map
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
    if (!window.confirm('Are you sure you want to delete this proposal link?')) return;
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
    <div className="min-h-screen bg-blush-gradient text-slate-800 pb-16 relative">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="font-serif text-xl font-bold text-slate-800">DateSite</span>
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
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-pink-50 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
                    className="absolute right-0 mt-2 w-80 bg-[#fffdfa] border border-pink-100 rounded-2xl shadow-xl p-4 z-40 text-left"
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-pink-100">
                      <span className="text-xs font-bold text-slate-700">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotifsRead}
                          className="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-4">No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs ${
                              n.is_read ? 'bg-slate-50 text-slate-600' : 'bg-pink-50 text-slate-800 font-medium border border-pink-200'
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

            {/* User Greeting */}
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
              👋 Hi, {user?.name || 'Creator'}
            </span>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                playPop();
                logout();
              }}
              title="Logout"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome & Stats Banner */}
        <div className="bg-[#fffdfa] border border-pink-100 rounded-3xl p-6 sm:p-8 card-shadow mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-800 tracking-tight mb-2">
              Proposal Dashboard 💌
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Create cute personalized date invitation links, customize your fake price joke, and track when she accepts!
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playPop();
              setShowCreateModal(true);
            }}
            className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-full shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all cursor-pointer flex items-center gap-2 shrink-0 pulse-glow"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Proposal</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 border border-pink-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Links</div>
              <div className="text-2xl font-bold text-slate-800">{proposals.length}</div>
            </div>
          </div>

          <div className="bg-white/80 border border-pink-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Views</div>
              <div className="text-2xl font-bold text-slate-800">{totalViews}</div>
            </div>
          </div>

          <div className="bg-white/80 border border-rose-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accepted Invites</div>
              <div className="text-2xl font-bold text-slate-800">{totalAccepts}</div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-800 text-left">Your Proposal Links</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <div className="bg-white/60 border border-pink-100 rounded-3xl p-12 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="font-semibold text-base mb-1">No proposal links created yet</p>
              <p className="text-xs text-slate-400 mb-4">Click below to create your first customized date invitation link!</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-rose-500 text-white font-semibold text-xs rounded-full cursor-pointer"
              >
                Create Proposal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {proposals.map((prop) => (
                <motion.div
                  key={prop.id}
                  whileHover={{ y: -2 }}
                  className="bg-[#fffdfa] border border-pink-100 rounded-2xl p-5 card-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left"
                >
                  {/* Left Column: Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={prop.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'}
                      alt="Thumbnail"
                      className="w-14 h-14 rounded-full object-cover border-2 border-pink-200 shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif text-lg font-bold text-slate-800">
                          {prop.recipient_nickname ? `Proposal for ${prop.recipient_nickname}` : prop.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            prop.status === 'live'
                              ? 'bg-emerald-100 text-emerald-700'
                              : prop.status === 'paused'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prop.status}
                        </span>
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                          ${prop.fake_amount || '499'} Fee
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-mono mb-2">/p/{prop.slug}</div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-pink-500" /> {prop.views_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {prop.accepts_count || 0} accepts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-pink-100">
                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(prop.slug)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-full border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
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

                    {/* Preview Link */}
                    <a
                      href={`/p/${prop.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                      title="Preview public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* View Responses */}
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setViewingDetailId(prop.id);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="View responses & messages"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Edit Proposal */}
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setEditingProposal(prop);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      title="Edit proposal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Proposal */}
                    <button
                      type="button"
                      onClick={() => handleDeleteProposal(prop.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Delete proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Proposal Create / Edit Modal */}
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

      {/* Proposal Detail / Responses Modal */}
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
