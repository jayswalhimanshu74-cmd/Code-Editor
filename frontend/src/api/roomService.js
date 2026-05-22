import api from '../api/axios';

export const roomService = {
  getRooms: () =>
    api.get('/rooms'),

  getRoom: (roomId) =>
    api.get(`/rooms/${roomId}`),

  createRoom: (name, language) =>
    api.post('/rooms', { name, language }),

  joinRoom: (inviteCode) =>
    api.post('/rooms/join', { inviteCode }),

  deleteRoom: (roomId) =>
    api.delete(`/rooms/${roomId}`),
};