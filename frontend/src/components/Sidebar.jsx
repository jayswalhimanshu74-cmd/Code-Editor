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

    if (user?.role === 'ROLE_ADMIN') {
        navLinks.push({ to: '/admin-dashboard', icon: 'admin_panel_settings', label: 'Admin Dashboard' });
    }

    return (
        <aside className="hidden md:flex md:flex-col w-[240px] flex-shrink-0 bg-[#000] border-r border-[#222] p-0 z-40 h-screen sticky top-0">
            <Link to="/dashboard" className="no-underline">
                <div className="px-5 py-6 border-b border-[#222] flex items-center gap-2">
                    <div className="w-5 h-5 rounded-[4px] bg-gradient-to-tr from-[#0070f3] to-[#00f0ff] shadow-[0_0_10px_rgba(0,112,243,0.5)]"></div>
                    <div>
                        <div className="text-[18px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Hence-Code</div>
                        <div className="text-[11px] text-white/40 font-medium">{user?.email || 'Guest'}</div>
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
                                  ? 'text-white bg-[#111] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-[#333]' 
                                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                              }`}>
                            <span className="material-symbols-outlined text-[18px] opacity-80">{l.icon}</span>
                            {l.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-background bg-on-surface shadow-inner overflow-hidden flex-shrink-0">
                        {user?.avatarUrl?.startsWith('http')
                            ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                            : (user?.username?.[0]?.toUpperCase() || 'U')}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-white/90 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">{user?.username || 'User'}</div>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-transparent border border-[#333] text-white/60 text-[12px] font-semibold rounded-lg hover:text-[#ff0080] hover:border-[#ff0080]/50 hover:bg-[#ff0080]/10 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
