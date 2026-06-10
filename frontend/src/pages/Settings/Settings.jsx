import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { userService } from '../../api/userService';

const AVATAR_COLORS = [
    '#6366f1','#8b5cf6','#ec4899','#f43f5e',
    '#f97316','#eab308','#22c55e','#14b8a6',
    '#3b82f6','#06b6d4',
];

const useTheme = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
    return { theme, toggle };
};

const Settings = () => {
    const { user, fetchMe, logout } = useAuthStore();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarInput, setAvatarInput] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwStrength, setPwStrength] = useState(0);

    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (user) { setUsername(user.username || ''); setAvatarUrl(user.avatarUrl || ''); }
        else fetchMe();
    }, [user]);

    useEffect(() => {
        let s = 0;
        if (newPassword.length >= 6) s++;
        if (newPassword.length >= 10) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        setPwStrength(s);
    }, [newPassword]);

    const handleSaveProfile = async () => {
        if (!username.trim()) return showToast('Username cannot be empty', 'error');
        setProfileLoading(true);
        try {
            await userService.updateProfile(username.trim(), avatarUrl);
            await fetchMe();
            showToast('Profile saved successfully');
        } catch (e) {
            showToast(e.response?.data?.message || 'Failed to save', 'error');
        } finally { setProfileLoading(false); }
    };

    const handleSavePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) return showToast('Fill all fields', 'error');
        if (newPassword !== confirmPassword) return showToast('Passwords do not match', 'error');
        if (newPassword.length < 6) return showToast('Min 6 characters', 'error');
        setPwLoading(true);
        try {
            await userService.updatePassword(currentPassword, newPassword);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            showToast('Password changed successfully');
        } catch (e) {
            showToast(e.response?.data?.message || 'Failed to change password', 'error');
        } finally { setPwLoading(false); }
    };

    const initials = (username || user?.username || 'U')[0].toUpperCase();
    const pwStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][pwStrength];
    const pwStrengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'][pwStrength];

    const tabs = [
        { id: 'profile',    label: 'Profile',    icon: 'person' },
        { id: 'security',   label: 'Security',   icon: 'lock' },
        { id: 'appearance', label: 'Appearance', icon: 'palette' },
        { id: 'account',    label: 'Account',    icon: 'manage_accounts' },
    ];

    const navLinks = [
        { to: '/dashboard', icon: 'folder_open',  label: 'My Rooms'  },
        { to: '/history',   icon: 'history',      label: 'History'   },
        { to: '/settings',  icon: 'settings',     label: 'Settings', active: true },
    ];

    const s = {
        main:   { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },
        tabBar: { display:'flex', gap:4, background:'rgba(255,255,255,0.03)', padding:4, borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' },
        tab:    (active) => ({ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:500, transition:'all 0.15s', background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#818cf8' : 'rgba(255,255,255,0.4)', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' }),
        scroll: { flex:1, overflowY:'auto', padding:'28px 32px' },
        card:   { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'24px', marginBottom:16 },
        label:  { fontSize:10, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600, marginBottom:8, display:'block' },
        input:  { width:'100%', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 14px', color:'#e8e8f0', fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s' },
        btn:    (variant='primary', sm=false) => ({
            display:'inline-flex', alignItems:'center', gap:7,
            padding: sm ? '8px 14px' : '11px 20px',
            borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:600,
            transition:'all 0.15s', letterSpacing:'0.01em',
            ...(variant === 'primary' ? { background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', boxShadow:'0 2px 12px rgba(99,102,241,0.3)' } : {}),
            ...(variant === 'ghost'   ? { background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.08)' } : {}),
            ...(variant === 'danger'  ? { background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' } : {}),
        }),
        row:    { display:'flex', flexDirection:'column', gap:14 },
        grid2:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
        divider:{ height:1, background:'rgba(255,255,255,0.05)', margin:'20px 0' },
    };

    return (
        <div className="flex-1 w-full h-full text-on-surface">
                {/* Tabs Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px 20px 32px', flexShrink:0 }}>
                    <div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Manage your account and preferences</div>
                    </div>
                    {/* Tab bar */}
                    <div style={s.tabBar}>
                        {tabs.map(t => (
                            <button key={t.id} style={s.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
                                <span className="material-symbols-outlined" style={{ fontSize:14 }}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={s.scroll}>
                    <div style={{ maxWidth:580 }}>

                        {/* ── Profile Tab ── */}
                        {activeTab === 'profile' && (
                            <>
                                {/* Avatar + name hero */}
                                <div style={{ ...s.card, display:'flex', alignItems:'center', gap:20 }}>
                                    <div style={{ position:'relative', flexShrink:0 }}>
                                        <div style={{ width:72, height:72, borderRadius:'50%', background: avatarUrl?.startsWith('http') ? 'transparent' : (avatarUrl || '#4f46e5'), display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#fff', border:'3px solid rgba(99,102,241,0.3)', overflow:'hidden' }}>
                                            {avatarUrl?.startsWith('http')
                                                ? <img src={avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                                                : initials}
                                        </div>
                                        <div style={{ position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0a0a0f' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize:12, color:'#fff' }}>edit</span>
                                        </div>
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>{user?.username || '—'}</div>
                                        <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:3 }}>{user?.email}</div>
                                        <div style={{ display:'flex', gap:6, marginTop:10 }}>
                                            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>Member</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit name */}
                                <div style={s.card}>
                                    <div style={{ fontSize:13, fontWeight:600, marginBottom:16, color:'rgba(255,255,255,0.8)' }}>Display Name</div>
                                    <div style={s.row}>
                                        <div>
                                            <span style={s.label}>Username</span>
                                            <input
                                                style={s.input}
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                placeholder="Your display name"
                                                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                            />
                                        </div>
                                        <div>
                                            <button style={s.btn('primary')} onClick={handleSaveProfile} disabled={profileLoading}>
                                                {profileLoading
                                                    ? <><span className="material-symbols-outlined" style={{ fontSize:14, animation:'spin 1s linear infinite' }}>progress_activity</span>Saving…</>
                                                    : <><span className="material-symbols-outlined" style={{ fontSize:14 }}>save</span>Save Changes</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar picker */}
                                <div style={s.card}>
                                    <div style={{ fontSize:13, fontWeight:600, marginBottom:4, color:'rgba(255,255,255,0.8)' }}>Avatar Color</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:16 }}>Choose a color or paste an image URL</div>

                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                                        {AVATAR_COLORS.map(c => (
                                            <button key={c} onClick={() => setAvatarUrl(c)} style={{ width:38, height:38, borderRadius:'50%', background:c, border: avatarUrl===c ? '3px solid #fff' : '2px solid transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', transition:'all 0.15s' }}>
                                                {avatarUrl === c ? '✓' : initials}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={s.divider} />

                                    <span style={s.label}>Image URL</span>
                                    <div style={{ display:'flex', gap:8 }}>
                                        <input
                                            style={{ ...s.input, flex:1 }}
                                            value={avatarInput}
                                            onChange={e => setAvatarInput(e.target.value)}
                                            placeholder="https://example.com/photo.jpg"
                                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                        <button style={s.btn('ghost', true)} onClick={() => { setAvatarUrl(avatarInput); }}>
                                            Apply
                                        </button>
                                    </div>
                                    {avatarUrl?.startsWith('http') && (
                                        <img src={avatarUrl} alt="Preview" style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', marginTop:12, border:'2px solid rgba(99,102,241,0.3)' }}
                                            onError={e => e.target.style.display='none'} />
                                    )}

                                    <div style={{ marginTop:16 }}>
                                        <button style={s.btn('primary')} onClick={handleSaveProfile} disabled={profileLoading}>
                                            <span className="material-symbols-outlined" style={{ fontSize:14 }}>face</span>
                                            Save Avatar
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Security Tab ── */}
                        {activeTab === 'security' && (
                            <div style={s.card}>
                                <div style={{ fontSize:13, fontWeight:600, marginBottom:4, color:'rgba(255,255,255,0.8)' }}>Change Password</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:20 }}>Use a strong password to keep your account safe</div>

                                <div style={s.row}>
                                    <div>
                                        <span style={s.label}>Current Password</span>
                                        <input type={showPw ? 'text' : 'password'} style={s.input} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password"
                                            onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                                    </div>

                                    <div style={s.divider} />

                                    <div>
                                        <span style={s.label}>New Password</span>
                                        <input type={showPw ? 'text' : 'password'} style={s.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters"
                                            onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />

                                        {/* Strength bar */}
                                        {newPassword && (
                                            <div style={{ marginTop:8 }}>
                                                <div style={{ display:'flex', gap:3, marginBottom:4 }}>
                                                    {[1,2,3,4,5].map(i => (
                                                        <div key={i} style={{ flex:1, height:3, borderRadius:3, background: i <= pwStrength ? pwStrengthColor : 'rgba(255,255,255,0.1)', transition:'all 0.3s' }} />
                                                    ))}
                                                </div>
                                                <div style={{ fontSize:10, color: pwStrengthColor, fontWeight:600 }}>{pwStrengthLabel}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <span style={s.label}>Confirm New Password</span>
                                        <input type={showPw ? 'text' : 'password'} style={{ ...s.input, borderColor: confirmPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                                            onFocus={e => e.target.style.borderColor=confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)':'rgba(99,102,241,0.5)'} onBlur={e => e.target.style.borderColor=confirmPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)':'rgba(255,255,255,0.1)'} />
                                        {confirmPassword && confirmPassword !== newPassword && (
                                            <div style={{ fontSize:10, color:'#f87171', marginTop:4 }}>Passwords do not match</div>
                                        )}
                                        {confirmPassword && confirmPassword === newPassword && (
                                            <div style={{ fontSize:10, color:'#4ade80', marginTop:4 }}>✓ Passwords match</div>
                                        )}
                                    </div>

                                    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.4)', cursor:'pointer' }}>
                                        <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor:'#6366f1', width:14, height:14 }} />
                                        Show passwords
                                    </label>

                                    <div>
                                        <button style={s.btn('primary')} onClick={handleSavePassword} disabled={pwLoading}>
                                            {pwLoading
                                                ? <><span className="material-symbols-outlined" style={{ fontSize:14 }}>progress_activity</span>Changing…</>
                                                : <><span className="material-symbols-outlined" style={{ fontSize:14 }}>lock_reset</span>Change Password</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Appearance Tab ── */}
                        {activeTab === 'appearance' && (
                            <div style={s.card}>
                                <div style={{ fontSize:13, fontWeight:600, marginBottom:4, color:'rgba(255,255,255,0.8)' }}>Theme</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:20 }}>Choose your preferred color theme</div>

                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                    {[
                                        { id:'dark',  label:'Dark', desc:'Easy on the eyes', bg:'#0a0a0f', surface:'#1a1a2e', text:'#e8e8f0' },
                                        { id:'light', label:'Light', desc:'Classic and clean', bg:'#f8f8fc', surface:'#ffffff', text:'#1a1a2e' },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => { if(opt.id !== theme) toggle(); }}
                                            style={{ padding:0, border: theme === opt.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)', borderRadius:12, cursor:'pointer', overflow:'hidden', background:'transparent', position:'relative', transition:'all 0.2s' }}>
                                            {/* Preview */}
                                            <div style={{ height:80, background:opt.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, padding:12 }}>
                                                <div style={{ width:'80%', height:8, borderRadius:4, background:opt.surface }} />
                                                <div style={{ width:'60%', height:6, borderRadius:3, background:opt.surface, opacity:0.6 }} />
                                                <div style={{ width:'70%', height:6, borderRadius:3, background:opt.surface, opacity:0.4 }} />
                                            </div>
                                            <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', textAlign:'left' }}>
                                                <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)' }}>{opt.label}</div>
                                                <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{opt.desc}</div>
                                            </div>
                                            {theme === opt.id && (
                                                <div style={{ position:'absolute', top:8, right:8, width:20, height:20, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize:12, color:'#fff' }}>check</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Account Tab ── */}
                        {activeTab === 'account' && (
                            <>
                                <div style={{ ...s.card, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                    <div>
                                        <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:4 }}>Sign out</div>
                                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Sign out of your account on this device</div>
                                    </div>
                                    <button style={s.btn('ghost')} onClick={async () => { await logout(); navigate('/login'); }}>
                                        <span className="material-symbols-outlined" style={{ fontSize:15 }}>logout</span>
                                        Sign out
                                    </button>
                                </div>

                                <div style={{ ...s.card, border:'1px solid rgba(239,68,68,0.15)', background:'rgba(239,68,68,0.03)' }}>
                                    <div style={{ fontSize:13, fontWeight:600, color:'#f87171', marginBottom:4 }}>Danger Zone</div>
                                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:16 }}>These actions are permanent and cannot be undone</div>
                                    <div style={s.divider} />
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
                                        <div>
                                            <div style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.7)' }}>Delete Account</div>
                                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Permanently delete your account and all data</div>
                                        </div>
                                        <button style={s.btn('danger')} onClick={() => showToast('Contact support to delete your account', 'error')}>
                                            <span className="material-symbols-outlined" style={{ fontSize:14 }}>delete_forever</span>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </>     
                        )}
                    </div>
                </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position:'fixed', bottom:24, right:24, zIndex:9999,
                    padding:'12px 18px', borderRadius:12, fontSize:12, fontWeight:500,
                    display:'flex', alignItems:'center', gap:8,
                    backdropFilter:'blur(12px)',
                    background: toast.type==='success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${toast.type==='success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    color: toast.type==='success' ? '#4ade80' : '#f87171',
                    boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
                    animation:'slideUp 0.25s ease',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16 }}>
                        {toast.type==='success' ? 'check_circle' : 'error'}
                    </span>
                    {toast.msg}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default Settings;