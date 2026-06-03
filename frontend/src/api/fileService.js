import api from './axios';


export const fileService = {
// GET /api/rooms/{roomId}/files
// Returns array of all files in the room

    getFiles: (roomId) =>
    api.get(`/rooms/${roomId}/files`),


// POST /api/rooms/{roomId}/files
// Creates a new file — body: { name, content }

createFile: (roomId, name, content = "") =>
    api.post(`/rooms/${roomId}/files`, { name, content }),
    

// PUT /api/rooms/{roomId}/files/{fileId}
// Updates file content (called on every code save)

updateFile: (roomId, fileId, data) =>
    api.put(`/rooms/${roomId}/files/${fileId}`, data),
// DELETE /api/rooms/{roomId}/files/{fileId}
deleteFile: (roomId, fileId) =>
    api.delete(`/rooms/${roomId}/files/${fileId}`),
};