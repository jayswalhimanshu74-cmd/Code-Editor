import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isCheckingAuth, user, fetchMe } = useAuthStore();

    // ✅ If authenticated but user object missing — fetch it
    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchMe();
        }
    }, [isAuthenticated, user, fetchMe]);

    // ✅ Also reconnect WebSocket on page refresh
    useEffect(() => {
        if (isAuthenticated) {
            import('../api/websocketService').then(({ wsService }) => {
                if (!wsService.isConnected()) {
                    wsService.connect();
                }
            });
        }
    }, [isAuthenticated]);

    if (isCheckingAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
                <span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;