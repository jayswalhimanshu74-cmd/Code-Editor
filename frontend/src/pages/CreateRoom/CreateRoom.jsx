import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [language, setLanguage] = useState('TypeScript');

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden selection:bg-primary/30">
      {/* TopNavBar Implementation */}
      <header className="bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 docked full-width top-0 z-50 flex justify-between items-center w-full px-md h-16 max-w-full fixed">
        <div className="flex items-center gap-lg">
          <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">CodeEditor</Link>
          <nav className="hidden md:flex gap-md">
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="/">Home</Link>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">Features</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">About</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            <button className="p-2 text-on-surface-variant hover:bg-white/5 transition-all rounded-full">
              <span className="material-symbols-outlined">play_arrow</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-white/5 transition-all rounded-full">
              <span className="material-symbols-outlined">save</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-white/5 transition-all rounded-full">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
          <div className="h-8 w-px bg-outline-variant/30 mx-xs"></div>
          <Link to="/login" className="text-on-surface-variant hover:text-on-surface px-md py-sm rounded-lg transition-colors font-label-sm text-label-sm">Login</Link>
          <Link to="/register" className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white px-md py-sm rounded-lg transition-transform active:scale-95 font-label-sm text-label-sm">Sign Up</Link>
        </div>
      </header>

      {/* SideNavBar Implementation */}
      <aside className="hidden md:flex flex-col h-screen fixed left-0 top-16 w-sidebar-width bg-surface-container-lowest/90 backdrop-blur-lg border-r border-outline-variant/30 py-md gap-sm z-40">
        <div className="px-md mb-md">
          <div className="flex items-center gap-sm p-sm bg-surface-variant/20 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <div>
              <div className="font-label-sm text-label-sm font-bold text-on-surface">Project Alpha</div>
              <div className="text-[10px] text-on-surface-variant">Collaborative Session</div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-sm space-y-1">
          <Link to="/dashboard" className="w-full bg-primary-container/20 text-primary border-r-2 border-primary flex items-center px-md py-sm gap-md font-label-sm text-label-sm group">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            <span>Explorer</span>
          </Link>
          <button className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">search</span>
            <span>Search</span>
          </button>
          <button className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">camera_alt</span>
            <span>Snapshots</span>
          </button>
          <Link to="/history" className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>History</span>
          </Link>
          <Link to="/settings" className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </Link>
        </div>
        <div className="px-md mb-xl">
          <button className="w-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-sm rounded-lg flex items-center justify-center gap-sm font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New File
          </button>
        </div>
        <div className="px-sm mt-auto border-t border-outline-variant/20 pt-md">
          <button className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Help</span>
          </button>
          <button className="w-full text-on-surface-variant flex items-center px-md py-sm gap-md hover:bg-surface-variant/50 transition-colors font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
            <span>Feedback</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:pl-sidebar-width pt-16 min-h-screen flex items-center justify-center relative">
        {/* Atmospheric Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]"></div>
        </div>

        {/* Create Room Modal / Centered Form */}
        <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 w-full max-w-2xl mx-gutter p-xl rounded-xl shadow-2xl relative z-10">
          <div className="flex justify-between items-start mb-xl">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Create a New Room</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Set up a collaborative environment for your team in seconds.</p>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface" onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-lg" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            {/* Room Basics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Room Name</label>
                <input 
                  className="w-full bg-black/20 border border-white/10 focus:border-primary focus:shadow-[0_0_0_2px_rgba(192,193,255,0.2)] outline-none rounded-lg px-md py-sm text-on-surface font-body-md transition-all" 
                  placeholder="e.g. Frontend Architecture Review" 
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Visibility</label>
                <div className="flex bg-surface-container-highest rounded-lg p-unit">
                  <button 
                    className={`flex-1 rounded-md py-1.5 font-label-sm text-label-sm shadow-sm transition-all ${visibility === 'Public' ? 'bg-surface-bright text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`} 
                    type="button"
                    onClick={() => setVisibility('Public')}
                  >
                    Public
                  </button>
                  <button 
                    className={`flex-1 rounded-md py-1.5 font-label-sm text-label-sm transition-all ${visibility === 'Private' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} 
                    type="button"
                    onClick={() => setVisibility('Private')}
                  >
                    Private
                  </button>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant px-xs flex items-center gap-xs">
                Password 
                <span className="text-[10px] bg-surface-variant text-outline px-1.5 rounded uppercase tracking-wider">Public Only</span>
              </label>
              <div className="relative group">
                <input 
                  className={`w-full bg-black/20 border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md transition-all outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(192,193,255,0.2)] ${visibility === 'Public' ? 'opacity-40 cursor-not-allowed' : ''}`} 
                  disabled={visibility === 'Public'} 
                  type="password" 
                  placeholder={visibility === 'Public' ? "••••••••••••" : "Enter room password"}
                />
                <div className="absolute right-md top-1/2 -translate-y-1/2 text-outline">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
              </div>
              <p className="text-[11px] text-outline italic px-xs">Password protection is only available for private rooms.</p>
            </div>

            {/* Language Selection Grid */}
            <div className="space-y-md">
              <label className="font-label-sm text-label-sm text-on-surface-variant px-xs">Primary Environment Language</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-sm">
                {[
                  { id: 'TypeScript', icon: 'code' },
                  { id: 'Python', icon: 'terminal' },
                  { id: 'Go', icon: 'settings_ethernet' },
                  { id: 'C++', icon: 'memory' },
                  { id: 'Rust', icon: 'dataset' }
                ].map(lang => (
                  <label key={lang.id} className="cursor-pointer group">
                    <input 
                      checked={language === lang.id} 
                      onChange={() => setLanguage(lang.id)}
                      className="hidden" 
                      name="lang" 
                      type="radio"
                    />
                    <div className={`flex flex-col items-center justify-center p-md rounded-xl bg-[#161618cc] backdrop-blur-[16px] transition-all border ${language === lang.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-white/5'}`}>
                      <span className={`material-symbols-outlined mb-sm ${language === lang.id ? 'text-primary' : 'text-on-surface-variant'}`}>{lang.icon}</span>
                      <span className={`font-label-sm text-label-sm ${language === lang.id ? 'text-primary' : 'text-on-surface-variant'}`}>{lang.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Room Features Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant/10">
              <label className="flex items-center gap-md cursor-pointer group">
                <input type="checkbox" className="hidden" defaultChecked />
                <div className="w-5 h-5 rounded border border-primary bg-primary/20 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface">Enable Terminal Access</span>
              </label>
              <label className="flex items-center gap-md cursor-pointer group">
                <input type="checkbox" className="hidden" defaultChecked />
                <div className="w-5 h-5 rounded border border-primary bg-primary/20 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface">Auto-install Dependencies</span>
              </label>
            </div>

            <div className="pt-xl flex flex-col md:flex-row gap-md items-center justify-between">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                  <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbQqB7PDbcBC48UpQPMoR2sSRW4hm-jEgpP5826rk9k1I6mHyUvKFYzkokrvoulRSDTpkk_Hx2baRiENQrkaxMIL4vIiKQxGt1-xYCG0NhLQt9d21hIvx5xVILhKgJ69Ij_Kfqe92z9Px85wk47B_pfizxAwYo8937xlvBYf-aXWmwvzK_WjtXMoYioKM8IF1hq_qgmy0rQg-LqjW_o3w6s6GxWq1AorcQK5qGRB6Y1jlypW6Vh3xaHgk2FLiYGgFEeob-g7DCJd9A" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">add</span>
                </div>
                <span className="flex items-center pl-6 text-on-surface-variant font-label-sm text-label-sm">Invite members later</span>
              </div>
              <div className="flex gap-md w-full md:w-auto">
                <button className="flex-1 md:flex-none px-xl py-md bg-[#161618cc] backdrop-blur-[16px] border border-white/10 text-on-surface rounded-lg hover:bg-white/10 transition-all font-label-sm text-label-sm" type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
                <button className="flex-1 md:flex-none px-xl py-md bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-label-sm text-label-sm flex items-center justify-center gap-md" type="submit">
                  Create & Invite
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Implementation */}
      <footer className="bg-surface-dim border-t border-outline-variant/20 full-width bottom-0 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-md w-full">
          <div className="mb-md md:mb-0">
            <span className="font-headline-md text-headline-md text-primary font-bold">CodeEditor</span>
          </div>
          <div className="flex gap-lg">
            <a className="font-body-md text-body-md text-outline hover:text-on-surface hover:underline transition-all" href="#">Terms</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface hover:underline transition-all" href="#">Privacy</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface hover:underline transition-all" href="#">Status</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface hover:underline transition-all" href="#">Documentation</a>
          </div>
          <p className="mt-md md:mt-0 font-body-md text-body-md text-outline">© 2024 CodeEditor Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CreateRoom;
