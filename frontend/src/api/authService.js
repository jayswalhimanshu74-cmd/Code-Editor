import api from '../api/axios';
import { wsService } from '../api/websocketService'; // adjust path as needed

export const authService = {

    register: (username, email, password) =>
        api.post('/auth/register', { username, email, password }),

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken } = response.data;

        // ✅ Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // ✅ Connect WebSocket after login
        wsService.connect(
            () => console.log('[Auth] WebSocket connected after login'),
            () => console.log('[Auth] WebSocket disconnected')
        );

        return response;
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch (e) {
            console.warn('[Auth] Logout API failed:', e.message);
        } finally {
            // ✅ Always clean up regardless of API success
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            wsService.disconnect();
        }
    },

    refresh: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;

        // ✅ Update stored access token
        localStorage.setItem('accessToken', accessToken);

        return response;
    },

    getMe: () =>
        api.get('/auth/me'),

    isLoggedIn: () =>
        !!localStorage.getItem('accessToken'),
};