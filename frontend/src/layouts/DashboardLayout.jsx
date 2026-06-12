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

const LANGUAGE_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#4ade80',
  java: '#fb923c', cpp: '#c084fc', c: '#a78bfa', go: '#22d3ee',
  rust: '#f97316', kotlin: '#818cf8', csharp: '#86efac',
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
    setLoading(true); setError('');
    try { const room = await onCreate(name.trim(), language); onClose(room); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const langColor = LANGUAGE_COLORS[language] || '#60a5fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose(null)}>
      <div className="w-full max-w-[440px] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>

        {/* Gradient top bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${langColor}, transparent)` }} />

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${langColor}15`, border: `1px solid ${langColor}30` }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: langColor }}>terminal</span>
              </div>
              <h2 className="text-[17px] font-extrabold text-on-surface tracking-tight">New Workspace</h2>
            </div>
            <button onClick={() => onClose(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
              <span className="material-symbols-outlined text-[15px]">error</span>{error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Workspace Name</label>
              <input
                className="w-full px-4 py-3 rounded-xl text-[13px] text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                placeholder="e.g. My Python Project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor = `${langColor}50`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                autoFocus required
              />
            </div>

            {/* Language picker grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Language</label>
              <div className="grid grid-cols-5 gap-2">
                {LANGUAGES.map((l) => {
                  const c = LANGUAGE_COLORS[l] || '#60a5fa';
                  const active = language === l;
                  return (
                    <button key={l} type="button" onClick={() => setLanguage(l)}
                      className="py-2 px-1 rounded-xl text-[10px] font-bold transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-1"
                      style={{ background: active ? `${c}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? c + '45' : 'rgba(255,255,255,0.07)'}`, color: active ? c : 'rgba(255,255,255,0.4)' }}>
                      <span className="material-symbols-outlined text-[14px]" style={{ color: active ? c : 'rgba(255,255,255,0.3)' }}>code</span>
                      {LANGUAGE_LABELS[l].slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Selected: <span className="font-semibold" style={{ color: langColor }}>{LANGUAGE_LABELS[language]}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => onClose(null)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:text-on-surface transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${langColor}cc, ${langColor}88)`, boxShadow: `0 0 16px ${langColor}40` }}>
                {loading
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Creating...</>
                  : <><span className="material-symbols-outlined text-[16px]">add</span> Create workspace</>}
              </button>
            </div>
          </form>
        </div>
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
    setLoading(true); setError('');
    try { const room = await onJoin(code.trim().toUpperCase()); onClose(room); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const codeChars = code.toUpperCase().padEnd(8, '·').split('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose(null)}>
      <div className="w-full max-w-[420px] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}>

        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #0070f3, transparent)' }} />

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)' }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#60a5fa' }}>group_add</span>
              </div>
              <h2 className="text-[17px] font-extrabold text-on-surface tracking-tight">Join a Workspace</h2>
            </div>
            <button onClick={() => onClose(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
              <span className="material-symbols-outlined text-[15px]">error</span>{error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Invite Code</label>
              {/* Character display */}
              <div className="flex gap-1.5 justify-center mb-1">
                {codeChars.slice(0, 8).map((ch, i) => (
                  <div key={i} className="w-9 h-10 rounded-lg flex items-center justify-center text-[14px] font-bold font-mono transition-all"
                    style={{ background: ch !== '·' ? 'rgba(0,112,243,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${ch !== '·' ? 'rgba(0,112,243,0.35)' : 'rgba(255,255,255,0.07)'}`, color: ch !== '·' ? '#60a5fa' : 'rgba(255,255,255,0.12)' }}>
                    {ch}
                  </div>
                ))}
              </div>
              <input
                className="w-full text-center text-[15px] font-bold font-mono tracking-[0.25em] uppercase py-3 rounded-xl outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e8e8f0' }}
                placeholder="Type invite code..."
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={8} autoFocus required
                onFocus={e => e.target.style.borderColor = 'rgba(0,112,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => onClose(null)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:text-on-surface transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || code.length < 4}
                className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 16px rgba(0,112,243,0.35)' }}>
                {loading
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Joining...</>
                  : <><span className="material-symbols-outlined text-[16px]">login</span> Join workspace</>}
              </button>
            </div>
          </form>
        </div>
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
    <div className="flex h-screen bg-background overflow-hidden relative">
      
      {/* Background Glow Mesh — matches Landing page */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/20 blur-[180px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/20 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Sidebar - Shared across all layout pages */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 bg-surface-container-low/50 relative z-10 m-2 rounded-2xl border border-outline-variant/30 shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-sm">
        
        {/* Global Top Navbar */}
        <header className="sticky top-0 z-30 bg-surface-container-low/80 backdrop-blur-2xl border-b border-outline-variant/30 flex justify-between items-center w-full px-lg h-16 flex-shrink-0">
          <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-md">
            <button onClick={() => setShowJoin(true)}
              className="border border-outline-variant/50 text-on-surface-variant px-md py-1.5 rounded-lg font-label-sm text-label-sm hover:bg-white/5 hover:text-on-surface transition-all flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">login</span>
              Join room
            </button>
            <button onClick={() => setShowCreate(true)}
              className="bg-primary text-on-primary px-md py-1.5 rounded-lg font-label-sm text-label-sm font-semibold hover:scale-105 active:scale-95 transition-all flex items-center gap-xs shadow-[0_0_15px_rgba(0,112,243,0.3)] hover:shadow-[0_0_25px_rgba(0,112,243,0.5)]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New room
            </button>
            
            <div className="w-px h-6 bg-outline-variant/40 mx-1"></div>
            
            <button onClick={() => navigate('/profile')} className="hover:scale-105 transition-transform">
              <div className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center text-on-surface font-bold text-sm shadow-inner overflow-hidden">
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
