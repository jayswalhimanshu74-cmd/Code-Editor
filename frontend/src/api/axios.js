import axios from 'axios';
import { authService } from '../api/authService';
import { wsService } from './websocketService';

export const getBackendUrl = () => {
    let url = import.meta.env.VITE_API_URL;
    if (!url || url === 'undefined' || (url.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
        url = 'https://code-editor-5n1x.onrender.com';
    }
    return url.replace(/\/$/, '');
};

const api = axios.create({
    baseURL: getBackendUrl() + '/api',
    withCredentials: true
});

// ✅ Attach Bearer token from localStorage for cross-domain requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// ✅ Auto-refresh on 401 with promise deduplication
let refreshPromise = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const isAuthRequest = originalRequest.url?.includes('/auth/refresh') || 
                              originalRequest.url?.includes('/auth/login') || 
                              originalRequest.url?.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            if (!refreshPromise) {
                refreshPromise = authService.refresh().finally(() => {
                    refreshPromise = null;
                });
            }

            try {
                await refreshPromise;
                const token = localStorage.getItem('accessToken');
                if (token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — clear state and disconnect WebSocket
                wsService.disconnect();
                
                // Dynamically import store to update auth state without circular dependency
                try {
                    const { default: useAuthStore } = await import('../store/authStore');
                    useAuthStore.setState({ user: null, isAuthenticated: false });
                } catch (storeError) {
                    console.error('[Axios] Failed to update auth store:', storeError);
                }

                // Redirect to login only if not already on a public page to avoid reload loops
                const publicPaths = ['/', '/login', '/register', '/auth/success'];
                const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
                if (!publicPaths.includes(currentPath)) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;