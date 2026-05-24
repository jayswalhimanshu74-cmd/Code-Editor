import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0f', color: '#e8e8f0',
            fontFamily: 'Inter, sans-serif', gap: 20, padding: 24,
            textAlign: 'center',
        }}>
            {/* 404 number */}
            <div style={{
                fontSize: 120, fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em',
            }}>
                404
            </div>

            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                    Page not found
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: 360, lineHeight: 1.6 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Link to="/dashboard" style={{
                    padding: '11px 24px', borderRadius: 10,
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: '#fff', textDecoration: 'none',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
                    Go to Dashboard
                </Link>
                <Link to="/" style={{
                    padding: '11px 24px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                    fontSize: 13, fontWeight: 600,
                }}>
                    Landing Page
                </Link>
            </div>

            {/* Decorative glow */}
            <div style={{
                position: 'fixed', top: '30%', left: '50%',
                transform: 'translateX(-50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)',
                filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
            }} />
        </div>
    );
};

export default NotFound;