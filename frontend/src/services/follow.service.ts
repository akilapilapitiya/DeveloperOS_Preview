import api from '../api/api';
import type { FollowStats, FollowUser } from '../types/app.types';

export const followService = {
  follow: async (username: string): Promise<void> => {
    await api.post(`/api/v1/follow/${username}`);
  },

  unfollow: async (username: string): Promise<void> => {
    await api.delete(`/api/v1/follow/${username}`);
  },

  getStatus: async (username: string): Promise<boolean> => {
    const res = await api.get<boolean>(`/api/v1/follow/${username}/status`);
    return res.data;
  },

  getStats: async (username: string): Promise<FollowStats> => {
    const res = await api.get<FollowStats>(`/api/v1/follow/${username}/stats`);
    return res.data;
  },

  getFollowers: async (username: string): Promise<FollowUser[]> => {
    const res = await api.get<FollowUser[]>(`/api/v1/follow/${username}/followers`);
    return res.data;
  },

  getFollowing: async (username: string): Promise<FollowUser[]> => {
    const res = await api.get<FollowUser[]>(`/api/v1/follow/${username}/following`);
    return res.data;
  },
};
