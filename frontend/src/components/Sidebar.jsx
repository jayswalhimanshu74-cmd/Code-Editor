import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', icon: 'folder_open', label: 'My Rooms' },
        { to: '/history',   icon: 'history',     label: 'History' },
        { to: '/join-room', icon: 'group_add',   label: 'Join Room' },
        { to: '/settings',  icon: 'settings',    label: 'Settings' },
        { to: '/profile',   icon: 'person',      label: 'Profile' },
        { to: '/activity',  icon: 'history_log',  label: 'Activity' }
    ];

    const s = {
        aside:  { width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '0', zIndex: 40, height: '100vh', position: 'sticky', top: 0 },
        logo:   { padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        logoTxt:{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' },
        navLnk: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', textDecoration: 'none', fontSize: 13, color: active ? '#818cf8' : 'rgba(255,255,255,0.45)', background: active ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: active ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.15s' }),
    };

    return (
        <aside style={s.aside} className="hidden md:flex md:flex-col">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={s.logo}>
                    <div style={s.logoTxt}>CodeEditor</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{user?.email || 'Guest'}</div>
                </div>
            </Link>

            <nav style={{ padding: '12px 0', flex: 1 }}>
                {navLinks.map(l => {
                    const active = location.pathname.startsWith(l.to);
                    return (
                        <Link key={l.to} to={l.to} style={s.navLnk(active)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>{l.icon}</span>
                            {l.label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background: user?.avatarUrl?.startsWith('http') ? 'transparent' : (user?.avatarUrl || '#4f46e5'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0, overflow:'hidden' }}>
                        {user?.avatarUrl?.startsWith('http')
                            ? <img src={user.avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                            : (user?.username?.[0]?.toUpperCase() || 'U')}
                    </div>
                    <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.username || 'User'}</div>
                    </div>
                </div>
                <button onClick={handleLogout}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent:'center', gap: 8,
                        padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.6)', fontSize: 11, cursor: 'pointer', borderRadius: 10,
                        transition: 'all 0.2s', fontWeight: 600
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>logout</span>
                    Sign out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
