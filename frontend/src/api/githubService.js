import api from './axios';

export const githubService = {
    getClientId: async () => {
        const response = await api.get('/github/client-id');
        return response.data;
    },

    getAuthorizeUrl: async () => {
        const response = await api.get('/github/authorize');
        return response.data;
    },

    connect: async (code, state) => {
        const response = await api.post('/github/callback', { code, state });
        return response.data;
    },

    getRepositories: async () => {
        const response = await api.get('/github/repos');
        return response.data;
    },

    createRepository: async (name, description, isPrivate) => {
        const response = await api.post('/github/repos/create', { name, description, private: isPrivate });
        return response.data;
    },

    disconnect: async () => {
        const response = await api.delete('/github/disconnect');
        return response.data;
    }
};
