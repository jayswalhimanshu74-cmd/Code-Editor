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


// ✅ Auto-refresh on 401 with single-flight queue & token verification
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

            const currentToken = localStorage.getItem('accessToken');
            const tokenUsed = originalRequest.headers.Authorization 
                ? originalRequest.headers.Authorization.replace('Bearer ', '') 
                : null;

            // If the token in localStorage has already changed since this request was sent,
            // it means another request already completed a token refresh. Retry immediately!
            if (currentToken && tokenUsed && currentToken !== tokenUsed) {
                originalRequest.headers.Authorization = `Bearer ${currentToken}`;
                return api(originalRequest);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            return new Promise((resolve, reject) => {
                authService.refresh()
                    .then((response) => {
                        const token = response?.data?.accessToken;
                        processQueue(null, token);

                        // Update the active request headers with the new token
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }

                        // Reconnect WebSocket to update its credentials without clearing listeners
                        wsService.reconnect().catch((wsErr) => {
                            console.error('[Axios] Failed to reconnect WebSocket after refresh:', wsErr);
                        });

                        resolve(api(originalRequest));
                    })
                    .catch(async (refreshError) => {
                        processQueue(refreshError, null);

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
                        const publicPaths = ['/', '/login', '/register', '/auth/success', '/oauth2/success', '/oauth2/error'];
                        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
                        if (!publicPaths.includes(currentPath)) {
                            window.location.href = '/login';
                        }
                        reject(refreshError);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(error);
    }
);

export default api;