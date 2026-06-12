import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const navigate = useNavigate();

  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [pwStrength, setPwStrength] = useState(0);

  useEffect(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setPwStrength(s);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    
    const strongPasswordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setLocalError('Password must contain a number, uppercase, lowercase, and special character');
      return;
    }
    
    const success = await register(username, email, password);
    if (success) navigate('/login');
  };

  const handleOAuthLogin = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-surface selection:bg-primary/30 relative overflow-hidden"
         style={{ backgroundColor: '#000000' }}>
      
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 blur-[180px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7928ca]/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Header / Brand Anchor */}
      <header className="bg-background/60 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 z-50 flex justify-between items-center w-full px-lg h-16 max-w-full">
        <div className="flex items-center gap-sm">
          <Link to="/" className="font-headline-md text-headline-md font-extrabold tracking-tight text-on-surface no-underline flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,112,243,0.3)]">
              <span className="material-symbols-outlined text-white text-[16px] font-bold">terminal</span>
            </div>
            <span style={{ background: 'linear-gradient(90deg, #ffffff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hence-Code
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <a className="text-white/60 hover:text-white transition-colors font-body-md text-[13px] no-underline" href="#">Documentation</a>
          <Link to="/login" className="text-primary border-b-2 border-primary pb-1 font-body-md text-[13px] no-underline font-bold ml-2">Log In</Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-md relative z-10">
        <div className="w-full max-w-[480px] glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-white/10"
             style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
          
          <div className="relative z-10">
            {/* Heading Group */}
            <div className="mb-6">
              <h1 className="text-[22px] font-black tracking-tight text-white mb-1">Create an account</h1>
              <p className="text-[13px] text-white/50">Join the future of collaborative coding</p>
            </div>
            
            {/* Messages */}
            {displayError && (
              <div className="bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 text-[12px] flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {displayError}
              </div>
            )}

            {/* Signup Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">Username</label>
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] transition-all group px-4 py-3">
                  <span className="material-symbols-outlined text-white/30 mr-2 text-[20px]">person</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-[13px] text-white placeholder:text-white/20" 
                    placeholder="Himanshu Jayswal"
                    type="text"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">Email</label>
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] transition-all group px-4 py-3">
                  <span className="material-symbols-outlined text-white/30 mr-2 text-[20px]">mail</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-[13px] text-white placeholder:text-white/20"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">Password</label>
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] transition-all group px-4 py-3">
                  <span className="material-symbols-outlined text-white/30 mr-2 text-[20px]">lock</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-[13px] text-white placeholder:text-white/20" 
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Strength Indicator */}
                <div className="pt-1 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40">Password Strength:</span>
                    <span className="font-bold uppercase tracking-wider" style={{ color: ['#ef4444','#ef4444','#f97316','#eab308','#22c55e','#14b8a6'][pwStrength] }}>
                      {['','Weak','Weak','Fair','Strong','Very Strong'][pwStrength]}
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(pwStrength / 5) * 100}%`,
                        background: ['#ef4444','#ef4444','#f97316','#eab308','#22c55e','#14b8a6'][pwStrength],
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">Confirm Password</label>
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] transition-all group px-4 py-3">
                  <span className="material-symbols-outlined text-white/30 mr-2 text-[20px]">shield_lock</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-[13px] text-white placeholder:text-white/20" 
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              
              {/* CTA */}
              <button 
                className="w-full bg-primary text-white py-3.5 rounded-xl text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all mt-3 border-none cursor-pointer"
                type="submit"
                disabled={isLoading}
                style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}
              >
                {isLoading ? (
                  <>  
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="h-[1px] flex-grow bg-white/5"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">Or sign up with</span>
              <div className="h-[1px] flex-grow bg-white/5"></div>
            </div>
            
             {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleOAuthLogin('github')}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-white/80 hover:text-white text-[12px] font-bold bg-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                GitHub
              </button>
              <button 
                onClick={() => handleOAuthLogin('google')}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-white/80 hover:text-white text-[12px] font-bold bg-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path></svg>
                Google
              </button>
            </div>
            
            {/* Footer link */}
            <div className="mt-8 text-center">
              <p className="text-[12px] text-white/50">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline transition-all ml-1 no-underline" to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-lg py-md w-full bg-surface-dim/40 border-t border-outline-variant/20 mt-auto relative z-10 backdrop-blur-xl">
        <span className="font-headline-md text-headline-md text-primary font-bold">Hence-Code</span>
        <div className="flex gap-md mt-md md:mt-0">
          <a className="text-white/40 hover:text-white transition-colors font-body-md text-[12px] no-underline" href="#">Terms</a>
          <a className="text-white/40 hover:text-white transition-colors font-body-md text-[12px] no-underline" href="#">Privacy</a>
          <a className="text-white/40 hover:text-white transition-colors font-body-md text-[12px] no-underline" href="#">Documentation</a>
        </div>
        <p className="text-white/40 font-body-md text-[12px] mt-md md:mt-0">© 2026 Hence-Code Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
