import api from '../api/api';
import type { PublicProfile } from '../types/app.types';

export const publicProfileService = {
  getByUsername: async (username: string): Promise<PublicProfile> => {
    const response = await api.get(`/api/v1/profile/u/${username}`);
    return response.data;
  },
};
