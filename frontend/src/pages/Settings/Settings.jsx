import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { userService } from '../../api/userService';

const AVATAR_COLORS = [
  '#0070f3','#00f0ff','#4ade80','#f472b6',
  '#fb923c','#fbbf24','#c084fc','#f87171',
  '#34d399','#818cf8',
];

// ── Reusable UI pieces ────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</label>
    {children}
  </div>
);

const Input = ({ onFocus, onBlur, style, ...props }) => (
  <input
    className="w-full px-4 py-3 rounded-xl text-[13px] text-on-surface placeholder:text-white/25 outline-none transition-all"
    style={{ background: 'rgba(0,112,243,0.05)', border: '1px solid rgba(255,255,255,0.10)', ...style }}
    onFocus={e => { e.target.style.borderColor = 'rgba(0,112,243,0.5)'; onFocus?.(e); }}
    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; onBlur?.(e); }}
    {...props}
  />
);

const PrimaryBtn = ({ loading, icon, label, loadingLabel, onClick, disabled, danger }) => (
  <button onClick={onClick} disabled={loading || disabled}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
    style={{ background: danger ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#0070f3,#0050c8)', boxShadow: danger ? '0 0 14px rgba(239,68,68,0.3)' : '0 0 14px rgba(0,112,243,0.35)' }}>
    <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'progress_activity' : icon}</span>
    {loading ? loadingLabel : label}
  </button>
);

const Card = ({ children, accent, danger }) => (
  <div className="rounded-2xl overflow-hidden relative"
    style={{ background: danger ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)', border: danger ? '1px solid rgba(239,68,68,0.18)' : '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
    {accent && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />}
    <div className="p-6">{children}</div>
  </div>
);

const CardTitle = ({ icon, color, title, desc }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
    </div>
    <div>
      <div className="text-[14px] font-bold text-on-surface">{title}</div>
      {desc && <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</div>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────
const Settings = () => {
  const { user, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState('profile');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (user) { setUsername(user.username || ''); setAvatarUrl(user.avatarUrl || ''); }
    else fetchMe();
  }, [user]);

  useEffect(() => {
    let s = 0;
    if (newPw.length >= 6) s++; if (newPw.length >= 10) s++;
    if (/[A-Z]/.test(newPw)) s++; if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    setPwStrength(s);
  }, [newPw]);

  const saveProfile = async () => {
    if (!username.trim()) return showToast('Username cannot be empty', 'error');
    setProfileLoading(true);
    try { await userService.updateProfile(username.trim(), avatarUrl); await fetchMe(); showToast('Profile saved!'); }
    catch (e) { showToast(e.response?.data?.message || 'Failed to save', 'error'); }
    finally { setProfileLoading(false); }
  };

  const savePw = async () => {
    if (!curPw || !newPw || !confPw) return showToast('Fill all fields', 'error');
    if (newPw !== confPw) return showToast('Passwords do not match', 'error');
    if (newPw.length < 6) return showToast('Min 6 characters', 'error');
    setPwLoading(true);
    try { await userService.updatePassword(curPw, newPw); setCurPw(''); setNewPw(''); setConfPw(''); showToast('Password changed!'); }
    catch (e) { showToast(e.response?.data?.message || 'Failed', 'error'); }
    finally { setPwLoading(false); }
  };

  const initials = (username || user?.username || 'U')[0].toUpperCase();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][pwStrength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6'][pwStrength];

  const TABS = [
    { id: 'profile',    label: 'Profile',    icon: 'person',          color: '#60a5fa' },
    { id: 'security',   label: 'Security',   icon: 'lock',            color: '#f472b6' },
    { id: 'appearance', label: 'Appearance', icon: 'palette',         color: '#c084fc' },
    { id: 'account',    label: 'Account',    icon: 'manage_accounts', color: '#fb923c' },
  ];

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="w-full text-on-surface">

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-6"
        style={{ background: 'linear-gradient(135deg,rgba(0,112,243,0.10),rgba(139,92,246,0.06),rgba(255,255,255,0.02))', border: '1px solid rgba(0,112,243,0.18)', backdropFilter: 'blur(12px)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg,#0070f3,#c084fc50,transparent)' }} />
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,112,243,0.15),transparent 70%)', filter: 'blur(20px)' }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
              Account Settings
            </div>
            <h1 className="text-[24px] font-black tracking-tight leading-tight"
              style={{ background: 'linear-gradient(90deg,#fff,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.username || 'Settings'}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Manage your profile, security &amp; preferences</p>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black overflow-hidden"
              style={{ background: avatarUrl?.startsWith('http') ? 'transparent' : (avatarUrl || 'rgba(0,112,243,0.20)'), border: '2px solid rgba(0,112,243,0.35)', boxShadow: '0 0 20px rgba(0,112,243,0.25)' }}>
              {avatarUrl?.startsWith('http')
                ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" onError={e => e.target.style.display='none'} />
                : <span style={{ color: '#60a5fa' }}>{initials}</span>}
            </div>
            <div>
              <div className="text-[14px] font-bold text-on-surface">{user?.username}</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ──────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap flex-1 justify-center"
              style={{ background: active ? `${t.color}18` : 'transparent', color: active ? t.color : 'rgba(255,255,255,0.4)', border: active ? `1px solid ${t.color}35` : '1px solid transparent' }}>
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── PROFILE TAB ──────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left col */}
          <div className="flex flex-col gap-5">
            <Card accent="#60a5fa">
              <CardTitle icon="person" color="#60a5fa" title="Display Name" desc="This is your public username across Hence-Code" />
              <div className="flex flex-col gap-4">
                <Field label="Username">
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your display name" />
                </Field>
                <PrimaryBtn loading={profileLoading} icon="save" label="Save Changes" loadingLabel="Saving…" onClick={saveProfile} />
              </div>
            </Card>

            <Card accent="#f472b6">
              <CardTitle icon="image" color="#f472b6" title="Profile Picture URL" desc="Paste a direct image link" />
              <div className="flex flex-col gap-3">
                <Field label="Image URL">
                  <div className="flex gap-2">
                    <Input value={avatarInput} onChange={e => setAvatarInput(e.target.value)} placeholder="https://example.com/photo.jpg" style={{ flex: 1 }} />
                    <button onClick={() => setAvatarUrl(avatarInput)} className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface transition-all hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>Apply</button>
                  </div>
                </Field>
                {avatarUrl?.startsWith('http') && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)' }}>
                    <img src={avatarUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover" style={{ border: '2px solid rgba(244,114,182,0.3)' }} onError={e => e.target.style.display='none'} />
                    <div>
                      <div className="text-[12px] font-semibold text-on-surface">Preview looks good!</div>
                      <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Click Save to apply</div>
                    </div>
                  </div>
                )}
                <PrimaryBtn loading={profileLoading} icon="face" label="Save Avatar" loadingLabel="Saving…" onClick={saveProfile} />
              </div>
            </Card>
          </div>

          {/* Right col — color picker */}
          <Card accent="#c084fc">
            <CardTitle icon="palette" color="#c084fc" title="Avatar Color" desc="Choose a solid color for your avatar" />
            <div className="grid grid-cols-5 gap-3 mb-5">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setAvatarUrl(c)}
                  className="w-full aspect-square rounded-xl flex items-center justify-center text-[15px] font-black text-white transition-all hover:scale-110 active:scale-95"
                  style={{ background: c, border: avatarUrl === c ? '3px solid #fff' : '2px solid transparent', boxShadow: avatarUrl === c ? `0 0 14px ${c}` : 'none' }}>
                  {avatarUrl === c ? '✓' : initials}
                </button>
              ))}
            </div>
            {/* Live preview big */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 overflow-hidden"
                style={{ background: avatarUrl?.startsWith('http') ? 'transparent' : (avatarUrl || 'rgba(0,112,243,0.20)'), border: '2px solid rgba(255,255,255,0.15)' }}>
                {avatarUrl?.startsWith('http')
                  ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" onError={e => e.target.style.display='none'} />
                  : <span style={{ color: '#fff' }}>{initials}</span>}
              </div>
              <div>
                <div className="text-[14px] font-bold text-on-surface">{username || user?.username}</div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Avatar preview</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── SECURITY TAB ─────────────────────────────────── */}
      {tab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card accent="#f472b6">
            <CardTitle icon="lock_reset" color="#f472b6" title="Change Password" desc="Use a strong password to keep your account safe" />
            <div className="flex flex-col gap-4">
              <Field label="Current Password">
                <Input type={showPw ? 'text' : 'password'} value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Enter current password" />
              </Field>
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <Field label="New Password">
                <Input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Minimum 6 characters" />
                {newPw && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: i <= pwStrength ? strengthColor : 'rgba(255,255,255,0.10)' }} />
                      ))}
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</div>
                  </div>
                )}
              </Field>
              <Field label="Confirm New Password">
                <Input type={showPw ? 'text' : 'password'} value={confPw} onChange={e => setConfPw(e.target.value)} placeholder="Repeat new password"
                  style={{ borderColor: confPw && confPw !== newPw ? 'rgba(239,68,68,0.5)' : undefined }} />
                {confPw && confPw !== newPw && <div className="text-[11px] text-red-400 mt-1">✗ Passwords do not match</div>}
                {confPw && confPw === newPw && <div className="text-[11px] text-green-400 mt-1">✓ Passwords match</div>}
              </Field>
              <label className="flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ accentColor: '#0070f3', width: 14, height: 14 }} />
                Show passwords
              </label>
              <PrimaryBtn loading={pwLoading} icon="lock_reset" label="Change Password" loadingLabel="Changing…" onClick={savePw} />
            </div>
          </Card>

          {/* Security tips */}
          <div className="flex flex-col gap-4">
            <Card accent="#4ade80">
              <CardTitle icon="verified_user" color="#4ade80" title="Security Tips" />
              <div className="flex flex-col gap-3">
                {[
                  { icon: 'check_circle', color: '#4ade80', text: 'Use at least 10 characters' },
                  { icon: 'check_circle', color: '#4ade80', text: 'Mix upper & lowercase letters' },
                  { icon: 'check_circle', color: '#4ade80', text: 'Include numbers and symbols' },
                  { icon: 'warning', color: '#fbbf24', text: 'Never reuse old passwords' },
                  { icon: 'warning', color: '#fbbf24', text: 'Don\'t share your password' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: tip.color }}>{tip.icon}</span>
                    <span className="text-[12px] text-on-surface-variant">{tip.text}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card accent="#60a5fa">
              <CardTitle icon="info" color="#60a5fa" title="Session Info" />
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Authentication', value: 'JWT Token' },
                  { label: 'Session', value: 'Active' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[12px] text-on-surface-variant">{row.label}</span>
                    <span className="text-[12px] font-semibold text-green-400">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── APPEARANCE TAB ───────────────────────────────── */}
      {tab === 'appearance' && (
        <div className="max-w-2xl">
          <Card accent="#c084fc">
            <CardTitle icon="palette" color="#c084fc" title="Theme" desc="Choose your preferred color theme" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'dark',  label: 'Dark Mode',  desc: 'Easy on the eyes', bg: '#0a0a0f', surface: '#1a1a2e', accent: '#0070f3' },
                { id: 'light', label: 'Light Mode', desc: 'Classic and clean', bg: '#f0f4ff', surface: '#ffffff', accent: '#0070f3' },
              ].map(opt => {
                const active = opt.id === 'dark';
                return (
                  <button key={opt.id}
                    className="relative rounded-2xl overflow-hidden transition-all hover:scale-[1.02] text-left"
                    style={{ border: active ? '2px solid rgba(0,112,243,0.6)' : '1px solid rgba(255,255,255,0.08)', boxShadow: active ? '0 0 20px rgba(0,112,243,0.25)' : 'none' }}>
                    <div className="h-24 flex flex-col justify-center gap-2 px-4" style={{ background: opt.bg }}>
                      <div className="h-2.5 w-4/5 rounded-full" style={{ background: opt.surface }} />
                      <div className="h-2 w-3/5 rounded-full" style={{ background: opt.surface, opacity: 0.6 }} />
                      <div className="h-2 w-2/3 rounded-full" style={{ background: opt.surface, opacity: 0.35 }} />
                    </div>
                    <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-[13px] font-bold text-on-surface">{opt.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</div>
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#0070f3' }}>
                        <span className="material-symbols-outlined text-white text-[13px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(0,112,243,0.06)', border: '1px solid rgba(0,112,243,0.15)' }}>
              <span className="material-symbols-outlined text-[16px]" style={{ color: '#60a5fa' }}>info</span>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Light mode coming soon. Currently running in dark mode.</span>
            </div>
          </Card>
        </div>
      )}

      {/* ── ACCOUNT TAB ──────────────────────────────────── */}
      {tab === 'account' && (
        <div className="max-w-2xl flex flex-col gap-5">
          <Card accent="#fb923c">
            <CardTitle icon="logout" color="#fb923c" title="Sign Out" desc="Sign out of your account on this device" />
            <div className="flex items-center justify-between">
              <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Signed in as <span className="text-on-surface font-semibold">{user?.username}</span></div>
              <button onClick={async () => { await logout(); navigate('/login'); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign out
              </button>
            </div>
          </Card>

          <Card danger>
            <CardTitle icon="warning" color="#f87171" title="Danger Zone" desc="These actions are permanent and cannot be undone" />
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div>
                <div className="text-[13px] font-semibold text-on-surface">Delete Account</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Permanently deletes your account and all data</div>
              </div>
              <PrimaryBtn icon="delete_forever" label="Delete" loadingLabel="…" onClick={() => {}} danger />
            </div>
          </Card>
        </div>
      )}

      {/* ── TOAST ────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2"
          style={{ background: toast.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#4ade80' : '#f87171', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease both; }
        .slide-in-from-bottom-2 { --tw-translate-y: 8px; }
      `}</style>
    </div>
  );
};

export default Settings;