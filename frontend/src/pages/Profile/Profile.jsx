import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import { userService } from '../../api/userService';

const LANGUAGE_META = {
  javascript: { color: '#f7df1e', bg: 'rgba(247,223,30,0.10)', label: 'JavaScript' },
  typescript: { color: '#3178c6', bg: 'rgba(49,120,198,0.12)',  label: 'TypeScript' },
  python:     { color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  label: 'Python'     },
  java:       { color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  label: 'Java'       },
  cpp:        { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', label: 'C++'        },
  c:          { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', label: 'C'          },
  go:         { color: '#22d3ee', bg: 'rgba(34,211,238,0.10)',  label: 'Go'         },
  rust:       { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  label: 'Rust'       },
  kotlin:     { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', label: 'Kotlin'     },
  csharp:     { color: '#86efac', bg: 'rgba(134,239,172,0.10)', label: 'C#'         },
};

const SectionHeader = ({ icon, title, color = '#60a5fa', bg = 'rgba(96,165,250,0.10)' }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg, border: `1px solid ${color}30` }}>
      <span className="material-symbols-outlined text-[17px]" style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-[14px] font-bold text-on-surface tracking-tight">{title}</h3>
    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
  </div>
);

const Profile = () => {
    const navigate = useNavigate();
    const { user, fetchMe } = useAuthStore();
    const { rooms, fetchRooms } = useRoomStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try { const { data } = await userService.getProfile(); setProfile(data); }
            catch { if (!user) fetchMe(); }
            finally { setLoading(false); }
        };
        load(); fetchRooms();
    }, []);

    const displayUser = profile || user;
    const initials = displayUser?.username?.[0]?.toUpperCase() || 'U';
    const joinDate = displayUser?.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—';
    const owned = rooms.filter(r => r.owner?.id === displayUser?.id).length;
    const uniqueLangs = [...new Set(rooms.map(r => r.language))].filter(Boolean);
    const isAdmin = displayUser?.role === 'ROLE_ADMIN';

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)' }}>
                    <span className="material-symbols-outlined text-primary text-[24px] animate-spin">progress_activity</span>
                </div>
                <p className="text-on-surface-variant text-[12px]">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full text-on-surface">
            {/* ── HERO BANNER ─────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.12) 0%, rgba(0,240,255,0.05) 50%, rgba(139,92,246,0.06) 100%)', border: '1px solid rgba(0,112,243,0.22)', backdropFilter: 'blur(16px)' }}>
                {/* Decorative orbs */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.18) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #0070f3, #00f0ff80, transparent)' }} />

                <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {displayUser?.avatarUrl?.startsWith('http') ? (
                            <img src={displayUser.avatarUrl} alt="Avatar"
                                className="w-24 h-24 rounded-2xl object-cover"
                                style={{ border: '2px solid rgba(0,112,243,0.4)', boxShadow: '0 0 30px rgba(0,112,243,0.3)' }} />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black"
                                style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.30) 0%, rgba(0,240,255,0.15) 100%)', border: '2px solid rgba(0,112,243,0.4)', color: '#60a5fa', boxShadow: '0 0 30px rgba(0,112,243,0.25)' }}>
                                {initials}
                            </div>
                        )}
                        {/* Online dot */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 flex items-center justify-center"
                            style={{ borderColor: 'rgba(0,0,0,0.8)', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }}>
                            <div className="w-2 h-2 rounded-full bg-green-300 animate-ping absolute" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#60a5fa' }}>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse inline-block" />
                                {isAdmin ? 'Administrator' : 'Active Member'}
                            </div>
                        </div>
                        <h1 className="text-[28px] font-black tracking-tight text-on-surface mb-1 leading-tight"
                            style={{ background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {displayUser?.username || '—'}
                        </h1>
                        <p className="text-[13px] mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{displayUser?.email}</p>

                        <div className="flex gap-2 flex-wrap">
                            <span className="text-[11px] px-3 py-1.5 rounded-full font-bold" style={{ background: isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(0,112,243,0.15)', color: isAdmin ? '#fbbf24' : '#60a5fa', border: `1px solid ${isAdmin ? 'rgba(245,158,11,0.3)' : 'rgba(0,112,243,0.3)'}` }}>
                                {isAdmin ? '⚡ Admin' : '👤 Member'}
                            </span>
                            <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                🗓 Joined {joinDate}
                            </span>
                            <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(74,222,128,0.10)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                                ✓ Verified
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link to="/settings"
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold text-white no-underline hover:scale-105 active:scale-95 transition-all"
                            style={{ background: 'linear-gradient(135deg,#0070f3,#0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.4)' }}>
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Edit Profile
                        </Link>
                        <button onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:text-on-surface transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            New Workspace
                        </button>
                    </div>
                </div>
            </div>

            {/* ── STATS GRID ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Workspaces', value: rooms.length,           icon: 'folder_open',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   glow: 'rgba(96,165,250,0.15)'  },
                    { label: 'Owned by You',     value: owned,                  icon: 'admin_panel_settings',color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   glow: 'rgba(74,222,128,0.15)'  },
                    { label: 'Joined Others',    value: rooms.length - owned,   icon: 'group',              color: '#f472b6', bg: 'rgba(244,114,182,0.12)',  glow: 'rgba(244,114,182,0.15)' },
                    { label: 'Languages Used',   value: uniqueLangs.length,     icon: 'code',               color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   glow: 'rgba(251,146,60,0.15)'  },
                ].map((stat, i) => (
                    <div key={stat.label}
                        className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-all hover:scale-[1.02] duration-200 animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${i * 60}ms`, background: 'rgba(255,255,255,0.03)', border: `1px solid ${stat.color}18`, backdropFilter: 'blur(12px)', boxShadow: `0 0 20px ${stat.glow}` }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: stat.color }}>{stat.icon}</span>
                        </div>
                        <div>
                            <div className="text-[28px] font-black leading-none" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── LANGUAGE BADGES ─────────────────────────────────────────── */}
            {uniqueLangs.length > 0 && (
                <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                    <SectionHeader icon="translate" title="Languages You Code In" color="#f472b6" bg="rgba(244,114,182,0.10)" />
                    <div className="flex gap-2 flex-wrap">
                        {uniqueLangs.map(lang => {
                            const m = LANGUAGE_META[lang] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', label: lang };
                            return (
                                <span key={lang} className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105"
                                    style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}30` }}>
                                    {m.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── TWO COLUMN: Recent Rooms + Account Info ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent workspaces */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                    <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.12)' }}>
                                <span className="material-symbols-outlined text-[15px]" style={{ color: '#60a5fa' }}>folder_open</span>
                            </div>
                            <span className="text-[13px] font-bold text-on-surface">Recent Workspaces</span>
                        </div>
                        <Link to="/dashboard" className="text-[11px] font-semibold no-underline hover:underline" style={{ color: '#60a5fa' }}>View all →</Link>
                    </div>
                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.08)' }}>
                                <span className="material-symbols-outlined text-[24px]" style={{ color: '#60a5fa' }}>folder_off</span>
                            </div>
                            <p className="text-on-surface-variant text-[13px]">No workspaces yet</p>
                            <Link to="/dashboard" className="text-[12px] font-semibold no-underline hover:underline" style={{ color: '#60a5fa' }}>Create one →</Link>
                        </div>
                    ) : (
                        <div>
                            {rooms.slice(0, 6).map((room, i) => {
                                const m = LANGUAGE_META[room.language] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', label: room.language };
                                return (
                                    <div key={room.id} onClick={() => navigate(`/workspace/${room.id}`)}
                                        className="flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all group border-b"
                                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: m.bg, border: `1px solid ${m.color}25` }}>
                                                <span className="material-symbols-outlined text-[15px]" style={{ color: m.color }}>terminal</span>
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-semibold text-on-surface">{room.name}</div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: m.color }}>{m.label}</div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-[16px] transition-all group-hover:translate-x-1" style={{ color: 'rgba(255,255,255,0.2)' }}>chevron_right</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Account info */}
                <div className="flex flex-col gap-4">
                    {/* Account details card */}
                    <div className="rounded-2xl overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
                                <span className="material-symbols-outlined text-[15px]" style={{ color: '#4ade80' }}>manage_accounts</span>
                            </div>
                            <span className="text-[13px] font-bold text-on-surface">Account Details</span>
                        </div>
                        <div className="px-5 py-2">
                            {[
                                { label: 'Username',     value: displayUser?.username, icon: 'person',   color: '#60a5fa' },
                                { label: 'Email',        value: displayUser?.email,    icon: 'mail',     color: '#f472b6' },
                                { label: 'Role',         value: isAdmin ? 'Administrator' : 'Member', icon: 'shield', color: isAdmin ? '#fbbf24' : '#4ade80' },
                                { label: 'Member Since', value: joinDate,              icon: 'calendar_month', color: '#fb923c' },
                            ].map((item, i, arr) => (
                                <div key={item.label}
                                    className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? 'border-b' : ''}`}
                                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${item.color}12` }}>
                                            <span className="material-symbols-outlined text-[13px]" style={{ color: item.color }}>{item.icon}</span>
                                        </div>
                                        <span className="text-[12px] text-on-surface-variant">{item.label}</span>
                                    </div>
                                    <span className="text-[12px] font-semibold text-on-surface">{item.value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick actions card */}
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                        <SectionHeader icon="bolt" title="Quick Actions" color="#fbbf24" bg="rgba(251,191,36,0.10)" />
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Edit Profile', icon: 'edit', to: '/settings', color: '#0070f3', bg: 'rgba(0,112,243,0.12)', glow: 'rgba(0,112,243,0.3)' },
                                { label: 'History', icon: 'history', to: '/history', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', glow: null },
                                { label: 'Activity', icon: 'history_log', to: '/activity', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', glow: null },
                                { label: 'My Rooms', icon: 'folder_open', to: '/dashboard', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', glow: null },
                            ].map(action => (
                                <Link key={action.label} to={action.to}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold no-underline transition-all hover:scale-[1.03] active:scale-95"
                                    style={{ background: action.bg, color: action.color, border: `1px solid ${action.color}25`, boxShadow: action.glow ? `0 0 12px ${action.glow}` : 'none' }}>
                                    <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fade-in 0.4s ease both; }
            `}</style>
        </div>
    );
};

export default Profile;