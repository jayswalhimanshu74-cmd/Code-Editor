import api from './axios';

export const executionService = {
    // POST /api/rooms/{roomId}/execute
    // Sends code to backend -> returns async execution ID
    execute: (roomId, sourceCode, language, stdin = "") => {
        return api.post(`/rooms/${roomId}/execute`, {
            sourceCode,
            language,
            stdin,
        });
    },

    // POST /api/rooms/{roomId}/executions
    // Saves a completed execution run (e.g. browser JS/Python or recorded failures)
    recordExecution: (roomId, executionData) => {
        return api.post(`/rooms/${roomId}/executions`, executionData);
    },

    // GET /api/executions (or /api/rooms/{roomId}/executions)
    // When roomId is null/undefined/empty: fetches all runs across all rooms for current user
    // When roomId is passed: fetches runs for that room
    getHistory: (roomIdOrOptions, page = 0, size = 20) => {
        if (typeof roomIdOrOptions === 'object' && roomIdOrOptions !== null) {
            const { roomId, page: p = 0, size: s = 20 } = roomIdOrOptions;
            if (roomId) {
                return api.get(`/executions`, { params: { roomId, page: p, size: s } });
            }
            return api.get(`/executions`, { params: { page: p, size: s } });
        }
        if (roomIdOrOptions) {
            return api.get(`/rooms/${roomIdOrOptions}/executions`, { params: { page, size } });
        }
        return api.get(`/executions`, { params: { page, size } });
    },
};
