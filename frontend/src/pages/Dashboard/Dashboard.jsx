import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';

const LANGUAGE_LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', go: 'Go',
  rust: 'Rust', kotlin: 'Kotlin', csharp: 'C#',
};

const LANGUAGE_META = {
  javascript: { color: '#f7df1e', bg: 'rgba(247,223,30,0.10)', icon: 'code' },
  typescript: { color: '#3178c6', bg: 'rgba(49,120,198,0.12)', icon: 'code' },
  python:     { color: '#4ade80', bg: 'rgba(74,222,128,0.10)', icon: 'code' },
  java:       { color: '#fb923c', bg: 'rgba(251,146,60,0.10)', icon: 'coffee' },
  cpp:        { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', icon: 'memory' },
  c:          { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', icon: 'memory' },
  go:         { color: '#22d3ee', bg: 'rgba(34,211,238,0.10)', icon: 'code' },
  rust:       { color: '#f97316', bg: 'rgba(249,115,22,0.10)', icon: 'code' },
  kotlin:     { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', icon: 'code' },
  csharp:     { color: '#86efac', bg: 'rgba(134,239,172,0.10)', icon: 'code' },
};

// ── Room Card ────────────────────────────────────────────────────────────────
const RoomCard = ({ room, currentUserId, onDelete, onOpen, index }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isOwner = room.owner?.id === currentUserId;
  const meta = LANGUAGE_META[room.language] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', icon: 'code' };
  const memberCount = room.memberCount ?? room.members?.length ?? 1;

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
    try { await onDelete(room.id); } finally { setDeleting(false); }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onOpen(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card glass background */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${meta.color}12 0%, rgba(255,255,255,0.04) 100%)`
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? meta.color + '40' : 'rgba(255,255,255,0.08)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: hovered ? `0 0 30px ${meta.color}18, 0 8px 32px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.2)',
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all duration-300"
        style={{ background: hovered ? `linear-gradient(90deg, ${meta.color}, transparent)` : 'transparent' }}
      />

      <div className="relative p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {/* Language icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}
          >
            <span className="material-symbols-outlined text-[22px]" style={{ color: meta.color }}>{meta.icon}</span>
          </div>

          {/* Delete button */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">
                {deleting ? 'progress_activity' : 'delete'}
              </span>
            </button>
          )}
        </div>

        {/* Room name & badges */}
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-[15px] text-on-surface truncate tracking-tight leading-tight">
            {room.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide"
              style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.color}25` }}
            >
              {LANGUAGE_LABELS[room.language] || room.language}
            </span>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">group</span>
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Invite code */}
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2 transition-all"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-code-md text-[11px] text-on-surface-variant tracking-[0.2em] select-all">
            {room.inviteCode}
          </span>
          <button
            onClick={copyCode}
            className="text-on-surface-variant hover:text-primary transition-colors ml-2 flex-shrink-0"
            title="Copy invite code"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>

        {/* Open button */}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(room.id); }}
          className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{
            background: hovered ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
            color: hovered ? meta.color : 'rgba(255,255,255,0.6)',
            border: `1px solid ${hovered ? meta.color + '35' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          Open workspace
        </button>
      </div>
    </div>
  );
};

// ── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ rooms, user }) => {
  const owned = rooms.filter(r => r.owner?.id === user?.id).length;
  const joined = rooms.length - owned;
  const langs = [...new Set(rooms.map(r => r.language))].length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: 'Total Rooms', value: rooms.length, icon: 'folder_open', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
        { label: 'Owned', value: owned, icon: 'admin_panel_settings', color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
        { label: 'Languages', value: langs, icon: 'translate', color: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
      ].map(stat => (
        <div
          key={stat.label}
          className="rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02] duration-200"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: stat.color }}>{stat.icon}</span>
          </div>
          <div>
            <div className="text-[20px] font-extrabold text-on-surface leading-none">{stat.value}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { rooms, isLoading, fetchRooms, deleteRoom } = useRoomStore();
  const { setShowCreate, setShowJoin } = useOutletContext();

  useEffect(() => { fetchRooms(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-grow">

      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-6"
        style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.12) 0%, rgba(0,240,255,0.06) 50%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(0,112,243,0.2)', backdropFilter: 'blur(12px)' }}>
        {/* Decorative glow orbs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 right-1/3 w-20 h-20 bg-secondary/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-primary font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
              Hence-Code IDE
            </div>
            <h2 className="text-[22px] font-extrabold tracking-tight text-on-surface mb-1">
              {greeting()}, <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.username || 'Developer'}</span> 👋
            </h2>
            <p className="text-[13px] text-on-surface-variant">
              {rooms.length > 0
                ? `You have ${rooms.length} workspace${rooms.length !== 1 ? 's' : ''}. Ready to code?`
                : 'Start your first collaborative session today.'}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Join room
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.4)' }}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New workspace
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && rooms.length > 0 && <StatsBar rooms={rooms} user={user} />}

      {/* Section header */}
      {!isLoading && rooms.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">grid_view</span>
            <h3 className="text-[13px] font-semibold text-on-surface">Your Workspaces</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{rooms.length}</span>
          </div>
          <div className="text-[11px] text-on-surface-variant">Click any room to open it</div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-xl" />
                <div className="flex-1">
                  <div className="h-3.5 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-white/05 rounded w-1/2" />
                </div>
              </div>
              <div className="h-9 bg-white/05 rounded-xl" />
              <div className="h-9 bg-white/05 rounded-xl" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center animate-in fade-in duration-700">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.15), rgba(0,240,255,0.08))', border: '1px solid rgba(0,112,243,0.25)', boxShadow: '0 0 40px rgba(0,112,243,0.2)' }}>
              <span className="material-symbols-outlined text-primary text-[44px]">terminal</span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[12px]">add</span>
            </div>
          </div>
          <div>
            <h2 className="text-[20px] font-extrabold text-on-surface mb-2 tracking-tight">No workspaces yet</h2>
            <p className="text-[13px] text-on-surface-variant max-w-xs">Create your first collaborative workspace or join an existing one with an invite code.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-2xl text-[13px] font-bold text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 25px rgba(0,112,243,0.4)' }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create workspace
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="px-6 py-3 rounded-2xl text-[13px] font-semibold text-on-surface hover:bg-white/5 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Join with code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room, i) => (
            <RoomCard
              key={room.id}
              room={room}
              index={i}
              currentUserId={user?.id}
              onDelete={deleteRoom}
              onOpen={(id) => navigate(`/workspace/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;