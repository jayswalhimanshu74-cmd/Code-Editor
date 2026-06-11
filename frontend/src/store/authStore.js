import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false, // Will be set true by fetchMe or login
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
            await api.post('/auth/logout');
        } catch (_) {
            // still clear state even if API fails
        } finally {
            const { wsService } = await import('../api/websocketService');
            wsService.disconnect();
            set({ user: null, isAuthenticated: false, error: null });
        }
    },

    fetchMe: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch (_) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;