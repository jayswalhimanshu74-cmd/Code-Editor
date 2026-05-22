import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, fetchMe } = useAuthStore();

    // ✅ If authenticated but user object missing — fetch it
    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchMe();
        }
    }, [isAuthenticated, user]);

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;