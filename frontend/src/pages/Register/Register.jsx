import React, { useState, useEffect } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
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

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-surface selection:bg-primary/30" 
         style={{ backgroundColor: '#09090aff', backgroundImage: 'radial-gradient(at 0% 0%, rgba(192, 193, 255, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(73, 75, 214, 0.1) 0px, transparent 50%)' }}>
      {/* Header / Brand Anchor */}
      <header className="flex justify-between items-center w-full px-md h-16 max-w-full bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 z-50">
        <div className="flex items-center gap-sm">
          <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Hence-Code</Link>
        </div>
        <div className="flex items-center gap-md">
          <a className="text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Documentation</a>
          <Link to="/login" className="text-primary border-b-2 border-primary pb-1 font-body-md text-body-md">Log In</Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-gutter">
        <div className="w-full max-w-[480px] glass-card rounded-xl p-xl shadow-2xl relative overflow-hidden">
          {/* Decorative atmospheric light */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            {/* Heading Group */}
            <div className="mb-lg">
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Create an account</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Join the future of collaborative coding</p>
            </div>
            
            {/* Signup Form */}
            <form className="space-y-md" onSubmit={handleSubmit}>
              {/* Full Name & Username Grid */}
              <div className="grid grid-cols-1 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Username</label>
                  <div className="relative flex items-center bg-black/20 border border-outline-variant/50 rounded-lg focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] transition-all group">
                    <span className="material-symbols-outlined text-outline ml-md group-focus-within:text-primary">person</span>
                    <input className="bg-transparent border-none focus:ring-0 w-full text-body-md py-sm pr-md placeholder:text-outline/50" 
                    placeholder="Himanshu Jayswal"
                    type="text"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
               
              </div>
              
              {/* Email */}
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Email</label>
                <div className="relative flex items-center bg-black/20 border border-outline-variant/50 rounded-lg focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] transition-all group">
                  <span className="material-symbols-outlined text-outline ml-md group-focus-within:text-primary">mail</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full text-body-md py-sm pr-md placeholder:text-outline/50"
                  placeholder="jaysalhimanshu122@gmail.com"
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Password</label>
                <div className="relative flex items-center bg-black/20 border border-outline-variant/50 rounded-lg focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] transition-all group">
                  <span className="material-symbols-outlined text-outline ml-md group-focus-within:text-primary">lock</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full text-body-md py-sm pr-md placeholder:text-outline/50" 
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {localError && (
                  <div className="text-error text-sm">{localError}</div>
                )}
                
                {/* Strength Indicator */}
                <div className="pt-xs flex items-center gap-xs">
                  <div className="h-1 flex-grow rounded-full bg-surface-container-highest overflow-hidden">
                   <div
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${(pwStrength / 5) * 100}%`,
                            background: ['#ef4444','#ef4444','#f97316','#eab308','#22c55e','#14b8a6'][pwStrength],
                        }}
                        />
                    <span className="font-label-sm text-[10px] uppercase" style={{ color: ['#ef4444','#ef4444','#f97316','#eab308','#22c55e','#14b8a6'][pwStrength] }}>
                        {['','Weak','Weak','Fair','Strong','Very Strong'][pwStrength]}
                    </span> 
                  </div>
                </div>
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Confirm Password</label>
                <div className="relative flex items-center bg-black/20 border border-outline-variant/50 rounded-lg focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] transition-all group">
                  <span className="material-symbols-outlined text-outline ml-md group-focus-within:text-primary">shield_lock</span>
                  <input className="bg-transparent border-none focus:ring-0 w-full text-body-md py-sm pr-md placeholder:text-outline/50" 
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              
              {/* CTA */}
              <button className="w-full bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-body-md text-body-lg py-md rounded-lg font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
              type="submit"
              disabled={isLoading}>
                {isLoading ? (
                  <>  
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Creating Account  ...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center gap-md my-lg">
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
              <span className="font-label-sm text-label-sm text-outline">Or sign up with</span>
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
            </div>
            
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-md">
              <button className="flex items-center justify-center gap-sm py-sm border border-outline-variant/50 rounded-lg hover:bg-surface-variant/40 transition-colors font-body-md text-body-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
                GitHub
              </button>
              <button className="flex items-center justify-center gap-sm py-sm border border-outline-variant/50 rounded-lg hover:bg-surface-variant/40 transition-colors font-body-md text-body-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path></svg>
                Google
              </button>
            </div>
            
            {/* Footer link */}
            <div className="mt-xl text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline transition-all ml-xs" to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Side Graphic (Contextual Decoration) */}
      <div className="hidden lg:block fixed right-0 top-0 w-1/3 h-full -z-10 pointer-events-none opacity-40">
        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_qeyWyDA0QEGFLZeS2fW8-67OoBCD3sUu9hjpTPbIoo9O3PRBlg0_kAFkL3L_IEYHLuMuCo7a8YAE_5UH67yRpc_XtZ5wUeevCP1GdIv1bPa0qMNll0nt5eSfyMs0Qo18i8_Qljv_aeO-u2sWU_P0Tkcly-3jme751t0yDBxeFle2wBa7fgZdekbFg58IWeHrMbw5zEZc2uutnTgxCQU3ftrRn11Y9O5ZxSv4XZs62oDrsz-xtHD7Nzd0tcMgZ6rWGIlTahtbxbTy" alt="Decorative" />
      </div>

      {/* Page Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-lg py-md w-full bg-surface-dim border-t border-outline-variant/20 mt-auto">
        <span className="font-headline-md text-headline-md text-primary font-bold">Hence-Code</span>
        <div className="flex gap-md mt-md md:mt-0">
          <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Terms</a>
          <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Privacy</a>
          <a className="text-outline hover:text-on-surface transition-colors font-body-md text-body-md" href="#">Documentation</a>
        </div>
        <p className="font-body-md text-body-md text-outline mt-md md:mt-0">© 2024 Hence-Code Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Register;
