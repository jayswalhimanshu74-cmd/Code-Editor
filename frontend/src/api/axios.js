import axios from 'axios';
import { authService } from '../api/authService';
import { wsService } from './websocketService';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    withCredentials: true,
});

// Remove request interceptor since cookies are automatically sent


// ✅ Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest.url?.includes('/auth/refresh') || 
                              originalRequest.url?.includes('/auth/login') || 
                              originalRequest.url?.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                // Queue requests while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await authService.refresh();
                processQueue(null, null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed — backend will clear cookies
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
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;