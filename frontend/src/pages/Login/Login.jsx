import React, { useState,useEffect } from 'react';
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalMessage('');
    setIsProcessing(true);
    try {
      const res = await authService.forgotPassword(email);
      setLocalMessage(res.data.message || 'Reset link sent!');
      // Move to reset step (in a real app, user clicks email link instead)
      setTimeout(() => setStep('reset'), 2000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send reset link');
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
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col selection:bg-primary/30">
      {/* TopNavBar */}
      <header className="bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 docked full-width top-0 z-50 flex justify-between items-center w-full px-md h-16 max-w-full">
        <div className="flex items-center gap-md">
          <Link to="/" className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Hence-Code</Link>
        </div>
        <div className="flex items-center gap-sm">
          <Link to="/login" className="font-body-md text-body-md text-primary font-bold px-md py-sm hover:bg-white/5 transition-all duration-200">Login</Link>
          <Link to="/register" className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white font-body-md text-body-md font-bold px-lg py-sm rounded-lg active:scale-95 transition-transform">Sign Up</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative px-md py-xl overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full"></div>

        <div className="glass-card w-full max-w-[440px] p-lg md:p-xl rounded-xl shadow-2xl relative z-10 flex flex-col gap-lg">
          {/* Brand */}
          <div className="flex flex-col items-center text-center gap-xs">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-sm border border-primary/30">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {step === 'login' ? 'terminal' : 'lock_reset'}
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              {step === 'login' && 'Welcome back'}
              {step === 'forgot' && 'Reset Password'}
              {step === 'reset' && 'Set New Password'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {step === 'login' && 'Enter your details to continue'}
              {step === 'forgot' && 'Enter your email to receive a reset token'}
              {step === 'reset' && 'Enter the token and your new password'}
            </p>
          </div>

          {/* Messages */}
          {(error || localError) && (
            <div className="bg-error/10 border border-error/30 text-error rounded-lg px-md py-sm font-body-md text-body-md">
              {error || localError}
            </div>
          )}
          {localMessage && (
            <div className="bg-primary/10 border border-primary/30 text-primary rounded-lg px-md py-sm font-body-md text-body-md">
              {localMessage}
            </div>
          )}

          {/* Form */}
          {step === 'login' && (
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-sm">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
              <div className="relative group focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] bg-black/20 border border-outline-variant/30 rounded-lg flex items-center px-md py-sm transition-all duration-200">
                <span className="material-symbols-outlined text-outline text-[20px] mr-sm">mail</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline font-body-md text-body-md"
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setStep('forgot'); clearError(); setLocalError(''); setLocalMessage(''); }}
                  className="font-label-sm text-label-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] bg-black/20 border border-outline-variant/30 rounded-lg flex items-center px-md py-sm transition-all duration-200">
                <span className="material-symbols-outlined text-outline text-[20px] mr-sm">lock</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline font-body-md text-body-md"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="material-symbols-outlined text-outline text-[20px] ml-sm cursor-pointer hover:text-on-surface"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            <button
              className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-md rounded-lg font-body-md text-body-md font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all mt-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>
          )}

          {/* Forgot Password Form */}
          {step === 'forgot' && (
            <form className="flex flex-col gap-md" onSubmit={handleForgotSubmit}>
              <div className="flex flex-col gap-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="forgot-email">Email Address</label>
                <div className="relative group focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] bg-black/20 border border-outline-variant/30 rounded-lg flex items-center px-md py-sm transition-all duration-200">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-sm">mail</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline font-body-md text-body-md"
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
                className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-md rounded-lg font-body-md text-body-md font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all mt-sm disabled:opacity-60 flex items-center justify-center gap-sm"
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : 'Send Reset Link'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('login')}
                className="text-on-surface-variant hover:text-on-surface font-body-md transition-colors mt-2"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {step === 'reset' && (
            <form className="flex flex-col gap-md" onSubmit={handleResetSubmit}>
              <div className="flex flex-col gap-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="token">Reset Token</label>
                <div className="relative group focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] bg-black/20 border border-outline-variant/30 rounded-lg flex items-center px-md py-sm transition-all duration-200">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-sm">key</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="token"
                    type="text"
                    placeholder="Paste your reset token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="new-password">New Password</label>
                <div className="relative group focus-within:border-[#6366f1] focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.2)] bg-black/20 border border-outline-variant/30 rounded-lg flex items-center px-md py-sm transition-all duration-200">
                  <span className="material-symbols-outlined text-outline text-[20px] mr-sm">lock</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline font-body-md text-body-md"
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span
                    className="material-symbols-outlined text-outline text-[20px] ml-sm cursor-pointer hover:text-on-surface"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>

              <button
                className="bg-gradient-to-b from-[#6366f1] to-[#4f46e5] text-white py-md rounded-lg font-body-md text-body-md font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all mt-sm disabled:opacity-60 flex items-center justify-center gap-sm"
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : 'Confirm Reset'}
              </button>
            </form>
          )}

          {step === 'login' && (
            <p className="text-center font-body-md text-body-md text-on-surface-variant">
              Don't have an account?
              <Link className="text-primary font-bold hover:underline ml-xs" to="/register">Sign up</Link>
            </p>
          )}
        </div>
      </main>

      <footer className="bg-surface-dim border-t border-outline-variant/20 full-width bottom-0 flex flex-col md:flex-row justify-between items-center px-lg py-md w-full">
        <div className="flex items-center gap-md mb-md md:mb-0">
          <span className="font-headline-md text-headline-md text-primary font-bold">Hence-Code</span>
          <span className="font-body-md text-body-md text-outline">© 2024 Hence-Code Inc. All rights reserved.</span>
        </div>
        <div className="flex gap-lg">
          <a className="font-body-md text-body-md text-outline hover:text-primary transition-colors" href="#">Terms</a>
          <a className="font-body-md text-body-md text-outline hover:text-primary transition-colors" href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;