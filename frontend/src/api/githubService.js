import api from './axios';

export const githubService = {
    getClientId: async () => {
        const response = await api.get('/github/client-id');
        return response.data;
    },

    connect: async (code) => {
        const response = await api.post('/github/callback', { code });
        return response.data;
    },

    getRepositories: async () => {
        const response = await api.get('/github/repos');
        return response.data;
    },

    disconnect: async () => {
        const response = await api.delete('/github/disconnect');
        return response.data;
    }
};
