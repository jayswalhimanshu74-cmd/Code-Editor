import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Cookies are already set by the backend OAuth2 success handler.
        // Simply call /me with credentials to validate the session.
        await fetchMe();

        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            const { data } = await api.post('/auth/refresh');
            if (data?.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
            }
            if (data?.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            const { wsService } = await import('../../api/websocketService');
            wsService.connect(
              () => console.log('[Auth] WS connected'),
              () => console.log('[Auth] WS disconnected')
            );
          } catch (tokenErr) {
            console.warn('[AuthSuccess] Token fetch or WS connect failed:', tokenErr);
          }

          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1200);
        } else {
          setStatus('failed');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error('OAuth session verification failed', err);
        setStatus('failed');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };
    handleAuth();
  }, [fetchMe, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
         style={{ backgroundColor: '#000000' }}>
      
      {/* Background Glow Mesh */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7928ca]/10 blur-[120px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="glass-card max-w-sm w-full p-8 rounded-2xl border border-white/10 text-center flex flex-col items-center gap-5 relative z-10"
           style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
        
        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center relative">
          <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">
            {status === 'failed' ? 'error' : 'security'}
          </span>
          {status === 'verifying' && (
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" style={{ margin: -4 }} />
          )}
        </div>

        <div>
          <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">
            {status === 'verifying' && 'Securing Session'}
            {status === 'success' && 'Welcome Back'}
            {status === 'failed' && 'Authentication Failed'}
          </h1>
          <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
            {status === 'verifying' && 'Verifying credentials and loading workspace profile...'}
            {status === 'success' && 'Redirecting to your dashboard...'}
            {status === 'failed' && 'Could not verify your session. Redirecting to login...'}
          </p>
        </div>

        {/* Sync Status Logs */}
        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] text-left text-white/60 space-y-1 select-none">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span>OAuth redirect verified</span>
          </div>
          <div className={`flex items-center gap-1.5 ${status !== 'verifying' ? (status === 'success' ? 'text-[#34d399]' : 'text-red-400') : 'text-white/30 animate-pulse'}`}>
            <span className={`w-1 h-1 rounded-full ${status !== 'verifying' ? (status === 'success' ? 'bg-[#34d399]' : 'bg-red-400') : 'bg-white/30'}`} />
            <span>{status === 'failed' ? 'Session verification failed' : 'Session cookie validated'}</span>
          </div>
          {status === 'success' && (
            <div className="flex items-center gap-1.5 text-[#34d399]">
              <span className="w-1 h-1 rounded-full bg-[#34d399]" />
              <span>Workspace ready</span>
            </div>
          )}
          {status === 'verifying' && (
            <div className="flex items-center gap-1.5 text-white/30 animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>Establishing session...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
