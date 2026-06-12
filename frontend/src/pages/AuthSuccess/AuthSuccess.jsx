import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        await fetchMe();
        // If authentication succeeded, wait 1.5 seconds to show a premium transition and redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        console.error('OAuth processing failed', err);
        navigate('/login');
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
          <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">security</span>
          {/* Circular Orbit Spinner */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 border-t-primary animate-spin" style={{ margin: -4 }} />
        </div>

        <div>
          <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">Securing Session</h1>
          <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">Verifying credentials and loading workspace profile...</p>
        </div>

        {/* Sync Status Logs */}
        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] text-left text-white/60 space-y-1 select-none">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span>OAuth redirect verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#34d399]">
            <span className="w-1 h-1 rounded-full bg-[#34d399] animate-pulse" />
            <span>Access token captured</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/30 animate-pulse">
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Establishing WebSocket link...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
