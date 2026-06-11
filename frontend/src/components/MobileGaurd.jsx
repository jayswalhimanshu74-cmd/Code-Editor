import React, { useEffect, useState } from 'react';

const MobileGuard = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (isMobile && !dismissed) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#0a0a0f', color: '#e8e8f0',
                fontFamily: 'Inter, sans-serif', padding: 24,
                textAlign: 'center', gap: 20,
            }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                }}>
                    💻
                </div>

                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                        Better on Desktop
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6, maxWidth: 300 }}>
                        Hence-Code is optimized for desktop browsers. For the best experience, open it on a larger screen.
                    </p>
                </div>

                {/* Feature highlights */}
                {[
                    { icon: '⌨️', text: 'Full Monaco code editor' },
                    { icon: '🤝', text: 'Real-time collaboration' },
                    { icon: '🤖', text: 'AI code assistant' },
                ].map(f => (
                    <div key={f.text} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 13, color: 'rgba(255,255,255,0.5)',
                    }}>
                        <span>{f.icon}</span>
                        {f.text}
                    </div>
                ))}

                <button
                    onClick={() => setDismissed(true)}
                    style={{
                        marginTop: 8, padding: '12px 28px', borderRadius: 12,
                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
                    }}
                >
                    Continue Anyway
                </button>
            </div>
        );
    }

    return children;
};

export default MobileGuard;