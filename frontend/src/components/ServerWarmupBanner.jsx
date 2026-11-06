import React from 'react';
import useWarmupStore from '../store/warmupStore';

const ServerWarmupBanner = () => {
  const { isWakingUp, hasError, errorMessage, retryFn, reset } = useWarmupStore();

  if (!isWakingUp && !hasError) return null;

  return (
    <aside
      aria-label="Server status alert"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99998] max-w-lg w-[92%] sm:w-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 border shadow-2xl backdrop-blur-md"
        style={{
          background: hasError ? 'rgba(30, 10, 15, 0.92)' : 'rgba(15, 23, 42, 0.92)',
          borderColor: hasError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.35)',
          boxShadow: hasError
            ? '0 10px 25px -5px rgba(239, 68, 68, 0.25)'
            : '0 10px 25px -5px rgba(56, 189, 248, 0.25)',
        }}
      >
        {/* Status Icon */}
        {hasError ? (
          <span className="material-symbols-outlined text-[20px] text-red-400 shrink-0">
            error
          </span>
        ) : (
          <div className="relative shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-sky-400 animate-spin">
              progress_activity
            </span>
          </div>
        )}

        {/* Text Message */}
        <div className="text-left flex-1 min-w-0 pr-1">
          <p className="text-[12px] font-semibold text-white tracking-tight">
            {hasError
              ? errorMessage || 'Server wake-up timed out.'
              : 'Waking up the server... this can take up to a minute on the free tier.'}
          </p>
          {!hasError && (
            <p className="text-[10px] text-white/50 mt-0.5">
              Retrying automatically...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {hasError && retryFn && (
            <button
              onClick={() => retryFn()}
              className="px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-all bg-red-600 hover:bg-red-500 shadow-sm"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => reset()}
            className="text-white/40 hover:text-white transition-colors p-1"
            title="Dismiss notice"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ServerWarmupBanner;
