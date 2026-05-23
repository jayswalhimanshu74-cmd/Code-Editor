import api from './axios';

export const userService = {

    getProfile: () =>
        api.get('/user/profile'),

    updateProfile: (username, avatarUrl) =>
        api.put('/user/profile', { username, avatarUrl }),

    updatePassword: (currentPassword, newPassword) =>
        api.put('/user/password', { currentPassword, newPassword }),
};