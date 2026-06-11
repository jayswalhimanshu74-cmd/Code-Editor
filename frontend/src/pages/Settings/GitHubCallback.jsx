import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { githubService } from '../../api/githubService';

const GitHubCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Connecting to GitHub...');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            githubService.connect(code)
                .then((res) => {
                    setStatus('GitHub Connected! Redirecting...');
                    setTimeout(() => navigate('/settings'), 1500);
                })
                .catch((err) => {
                    setStatus('Failed to connect GitHub. Redirecting...');
                    setTimeout(() => navigate('/settings'), 2500);
                });
        } else {
            setStatus('No authorization code found. Redirecting...');
            setTimeout(() => navigate('/settings'), 2500);
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#fff', flexDirection: 'column', gap: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{status}</div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default GitHubCallback;
