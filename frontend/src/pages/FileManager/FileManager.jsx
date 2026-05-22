import React from 'react';
import { Link } from 'react-router-dom';

const FileManager = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c] text-[#e4e1ed] font-body-md">
      {/* Column 1: SideNavBar (Shared Component) */}
      <aside className="hidden md:flex flex-col h-full py-md px-sm gap-sm bg-surface-container-low/90 backdrop-blur-xl text-primary font-body-md text-body-md w-[260px] border-r border-outline-variant shrink-0 z-40">
        <div className="flex items-center gap-sm mb-lg px-xs">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">terminal</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-primary leading-tight">Project Alpha</h2>
            <p className="text-on-surface-variant text-label-sm">Main Branch</p>
          </div>
        </div>
        <nav className="flex flex-col gap-xs flex-grow">
          <Link className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-variant/30 text-on-surface transition-all duration-200 ease-in-out rounded-lg" to="/dashboard">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>grid_view</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-sm px-sm py-xs bg-secondary-container text-on-secondary-container rounded-lg transition-all duration-200 ease-in-out" to="/file-manager">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>folder_open</span>
            <span className="font-body-md text-body-md">Explorer</span>
          </Link>
          <Link className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:bg-surface-variant/30 text-on-surface transition-all duration-200 ease-in-out rounded-lg" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </Link>
        </nav>
        <div className="mt-auto px-xs">
          <button className="w-full py-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white rounded-lg font-body-md font-bold shadow-lg shadow-primary-container/20 active:scale-95 transition-transform">
            New File
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-col flex-grow min-w-0">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-md h-14 z-50 bg-surface/80 backdrop-blur-md text-primary font-headline-md text-headline-md font-bold top-0 border-b border-outline-variant shadow-sm">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">CodeEditor</span>
            <div className="hidden md:flex items-center bg-surface-variant/40 rounded-full px-sm py-1 border border-outline-variant/30 w-80">
              <span className="material-symbols-outlined text-on-surface-variant text-body-md mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/50 outline-none" placeholder="Search commands or files..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <button className="p-2 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden sm:block p-2 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg active:scale-95">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="hidden sm:block p-2 text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-lg active:scale-95">
              <span className="material-symbols-outlined">help</span>
            </button>
            <Link to="/profile" className="h-8 w-8 rounded-full overflow-hidden ml-2 border border-primary/20">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB15OVGwf5L9sq-WV2ph9KQI3ABqACh8WQBgVudbQJoSIsWnAh9g-9JBf9D7Odpe6SS34rkYUlu75vE6RICU-L2Itxb5dqqfGw_d2L8TQnnwbmvs3-Es3CZf8YDBq6kOFxznkR7mAhxFzXVEAWU4oJB8BC-W9sj4MPjNq7Jscj5b0PbGpp-DyZaPJlWeJeggUKPqwbe13c4A7yra7NjBU-VR6DmJ-MhqCVK2sVHqkCYy0oYtADj1rktOH-5N7wszcbfKV5wySK8HZTt" />
            </Link>
          </div>
        </header>

        {/* Content Shell */}
        <div className="flex flex-grow min-h-0">
          {/* Column 2: File Explorer Sidebar */}
          <section className="hidden xl:flex w-64 flex-col bg-[#161618cc] backdrop-blur-[16px] border-r border-white/10 shrink-0">
            <div className="p-md flex items-center justify-between border-b border-outline-variant/30">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Explorer</span>
              <div className="flex gap-xs">
                <button className="p-1 hover:bg-surface-variant/50 rounded transition-colors text-on-surface-variant" title="New File">
                  <span className="material-symbols-outlined !text-[18px]">note_add</span>
                </button>
                <button className="p-1 hover:bg-surface-variant/50 rounded transition-colors text-on-surface-variant" title="New Folder">
                  <span className="material-symbols-outlined !text-[18px]">create_new_folder</span>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto py-sm custom-scrollbar">
              {/* Folder: src */}
              <div className="flex items-center gap-xs px-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                <span className="material-symbols-outlined text-tertiary text-[18px]">expand_more</span>
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
                <span className="font-body-md text-body-md text-on-surface">src</span>
              </div>
              {/* Subfolder: components */}
              <div className="flex items-center gap-xs pl-xl pr-md py-1 hover:bg-surface-variant/30 cursor-pointer group bg-surface-variant/20 border-r-2 border-primary">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>folder_open</span>
                <span className="font-body-md text-body-md text-primary font-bold">components</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-tertiary" title="Modified"></span>
              </div>
              {/* Files inside components */}
              <div className="flex items-center gap-xs pl-[60px] pr-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                <span className="material-symbols-outlined text-secondary text-[18px]">javascript</span>
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface">Button.jsx</span>
              </div>
              <div className="flex items-center gap-xs pl-[60px] pr-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                <span className="material-symbols-outlined text-secondary text-[18px]">javascript</span>
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface">Card.jsx</span>
                <span className="ml-auto text-error text-[12px] font-bold">M</span>
              </div>
              <div className="flex items-center gap-xs pl-[60px] pr-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                <span className="material-symbols-outlined text-secondary text-[18px]">javascript</span>
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface">Navbar.jsx</span>
              </div>
              {/* Folder: assets */}
              <div className="flex items-center gap-xs px-md py-1 hover:bg-surface-variant/30 cursor-pointer group mt-sm">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
                <span className="font-body-md text-body-md text-on-surface">assets</span>
              </div>
              {/* Folder: styles */}
              <div className="flex items-center gap-xs px-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>folder</span>
                <span className="font-body-md text-body-md text-on-surface">styles</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-error" title="Deleted locally"></span>
              </div>
              {/* Config Files */}
              <div className="mt-md border-t border-outline-variant/30 pt-sm">
                <div className="flex items-center gap-xs px-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">description</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">package.json</span>
                </div>
                <div className="flex items-center gap-xs px-md py-1 hover:bg-surface-variant/30 cursor-pointer group">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">description</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">tailwind.config.js</span>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3: File Management Main Area */}
          <section className="flex-grow flex flex-col min-w-0 bg-surface-container-lowest/50">
            {/* Breadcrumbs & Bulk Actions */}
            <div className="h-14 px-md flex items-center justify-between border-b border-outline-variant/30 bg-[#161618cc] backdrop-blur-[16px]">
              <nav className="flex items-center gap-xs overflow-hidden">
                <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">home</span>
                </button>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
                <span className="text-on-surface-variant font-body-md text-body-md hover:text-primary cursor-pointer transition-colors">src</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
                <span className="text-on-surface font-bold font-body-md text-body-md">components</span>
              </nav>
              <div className="hidden sm:flex items-center gap-sm">
                <button className="flex items-center gap-xs px-sm py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant/50 transition-all font-label-sm text-label-sm">
                  <span className="material-symbols-outlined !text-[16px]">move_item</span>
                  Move
                </button>
                <button className="flex items-center gap-xs px-sm py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant/50 transition-all font-label-sm text-label-sm">
                  <span className="material-symbols-outlined !text-[16px]">download</span>
                  Download
                </button>
                <button className="flex items-center gap-xs px-sm py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 transition-all font-label-sm text-label-sm">
                  <span className="material-symbols-outlined !text-[16px]">delete</span>
                  Delete
                </button>
              </div>
            </div>

            {/* High-Density Grid View */}
            <div className="flex-grow overflow-y-auto p-md lg:p-xl custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-md">
                {/* File Card 1 */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:border-primary/50 cursor-pointer group transition-all hover:translate-y-[-2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <input className="rounded border-outline-variant bg-surface-variant text-primary focus:ring-primary" type="checkbox" />
                  </div>
                  <div className="flex items-center gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30">
                      <span className="material-symbols-outlined text-secondary text-[32px]">javascript</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-body-md text-body-md text-on-surface font-bold truncate">Button.jsx</h3>
                      <p className="text-label-sm text-on-surface-variant">Component</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Size</span>
                      <span className="font-code-md text-code-md text-primary">4.2 KB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Modified</span>
                      <span className="font-code-md text-code-md text-on-surface-variant">2h ago</span>
                    </div>
                  </div>
                </div>

                {/* File Card 2 */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-primary/30 p-md rounded-xl hover:border-primary/50 cursor-pointer group transition-all hover:translate-y-[-2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <input checked readOnly className="rounded border-primary bg-primary-container text-on-primary-container focus:ring-primary" type="checkbox" />
                  </div>
                  <div className="flex items-center gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30">
                      <span className="material-symbols-outlined text-secondary text-[32px]">javascript</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-body-md text-body-md text-primary font-bold truncate">Card.jsx</h3>
                      <p className="text-label-sm text-on-surface-variant">Component</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Size</span>
                      <span className="font-code-md text-code-md text-primary">12.8 KB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Modified</span>
                      <span className="font-code-md text-code-md text-on-surface-variant">5m ago</span>
                    </div>
                  </div>
                  <div className="mt-sm flex items-center gap-xs">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-wider">Unsaved</span>
                  </div>
                </div>

                {/* File Card 3 */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:border-primary/50 cursor-pointer group transition-all hover:translate-y-[-2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <input className="rounded border-outline-variant bg-surface-variant text-primary focus:ring-primary" type="checkbox" />
                  </div>
                  <div className="flex items-center gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30">
                      <span className="material-symbols-outlined text-secondary text-[32px]">javascript</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-body-md text-body-md text-on-surface font-bold truncate">Navbar.jsx</h3>
                      <p className="text-label-sm text-on-surface-variant">Navigation</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Size</span>
                      <span className="font-code-md text-code-md text-primary">8.5 KB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Modified</span>
                      <span className="font-code-md text-code-md text-on-surface-variant">3d ago</span>
                    </div>
                  </div>
                </div>

                {/* File Card 4 (CSS) */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:border-primary/50 cursor-pointer group transition-all hover:translate-y-[-2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <input className="rounded border-outline-variant bg-surface-variant text-primary focus:ring-primary" type="checkbox" />
                  </div>
                  <div className="flex items-center gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center border border-tertiary-container/20">
                      <span className="material-symbols-outlined text-tertiary text-[32px]">css</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-body-md text-body-md text-on-surface font-bold truncate">styles.module.css</h3>
                      <p className="text-label-sm text-on-surface-variant">Stylesheet</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Size</span>
                      <span className="font-code-md text-code-md text-primary">2.1 KB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Modified</span>
                      <span className="font-code-md text-code-md text-on-surface-variant">12h ago</span>
                    </div>
                  </div>
                </div>

                {/* File Card 5 (Asset) */}
                <div className="bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-md rounded-xl hover:border-primary/50 cursor-pointer group transition-all hover:translate-y-[-2px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <input className="rounded border-outline-variant bg-surface-variant text-primary focus:ring-primary" type="checkbox" />
                  </div>
                  <div className="flex items-center gap-md mb-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-variant/50 overflow-hidden border border-outline-variant/30">
                      <img alt="Asset Preview" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxaWDtjOnzoW1GR67JSjXOGSQlRoU9saNZ-29psLbl7AzDkKDiKfwcNOojYYwteW7g-a31LTNRzpuy95XJwRh_FlZp1X-FubRbMnHa46Qee1FlL16LGwwwmCZRSOcOgr30vYmtoAa6ZlVRD6wq8MWT1ZAt3K3vuIjq4EKrd76Wf-Kx-fiQboEb62sjer-a36zU2hUXLYLstgiEEh_lDFOlzSLgW70SEloN_txUlmBh2bzklElMRV46IPe16ni5-LAU10ZdHUbO5dnf" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-body-md text-body-md text-on-surface font-bold truncate">hero-bg.webp</h3>
                      <p className="text-label-sm text-on-surface-variant">Image</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Size</span>
                      <span className="font-code-md text-code-md text-primary">145 KB</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant/60 uppercase">Modified</span>
                      <span className="font-code-md text-code-md text-on-surface-variant">Yesterday</span>
                    </div>
                  </div>
                </div>

                {/* Add New File Card */}
                <div className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-md hover:bg-surface-variant/20 hover:border-primary/50 cursor-pointer transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px] mb-2">add_circle</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Drop files here</span>
                </div>
              </div>

              {/* Storage Summary / Info Section */}
              <div className="mt-xl grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="md:col-span-2 bg-[#161618cc] backdrop-blur-[16px] border border-white/10 p-lg rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-xs">Project Health</h4>
                    <p className="text-on-surface-variant text-body-md">Overall repository stats and git status summary.</p>
                  </div>
                  <div className="mt-lg flex flex-wrap items-center gap-xl">
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface">1,204</span>
                      <span className="text-label-sm text-on-surface-variant uppercase">Total Files</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-tertiary">14</span>
                      <span className="text-label-sm text-on-surface-variant uppercase">Modifications</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-secondary">2.4GB</span>
                      <span className="text-label-sm text-on-surface-variant uppercase">Disk Usage</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 p-lg rounded-xl">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    <h4 className="font-body-md text-body-md font-bold text-on-surface">Git Sync</h4>
                  </div>
                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-label-sm text-on-surface-variant">Last push</span>
                      <span className="text-label-sm text-on-surface">14 mins ago</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(192,193,255,0.5)]"></div>
                    </div>
                    <p className="text-label-sm text-on-surface-variant text-center mt-xs">Syncing artifacts (85%)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
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
      `}</style>
    </div>
  );
};

export default FileManager;
