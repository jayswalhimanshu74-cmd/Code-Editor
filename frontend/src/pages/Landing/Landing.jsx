import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-md h-16 max-w-full">
        <div className="flex items-center gap-xl">
          <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">CodeEditor</span>
          <div className="hidden md:flex gap-md">
            <Link className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1" to="/">Home</Link>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Features</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#about">About</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#pricing">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <div className="hidden lg:flex items-center gap-sm mr-md">
            <button className="p-xs text-on-surface-variant hover:bg-white/5 transition-all duration-200 rounded">
              <span className="material-symbols-outlined">play_arrow</span>
            </button>
            <button className="p-xs text-on-surface-variant hover:bg-white/5 transition-all duration-200 rounded">
              <span className="material-symbols-outlined">save</span>
            </button>
            <button className="p-xs text-on-surface-variant hover:bg-white/5 transition-all duration-200 rounded">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
          <Link to="/login" className="px-md py-sm font-label-sm text-label-sm text-on-surface hover:bg-white/5 transition-all rounded-lg">Login</Link>
          <Link to="/register" className="px-md py-sm font-label-sm text-label-sm bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white rounded-lg shadow-lg active:scale-95 transition-transform">Sign Up</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex flex-col items-center justify-center px-md py-xl text-center overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] -z-10 rounded-full"></div>
          <h1 className="font-headline-lg text-headline-lg md:text-[64px] md:leading-[1.1] font-extrabold max-w-4xl mb-md">
            Code with Anyone, <span className="text-primary">Anywhere.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-xl">
            The next-generation collaborative IDE built for speed. Experience millisecond sync latency, AI-powered pair programming, and one-click cloud deployments.
          </p>
          <div className="flex flex-col sm:flex-row gap-md mb-20">
            <Link to="/register" className="px-lg py-md bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-headline-md text-headline-md rounded-xl shadow-xl flex items-center gap-sm">
              Get Started Free <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <button className="px-lg py-md glass-card text-on-surface font-headline-md text-headline-md rounded-xl flex items-center gap-sm">
              View Demo
            </button>
          </div>

          {/* Glassmorphic Editor Preview */}
          <div className="w-full max-w-5xl glass-card rounded-xl overflow-hidden shadow-2xl relative">
            <div className="bg-surface-container-highest/50 px-md py-sm flex items-center gap-sm border-b border-outline-variant/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error/40"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/40"></div>
              </div>
              <div className="ml-4 flex gap-4">
                <div className="px-sm py-1 bg-surface-container-low border-b-2 border-primary text-primary text-xs font-label-sm flex items-center gap-xs">
                  App.tsx <span className="material-symbols-outlined text-[12px]">close</span>
                </div>
                <div className="px-sm py-1 text-on-surface-variant text-xs font-label-sm flex items-center gap-xs">
                  server.py
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="w-12 bg-black/20 border-r border-outline-variant/10 py-md font-code-md text-xs text-outline/50 select-none">
                1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10
              </div>
              <div className="p-md text-left font-code-md text-code-md w-full relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-white/5 pointer-events-none"></div>
                <pre><code><span className="code-token-keyword">import</span> React <span className="code-token-keyword">from</span> <span className="code-token-string">'react'</span>;
{"\n"}
<span className="code-token-keyword">const</span> <span className="code-token-function">CodeEditor</span> = () =&gt; {"{"}
  <span className="code-token-keyword">const</span> [code, setCode] = React.<span className="code-token-function">useState</span>(<span className="code-token-string">""</span>);
{"\n"}
  <span className="code-token-keyword">return</span> (
    &lt;<span className="code-token-function">div</span> className=<span className="code-token-string">"editor-container"</span>&gt;
      &lt;<span className="code-token-function">MonacoEditor</span> theme=<span className="code-token-string">"vs-dark"</span> /&gt;
    &lt;/<span className="code-token-function">div</span>&gt;
  );
{"}"};</code></pre>
                {/* Collaborative Cursors */}
                <div className="absolute top-32 left-48 flex flex-col gap-xs">
                  <div className="w-0.5 h-5 bg-primary relative">
                    <div className="absolute -top-6 left-0 bg-primary px-sm py-0.5 rounded text-[10px] text-on-primary-container font-bold whitespace-nowrap">Sarah</div>
                  </div>
                </div>
                <div className="absolute top-48 left-80 flex flex-col gap-xs">
                  <div className="w-0.5 h-5 bg-tertiary relative">
                    <div className="absolute -top-6 left-0 bg-tertiary px-sm py-0.5 rounded text-[10px] text-on-tertiary-container font-bold whitespace-nowrap">Alex</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WebSocket Explanation Block */}
        <section className="py-xl px-md bg-surface-container-lowest" id="features">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-xl items-center">
            <div className="space-y-md">
              <div className="inline-flex items-center gap-sm px-sm py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                REAL-TIME SYNC
              </div>
              <h2 className="font-headline-lg text-headline-lg">Zero Latency. Zero Conflicts.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                CodeEditor uses proprietary WebSocket optimization to sync keystrokes across the globe in under 50ms. Our Conflict-Free Replicated Data Types (CRDT) ensure that even with patchy connections, your team stays perfectly in sync.
              </p>
              <ul className="space-y-sm">
                <li className="flex items-center gap-sm font-body-md text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Binary-encoded state synchronization
                </li>
                <li className="flex items-center gap-sm font-body-md text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  Automatic reconnections without state loss
                </li>
              </ul>
            </div>
            <div className="glass-card p-xl rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              <img alt="Network Infrastructure" className="rounded-xl w-full object-cover aspect-video grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBpDHA3-OXpG6tEcSuTNs4byx2bOo85UtFlU98JW32_hQQkOlzAghW2mLJ6WNdZsQHYI6uDoX2yGQNYszkWkFleuSH7kuLp5mKoWXNitbF9ndSsW1884pzekE5J85eKsbMlU9nz4eeFl24i2iD9gdErcZ96NZbwfWgPAmybst7OgvZvIKkfusEPdrqZl5QFshOVFCMBD98wjI-5piDiOPAMBDc6IrzRT3i0vKe9cjt5oz5oHMHf2-aJwUSeb6nW5OBry3cID6Pgu9b" />
              <div className="mt-md font-code-md text-xs text-primary bg-black/40 p-sm rounded border border-primary/20">
                WebSocket Connected: wss://sync.codeeditor.io/v1/session_94a2
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-xl px-md max-w-7xl mx-auto">
          <h3 className="font-headline-lg text-headline-lg text-center mb-xl">Everything you need to <span className="text-secondary">ship faster</span>.</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="glass-card p-md rounded-xl hover:bg-surface-variant/40 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">sync</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-lg mb-sm">Real-time Sync</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Multi-user cursor tracking and shared terminal instances across the globe.</p>
            </div>
            <div className="glass-card p-md rounded-xl hover:bg-surface-variant/40 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary">language</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-lg mb-sm">Multi-language</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Native LSP support for 50+ languages including Rust, Go, Python, and C++.</p>
            </div>
            <div className="glass-card p-md rounded-xl hover:bg-surface-variant/40 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary">psychology</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-lg mb-sm">AI Pair Programming</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">Context-aware code completion and automated refactoring suggestions.</p>
            </div>
            <div className="glass-card p-md rounded-xl hover:bg-surface-variant/40 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary-container">rocket_launch</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-lg mb-sm">Instant Deploy</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">One-click push to staging or production directly from the editor console.</p>
            </div>
          </div>
        </section>

        {/* Collaboration Section */}
        <section className="py-xl px-md bg-surface-container-high relative overflow-hidden" id="about">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-xl">
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden glass-card">
                <img alt="Collaborative Session" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMPavXrnxwQDrupz3DN5AjN2OjKlY-vkL5fcUi4zC0B6kfhq-EynYWCSrtQhFPq5m9lsty4aQG4a42awIzFfm9GCftIww47i1MRktiCo8CjzHRYjRkqaOyGto3zQ1efZMLNUAjNOuPwdH0u_0p0twz-KM1BtPxJuZTvDkdNfUqfpRgQm2sPWoag3PfWkUlhohckTAF9rjydT2ctmVCcVX9o8YZac30xekANcDZUJbMdriEMoPvyoilnB5QvijalnwTPnRYeKqtf4dF" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-md glass-card rounded-lg flex flex-col gap-sm max-w-xs shadow-2xl">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-on-primary">JD</div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-white/20 rounded"></div>
                        <div className="h-2 w-16 bg-white/10 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-on-secondary">EM</div>
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-white/20 rounded"></div>
                        <div className="h-2 w-12 bg-white/10 rounded mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 space-y-md">
              <h2 className="font-headline-lg text-headline-lg">Built for Teams that Move Fast.</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Our editor isn't just a place to type code; it's a shared workspace where distance is eliminated. Jump into your teammate's file with a click, pair program with voice and video integration, and see exactly where everyone is focusing.
              </p>
              <div className="grid grid-cols-2 gap-md pt-md">
                <div>
                  <div className="font-headline-md text-headline-md text-primary">250+</div>
                  <div className="font-label-sm text-label-sm uppercase tracking-widest text-outline">Open Sessions</div>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-secondary">40ms</div>
                  <div className="font-label-sm text-label-sm uppercase tracking-widest text-outline">Avg. Latency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl px-md text-center max-w-4xl mx-auto" id="pricing">
          <h2 className="font-headline-lg text-headline-lg mb-md">Ready to upgrade your workflow?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">Join 50,000+ developers building the future on CodeEditor.</p>
          <div className="flex justify-center gap-md">
            <Link to="/register" className="px-xl py-md bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">Start Coding Now</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-md w-full gap-md">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md text-primary font-bold">CodeEditor</span>
            <span className="hidden md:block text-outline-variant">|</span>
            <span className="text-outline font-body-md text-body-md">© 2024 CodeEditor Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-lg">
            <a className="font-body-md text-body-md text-outline hover:text-on-surface transition-colors hover:underline" href="#">Terms</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface transition-colors hover:underline" href="#">Privacy</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface transition-colors hover:underline" href="#">Status</a>
            <a className="font-body-md text-body-md text-outline hover:text-on-surface transition-colors hover:underline" href="#">Documentation</a>
          </div>
          <div className="flex gap-md">
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">terminal</span>
            </button>
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">public</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
