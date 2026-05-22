import { create } from 'zustand';
import { roomService } from '../api/roomService';

const useRoomStore = create((set) => ({
  rooms: [],
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    console.log("Fetching rooms...");
    set({ isLoading: true, error: null });
    try {
      const { data } = await roomService.getRooms();
      console.log("Rooms fetched successfully:", data);
      set({ rooms: data, isLoading: false });
    } catch (err) {
      
      set({ error: 'Failed to load rooms', isLoading: false });
    }
  },

  createRoom: async (name, language) => {
    try {
      const { data } = await roomService.createRoom(name, language);
      set((state) => ({ rooms: [data, ...state.rooms] }));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create room';
      throw new Error(message);
    }
  },

  joinRoom: async (inviteCode) => {
    try {
      const { data } = await roomService.joinRoom(inviteCode);
      set((state) => {
        const exists = state.rooms.find((r) => r.id === data.id);
        if (exists) return state;
        return { rooms: [data, ...state.rooms] };
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid invite code';
      throw new Error(message);
    }
  },

  deleteRoom: async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      set((state) => ({ rooms: state.rooms.filter((r) => r.id !== roomId) }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete room';
      throw new Error(message);
    }
  },
}));

export default useRoomStore;