import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import { userService } from '../../api/userService';
import Sidebar from '../../components/Sidebar';

const Profile = () => {
    const navigate = useNavigate();
    const { user, fetchMe, logout } = useAuthStore();
    const { rooms, fetchRooms } = useRoomStore();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await userService.getProfile();
                setProfile(data);
            } catch {
                if (!user) fetchMe();
            } finally {
                setLoading(false);
            }
        };
        load();
        fetchRooms();
    }, [user, fetchMe, fetchRooms]);

    const displayUser = profile || user;
    const initials = displayUser?.username?.[0]?.toUpperCase() || 'U';
    const joinDate = displayUser?.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : '—';

    const s = {
        page:    { height: '100vh', display: 'flex', overflow: 'hidden' },
        main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        header:  { height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' },
        scroll:  { flex: 1, overflowY: 'auto', padding: 28 },
        card:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 16 },
        label:   { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 6 },
        navLink: (active) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', textDecoration: 'none', fontSize: 12,
            color: active ? '#818cf8' : 'rgba(255,255,255,0.45)',
            background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
            transition: 'all 0.15s',
        }),
    };

    return (
        <div style={s.page}>

            {/* Sidebar */}
            <Sidebar />

            {/* Main */}
            <div style={s.main}>

                {/* Header */}
                <header style={s.header}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>Profile</div>
                    <Link to="/settings" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 9,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 12,
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                        Edit Profile
                    </Link>
                </header>

                <div style={s.scroll}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                            Loading...
                        </div>
                    ) : (
                        <div style={{ maxWidth: 700, margin: '0 auto' }}>

                            {/* Hero card */}
                            <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                                {/* Avatar */}
                                {displayUser?.avatarUrl?.startsWith('http') ? (
                                    <img src={displayUser.avatarUrl} alt="Avatar"
                                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.3)', flexShrink: 0 }} />
                                ) : (
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                                        background: displayUser?.avatarUrl || 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 32, fontWeight: 800, color: '#fff',
                                        border: '3px solid rgba(99,102,241,0.3)',
                                    }}>
                                        {initials}
                                    </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
                                        {displayUser?.username || '—'}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                                        {displayUser?.email}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            Member
                                        </span>
                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            Joined {joinDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: 'Total Rooms', value: rooms.length, icon: 'folder_open' },
                                    { label: 'Owned Rooms', value: rooms.filter(r => r.owner?.id === displayUser?.id).length, icon: 'admin_panel_settings' },
                                    { label: 'Joined Rooms', value: rooms.filter(r => r.owner?.id !== displayUser?.id).length, icon: 'group' },
                                ].map(stat => (
                                    <div key={stat.label} style={{ ...s.card, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#818cf8' }}>{stat.icon}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: '#e8e8f0' }}>{stat.value}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent rooms */}
                            <div style={s.card}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>Recent Rooms</div>
                                {rooms.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                                        No rooms yet —{' '}
                                        <Link to="/dashboard" style={{ color: '#818cf8', textDecoration: 'none' }}>create one</Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {rooms.slice(0, 5).map(room => (
                                            <div key={room.id}
                                                onClick={() => navigate(`/workspace/${room.id}`)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 14px', borderRadius: 10,
                                                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#818cf8' }}>terminal</span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f0' }}>{room.name}</div>
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{room.language}</div>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }}>chevron_right</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Account info */}
                            <div style={s.card}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>Account Info</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'Username', value: displayUser?.username },
                                        { label: 'Email', value: displayUser?.email },
                                        { label: 'Member Since', value: joinDate },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                                            <span style={{ fontSize: 12, color: '#e8e8f0', fontWeight: 500 }}>{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <Link to="/settings" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '9px 16px', borderRadius: 9,
                                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                        color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600,
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>settings</span>
                                        Edit in Settings
                                    </Link>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;