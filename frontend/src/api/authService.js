import api from '../api/axios';
import { wsService } from '../api/websocketService'; // adjust path as needed

export const authService = {

    register: (username, email, password) =>
        api.post('/auth/register', { username, email, password }),

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });

        // ✅ Connect WebSocket after login
        wsService.connect(
            () => console.log('[Auth] WebSocket connected after login'),
            () => console.log('[Auth] WebSocket disconnected')
        );

        return response;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.warn('[Auth] Logout API failed:', e.message);
        } finally {
            wsService.disconnect();
        }
    },

    refresh: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh', { refreshToken });
        if (response?.data?.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response?.data?.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response;
    },

    getMe: () =>
        api.get('/auth/me'),

 
    isLoggedIn: () => true,

    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (token, newPassword) =>
        api.post('/auth/reset-password', { token, newPassword }),
};