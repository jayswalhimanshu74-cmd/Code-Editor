import React from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    <div className="bg-[#13131b] text-[#e4e1ed] flex h-screen overflow-hidden font-body-md">
      {/* SideNavBar Anchor */}
      <aside className="hidden md:flex w-[260px] bg-surface-container-lowest/90 backdrop-blur-lg border-r border-outline-variant/30 flex-col h-full py-md gap-sm shrink-0 z-40">
        <div className="px-md mb-lg">
          <h1 className="font-headline-md text-headline-md font-black text-primary">CodeEditor</h1>
          <div className="flex items-center mt-sm gap-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
              <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface">Project Alpha</p>
              <p className="text-[10px] text-on-surface-variant">Collaborative Session</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link className="text-on-surface-variant flex items-center px-md py-sm hover:bg-surface-variant/50 transition-colors duration-150 group" to="/file-manager">
            <span className="material-symbols-outlined mr-sm text-[20px]">folder_open</span>
            <span className="font-label-sm text-label-sm">Explorer</span>
          </Link>
          <a className="text-on-surface-variant flex items-center px-md py-sm hover:bg-surface-variant/50 transition-colors duration-150 group" href="#">
            <span className="material-symbols-outlined mr-sm text-[20px]">search</span>
            <span className="font-label-sm text-label-sm">Search</span>
          </a>
          <a className="text-on-surface-variant flex items-center px-md py-sm hover:bg-surface-variant/50 transition-colors duration-150 group" href="#">
            <span className="material-symbols-outlined mr-sm text-[20px]">camera_alt</span>
            <span className="font-label-sm text-label-sm">Snapshots</span>
          </a>
          <Link className="text-on-surface-variant flex items-center px-md py-sm hover:bg-surface-variant/50 transition-colors duration-150 group" to="/history">
            <span className="material-symbols-outlined mr-sm text-[20px]">history</span>
            <span className="font-label-sm text-label-sm">History</span>
          </Link>
          <Link className="bg-primary-container/20 text-primary border-r-2 border-primary flex items-center px-md py-sm transition-all duration-150 group" to="/settings">
            <span className="material-symbols-outlined mr-sm text-[20px]">settings</span>
            <span className="font-label-sm text-label-sm">Settings</span>
          </Link>
        </nav>
        <div className="px-md py-sm mt-auto border-t border-outline-variant/20">
          <a className="text-outline hover:text-on-surface flex items-center py-xs transition-colors group" href="#">
            <span className="material-symbols-outlined mr-sm text-[18px]">help</span>
            <span className="font-label-sm text-label-sm">Help</span>
          </a>
          <a className="text-outline hover:text-on-surface flex items-center py-xs transition-colors group" href="#">
            <span className="material-symbols-outlined mr-sm text-[18px]">chat_bubble</span>
            <span className="font-label-sm text-label-sm">Feedback</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* TopNavBar Anchor */}
        <header className="bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center w-full px-md h-16 max-w-full z-50">
          <div className="flex items-center gap-xl">
            <nav className="hidden md:flex items-center gap-md">
              <Link className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" to="/">Home</Link>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Features</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">About</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden sm:flex gap-sm">
              <button className="w-8 h-8 rounded hover:bg-white/5 transition-all duration-200 flex items-center justify-center group active:scale-95">
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface">play_arrow</span>
              </button>
              <button className="w-8 h-8 rounded hover:bg-white/5 transition-all duration-200 flex items-center justify-center group active:scale-95">
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface">save</span>
              </button>
              <button className="w-8 h-8 rounded hover:bg-white/5 transition-all duration-200 flex items-center justify-center group active:scale-95">
                <span className="material-symbols-outlined text-outline group-hover:text-on-surface">share</span>
              </button>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/30"></div>
            <Link to="/profile">
              <img alt="User profile avatar" className="w-8 h-8 rounded-full border border-outline-variant/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjfVeH6WV84Trc_hEc9ke_UgMsi9KEg_Sfx2CliT6T35jVlBu0BgAazhvXNqUQEeQLE0dr_H-CG9sMdnYMBI0Jde2E7a7Ko_DXvqBGdMsQxIyFRA5ehNqATMLNdlW2G-dmzip_IMB6NFQure4iqM8bl-ODZSvnW27WyujYtIbE7MhTksA_AX8Jb1bWQhYMiWkEY4XaiF0vXESf0fGT8jUXdQ-9GZPxQMe5sPbVeDrNatz046E9UHEn5hvPMFOa7cZMkeuTtCtgfWpW" />
            </Link>
          </div>
        </header>

        {/* Settings Content Canvas */}
        <div className="flex-1 overflow-y-auto p-md lg:p-xl custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <header className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Settings</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Customize your CodeEditor workspace and account preferences.</p>
            </header>

            {/* Settings Tabs */}
            <div className="flex gap-md border-b border-outline-variant/30 mb-lg overflow-x-auto custom-scrollbar pb-2">
              <button className="font-body-md text-body-md text-primary border-b-2 border-primary pb-sm px-xs transition-all whitespace-nowrap">Theme</button>
              <button className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface pb-sm px-xs transition-all whitespace-nowrap">Editor</button>
              <button className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface pb-sm px-xs transition-all whitespace-nowrap">Notifications</button>
              <button className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface pb-sm px-xs transition-all whitespace-nowrap">Account</button>
            </div>

            {/* Settings Grid (Bento Style Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
              {/* Theme & Appearance Card */}
              <section className="md:col-span-8 bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-lg flex flex-col gap-lg">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">palette</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Appearance</h3>
                </div>
                <div className="space-y-md">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-md sm:gap-0">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">Color Theme</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Choose your primary workspace visual style.</p>
                    </div>
                    <select className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all">
                      <option>Deep Space (Default)</option>
                      <option>Monokai Pro</option>
                      <option>GitHub Dark Dimmed</option>
                      <option>Solarized Light</option>
                    </select>
                  </div>
                  
                  <div className="space-y-sm pt-4 border-t border-outline-variant/20">
                    <div className="flex justify-between items-center">
                      <p className="font-body-lg text-body-lg text-on-surface">Font Size</p>
                      <span className="font-code-md text-code-md text-primary bg-primary/10 px-sm py-xs rounded">14px</span>
                    </div>
                    <input className="w-full range-slider" max="24" min="10" type="range" defaultValue="14" />
                    <div className="flex justify-between text-[10px] text-outline">
                      <span>Small</span>
                      <span>Comfortable</span>
                      <span>Accessible</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-sm border-t border-outline-variant/20">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">Font Ligatures</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Enable stylized operator combinations ({`=>`}, !=).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Preview Card */}
              <section className="md:col-span-4 bg-primary/5 backdrop-blur-[16px] border border-primary/20 rounded-xl p-lg flex flex-col justify-between">
                <div className="mb-md">
                  <p className="font-label-sm text-label-sm text-primary mb-sm uppercase tracking-widest">Live Preview</p>
                  <div className="bg-black/40 rounded-lg p-md font-code-md text-code-md space-y-1 overflow-x-auto border border-white/5">
                    <p><span className="text-[#ffb783]">function</span> <span className="text-primary">init</span>() {'{'}</p>
                    <p className="pl-md text-on-surface-variant">// Check ligatures</p>
                    <p className="pl-md"><span className="text-[#adc6ff]">const</span> res <span className="text-primary">=</span> <span className="text-[#ffb4ab]">true</span>;</p>
                    <p className="pl-md"><span className="text-[#adc6ff]">if</span> (res <span className="text-primary">!==</span> <span className="text-[#ffb4ab]">false</span>) {'{'}</p>
                    <p className="pl-xl text-on-surface-variant">console.log(<span className="text-[#d8e2ff]">"Success"</span>);</p>
                    <p className="pl-md">{'}'}</p>
                    <p>{'}'}</p>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-center italic mt-4">Settings apply immediately</p>
              </section>

              {/* Editor Preferences Card */}
              <section className="md:col-span-12 bg-[#161618cc] backdrop-blur-[16px] border border-white/10 rounded-xl p-lg">
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Editor Preferences</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-xl gap-y-lg">
                  <div className="flex justify-between items-center gap-md">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">Tab Size</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Number of spaces for indentation.</p>
                    </div>
                    <select className="bg-black/20 border border-outline-variant/50 rounded-lg px-md py-sm font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary">
                      <option>2 Spaces</option>
                      <option defaultValue>4 Spaces</option>
                      <option>8 Spaces</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center gap-md">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">Show Line Numbers</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Display absolute line gutter numbers.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center gap-md border-t border-outline-variant/20 pt-4 md:border-t-0 md:pt-0">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">Auto-Save</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Automatically save changes after delay.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center gap-md border-t border-outline-variant/20 pt-4 md:border-t-0 md:pt-0">
                    <div>
                      <p className="font-body-lg text-body-lg text-on-surface">IntelliSense Suggestions</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Show smart autocomplete popups.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* AI Assistant Context */}
              <section className="md:col-span-12 relative overflow-hidden rounded-xl h-48 sm:h-64 group border border-white/10">
                <img alt="Advanced coding AI interface" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOhz5Exzsu9Q62DlzJzA1dO-bYkk5CRgqfgQaB9VM98z49xL8JbSUo3tpHvl7c5CYF_cPDoBRwzckpc8Iu8FW-HEAMaenfMeqoZesdEyBlHHXMlLmKfPkQElFReOB-wT6k_mtHVns6jFOuNbuTSL2ezX9ZSFmZ_B4XHvAK4Wb7aQni0esjP3Y8GRp4R2U5EW9rFXVoPfL2iyYafU6ID7-MioxDG5INlcnQ2riwHmC_cqyGWaEfnK6kQe3Tx0bZ5ZYwsNr7V_thHwt0" />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/80 to-transparent flex flex-col justify-center px-lg">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                    <p className="font-label-sm text-label-sm text-primary tracking-widest uppercase">Premium Feature</p>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">AI Pair Programmer</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md hidden sm:block">Enable context-aware code generation and bug prediction powered by CodePulse Engine.</p>
                  <button className="mt-md w-fit px-lg py-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white rounded-lg font-body-md text-body-md font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">Upgrade Pro</button>
                </div>
              </section>
            </div>

            {/* Action Footer */}
            <footer className="mt-xl flex justify-end gap-md pb-xl">
              <button className="px-lg py-md font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">Discard Changes</button>
              <button className="px-xl py-md bg-primary-container text-on-primary-container rounded-lg font-body-md text-body-md font-bold shadow-xl shadow-primary/20 hover:bg-primary hover:text-on-primary transition-all active:scale-95">Save Preferences</button>
            </footer>
          </div>
        </div>

        {/* Shared Component Footer Anchor */}
        <footer className="bg-surface-dim border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center px-lg py-md w-full shrink-0">
          <div className="font-headline-md text-headline-md text-primary font-bold">CodeEditor</div>
          <div className="flex flex-wrap justify-center gap-lg my-md md:my-0">
            <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Terms</a>
            <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Privacy</a>
            <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Status</a>
            <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Documentation</a>
          </div>
          <p className="font-body-md text-body-md text-outline">© 2024 CodeEditor Inc. All rights reserved.</p>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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
        .range-slider {
          -webkit-appearance: none;
          background: #464554;
          height: 4px;
          border-radius: 2px;
        }
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #c0c1ff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Settings;
