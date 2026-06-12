import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen selection:bg-primary/30 relative">
      
      {/* Background Glow Mesh — matches IDE Layout */}
      <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-primary/10 blur-[180px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-secondary/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-lg h-16 max-w-full">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-headline-md text-headline-md font-extrabold tracking-tighter text-on-surface flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-neon-cyan shadow-[0_0_20px_rgba(0,112,243,0.5)] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px] font-bold">terminal</span>
            </div>
            <span style={{ background: 'linear-gradient(90deg, #ffffff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hence-Code
            </span>
          </Link>
          <div className="hidden md:flex gap-md">
            <Link className="font-body-md text-body-md text-primary font-bold transition-all hover:opacity-90" to="/">Home</Link>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors no-underline" href="#features">Features</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors no-underline" href="#about">About</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors no-underline" href="#pricing">Pricing</a>
          </div>  
        </div>
        <div className="flex items-center gap-md">
          <Link to="/login" className="px-4 py-2 font-label-sm text-label-sm text-on-surface hover:bg-white/5 transition-all rounded-xl no-underline font-semibold">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 font-label-sm text-label-sm bg-primary text-white rounded-xl shadow-[0_0_15px_rgba(0,112,243,0.3)] hover:shadow-[0_0_25px_rgba(0,112,243,0.5)] hover:scale-105 active:scale-95 transition-all no-underline font-bold">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-lg py-xl text-center overflow-hidden">
          <div className="absolute -top-40 right-1/4 w-96 h-96 bg-secondary/80 rounded-full blur-[150px] -z-10 opacity-30 animate-pulse" />
          
          <div className="text-[11px] text-primary font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse inline-block" />
            Hence-Code Collaborative IDE
          </div>

          <h1 className="font-headline-lg text-[44px] md:text-[68px] md:leading-[1.1] font-black tracking-tight max-w-4xl mb-6">
            Code with Anyone,<br/> 
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Anywhere.
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            The next-generation collaborative IDE built for speed. Experience millisecond sync latency, isolated container runtimes, and instant browser-based workspace sharing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 z-10">
            <Link to="/register" 
              className="px-8 py-3.5 bg-white text-black font-bold text-[14px] rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.25)] no-underline">
              Get Started Free 
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <a href="#features" 
              className="px-8 py-3.5 glass-card text-on-surface font-semibold text-[14px] rounded-xl hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10 no-underline">
              Explore Features
            </a>
          </div>

          {/* Glassmorphic Editor Preview */}
          <div className="w-full max-w-4xl glass-card rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)] relative border border-white/10 mx-auto"
               style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
            <div className="bg-white/[0.02] px-md py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-3">
                  <div className="w-3 h-3 rounded-full bg-error/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                </div>
                <div className="flex gap-1.5">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-primary text-xs font-semibold flex items-center gap-2 shadow-inner">
                    <span className="material-symbols-outlined text-[14px] text-[#f7df1e]">javascript</span>
                    main.js 
                    <span className="material-symbols-outlined text-[12px] opacity-70 hover:opacity-100 cursor-pointer">close</span>
                  </div>
                  <div className="px-3 py-1 text-on-surface-variant text-xs flex items-center gap-2 hover:bg-white/[0.02] rounded-lg cursor-pointer transition-all">
                    <span className="material-symbols-outlined text-[14px] text-[#fb923c]">coffee</span>
                    App.java
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <span className="material-symbols-outlined text-[16px] hover:text-white cursor-pointer transition-colors">settings</span>
              </div>
            </div>
            
            <div className="flex min-h-[220px]">
              <div className="w-12 bg-black/40 border-r border-white/5 py-4 font-code-md text-xs text-outline/40 select-none text-right pr-3 font-mono leading-relaxed">
                1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8
              </div>
              <div className="p-4 text-left font-code-md text-code-md w-full relative font-mono leading-relaxed">
                <div className="absolute top-4 left-0 w-full h-6 bg-white/[0.02] pointer-events-none"></div>
                <pre className="text-white/90"><code>
<span className="code-token-keyword">import</span> Y <span className="code-token-keyword">from</span> <span className="code-token-string">'yjs'</span>;
<span className="code-token-keyword">import</span> {'{ WebrtcProvider }'} <span className="code-token-keyword">from</span> <span className="code-token-string">'y-webrtc'</span>;

<span className="code-token-keyword">const</span> ydoc = <span className="code-token-keyword">new</span> Y.<span className="code-token-function">Doc</span>();
<span className="code-token-keyword">const</span> provider = <span className="code-token-keyword">new</span> <span className="code-token-function">WebrtcProvider</span>(<span className="code-token-string">'collaborative-room'</span>, ydoc);
<span className="code-token-keyword">const</span> ytext = ydoc.<span className="code-token-function">getText</span>(<span className="code-token-string">'shared-code'</span>);

console.<span className="code-token-function">log</span>(<span className="code-token-string">"Millisecond sync latency initialized!"</span>);
                </code></pre>
                
                {/* Collaborative Cursors */}
                <div className="absolute top-28 left-80 flex flex-col gap-1">
                  <div className="w-0.5 h-5 bg-[#60a5fa] relative animate-pulse">
                    <div className="absolute -top-6 left-0 bg-[#60a5fa] text-[10px] text-black font-bold whitespace-nowrap px-1.5 py-0.5 rounded shadow-lg">
                      Himanshu
                    </div>
                  </div>
                </div>
                <div className="absolute top-40 left-48 flex flex-col gap-1">
                  <div className="w-0.5 h-5 bg-[#f472b6] relative animate-pulse">
                    <div className="absolute -top-6 left-0 bg-[#f472b6] text-[10px] text-black font-bold whitespace-nowrap px-1.5 py-0.5 rounded shadow-lg">
                      Sarah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WebSocket Explanation Block */}
        <section className="py-24 px-lg" id="features">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-[10px] uppercase tracking-wider font-bold">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Real-Time Synchronization
              </div>
              <h2 className="font-headline-lg text-[28px] md:text-[38px] tracking-tight leading-tight font-black">
                Zero Latency.<br/>Zero Conflicts.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Hence-Code uses optimized WebSockets paired with Conflict-Free Replicated Data Types (CRDTs) to sync workspaces globally under 50ms. Your team stays aligned instantly.
              </p>
              <ul className="space-y-3 p-0">
                <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-green-400">check_circle</span>
                  Binary-encoded state synchronization using Yjs
                </li>
                <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-green-400">check_circle</span>
                  Automatic offline buffer recovery without loss
                </li>
              </ul>
            </div>
            
            {/* Visual network state illustration */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border border-white/10"
                 style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              
              {/* Interactive CSS Graphic */}
              <div className="w-full aspect-video rounded-xl border border-white/5 bg-black/40 flex flex-col justify-between p-4 relative overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                    <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-wider">WS Connection Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">RTT: 18ms</span>
                </div>
                
                {/* Node connection diagram */}
                <div className="flex items-center justify-around py-8 relative">
                  {/* Connective lines */}
                  <div className="absolute left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-40 blur-[1px]"></div>
                  
                  <div className="flex flex-col items-center gap-2 z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/50">Client A</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center shadow-lg animate-pulse">
                      <span className="material-symbols-outlined text-secondary text-[24px]">hub</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#a78bfa] font-bold">Hence Server</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">person</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/50">Client B</span>
                  </div>
                </div>

                <div className="font-code-md text-[10px] text-primary bg-black/40 p-2.5 rounded-lg border border-primary/20 font-mono text-left z-10">
                  WebSocket Connected: wss://sync.hencecode.io/v1/session_94a2
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-lg max-w-6xl mx-auto">
          <h3 className="font-headline-lg text-[28px] md:text-[38px] tracking-tight text-center mb-16 font-black">
            Everything you need to <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ship faster</span>.
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 group border border-white/5"
                 style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[22px]">sync</span>
              </div>
              <h4 className="font-headline-md text-[15px] font-extrabold mb-2 text-white">Real-time Sync</h4>
              <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">Multi-user cursor tracking and shared terminal instances across the globe.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 group border border-white/5"
                 style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-12 h-12 rounded-xl bg-[#7928ca]/15 border border-[#7928ca]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#a78bfa] text-[22px]">language</span>
              </div>
              <h4 className="font-headline-md text-[15px] font-extrabold mb-2 text-white">Multi-language</h4>
              <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">Native LSP support for 50+ languages including Rust, Go, Python, and C++.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 group border border-white/5"
                 style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-12 h-12 rounded-xl bg-[#ff0080]/10 border border-[#ff0080]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#f472b6] text-[22px]">psychology</span>
              </div>
              <h4 className="font-headline-md text-[15px] font-extrabold mb-2 text-white">AI Pair Programming</h4>
              <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">Context-aware code completion and automated refactoring suggestions.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 group border border-white/5"
                 style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-green-400 text-[22px]">rocket_launch</span>
              </div>
              <h4 className="font-headline-md text-[15px] font-extrabold mb-2 text-white">Instant Deploy</h4>
              <p className="font-body-md text-[12px] text-on-surface-variant leading-relaxed">One-click push to staging or production directly from the editor console.</p>
            </div>
          </div>
        </section>

        {/* Collaboration Section */}
        <section className="py-24 px-lg relative overflow-hidden" id="about">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[120px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass-card border border-white/10"
                   style={{ background: 'rgba(10,10,15,0.6)' }}>
                {/* CSS Graphic for Collaboration metrics */}
                <div className="w-full h-full flex flex-col justify-center p-8 relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">H</div>
                    <div>
                      <div className="text-[13px] font-bold text-white">Himanshu Jayswal</div>
                      <div className="text-[10px] text-white/50">Editing main.js</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4 pl-6">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-[#a78bfa] font-bold">S</div>
                    <div>
                      <div className="text-[13px] font-bold text-white">Sarah Connor</div>
                      <div className="text-[10px] text-white/50">Viewing main.js</div>
                    </div>
                  </div>
                  
                  <div className="h-[2px] bg-white/5 my-4" />
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Workspace Telemetry</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-1 lg:order-2 space-y-6 text-left">
              <h2 className="font-headline-lg text-[28px] md:text-[38px] tracking-tight leading-tight font-black">
                Built for Teams that Move Fast.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Hence-Code isn't just a basic code editor; it's a shared virtual workspace where distance is eliminated. Jump into your teammate's file with a single click, pair program in real-time, and run your tests in isolated sandboxes.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <div className="text-[28px] font-black text-primary">500+</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Active Rooms</div>
                </div>
                <div>
                  <div className="text-[28px] font-black text-[#a78bfa]">18ms</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Sync Latency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-lg text-center max-w-3xl mx-auto" id="pricing">
          <h2 className="font-headline-lg text-[28px] md:text-[40px] tracking-tight mb-4 font-black">
            Ready to upgrade your workflow?
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
            Join developers globally building the future of real-time collaborative applications on Hence-Code.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" 
              className="px-8 py-3.5 bg-white text-black font-bold text-[14px] rounded-xl hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all no-underline">
              Start Coding Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim/40 border-t border-outline-variant/20 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-lg py-md w-full gap-4">
          <div className="flex items-center gap-4">
            <span className="font-headline-md text-headline-md text-primary font-bold">Hence-Code</span>
            <span className="hidden md:block text-outline-variant">|</span>
            <span className="text-white/40 font-body-md text-[12px]">© 2026 Hence-Code Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-md">
            <a className="font-body-md text-[12px] text-white/40 hover:text-white transition-colors no-underline" href="#">Terms</a>
            <a className="font-body-md text-[12px] text-white/40 hover:text-white transition-colors no-underline" href="#">Privacy</a>
            <a className="font-body-md text-[12px] text-white/40 hover:text-white transition-colors no-underline" href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
