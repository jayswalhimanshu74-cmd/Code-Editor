import api from './axios';

export const logService = {
    getRoomLogs: (roomId, page = 0, size = 50) =>
        api.get(`/rooms/${roomId}/logs`, { params: { page, size } }),

    getFileLogs: (roomId, fileId, page = 0, size = 50) =>
        api.get(`/rooms/${roomId}/files/${fileId}/logs`, { params: { page, size } }),

    getUserLogs: (roomId, email, page = 0, size = 50) =>
        api.get(`/rooms/${roomId}/logs/user/${email}`, { params: { page, size } }),
};