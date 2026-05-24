import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import Sidebar from '../../components/Sidebar';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java',
  'cpp', 'c', 'go', 'rust', 'kotlin', 'csharp',
];

const LANGUAGE_LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', go: 'Go',
  rust: 'Rust', kotlin: 'Kotlin', csharp: 'C#',
};

const languageColor = (lang) => {
  const map = {
    javascript: 'text-yellow-400 bg-yellow-400/10',
    typescript: 'text-blue-400 bg-blue-400/10',
    python: 'text-green-400 bg-green-400/10',
    java: 'text-orange-400 bg-orange-400/10',
    cpp: 'text-purple-400 bg-purple-400/10',
    c: 'text-purple-300 bg-purple-300/10',
    go: 'text-cyan-400 bg-cyan-400/10',
    rust: 'text-orange-300 bg-orange-300/10',
    kotlin: 'text-violet-400 bg-violet-400/10',
    csharp: 'text-green-300 bg-green-300/10',
  };
  return map[lang] || 'text-on-surface-variant bg-surface-variant/30';
};

// ── Create Room Modal ──────────────────────────────────────────────────────────
const CreateRoomModal = ({ onClose, onCreate }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-[420px] rounded-xl p-xl shadow-2xl flex flex-col gap-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Create a new room</h2>
          <button onClick={() => onClose(null)} className="p-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant/30 transition-all">
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
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:border-[#6366f1] focus:ring-0 focus:outline-none transition-all font-body-md text-body-md"
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
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface focus:border-[#6366f1] focus:ring-0 focus:outline-none transition-all font-body-md text-body-md"
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
              className="flex-1 py-sm rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant/30 transition-all font-body-md text-body-md">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-sm rounded-lg font-body-md text-body-md font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Creating...</> : 'Create room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Join Room Modal ────────────────────────────────────────────────────────────
const JoinRoomModal = ({ onClose, onJoin }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-[420px] rounded-xl p-xl shadow-2xl flex flex-col gap-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Join a room</h2>
          <button onClick={() => onClose(null)} className="p-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-variant/30 transition-all">
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
              className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm text-on-surface placeholder:text-outline focus:border-[#6366f1] focus:ring-0 focus:outline-none transition-all font-code-md text-body-md tracking-widest uppercase"
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
              className="flex-1 py-sm rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant/30 transition-all font-body-md text-body-md">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-sm rounded-lg font-body-md text-body-md font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Joining...</> : 'Join room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Room Card ──────────────────────────────────────────────────────────────────
const RoomCard = ({ room, currentUserId, onDelete, onOpen }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
const isOwner = room.owner?.id === currentUserId;


  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(room.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-lg flex flex-col gap-md hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => onOpen(room.id)}>
      <div className="flex items-start justify-between gap-sm">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline-md text-headline-md text-on-surface truncate group-hover:text-primary transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-sm mt-xs flex-wrap">
            <span className={`font-label-sm text-label-sm px-sm py-xs rounded-full ${languageColor(room.language)}`}>
              {LANGUAGE_LABELS[room.language] || room.language}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">group</span>
              {room.memberCount ?? room.members?.length ?? 1} member{(room.memberCount ?? room.members?.length ?? 1) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {isOwner && (
          <button onClick={handleDelete} disabled={deleting}
            className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-[18px]">
              {deleting ? 'progress_activity' : 'delete'}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between bg-black/20 rounded-lg px-md py-sm border border-outline-variant/20">
        <span className="font-code-md text-body-md text-on-surface-variant tracking-widest">
          {room.inviteCode}
        </span>
        <button onClick={copyCode}
          className="text-on-surface-variant hover:text-primary transition-colors ml-sm">
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onOpen(room.id); }}
        className="w-full py-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg font-label-sm text-label-sm transition-all active:scale-95">
        Open room →
      </button>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rooms, isLoading, fetchRooms, createRoom, joinRoom, deleteRoom } = useRoomStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateClose = (room) => {
    setShowCreate(false);
    if (room) navigate(`/workspace/${room.id}`);
  };

  const handleJoinClose = (room) => {
    setShowJoin(false);
    if (room) navigate(`/workspace/${room.id}`);
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar />

      <main className="flex-grow min-h-screen flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center w-full px-md h-16">
          <h1 className="font-headline-md text-headline-md text-on-surface">My Rooms</h1>
          <div className="flex items-center gap-md">
            <button onClick={() => setShowJoin(true)}
              className="border border-outline-variant/40 text-on-surface-variant px-md py-xs rounded-lg font-label-sm text-label-sm hover:bg-surface-variant/30 transition-all flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">login</span>
              Join room
            </button>
            <button onClick={() => setShowCreate(true)}
              className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white px-md py-xs rounded-lg font-label-sm text-label-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-xs shadow-lg">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New room
            </button>
            <Link to="/profile">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow p-lg">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-lg animate-pulse flex flex-col gap-md">
                  <div className="h-5 bg-surface-variant/50 rounded w-3/4"></div>
                  <div className="h-4 bg-surface-variant/30 rounded w-1/2"></div>
                  <div className="h-10 bg-surface-variant/20 rounded"></div>
                  <div className="h-9 bg-surface-variant/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-lg text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[40px]">terminal</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">No rooms yet</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Create your first room or join one with an invite code</p>
              </div>
              <div className="flex gap-md">
                <button onClick={() => setShowCreate(true)}
                  className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white px-lg py-sm rounded-lg font-body-md text-body-md font-bold hover:brightness-110 active:scale-95 transition-all">
                  Create room
                </button>
                <button onClick={() => setShowJoin(true)}
                  className="border border-outline-variant/40 text-on-surface-variant px-lg py-sm rounded-lg font-body-md text-body-md hover:bg-surface-variant/30 transition-all">
                  Join room
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
              {rooms.map((room) => {
                return (<RoomCard
                  key={room.id}
                  room={room}
                  currentUserId={user?.id}
                  onDelete={deleteRoom}
                  onOpen={(id) => navigate(`/workspace/${id}`)}
                />
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateRoomModal onClose={handleCreateClose} onCreate={createRoom} />}
      {showJoin && <JoinRoomModal onClose={handleJoinClose} onJoin={joinRoom} />}
    </div>
  );
};

export default Dashboard;