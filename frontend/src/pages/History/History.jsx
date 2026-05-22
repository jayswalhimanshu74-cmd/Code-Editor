import React from 'react';
import { Link } from 'react-router-dom';

const History = () => {


  const [history, setHistory] = useState([]);

useEffect(() => {
    // You need a roomId — either get from URL param or show all rooms' history
    executionService.getHistory(roomId).then(({ data }) => setHistory(data));
}, [roomId]);

  return (
    <div className="flex overflow-hidden h-screen bg-[#13131b] text-[#e4e1ed] font-body-md">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-full py-md bg-surface-container-low/90 backdrop-blur-2xl border-r border-outline-variant/20 w-[260px] z-50 shrink-0">
        <div className="px-md mb-lg">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>terminal</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-black text-primary">Workspace</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">v2.4.0</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/editor">
            <span className="material-symbols-outlined">code</span>
            <span className="font-label-sm text-label-sm">Editor</span>
          </Link>
          <Link className="flex items-center gap-sm bg-primary/10 text-primary border-r-2 border-primary px-md py-sm translate-x-1 transition-transform" to="/history">
            <span className="material-symbols-outlined">account_tree</span>
            <span className="font-label-sm text-label-sm">Source Control</span>
          </Link>
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/file-manager">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-label-sm text-label-sm">Explorer</span>
          </Link>
          <a className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">bug_report</span>
            <span className="font-label-sm text-label-sm">Debug</span>
          </a>
          <a className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" href="#">
            <span className="material-symbols-outlined">extension</span>
            <span className="font-label-sm text-label-sm">Extensions</span>
          </a>
        </nav>
        <div className="mt-auto pt-md border-t border-outline-variant/20">
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-sm text-label-sm">Settings</span>
          </Link>
          <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all duration-200" to="/profile">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm">Account</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* TopAppBar */}
        <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 h-16 flex justify-between items-center w-full px-md z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Snapshot History</span>
            <div className="hidden lg:flex items-center bg-surface-container-highest px-sm py-1 rounded-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-on-surface-variant mr-2" style={{fontSize: "18px"}}>search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface w-64 placeholder-on-surface-variant/50 outline-none" placeholder="Filter project snapshots..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-sm">
              <button className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-colors active:scale-95">
                <span className="material-symbols-outlined">terminal</span>
              </button>
              <Link to="/settings" className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-colors active:scale-95 flex">
                <span className="material-symbols-outlined">settings</span>
              </Link>
            </div>
            <Link to="/profile">
              <img alt="User avatar" className="w-8 h-8 rounded-full border border-primary/20 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgEY93LRyzs587vIp8obrG2_k0RtjbE7JvUTYbQG07c52dgsTvo20fui6MfRubpaHOqOHybgGHOi9RbLsF8W4IfCZWvIswkhbzvCoo2MIsN0ksFpNSvgGJjKz3K-YMl4j5iORU6aYbSrXE0fVpnsy8W3JZUIgiisxGeF43aQ6kOKrbfwmSafzdRQiEfyPPS-1-yr2AoXHXjxapN3yO44kZsZDpZuo8JU1xDQyeMk_Q93kpKC3x-3FpxHpBF0cgW3TtTU9HhuX_e7tQ" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-md lg:p-lg bg-background custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-24">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-md mb-xl bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl">
              <div className="flex items-center gap-sm flex-wrap">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Filter:</span>
                <div className="flex flex-wrap gap-2">
                  <button className="px-sm py-1 bg-surface-variant rounded-lg border border-outline-variant/30 font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform">
                    Developer <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>
                  <button className="px-sm py-1 bg-surface-variant rounded-lg border border-outline-variant/30 font-label-sm text-label-sm flex items-center gap-1 active:scale-95 transition-transform">
                    Date Range <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  </button>
                </div>
              </div>
              <div className="hidden sm:block h-6 w-px bg-outline-variant/30 mx-2"></div>
              <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                <span className="px-2 py-0.5 bg-primary/10 text-primary font-label-sm text-label-sm rounded border border-primary/20 flex items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors">
                  branch: main <span className="material-symbols-outlined text-[14px]">close</span>
                </span>
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary font-label-sm text-label-sm rounded border border-secondary/20 flex items-center gap-1 cursor-pointer hover:bg-secondary/20 transition-colors">
                  path: /src <span className="material-symbols-outlined text-[14px]">close</span>
                </span>
              </div>
              <button className="sm:ml-auto mt-2 sm:mt-0 text-primary font-label-sm text-label-sm hover:underline">Clear all filters</button>
            </div>

            {/* Timeline */}
            <div className="relative pl-2 md:pl-0">
              {/* Vertical Line */}
              <div className="absolute left-8 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-outline-variant/20 to-transparent"></div>
              
              {/* Snapshot: ACTIVE HEAD */}
              <div className="relative pl-14 md:pl-16 pb-12">
                {/* Head Marker */}
                <div className="absolute left-6 md:left-[18px] top-2 w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20 z-10"></div>
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl border-l-4 border-l-primary relative overflow-hidden group shadow-lg">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-md mb-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-sm flex-wrap">
                        <span className="bg-primary text-on-primary-container px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-tighter">Current Head</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md">Commit: 7f3a12d</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Refactored auth middleware for better session handling</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">Implemented JWT rotation and fixed the persistent logout bug reported in issue #442.</p>
                    </div>
                    <div className="flex items-center gap-sm shrink-0">
                      <img className="w-8 h-8 rounded-full ring-2 ring-primary/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeOykN9yVGM9C9VyXzy1S8Fmvk3awwxM9Edd_y5t7iN-tRpCqyhlnkGERoWGtjn3itMVErKW9djGmK-Op2CQeykV5_oVD5giGjRrrErkntzOaUgfU_aLohMOWXIQkLMxisndnrAJsv6D0dn8IrRQQ31XjZE4QCRmGQO8-DDRy-AgqZ2K7DIB0FAK7_5BmDrM6YvLboyAs_-oj4Und7X8l2pJSJnG6kxiD600CjPSBDtN1rTiTfnESg8-mlAtWBmzb2GbTZBSpXxuuO" alt="James Sterling" />
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface font-bold">James Sterling</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">2 mins ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-sm mb-lg">
                    <div className="flex items-center gap-1 font-code-md text-body-md text-on-surface-variant bg-black/20 px-2 py-1 rounded border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[16px] text-green-400">add_box</span>
                      auth_provider.ts
                    </div>
                    <div className="flex items-center gap-1 font-code-md text-body-md text-on-surface-variant bg-black/20 px-2 py-1 rounded border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">edit_square</span>
                      middleware.ts
                    </div>
                    <div className="flex items-center gap-1 font-code-md text-body-md text-on-surface-variant bg-black/20 px-2 py-1 rounded border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[16px] text-red-400">disabled_by_default</span>
                      session_utils.ts
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-md">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-sm px-lg py-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white rounded-lg font-label-sm text-label-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20">
                      <span className="material-symbols-outlined">gif</span> Preview Diff
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-sm px-lg py-sm border border-outline-variant/30 rounded-lg font-label-sm text-label-sm hover:bg-white/5 active:scale-[0.98] transition-all">
                      <span className="material-symbols-outlined">history</span> Restore
                    </button>
                  </div>
                </div>
              </div>

              {/* Snapshot: Entry 2 */}
              <div className="relative pl-14 md:pl-16 pb-12">
                <div className="absolute left-6 md:left-[18px] top-2 w-3 h-3 bg-outline-variant rounded-full z-10"></div>
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-md mb-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md">Commit: 9c21b4a</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface/80 group-hover:text-on-surface transition-colors">Fixed CSS grid issue in dashboard widget</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant/80">Adjusted auto-fit parameters for smaller screen sizes to prevent horizontal overflow.</p>
                    </div>
                    <div className="flex items-center gap-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <img className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_XD9x4OpUjjU09H0F6EwA4Xgz3vRXnGlOFKdj8zPXPIx_WPtWsWEA1_H5HteSeoUkoGMNo5T4wuy_BegqzY-uQjaMDbxyXbfc5DDuVPZQAi4kjMcFaBUPcCZMsvXbN1ZFq-gOSy2dqW7K5rRoFluOvV6QoBTThVHsiEG24OLVir_ivwg48cIhJqi5bCBeg-HfKHCMlW7uPkDmPyCyw1m5bLhSK8M5b-QyYSZ5hn0lS_v0LA-vN8zeXrszBewNRWR_1v5asNSD38fY" alt="Avery Miller" />
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface font-bold">Avery Miller</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">45 mins ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-md hidden group-hover:flex mt-md">
                    <button className="flex items-center justify-center gap-sm px-md py-1.5 border border-outline-variant/30 rounded-lg font-label-sm text-label-sm hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined">gif</span> Preview
                    </button>
                    <button className="flex items-center justify-center gap-sm px-md py-1.5 border border-outline-variant/30 rounded-lg font-label-sm text-label-sm hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined">history</span> Restore
                    </button>
                  </div>
                </div>
              </div>

              {/* Snapshot: Entry 3 */}
              <div className="relative pl-14 md:pl-16 pb-12">
                <div className="absolute left-6 md:left-[18px] top-2 w-3 h-3 bg-outline-variant rounded-full z-10"></div>
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-md mb-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-sm">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md">Commit: a4412f9</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface/80 group-hover:text-on-surface transition-colors">Added dark mode support for user profiles</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant/80">Updated the theme provider and added missing semantic color variables for the profile page.</p>
                    </div>
                    <div className="flex items-center gap-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <img className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACwwkNvVcI2IGgagJ7AKVvWDnN5psYRJjI72j_T2urYWX-l3fz-D_Pd4u3aAL13WaFj4zoBIa7-q6C5PYaX4s6tfBLY_XKO0GDmNxlxkZwunNK3VAiagmyIO230iSVzemnvuQtN5IuhU6ClZzirIUFzjwrI3XmY7LEwNBRGBC4O_65gRQIhYUhWaa_ce__OZ3XNH0z1eFPoihKLGxn1PYyHFhpNv35NxS1SNlRXDVEVwbVuD4E7KYD8qJ3UztQ_9ZsGPgeoeYmSz0q" alt="James Sterling" />
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface font-bold">James Sterling</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-md hidden group-hover:flex mt-md">
                    <button className="flex items-center justify-center gap-sm px-md py-1.5 border border-outline-variant/30 rounded-lg font-label-sm text-label-sm hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined">gif</span> Preview
                    </button>
                    <button className="flex items-center justify-center gap-sm px-md py-1.5 border border-outline-variant/30 rounded-lg font-label-sm text-label-sm hover:bg-white/5 transition-all">
                      <span className="material-symbols-outlined">history</span> Restore
                    </button>
                  </div>
                </div>
              </div>

              {/* Pagination / Load more */}
              <div className="flex justify-center pt-8">
                <button className="px-xl py-md bg-[#161618cc] backdrop-blur-[16px] border border-primary/20 rounded-full font-label-sm text-label-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-sm active:scale-95">
                  <span className="material-symbols-outlined">expand_more</span> Load older snapshots
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Preview Diff Inline "Modal" (Hidden state representation) - commented out but structure kept */}
        {/*
        <div className="absolute bottom-6 right-6 w-[400px] bg-[#161618cc] backdrop-blur-[16px] rounded-xl border border-primary/30 shadow-2xl overflow-hidden z-[60] flex flex-col max-h-[500px]">
          <div className="px-md py-sm bg-primary/10 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{fontSize: "18px"}}>code</span>
              <span className="font-label-sm text-label-sm font-bold text-primary">Diff Preview: auth_provider.ts</span>
            </div>
            <button className="p-1 hover:bg-primary/20 rounded-full text-primary transition-colors">
              <span className="material-symbols-outlined" style={{fontSize: "18px"}}>close</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-md font-code-md text-code-md leading-relaxed custom-scrollbar">
            <div className="text-on-surface-variant mb-2">// Line 24: Updated session config</div>
            <div className="bg-red-900/20 text-red-400 px-2 line-through">- return session.token;</div>
            <div className="bg-green-900/20 text-green-400 px-2">+ return rotateSession(session.token);</div>
            <div className="text-on-surface-variant mt-4 opacity-50">...</div>
            <div className="text-on-surface-variant mt-4 opacity-50">...</div>
            <div className="text-on-surface-variant mt-4 opacity-50">...</div>
          </div>
          <div className="p-md bg-surface-container-low border-t border-outline-variant/20 flex gap-sm">
            <button className="flex-1 py-1.5 bg-primary text-on-primary rounded font-label-sm text-label-sm hover:brightness-110 transition-all">Accept Changes</button>
            <button className="flex-1 py-1.5 bg-surface-variant rounded font-label-sm text-label-sm hover:bg-surface-variant/80 transition-colors">Open Full Diff</button>
          </div>
        </div>
        */}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #464554;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c0c1ff;
        }
      `}</style>
    </div>
  );
};

export default History;
