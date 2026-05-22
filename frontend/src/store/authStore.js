import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', { username, email, password });
            set({ isLoading: false });
            return true;
        } catch (err) {
            set({ isLoading: false, error: err.response?.data?.message || 'Registration failed' });
            return false;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // ✅ Set user immediately from login response
            set({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            // ✅ Connect WebSocket after login — lazy import avoids circular dep
            const { wsService } = await import('../api/websocketService');
            wsService.connect(
                () => console.log('[Auth] WS connected'),
                () => console.log('[Auth] WS disconnected')
            );

            return true;
        } catch (err) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Invalid email or password',
            });
            return false;
        }
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await api.post('/auth/logout', { refreshToken });
        } catch (_) {
            // still clear state even if API fails
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            const { wsService } = await import('../api/websocketService');
            wsService.disconnect();
            set({ user: null, isAuthenticated: false, error: null });
        }
    },

    fetchMe: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isLoading: false });
        } catch (_) {
            set({ isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;