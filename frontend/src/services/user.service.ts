import api from '../api/api';
import type { User } from '../types/app.types';

export const userService = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get(`/api/v1/users/search?query=${query}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.post('/api/v1/profile/sync');
    return response.data;
  }
};
