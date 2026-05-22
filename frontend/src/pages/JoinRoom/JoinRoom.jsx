import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const navigate = useNavigate();

  return (
    <div className="font-body-md text-on-surface antialiased overflow-hidden min-h-screen bg-[#0a0a0c]" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0c 100%)', backgroundAttachment: 'fixed' }}>
      {/* SideNavBar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container/80 backdrop-blur-xl border-r border-outline-variant/20 shadow-sm flex-col py-md z-50">
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary">CodeEditor</span>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant/60">v2.4.0</span>
        </div>
        <nav className="flex-1 px-sm space-y-xs overflow-y-auto">
          <Link className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5 active:scale-95" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          <a className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5 active:scale-95" href="#">
            <span className="material-symbols-outlined">code_blocks</span>
            <span className="font-body-md text-body-md">Workspace</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5 active:scale-95" href="#">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-body-md text-body-md">Projects</span>
          </a>
          <Link className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 bg-primary/10 text-primary border-r-2 border-primary active:scale-95" to="/join-room">
            <span className="material-symbols-outlined">groups</span>
            <span className="font-body-md text-body-md">Collaboration</span>
          </Link>
          <Link className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5 active:scale-95" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </Link>
        </nav>
        <div className="mt-auto px-sm space-y-xs">
          <button className="w-full mb-md bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-bold py-sm px-md rounded-lg flex items-center justify-center gap-sm shadow-lg active:scale-95 transition-transform" onClick={() => navigate('/create-room')}>
            <span className="material-symbols-outlined">add</span>
            <span>New Project</span>
          </button>
          <a className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5" href="#">
            <span className="material-symbols-outlined">description</span>
            <span className="font-body-md text-body-md">Docs</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 text-on-surface-variant hover:text-on-surface hover:bg-white/5" href="#">
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-md text-body-md">Support</span>
          </a>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="md:fixed top-0 right-0 md:w-[calc(100%-260px)] w-full h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm flex items-center justify-between px-lg z-40">
        <div className="flex items-center gap-lg flex-1">
          <div className="relative w-full max-w-md group hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full bg-black/20 border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search projects or rooms..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80 hidden sm:block">
            <span className="material-symbols-outlined">history</span>
          </button>
          <div className="h-8 w-px bg-outline-variant/20 mx-sm hidden sm:block"></div>
          <button className="px-md py-1.5 border border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors font-bold text-body-md hidden sm:block">
            Share
          </button>
          <div className="flex items-center gap-sm sm:ml-sm">
            <Link to="/profile">
              <img alt="User profile" className="w-8 h-8 rounded-full border border-outline-variant/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxkA8C2_TsylHAwpPckOvqjlbe2xxpjfmrVb2MOBTCk_G-yNxSBPplpKuSI5gPpZC6Ziwnt_HTQCAlXp2B-XIxa3cO2qL_Og5CxhIS5KBFAeSMUefDW-PxB-Jp1t1P4Ph4cAEFG4vvt0rGUmxAMQoS-sFnws3sECA-6mzCCsc8UQmprqR7AfF8Rtl3rLQ2ahpmXyuU6ICqImIeE-DrvnZYnfEn2HRAjSAgkMSoxeFwzAi3b-EW8ltUB6mk8vNJV6GbTFGIXZm3CI8k" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="md:ml-[260px] pt-16 h-screen overflow-y-auto scroll-smooth">
        <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center p-md md:p-xl relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Join Room Card */}
          <div className="w-full max-w-xl bg-[#161618cc] backdrop-blur-[24px] saturate-[180%] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_25px_-5px_rgba(0,0,0,0.5)] rounded-xl p-xl relative z-10">
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-white mb-sm">Join a Collaborative Room</h1>
              <p className="text-body-lg text-on-surface-variant">Enter a Room ID or paste an invite link to start coding with your team.</p>
            </div>
            
            <form className="space-y-lg" onSubmit={(e) => { e.preventDefault(); navigate('/room-lobby'); }}>
              <div className="space-y-sm">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block ml-1">Room Identity</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">code_blocks</span>
                  <input className="w-full bg-black/30 border border-outline-variant/50 rounded-lg py-4 pl-12 pr-4 text-body-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-code-md" placeholder="e.g. project-alpha-782" type="text" />
                </div>
              </div>
              <div className="space-y-sm">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block ml-1">Access Credentials (Optional)</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                  <input className="w-full bg-black/30 border border-outline-variant/50 rounded-lg py-4 pl-12 pr-4 text-body-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-code-md" placeholder="Room Password" type="password" />
                </div>
              </div>
              <button className="w-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-bold py-4 px-md rounded-lg flex items-center justify-center gap-md shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all text-body-lg mt-xl" type="submit">
                <span>Join Room</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="mt-lg text-center">
                <span className="text-on-surface-variant text-body-md">Don't have a room? </span>
                <Link to="/create-room" className="text-primary font-bold hover:underline">Create New Room</Link>
              </div>
            </form>
            <div className="mt-xl pt-lg border-t border-outline-variant/10 text-center">
              <p className="text-label-sm text-on-surface-variant/60">Need help? <a className="text-primary hover:underline" href="#">View Documentation</a> or see <a className="text-primary hover:underline" href="#">how it works</a>.</p>
            </div>
          </div>
          
          {/* Recent Rooms Section */}
          <div className="w-full max-w-xl mt-xl z-10">
            <div className="flex items-center justify-between mb-md px-1">
              <h3 className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Recent Rooms</h3>
              <button className="text-label-sm text-primary hover:underline transition-opacity">Clear History</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Recent Room 1 */}
              <div className="bg-[#161618cc] backdrop-blur-[24px] border border-white/10 p-md rounded-lg flex flex-col gap-md hover:bg-white/5 transition-all group cursor-pointer" onClick={() => navigate('/room-lobby')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">terminal</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-body-md text-white">Frontend Refactor</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-label-sm text-on-surface-variant">Active now</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">login</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <img className="w-6 h-6 rounded-full border-2 border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbvz9Lg3QY8g8B23zMCeBoA_Z5fvIzbeYHoIs1eO21fpCEib-l4s4k9NR7D9NJpgDzmPYVIY3XMmMb19VC7ko6dmxDaS1RZVdJLRhmS352D-WuC76kV7cT2Use5kr4lkr0RtGaLjEyDEGovC3FvZrJ5bHHMw2p7Ga1O2aqy7-Mh6H_wjLED38BKVjW7EZwvE0TwMP--1EEl-3a8qEeIguFKnU6Yv2fx3kAaNKOMdyD2wPE_mSpCO4BYJUYzQMFQwxlCS83n74x_yd" alt="user" />
                    <img className="w-6 h-6 rounded-full border-2 border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJzMTqMmXAt_7ZzO305HpCUHzZ9QVPbddi93D2cVHKF5Ot25b-n6cx5Tky5fUJcn20ncf1r00-HU7hRHOp-W4wd4N5V4OgUH4nR6870aeeCdEfGp_yn-kuW5MqQVIZYrlGJtIshQVTXEekpEoqJ9S7IyG91lSFNL7LQKYTfdX2syIo2f8KNsqM0JURL6FzhKUCHKhLtgLrSlya-EEAtZpXnAlmNg8_-fZJG3Q-ar2_EPin1kgWghnjBFA9AW4gQ0MgsumZpYAFC8Xl" alt="user" />
                    <img className="w-6 h-6 rounded-full border-2 border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3116rpeb0He5-jk8jvQiy2RL10xpyA3sXqY2LALrLmgppXyrRT3Sy4Ym_87X7a7he9rJh6oysYkIJ7ihUYLaFmgar-Su9yoq9n8orHD6U1HTxw5U94AlWZYENQbd98ZpKVYi9-2tb-_SPxuqyMJU9vgeCNDsbsXXbxVhgvB1KhV0tQp3w8eFLNqBZCuP6K6OYbq-HWj9ClVFVa3gyvJncUAQeGOAHQIZuLRMLwPoR6ljpShg5e0lEOozAWKeMBA0JRnWci0lZJkpZ" alt="user" />
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface-container-high flex items-center justify-center text-[10px] text-white">+2</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-tighter">PROJ-782</span>
                </div>
              </div>
              
              {/* Recent Room 2 */}
              <div className="bg-[#161618cc] backdrop-blur-[24px] border border-white/10 p-md rounded-lg flex flex-col gap-md hover:bg-white/5 transition-all group cursor-pointer" onClick={() => navigate('/room-lobby')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-body-md text-white">API Documentation</span>
                      <span className="text-label-sm text-on-surface-variant">Last active 5h ago</span>
                    </div>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">login</span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <img className="w-6 h-6 rounded-full border-2 border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgbVSAhlFj0AaeXnKkOgnVETkyfWG6Lt5oanLu6zZae5oweaK0dBXF2HpvD7fUajIRxG-CSjDkRwIU1MA1bceDwHxKWqgVKJvU8hTnw9jqoEoFCdHTz-ZRW4O4bgWjiI3TPBe_ucNOAtqy6SQFwTK1qjn6-cKPWyuR64JdBnayXa2rbi-4O9wlwQ08vs13pge7U_NEl0rUWykIi5JGa2RGpFpSpjMVP5-8oKrRPnaGAJ49-buKJmp2Ch6dwZKO-WEnlokLCfMeUSvI" alt="user" />
                    <img className="w-6 h-6 rounded-full border-2 border-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv7pK1bFXc4lVH0joqwIkBPBdrRw9mXmtNs_nv9k1p7nsaRHukhmUfRKEL62kEYz3j4Jnc0O_L2JawdmEB9DgYRQ4yskKKo3Ls9jRDZIZ5p_JoP1UWAjYwDmFMYRUdE3aK2jtT6Cbniu6DM4GfZtq6-GQlEEKcKjtBLmYlEwAXWLqX5Oyb8X4Fe0CHByBj-Y5eM5n0nak3MuLmW6cmpa7aYiltq-zIQa6ZTmadjOb3NCO0hL6lDlxnB3LOEFfZs5sDVWxaJelCChQ7" alt="user" />
                  </div>
                  <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-tighter">DOCS-001</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer for authentication session info */}
          <div className="mt-auto pt-xl text-center text-label-sm text-on-surface-variant/40 max-w-xl z-10">
            <p>© 2024 CodeEditor Inc. All active rooms are end-to-end encrypted for your security.</p>
          </div>
        </div>
      </main>

      {/* Illustration for background depth */}
      <div className="hidden lg:block fixed bottom-0 right-0 w-1/3 opacity-20 pointer-events-none z-0">
        <img alt="Abstract collaboration nodes" className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC2owXkT_YfMzQFDWSpcRtPeWuiWNmGmmgF8Bpx7y6jEoD7bjCgQ0LA9hBfAG9TgGsUy_MBC-dwN_1qLaHBXex1XDzw0_kmwrwLolIssdJ8PPUwmf_9yZ3KQdpRZjpPgfpLIhz_SeP2nWUANc_TCI9pz0U9-kWW35rxjTs-_DoQyDfv3eF6iC8yqCGJ_2SccmHvyqMjJLRPfDPicVGkaJFno-_CvTjNOrP_S4wkFM0h9sbOu_r1-QHQyTADOQlBnKCQtRwul0UMHiJ" />
      </div>
    </div>
  );
};

export default JoinRoom;
