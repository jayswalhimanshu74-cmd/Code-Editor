import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authService } from '../../api/authService';
import { wsService } from '../../api/websocketService';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [step, setStep] = useState('login'); // 'login', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    setLocalMessage('');
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  const handleOAuthLogin = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    setIsProcessing(true);
    try {
      const res = await authService.forgotPassword(email);
      setLocalMessage(res.data.message || 'Reset link sent!');
      // Move to reset step
      setTimeout(() => setStep('reset'), 2000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send reset token');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    setIsProcessing(true);
    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      setLocalMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        setStep('login');
        setPassword('');
        setResetToken('');
        setLocalMessage('');
      }, 2000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (authService.isLoggedIn()) {
      wsService.connect();
    }
  }, []);

  return (
    <div className="text-on-surface min-h-screen flex flex-col selection:bg-primary/30 relative overflow-hidden"
         style={{ backgroundColor: '#000000' }}>
      
      {/* Background Glow Mesh */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 blur-[180px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#7928ca]/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="bg-background/60 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 z-50 flex justify-between items-center w-full px-lg h-16 max-w-full">
        <div className="flex items-center gap-md">
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
          <Link to="/login" className="font-body-md text-body-md text-primary font-bold px-4 py-2 hover:bg-white/5 transition-all rounded-xl no-underline">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 font-label-sm text-label-sm bg-primary text-white rounded-xl shadow-[0_0_15px_rgba(0,112,243,0.3)] hover:shadow-[0_0_25px_rgba(0,112,243,0.5)] active:scale-95 hover:scale-105 transition-all no-underline font-bold">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Content Form Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-md relative z-10">
        <div className="glass-card w-full max-w-[440px] p-8 rounded-2xl shadow-2xl relative flex flex-col gap-6 border border-white/10"
             style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
          
          {/* Brand header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/25 shadow-lg">
              <span className="material-symbols-outlined text-primary text-[28px]">
                {step === 'login' ? 'terminal' : 'lock_reset'}
              </span>
            </div>
            <h1 className="text-[22px] font-black tracking-tight text-white leading-tight">
              {step === 'login' && 'Welcome back'}
              {step === 'forgot' && 'Reset Password'}
              {step === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-[13px] text-white/50 leading-relaxed">
              {step === 'login' && 'Enter your details to continue'}
              {step === 'forgot' && 'Enter your email to receive a reset token'}
              {step === 'reset' && 'Enter the token and your new password'}
            </p>
          </div>

          {/* Messages */}
          {(error || localError) && (
            <div className="bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error || localError}
            </div>
          )}
          {localMessage && (
            <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-3 text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              {localMessage}
            </div>
          )}

          {/* Step forms */}
          {step === 'login' && (
            <>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40" htmlFor="email">Email Address</label>
                <div className="relative group focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 transition-all duration-200">
                  <span className="material-symbols-outlined text-white/30 text-[20px] mr-2">mail</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder:text-white/20 text-[13px]"
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/40" htmlFor="password">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setStep('forgot'); clearError(); setLocalError(''); setLocalMessage(''); }}
                    className="text-[11px] font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 transition-all duration-200">
                  <span className="material-symbols-outlined text-white/30 text-[20px] mr-2">lock</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder:text-white/20 text-[13px]"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="material-symbols-outlined text-white/30 text-[18px] ml-2 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>

              <button
                className="bg-primary text-white py-3.5 rounded-xl text-[13px] font-bold hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none cursor-pointer"
                type="submit"
                disabled={isLoading}
                style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {/* Divider */}
              <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] flex-grow bg-white/5"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/30">Or continue with</span>
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
            </div>
            </>
          )}

          {step === 'forgot' && (
            <form className="flex flex-col gap-4" onSubmit={handleForgotSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40" htmlFor="forgot-email">Email Address</label>
                <div className="relative group focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 transition-all duration-200">
                  <span className="material-symbols-outlined text-white/30 text-[20px] mr-2">mail</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder:text-white/20 text-[13px]"
                    id="forgot-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                className="bg-primary text-white py-3.5 rounded-xl text-[13px] font-bold hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none cursor-pointer"
                type="submit"
                disabled={isProcessing}
                style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : 'Send Reset Link'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('login')}
                className="text-white/60 hover:text-white text-[12px] font-semibold bg-transparent border-none cursor-pointer outline-none mt-2 transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form className="flex flex-col gap-4" onSubmit={handleResetSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40" htmlFor="token">Reset Token</label>
                <div className="relative group focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 transition-all duration-200">
                  <span className="material-symbols-outlined text-white/30 text-[20px] mr-2">key</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder:text-white/20 text-[13px]"
                    id="token"
                    type="text"
                    placeholder="Paste your reset token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40" htmlFor="new-password">New Password</label>
                <div className="relative group focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(0,112,243,0.15)] bg-black/40 border border-white/10 rounded-xl flex items-center px-4 py-3 transition-all duration-200">
                  <span className="material-symbols-outlined text-white/30 text-[20px] mr-2">lock</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder:text-white/20 text-[13px]"
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span
                    className="material-symbols-outlined text-white/30 text-[18px] ml-2 cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>

              <button
                className="bg-primary text-white py-3.5 rounded-xl text-[13px] font-bold hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none cursor-pointer"
                type="submit"
                disabled={isProcessing}
                style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Resetting...
                  </>
                ) : 'Confirm Reset'}
              </button>
            </form>
          )}

          {step === 'login' && (
            <p className="text-center text-[12px] text-white/50">
              Don't have an account?
              <Link className="text-primary font-bold hover:underline ml-1 no-underline" to="/register">Sign up</Link>
            </p>
          )}
        </div>
      </main>

      <footer className="bg-surface-dim/40 border-t border-outline-variant/20 backdrop-blur-xl relative z-10 flex flex-col md:flex-row justify-between items-center px-lg py-md w-full gap-4">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md text-primary font-bold">Hence-Code</span>
          <span className="text-white/40 font-body-md text-[12px]">© 2026 Hence-Code Inc. All rights reserved.</span>
        </div>
        <div className="flex gap-md">
          <a className="font-body-md text-[12px] text-white/40 hover:text-white transition-colors no-underline" href="#">Terms</a>
          <a className="font-body-md text-[12px] text-white/40 hover:text-white transition-colors no-underline" href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;