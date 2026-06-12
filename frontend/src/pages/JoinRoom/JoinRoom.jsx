import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRoomStore from '../../store/roomStore';

const JoinRoom = () => {
    const navigate = useNavigate();
    const { joinRoom } = useRoomStore();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true); setError('');
        try {
            const room = await joinRoom(code.trim().toUpperCase());
            navigate(`/workspace/${room.id}`);
        } catch (err) {
            setError(err.message || 'Invalid invite code');
        } finally { setLoading(false); }
    };

    const codeChars = code.padEnd(8, '·').split('');

    return (
        <div className="flex-1 w-full h-full flex items-center justify-center relative">
            {/* Background glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Top accent line */}
                <div className="h-[2px] w-24 mx-auto mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #0070f3, transparent)' }} />

                <div className="rounded-2xl p-8 flex flex-col gap-6"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>

                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)', boxShadow: '0 0 20px rgba(0,112,243,0.2)' }}>
                            <span className="material-symbols-outlined text-[28px]" style={{ color: '#60a5fa' }}>group_add</span>
                        </div>
                        <div>
                            <h1 className="text-[22px] font-extrabold tracking-tight text-on-surface mb-1">Join a Workspace</h1>
                            <p className="text-[13px] text-on-surface-variant leading-relaxed">
                                Enter the invite code shared by your teammate to start collaborating.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px]"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Code visual display */}
                        <div>
                            <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold mb-3 text-center">
                                Invite Code
                            </label>
                            {/* Character boxes */}
                            <div className="flex gap-2 justify-center mb-4">
                                {codeChars.slice(0, 8).map((char, i) => (
                                    <div key={i}
                                        className="w-9 h-11 rounded-lg flex items-center justify-center text-[16px] font-bold font-mono transition-all duration-150"
                                        style={{
                                            background: char !== '·' ? 'rgba(0,112,243,0.12)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${char !== '·' ? 'rgba(0,112,243,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                            color: char !== '·' ? '#60a5fa' : 'rgba(255,255,255,0.15)',
                                            boxShadow: char !== '·' ? '0 0 8px rgba(0,112,243,0.15)' : 'none',
                                        }}>
                                        {char}
                                    </div>
                                ))}
                            </div>
                            {/* Actual input (hidden styling, functional) */}
                            <input
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                placeholder="Type code here..."
                                maxLength={8}
                                autoFocus
                                required
                                className="w-full text-center text-[14px] font-bold font-mono tracking-[0.3em] uppercase py-3 rounded-xl transition-all outline-none"
                                style={{
                                    background: 'rgba(0,0,0,0.25)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#e8e8f0',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(0,112,243,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length < 4}
                            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #0070f3, #0050c8)', boxShadow: '0 0 20px rgba(0,112,243,0.4)' }}>
                            {loading ? (
                                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Joining...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">login</span> Join Workspace</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[12px] text-on-surface-variant">
                        Don't have a code?{' '}
                        <Link to="/dashboard" className="text-primary font-semibold hover:underline no-underline">Create a workspace →</Link>
                    </p>
                </div>

                <div className="h-[2px] w-24 mx-auto mt-6 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,112,243,0.3), transparent)' }} />
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default JoinRoom;