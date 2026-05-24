import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRoomStore from '../../store/roomStore';
import useAuthStore from '../../store/authStore';

const JoinRoom = () => {
    const navigate = useNavigate();
    const { joinRoom } = useRoomStore();
    const { user, logout } = useAuthStore();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError('');
        try {
            const room = await joinRoom(code.trim().toUpperCase());
            navigate(`/workspace/${room.id}`);
        } catch (err) {
            setError(err.message || 'Invalid invite code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', overflow: 'hidden',
            background: '#0a0a0f', color: '#e8e8f0',
            fontFamily: 'Inter, sans-serif',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
                background: 'rgba(255,255,255,0.02)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CodeEditor
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{user?.email}</div>
                </div>
                <nav style={{ padding: '12px 0', flex: 1 }}>
                    {[
                        { to: '/dashboard', icon: 'folder_open', label: 'My Rooms' },
                        { to: '/history',   icon: 'history',     label: 'History'  },
                        { to: '/settings',  icon: 'settings',    label: 'Settings' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 20px', textDecoration: 'none',
                            fontSize: 12, color: 'rgba(255,255,255,0.45)',
                            transition: 'all 0.15s',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={async () => { await logout(); navigate('/login'); }}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', background: 'none', border: 'none',
                            color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', borderRadius: 8,
                        }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>

                {/* Glow */}
                <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                {/* Card */}
                <div style={{
                    width: '100%', maxWidth: 480, position: 'relative', zIndex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20, padding: 36,
                }}>
                    {/* Icon */}
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#818cf8' }}>group_add</span>
                    </div>

                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                        Join a Room
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.6 }}>
                        Enter the invite code shared by your teammate to start collaborating.
                    </p>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                            fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Invite code input */}
                        <div>
                            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 8 }}>
                                Invite Code
                            </label>
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="e.g. AB3X9K2M"
                                maxLength={12}
                                autoFocus
                                required
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: 'rgba(0,0,0,0.35)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 10, padding: '13px 16px',
                                    color: '#e8e8f0', fontSize: 18,
                                    fontFamily: 'monospace', letterSpacing: '0.2em',
                                    textTransform: 'uppercase', outline: 'none',
                                    textAlign: 'center', fontWeight: 700,
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            style={{
                                width: '100%', padding: '13px',
                                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading || !code.trim() ? 0.6 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all 0.15s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>login</span>
                                    Join Room
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                        Don't have a code?{' '}
                        <Link to="/dashboard" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                            Create a room
                        </Link>
                    </div>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
};

export default JoinRoom;