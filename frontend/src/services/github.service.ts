import api from '../api/api';
import type { GitHubConfig } from '../types/app.types';

export const githubService = {
  getConfig: async (orgId: string): Promise<GitHubConfig> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/github-config`);
    return response.data;
  },

  saveConfig: async (orgId: string, config: Partial<GitHubConfig>): Promise<GitHubConfig> => {
    const response = await api.post(`/api/v1/organizations/${orgId}/github-config`, config);
    return response.data;
  },

  deleteConfig: async (orgId: string): Promise<void> => {
    await api.delete(`/api/v1/organizations/${orgId}/github-config`);
  },

  connectToken: async (token: string): Promise<any> => {
    const response = await api.post('/api/v1/github/connect', { token });
    return response.data;
  },

  disconnect: async (): Promise<void> => {
    await api.delete('/api/v1/github/disconnect');
  },

  getGlobalAvailableRepositories: async (): Promise<string[]> => {
    const response = await api.get('/api/v1/github/available-repositories');
    return response.data;
  },
  
  getRepositoryMetadata: async (fullName: string): Promise<any> => {
    const response = await api.get('/api/v1/github/repository-metadata', { params: { fullName } });
    return response.data;
  }
};
