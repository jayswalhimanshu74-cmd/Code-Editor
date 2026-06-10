import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';


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
    <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl p-lg flex flex-col gap-md hover:border-[#666] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500"
      onClick={() => onOpen(room.id)}>
      <div className="flex items-start justify-between gap-sm">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline-md text-headline-md text-on-surface truncate tracking-tight font-semibold">
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
        className="w-full py-sm bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 rounded-lg font-label-sm text-label-sm transition-all active:scale-95">
        Open room →
      </button>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms, isLoading, fetchRooms, deleteRoom } = useRoomStore();
  const { setShowCreate, setShowJoin } = useOutletContext();

  useEffect(() => {
    fetchRooms();
  }, []);



  return (
    <div className="flex-grow">
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
            <div className="flex flex-col items-center justify-center h-[60vh] gap-lg text-center animate-in fade-in duration-700">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#333] to-[#111] rounded-2xl flex items-center justify-center border border-[#444] shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="material-symbols-outlined text-white text-[32px]">terminal</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">No rooms yet</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Create your first room or join one with an invite code</p>
              </div>
              <div className="flex gap-md">
                <button onClick={() => setShowCreate(true)}
                  className="bg-on-surface text-background px-lg py-sm rounded-full font-body-md text-body-md font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Create room
                </button>
                <button onClick={() => setShowJoin(true)}
                  className="border border-[#333] text-on-surface px-lg py-sm rounded-full font-body-md text-body-md hover:bg-white/5 transition-all">
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
  );
};

export default Dashboard;