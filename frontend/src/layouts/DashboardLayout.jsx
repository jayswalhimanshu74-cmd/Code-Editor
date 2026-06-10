import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/authStore';
import useRoomStore from '../store/roomStore';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java',
  'cpp', 'c', 'go', 'rust', 'kotlin', 'csharp',
];

const LANGUAGE_LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', go: 'Go',
  rust: 'Rust', kotlin: 'Kotlin', csharp: 'C#',
};

// ── Create Room Modal ──────────────────────────────────────────────────────────
export const CreateRoomModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const room = await onCreate(name.trim(), language);
      onClose(room);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#333] shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-[420px] rounded-2xl p-xl flex flex-col gap-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">Create a new room</h2>
          <button onClick={() => onClose(null)} className="p-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg px-md py-sm font-body-md text-body-md">{error}</div>
        )}

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Room name</label>
            <input
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:border-white focus:ring-0 focus:outline-none transition-all font-body-md text-body-md"
              placeholder="e.g. My Python Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Language</label>
            <select
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface focus:border-white focus:ring-0 focus:outline-none transition-all font-body-md text-body-md"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-surface-container">{LANGUAGE_LABELS[l]}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-md mt-sm">
            <button type="button" onClick={() => onClose(null)}
              className="flex-1 py-sm rounded-lg border border-[#333] text-on-surface-variant hover:bg-white/5 hover:text-white transition-all font-body-md text-body-md">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-on-surface text-background py-sm rounded-lg font-body-md text-body-md font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Creating...</> : 'Create room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Join Room Modal ────────────────────────────────────────────────────────────
export const JoinRoomModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const room = await onJoin(code.trim().toUpperCase());
      onClose(room);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#333] shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-[420px] rounded-2xl p-xl flex flex-col gap-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">Join a room</h2>
          <button onClick={() => onClose(null)} className="p-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg px-md py-sm font-body-md text-body-md">{error}</div>
        )}

        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Invite code</label>
            <input
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:border-white focus:ring-0 focus:outline-none transition-all font-code-md text-body-md tracking-widest uppercase"
              placeholder="e.g. AB3X9K2M"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={10}
              autoFocus
              required
            />
          </div>

          <div className="flex gap-md mt-sm">
            <button type="button" onClick={() => onClose(null)}
              className="flex-1 py-sm rounded-lg border border-[#333] text-on-surface-variant hover:bg-white/5 hover:text-white transition-all font-body-md text-body-md">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-on-surface text-background py-sm rounded-lg font-body-md text-body-md font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Joining...</> : 'Join room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { createRoom, joinRoom } = useRoomStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateClose = (room) => {
    setShowCreate(false);
    if (room) navigate(`/workspace/${room.id}`);
  };

  const handleJoinClose = (room) => {
    setShowJoin(false);
    if (room) navigate(`/workspace/${room.id}`);
  };

  // Determine the page title based on the route
  const getPageTitle = () => {
    if (location.pathname.includes('/dashboard')) return 'My Rooms';
    if (location.pathname.includes('/profile')) return 'Profile';
    if (location.pathname.includes('/history')) return 'Execution History';
    if (location.pathname.includes('/settings')) return 'Settings';
    if (location.pathname.includes('/activity')) return 'Activity Log';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#000] overflow-hidden relative">
      
      {/* Background Glow Mesh (Premium Aesthetic) */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 blur-[180px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Sidebar - Shared across all layout pages */}
      <Sidebar />

      {/* Main Content Area (Floating window feel) */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#050505] relative z-10 m-2 rounded-2xl border border-[#222] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-[#222] flex justify-between items-center w-full px-lg h-16 flex-shrink-0">
          <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-md">
            <button onClick={() => setShowJoin(true)}
              className="border border-[#333] text-on-surface-variant px-md py-1.5 rounded-lg font-label-sm text-label-sm hover:bg-white/5 hover:text-white transition-all flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">login</span>
              Join room
            </button>
            <button onClick={() => setShowCreate(true)}
              className="bg-on-surface text-background px-md py-1.5 rounded-lg font-label-sm text-label-sm font-semibold hover:scale-105 active:scale-95 transition-all flex items-center gap-xs shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New room
            </button>
            
            <div className="w-px h-6 bg-[#333] mx-1"></div>
            
            <button onClick={() => navigate('/profile')} className="hover:scale-105 transition-transform">
              <div className="w-9 h-9 rounded-full bg-surface-container border border-[#333] flex items-center justify-center text-on-surface font-bold text-sm shadow-inner overflow-hidden">
                {user?.avatarUrl?.startsWith('http')
                    ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                    : (user?.username?.[0]?.toUpperCase() || 'U')}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content injected via Outlet */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-lg">
            <Outlet context={{ setShowCreate, setShowJoin }} />
        </div>
      </main>

      {/* Global Modals */}
      {showCreate && <CreateRoomModal onClose={handleCreateClose} onCreate={createRoom} />}
      {showJoin && <JoinRoomModal onClose={handleJoinClose} onJoin={joinRoom} />}
    </div>
  );
};

export default DashboardLayout;
