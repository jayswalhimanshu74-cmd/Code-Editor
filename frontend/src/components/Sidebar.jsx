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
        { to: '/activity',  icon: 'history',  label: 'Activity' }
    ];

    if (user?.role === 'ROLE_ADMIN') {
        navLinks.push({ to: '/admin-dashboard', icon: 'admin_panel_settings', label: 'Admin Dashboard' });
    }

    return (
        <aside className="hidden md:flex md:flex-col w-[240px] flex-shrink-0 bg-surface-container-low/80 backdrop-blur-xl border-r border-outline-variant/30 p-0 z-40 h-screen sticky top-0">
            <Link to="/dashboard" className="no-underline">
                <div className="px-5 py-6 border-b border-outline-variant/30 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-neon-cyan shadow-[0_0_12px_rgba(0,112,243,0.5)] flex-shrink-0"></div>
                    <div>
                        <div className="text-[17px] font-extrabold tracking-tighter text-on-surface">Hence-Code</div>
                        <div className="text-[11px] text-on-surface-variant font-medium truncate max-w-[160px]">{user?.email || 'Guest'}</div>
                    </div>
                </div>
            </Link>

            <nav className="py-3 flex-1 flex flex-col gap-1 px-2">
                {navLinks.map(l => {
                    const active = location.pathname.startsWith(l.to);
                    return (
                        <Link key={l.to} to={l.to}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-[13px] font-medium transition-all ${
                                  active
                                  ? 'text-primary bg-primary/10 border border-primary/20 shadow-[0_0_10px_rgba(0,112,243,0.1)]'
                                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'
                              }`}>
                            <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'opacity-70'}`}>{l.icon}</span>
                            {l.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold bg-primary/10 text-primary border border-primary/20 shadow-inner overflow-hidden flex-shrink-0">
                        {user?.avatarUrl?.startsWith('http')
                            ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                            : (user?.username?.[0]?.toUpperCase() || 'U')}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-on-surface whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{user?.username || 'User'}</div>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-transparent border border-outline-variant/40 text-on-surface-variant text-[12px] font-semibold rounded-lg hover:text-error hover:border-error/50 hover:bg-error/10 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
