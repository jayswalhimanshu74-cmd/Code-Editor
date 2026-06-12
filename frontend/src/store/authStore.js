import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false, // Will be set true by fetchMe or login
            isLoading: false,
            isCheckingAuth: true, // Used to show initial spinner if not cached
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
                        isCheckingAuth: false,
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
                    set({ user: null, isAuthenticated: false, error: null, isCheckingAuth: false });
                }
            },

            fetchMe: async () => {
                set({ isCheckingAuth: true });
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data, isAuthenticated: true, isCheckingAuth: false });
                } catch (err) {
                    // Only clear state if it's explicitly unauthorized (401 or 403).
                    // If the backend is just down (network error), keep the persisted state!
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        set({ user: null, isAuthenticated: false, isCheckingAuth: false });
                    } else {
                        // Network error or 500: keep existing state, just stop loading
                        set({ isCheckingAuth: false });
                    }
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Only save these fields
        }
    )
);

export default useAuthStore;