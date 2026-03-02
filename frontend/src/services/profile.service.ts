import api from '../api/api';
import type { User } from '../types/app.types';

export const profileService = {
  syncProfile: async (): Promise<User> => {
    const response = await api.post('/api/v1/profile/sync');
    return response.data;
  },

  updateProfile: async (profileUpdates: Partial<User>): Promise<User> => {
    // Only send the fields the backend PUT endpoint accepts
    const payload = {
      bio: profileUpdates.bio,
      company: profileUpdates.company,
      location: profileUpdates.location,
      websiteUrl: profileUpdates.websiteUrl,
      twitterUsername: profileUpdates.twitterUsername,
      phoneNumber: profileUpdates.phoneNumber,
      secondaryEmail: profileUpdates.secondaryEmail,
    };
    const response = await api.put('/api/v1/profile', payload);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
