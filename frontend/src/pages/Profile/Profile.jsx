import React from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden selection:bg-primary/30">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-full w-sidebar-width bg-surface-container-low/90 backdrop-blur-2xl border-r border-outline-variant/20 z-50">
        <div className="p-md flex items-center gap-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-on-primary-container">terminal</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-black text-primary">Workspace</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant">v2.4.0</span>
          </div>
        </div>
        <nav className="flex-1 mt-lg space-y-unit">
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/dashboard">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-label-sm text-label-sm">Explorer</span>
          </Link>
          <a className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">account_tree</span>
            <span className="font-label-sm text-label-sm">Source Control</span>
          </a>
          <a className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">bug_report</span>
            <span className="font-label-sm text-label-sm">Debug</span>
          </a>
          <a className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">extension</span>
            <span className="font-label-sm text-label-sm">Extensions</span>
          </a>
        </nav>
        <div className="mt-auto border-t border-outline-variant/10 py-md">
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-sm text-label-sm">Settings</span>
          </Link>
          <Link className="flex items-center gap-sm bg-primary/10 text-primary border-r-2 border-primary px-md py-sm translate-x-1 transition-transform" to="/profile">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
            <span className="font-label-sm text-label-sm">Account</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TopAppBar */}
        <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
          <div className="flex items-center gap-md">
            {/* Mobile menu button */}
            <button className="md:hidden text-on-surface-variant p-2 mr-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Profile</h1>
            <div className="hidden sm:flex bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-1.5 w-64 items-center gap-sm">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <span className="font-body-md text-body-md text-outline">Search files...</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-sm mr-2">
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors duration-200">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors duration-200">
                <span className="material-symbols-outlined text-on-surface-variant">terminal</span>
              </button>
            </div>
            <img alt="User avatar" className="w-8 h-8 rounded-full border border-primary/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVOweOny-NKYFCHpxS9UOnBq-z86XAilgVIp41QKPXj0AmSW0eQUAD2m4BcesG8IkBiGoafiINSdWVqax65TSbAAj70MWJ1G1Dg1lTj0AcoD6cVke_NkwWk8GXPML0o_d_7CzOEcSszA_uwbeu2Z4NYkIJOMf3T4QdklqOV23Y55e0-idm-WSRbgF_CmxmdcHYPfyPKeCJs3ifZqz6MNc26zxIWYXAh9kdjwaQvrEFrnt_FAtrUWThcWzBoMc4seJUQwvpPurKIzh9" />
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-gutter md:p-xl space-y-xl">
          {/* Profile Overview Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-md text-center lg:text-left">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-[#6366f1] to-[#adc6ff] blur opacity-30"></div>
                <img alt="Sarah Miller" className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary shadow-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvRvOZrWpjGrchmxkZHMBJbYlUM1Bbmz-HzEj8KWxzKm141REzMc4EWOJmT1XTfsxZ8dvmzMQsVWMooPI3P22JHqiNvObJchsPu6PQmSpc6kmY8Jp5EjbZLnEu2Dc88StUvl7qOGXZhOV-i-nxu5lvu0kX2yHul4NJ78rmzf6D16mw7XyYpWf9086HoMePPfoigmD4v5IFQQu10pHJ7hcWm2CWmrQijp49m397ZOO4vyZ97qerNb9L00XiM8WFW3N32ZIOt_oP0Jr-" />
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-background rounded-full"></div>
              </div>
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Sarah Miller</h2>
                <p className="font-body-lg text-body-lg text-primary">@sarahm</p>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Full-stack developer passionate about building collaborative tools. Currently working on Project Alpha.
              </p>
              <div className="flex gap-md mt-sm">
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">link</span>
                </a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">terminal</span>
                </a>
                <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                  <span className="material-symbols-outlined">share</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-8 glass-card rounded-xl p-lg grid grid-cols-2 md:grid-cols-4 gap-md">
              <div className="space-y-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Coding Hours</span>
                <div className="flex items-end gap-xs">
                  <span className="font-headline-md text-headline-md text-primary">284</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-1.5">h</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="space-y-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Active Rooms</span>
                <div className="flex items-end gap-xs">
                  <span className="font-headline-md text-headline-md text-secondary">3</span>
                  <span className="material-symbols-outlined text-secondary text-[20px] mb-1.5">groups</span>
                </div>
              </div>
              <div className="space-y-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Contributions</span>
                <div className="flex items-end gap-xs">
                  <span className="font-headline-md text-headline-md text-on-surface">1,402</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mb-1.5">YTD</span>
                </div>
              </div>
              <div className="space-y-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Global Rank</span>
                <div className="flex items-end gap-xs">
                  <span className="font-headline-md text-headline-md text-tertiary">#42</span>
                  <span className="material-symbols-outlined text-tertiary text-[20px] mb-1.5">military_tech</span>
                </div>
              </div>
            </div>
          </section>

          {/* Coding Stats & Heatmap Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Contribution Heatmap */}
            <div className="lg:col-span-8 glass-card rounded-xl p-lg space-y-md">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Contributions</h3>
                <span className="font-label-sm text-label-sm text-outline">Last 12 Months</span>
              </div>
              <div className="grid grid-cols-12 gap-1 overflow-hidden">
                {/* Simulated Heatmap Grid */}
                <div className="col-span-12 grid grid-cols-[repeat(30,1fr)] gap-1">
                  {Array.from({ length: 150 }).map((_, i) => {
                    const intensities = ['bg-surface-container', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary'];
                    const rand = Math.floor(Math.random() * 5);
                    return <div key={i} className={`aspect-square rounded-sm ${intensities[rand]}`}></div>;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-sm font-label-sm text-label-sm text-outline">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-surface-container"></div>
                  <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
                  <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
                  <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                  <div className="w-3 h-3 rounded-sm bg-primary"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Top Languages */}
            <div className="lg:col-span-4 glass-card rounded-xl p-lg space-y-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Top Languages</h3>
              <div className="space-y-md">
                <div className="space-y-xs">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface">TypeScript</span>
                    <span className="text-outline">65%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%]"></div>
                  </div>
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface">React</span>
                    <span className="text-outline">20%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[20%]"></div>
                  </div>
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface">Rust</span>
                    <span className="text-outline">15%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-[15%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Layout Two-Column */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* My Repositories/Rooms */}
            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent Work</h3>
                <button className="text-primary font-label-sm text-label-sm hover:underline">View All</button>
              </div>
              <div className="space-y-md">
                {/* Card 1 */}
                <div className="glass-card p-md rounded-xl group hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-sm">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">folder</span>
                      <h4 className="font-body-lg text-body-lg font-bold group-hover:text-primary transition-colors">alpha-compiler-v2</h4>
                    </div>
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 font-label-sm uppercase tracking-tighter">Public</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-2">A high-performance LLVM-based compiler for the Alpha programming language. Features parallel AST parsing.</p>
                  <div className="flex items-center gap-md">
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span> Rust
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                      <span className="material-symbols-outlined text-[16px]">star</span> 1.2k
                    </div>
                    <span className="font-label-sm text-label-sm text-outline ml-auto">Updated 2h ago</span>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="glass-card p-md rounded-xl group hover:border-primary/40 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-sm">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary">hub</span>
                      <h4 className="font-body-lg text-body-lg font-bold group-hover:text-primary transition-colors">collaborative-canvas-ui</h4>
                    </div>
                    <span className="bg-secondary/10 text-secondary text-[10px] px-2 py-0.5 rounded-full border border-secondary/20 font-label-sm uppercase tracking-tighter">Private</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-2">Real-time collaborative drawing engine using CRDTs for seamless multi-user interaction.</p>
                  <div className="flex items-center gap-md">
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> TypeScript
                    </div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                      <span className="material-symbols-outlined text-[16px]">star</span> 48
                    </div>
                    <span className="font-label-sm text-label-sm text-outline ml-auto">Updated 5d ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="space-y-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Edit Profile</h3>
              <form className="glass-card p-lg rounded-xl space-y-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-outline">Full Name</label>
                    <input className="w-full bg-black/20 border border-outline-variant/30 rounded-lg px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface" type="text" defaultValue="Sarah Miller" />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-sm text-label-sm text-outline">Location</label>
                    <input className="w-full bg-black/20 border border-outline-variant/30 rounded-lg px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface" type="text" defaultValue="San Francisco, CA" />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-outline">Bio</label>
                  <textarea className="w-full bg-black/20 border border-outline-variant/30 rounded-lg px-md py-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-on-surface" rows="3" defaultValue="Full-stack developer passionate about building collaborative tools. Currently working on Project Alpha."></textarea>
                </div>
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-outline">Notification Preferences</label>
                  <div className="space-y-sm pt-xs">
                    <label className="flex items-center gap-sm cursor-pointer group">
                      <input defaultChecked className="w-4 h-4 rounded border-outline-variant bg-transparent text-primary focus:ring-primary" type="checkbox" />
                      <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface">Email notifications for room invites</span>
                    </label>
                    <label className="flex items-center gap-sm cursor-pointer group">
                      <input defaultChecked className="w-4 h-4 rounded border-outline-variant bg-transparent text-primary focus:ring-primary" type="checkbox" />
                      <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface">Push notifications for code reviews</span>
                    </label>
                  </div>
                </div>
                <div className="pt-md flex justify-end gap-md">
                  <button className="px-md py-sm rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-white/5 transition-colors" type="button">Discard</button>
                  <button className="px-md py-sm rounded-lg font-label-sm text-label-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" type="submit">Save Changes</button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
