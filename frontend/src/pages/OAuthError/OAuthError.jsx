import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBackendUrl } from '../../api/axios';

const OAuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'unknown';

  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'OAuth';

  const handleRetry = () => {
    if (provider === 'google' || provider === 'github') {
      window.location.href = `${getBackendUrl()}/oauth2/authorization/${provider}`;
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
         style={{ backgroundColor: '#000000' }}>
      
      {/* Background Glow Mesh */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/8 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7928ca]/8 blur-[120px] -z-10 rounded-full mix-blend-screen pointer-events-none"></div>

      <div className="glass-card max-w-sm w-full p-8 rounded-2xl border border-white/10 text-center flex flex-col items-center gap-5 relative z-10"
           style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)' }}>
        
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-400 text-[32px]">error</span>
        </div>

        <div>
          <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">
            Authentication Failed
          </h1>
          <p className="text-[12px] text-white/50 mt-1.5 leading-relaxed">
            We couldn't sign you in with {providerLabel}. This could be due to a cancelled login or a temporary issue.
          </p>
        </div>

        {/* Error Details */}
        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 font-mono text-[10px] text-left text-white/60 space-y-1 select-none">
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            <span>Provider: {providerLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            <span>OAuth flow did not complete</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleRetry}
            className="w-full bg-primary text-white py-3 rounded-xl text-[13px] font-bold hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all border-none cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Try Again with {providerLabel}
          </button>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 rounded-xl text-[13px] font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
