import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuthStore();
    const [status, setStatus] = useState('Authenticating...');

    useEffect(() => {
        const authenticate = async () => {
            const token = searchParams.get('token');
            if (token) {
                const success = await loginWithToken(token);
                if (success) {
                    navigate('/dashboard', { replace: true });
                } else {
                    setStatus('Authentication failed. Redirecting to login...');
                    setTimeout(() => navigate('/login', { replace: true }), 3000);
                }
            } else {
                setStatus('Invalid token. Redirecting to login...');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        authenticate();
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-md">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
                <h2 className="text-heading-md font-heading-md text-on-surface">{status}</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Please wait while we set up your secure session.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
