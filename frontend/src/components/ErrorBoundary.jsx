import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('App crashed:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#0a0a0f', color: '#e8e8f0',
                    fontFamily: 'Inter, sans-serif', gap: 16, padding: 24,
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, marginBottom: 8,
                    }}>
                        ⚠️
                    </div>

                    <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                        Something went wrong
                    </h1>

                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: 0 }}>
                        An unexpected error occurred. Try refreshing the page.
                    </p>

                    {/* Error details */}
                    {this.state.error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 10, padding: '10px 16px',
                            fontSize: 11, color: '#f87171',
                            fontFamily: 'monospace', maxWidth: 500,
                            wordBreak: 'break-word',
                        }}>
                            {this.state.error.message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '10px 20px', borderRadius: 10,
                                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                                color: '#fff', border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600,
                            }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            style={{
                                padding: '10px 20px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;