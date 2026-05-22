import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RoomLobby = () => {
  const navigate = useNavigate();

  return (
    <div className="flex overflow-hidden h-screen bg-[#0a0a0c] text-[#e4e1ed] font-body-md">
      {/* SideNavBar */}
      <aside className="hidden md:flex h-screen w-sidebar-width fixed left-0 top-0 flex-col bg-surface-container backdrop-blur-xl border-r border-outline-variant z-40">
        <div className="flex flex-col h-full py-md">
          <div className="px-md mb-lg">
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>terminal</span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-primary leading-tight">CodeEditor</h1>
                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">v1.0.4</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-sm space-y-xs">
            <div className="text-on-surface-variant bg-primary/10 border-l-2 border-primary group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined text-primary">groups</span>
              <span className="font-label-sm text-label-sm">Lobby</span>
            </div>
            <div className="text-on-surface-variant hover:bg-surface-bright group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined">folder</span>
              <span className="font-label-sm text-label-sm">Files</span>
            </div>
            <div className="text-on-surface-variant hover:bg-surface-bright group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined">search</span>
              <span className="font-label-sm text-label-sm">Search</span>
            </div>
            <div className="text-on-surface-variant hover:bg-surface-bright group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined">account_tree</span>
              <span className="font-label-sm text-label-sm">Git</span>
            </div>
          </nav>
          <div className="px-sm space-y-xs mt-auto">
            <div className="text-on-surface-variant hover:bg-surface-bright group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined">account_circle</span>
              <span className="font-label-sm text-label-sm">Accounts</span>
            </div>
            <div className="text-on-surface-variant hover:bg-surface-bright group flex items-center gap-md p-md cursor-pointer transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-sm text-label-sm">Settings</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-[260px] flex flex-col h-full bg-background relative w-full">
        {/* TopNavBar */}
        <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex items-center justify-between px-md py-sm">
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-md">
              <span className="font-headline-md text-headline-md font-bold text-primary">Workspace</span>
              <div className="hidden sm:flex items-center gap-sm px-md py-xs bg-surface-container-low rounded-lg border border-outline-variant">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
                <input className="bg-transparent border-none focus:ring-0 text-body-md font-body-md placeholder:text-outline text-on-surface w-48 outline-none" placeholder="Search resources..." type="text" />
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-lg">
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" to="/dashboard">Dashboard</Link>
              <a className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1 cursor-pointer" href="#">Workspace</a>
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Snapshots</a>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">settings</span>
            <button className="hidden sm:block bg-primary text-on-primary font-label-sm text-label-sm px-lg py-sm rounded-lg hover:opacity-90 active:opacity-80 transition-all">Deploy</button>
            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
              <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuGjgpLxMhPWC1OA9U5IiwY90D6rxRPSMxa6SzwYT-kQiW0wb92g48zBrU7MfZOjCHIc60COs_2U6ljL-53Sfd-OdaADzqeaTc7sNGJqBeS-QROaBqaYZrIMJ2l0xSl_bk6sposMgOj0svVKc0wvcxGzhl2BGQuOhLClg5kASV5aSTIV4xxv-fPy1S9GW5fa7HJjlbyzNwmPY4ueYbPi1rO_DaCmKNyH-355ORpC3-yXdhII79anYBDj6mz5_3nC0zG4a77hJIDx1N" />
            </Link>
          </div>
        </header>

        {/* Lobby Content */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden p-md md:p-lg gap-lg">
          {/* Left Column: Lobby Info & Participants */}
          <div className="flex-[2] flex flex-col gap-lg overflow-y-auto pr-sm custom-scrollbar">
            {/* Section 1: Lobby Header */}
            <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-lg flex flex-col sm:flex-row justify-between items-start gap-md">
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <span className="px-sm py-[2px] bg-primary-container/20 text-primary-container text-[10px] font-bold uppercase tracking-wider rounded border border-primary-container/30">Active Lobby</span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">Room ID: FE-REFACTOR-902</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Frontend Refactor</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Deep dive into the new authentication flow. We're migrating existing React components to the new Tailwind-based design system and optimizing performance.</p>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white px-xl py-md rounded-lg font-label-sm text-label-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Start Session
              </button>
            </div>

            {/* Section 2: Participant List */}
            <div className="flex flex-col gap-md">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-on-surface">Participants <span className="text-primary-container opacity-60 ml-sm">4/8</span></h3>
                <button className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Invite
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {/* Participant Card: Host */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl flex items-center gap-md border-l-4 border-l-primary">
                  <div className="relative">
                    <img alt="Alex Rivera" className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATkRyhTrJ7Wmo1CdNrttHPmp_eLgnDXWLutXX245ezfSsXBD0pJgERPc5p0s2jtBP98sGX_nEiUWqC4FNbdGktgbnxXMRgjk2dFZf9JMwjda34oByo9and6asoVb7IpcZRsW9ZKvOmUqN8kr9Wa6g-QNfBsMrCg50jnQ-d0IYHMmM3Y6DAIiDxDFPNKc-tUfWUjWjAyi10lviqSzMyYX292GGO9ARuXd77xwN01nBPT6uLPFdqnKE-cnldcLQ-NGm5xWf7H0gOzesZ" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-label-sm text-label-sm text-on-surface">Alex Rivera</p>
                      <span className="text-[10px] text-primary-container bg-primary-container/10 px-xs py-0.5 rounded border border-primary-container/20 font-bold">HOST</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-body-md">Ready to start</p>
                  </div>
                  <div className="flex gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-primary">mic</span>
                    <span className="material-symbols-outlined text-[18px] text-primary">videocam</span>
                  </div>
                </div>
                
                {/* Participant Card: Ready */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl flex items-center gap-md">
                  <div className="relative">
                    <img alt="Sarah Chen" className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ90mC5ued99VCoP5kkjOeIXZoF0qskHR8bgcCLolSU4Lbr5y2AaG8wPJPPAMcL2JrC4YEcYKlBABsbeYZNf8KNgpMuOlSpXdroxjCC6djGJpjroTndXgcXgB44fZcMHQcpsLPaAaJfSFjgPOaoNrSlswEFROYgkFvCycABKFczXV9RrOaNGvfGUH-EMF3_NOQqQ1KZf-lZZbLOPbRg_fgArRdYdg__nZYpnosS6m5cqW5VFJkejiXwKwtUVHtyjua2uW3PJfy34l_" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface flex items-center justify-center"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-label-sm text-label-sm text-on-surface">Sarah Chen</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-body-md">Ready to start</p>
                  </div>
                  <div className="flex gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-primary">mic</span>
                    <span className="material-symbols-outlined text-[18px] text-outline">videocam_off</span>
                  </div>
                </div>

                {/* Participant Card: Setting Up */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl flex items-center gap-md opacity-80">
                  <div className="relative">
                    <img alt="Marcus V." className="w-12 h-12 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy2XsSOEgIRxPapH0qUGbsOXWtwK-Xj5bZKTfZ6XZ-Yvu_mFLVTH0aCzM5ls188zSVznde40iVFaHEyAOT9FfPBu4G5CoPrDZG290T5f2FU1gqXKkJXHQts2gw15JunXcL4c7JaR85wYAFSPuU0uoScaerR75kQ8FAF6_59boPi_AeHi5UujsENSztpH73LrO4RnWKwHyat0n_2v7mRQ5S4qcNcCPy62EuRpt1T3vzAoxPQQpuaRM43xpmG47dkf17TZX9M5fI0YA7" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-tertiary rounded-full border-2 border-surface flex items-center justify-center"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-label-sm text-label-sm text-on-surface">Marcus V.</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-body-md italic">Setting up theme...</p>
                  </div>
                  <div className="flex gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-outline">mic_off</span>
                    <span className="material-symbols-outlined text-[18px] text-outline">videocam_off</span>
                  </div>
                </div>

                {/* Participant Card: Joining */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl flex items-center gap-md border-dashed border-outline-variant">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-outline animate-pulse">
                    <span className="material-symbols-outlined">hourglass_top</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-label-sm text-label-sm text-outline">Connecting...</p>
                    <div className="w-24 h-1.5 bg-surface-variant rounded-full mt-sm overflow-hidden">
                      <div className="w-1/2 h-full bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pre-Session Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Audio/Video Controls */}
              <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-md">
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">Quick Controls</h4>
                <div className="flex gap-md">
                  <div className="flex-1 p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center gap-sm cursor-pointer hover:bg-surface-bright transition-all">
                    <span className="material-symbols-outlined text-primary text-headline-md" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
                    <span className="font-label-sm text-label-sm">Microphone</span>
                    <p className="text-[10px] text-emerald-500 font-bold">ON</p>
                  </div>
                  <div className="flex-1 p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center gap-sm cursor-pointer hover:bg-surface-bright transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant text-headline-md">videocam_off</span>
                    <span className="font-label-sm text-label-sm">Camera</span>
                    <p className="text-[10px] text-outline font-bold">OFF</p>
                  </div>
                </div>
                <div className="mt-md flex items-center justify-between p-sm bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="font-label-sm text-label-sm text-on-surface">Ready Status</span>
                  </div>
                  <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-on-primary rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-md">
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">Environment</h4>
                <div className="space-y-sm">
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant">Editor Theme</span>
                    <div className="flex items-center gap-sm bg-surface-container px-sm py-1 rounded border border-outline-variant cursor-pointer">
                      <span>Deep Space</span>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant">Keybindings</span>
                    <div className="flex items-center gap-sm bg-surface-container px-sm py-1 rounded border border-outline-variant cursor-pointer">
                      <span>VS Code</span>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="text-on-surface-variant">Font Size</span>
                    <div className="flex items-center gap-sm bg-surface-container px-sm py-1 rounded border border-outline-variant cursor-pointer">
                      <span>14px</span>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (Chat, Activity, Details) */}
          <div className="w-full xl:w-[380px] flex flex-col gap-lg h-auto xl:h-[calc(100vh-140px)] flex-shrink-0">
            {/* Section 4: Chat & Activity */}
            <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 flex-1 rounded-xl flex flex-col overflow-hidden min-h-[400px]">
              <div className="p-md border-b border-outline-variant flex items-center justify-between">
                <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">Lobby Chat</h4>
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-[20px] text-outline cursor-pointer hover:text-primary">more_vert</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
                {/* Activity Log */}
                <div className="flex items-center gap-sm text-[11px] text-outline italic">
                  <div className="h-[1px] flex-1 bg-outline-variant"></div>
                  <span>Sarah Chen joined the room</span>
                  <div className="h-[1px] flex-1 bg-outline-variant"></div>
                </div>
                
                {/* Chat Message */}
                <div className="flex gap-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
                    <img alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjNYKikRODPKFxFZ0sajUkpPnYHFTS1EB4u2jpDyvubpfzytsCfqUv6qlG84I_ztmeCfsrbE9l-10ZTOkKgN4FOtrI3yTvMpEVlzNwVHAK3Nx5fxUz06I9mv9zRa9DuspMDzSLs-iVVYktg-s0O2VUinH0du6E4w7PfEuHdnbK8F-7iXvLWXYGpqulXCXNPBbZ9gCacGplWJVgNzm4U2Yw3_PrbZiQ2hWFpt0nGW-nsFqEb_ORWn7qTSXdVYh-2PJj9ZeQ5CaQxo7y" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-sm">
                      <span className="font-label-sm text-label-sm text-primary">Alex Rivera</span>
                      <span className="text-[10px] text-outline">10:45 AM</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface bg-surface-container px-md py-sm rounded-lg mt-xs inline-block">
                      Hey everyone! Thanks for joining. We'll start in about 5 minutes once Marcus is ready.
                    </p>
                  </div>
                </div>
                
                {/* Chat Message */}
                <div className="flex gap-sm justify-end">
                  <div className="flex-1 text-right">
                    <div className="flex items-baseline gap-sm justify-end">
                      <span className="text-[10px] text-outline">10:46 AM</span>
                      <span className="font-label-sm text-label-sm text-secondary-fixed">Me</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-primary bg-primary px-md py-sm rounded-lg mt-xs inline-block">
                      Sounds good. I'm just reviewing the PR changes now.
                    </p>
                  </div>
                </div>
                
                {/* Activity Log */}
                <div className="flex items-center gap-sm text-[11px] text-outline italic">
                  <div className="h-[1px] flex-1 bg-outline-variant"></div>
                  <span>Marcus V. changed theme to "Cobalt"</span>
                  <div className="h-[1px] flex-1 bg-outline-variant"></div>
                </div>
              </div>
              
              <div className="p-md pt-0">
                <div className="bg-surface-container-highest rounded-xl border border-outline-variant p-sm flex items-center gap-sm">
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">mood</span>
                  <input className="flex-1 bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder:text-outline outline-none" placeholder="Type a message..." type="text" />
                  <button className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: Session Details */}
            <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-md">
              <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">Session Info</h4>
              <div className="space-y-md">
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">account_tree</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface">Repository</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">frontend-core-v2</p>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">fork_right</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface">Current Branch</p>
                    <p className="font-code-md text-code-md text-secondary-fixed">feature/ui-refresh-2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">lock</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface">Privacy Settings</p>
                    <div className="flex items-center gap-xs mt-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="font-body-md text-body-md text-on-surface-variant">Private Room</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-lg pt-md border-t border-outline-variant flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold">AR</div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold">SC</div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold">MV</div>
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[10px] font-bold">+1</div>
                </div>
                <span className="text-[11px] text-outline">Collaborators</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #464554;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default RoomLobby;
