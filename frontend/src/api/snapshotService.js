import api from './axios';

export const snapshotService = {
    // Save a snapshot of current file
    saveSnapshot: (roomId, fileId, label = 'snapshot') =>
        api.post(`/rooms/${roomId}/files/${fileId}/snapshots`, { label }),

    // Get all snapshots for a file
    getSnapshots: (roomId, fileId) =>
        api.get(`/rooms/${roomId}/files/${fileId}/snapshots`),

    // Restore a snapshot
    restoreSnapshot: (roomId, fileId, snapshotId) =>
        api.post(`/rooms/${roomId}/files/${fileId}/snapshots/${snapshotId}/restore`),

    // Delete a snapshot
    deleteSnapshot: (roomId, fileId, snapshotId) =>
        api.delete(`/rooms/${roomId}/files/${fileId}/snapshots/${snapshotId}`),
};