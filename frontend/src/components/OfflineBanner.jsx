import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      backgroundColor: '#e11d48',
      color: '#ffffff',
      textAlign: 'center',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ⚠️ Connection Lost. You are currently offline. Changes will sync once reconnected.
    </div>
  );
};

export default OfflineBanner;
