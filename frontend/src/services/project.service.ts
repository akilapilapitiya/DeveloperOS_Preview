import api from '../api/api';
import type { Project, Environment, GitHubCommit, GitHubInsights } from '../types/app.types';

export const projectService = {
  getEnvironments: async (projectId: string): Promise<Environment[]> => {
    const response = await api.get(`/api/v1/projects/${projectId}/environments`);
    return response.data;
  },

  getProjectBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get(`/api/v1/projects/slug/${slug}`);
    return response.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get(`/api/v1/projects/${id}`);
    return response.data;
  },

  getMyProjects: async (): Promise<Project[]> => {
    const response = await api.get('/api/v1/projects/my');
    return response.data;
  },

  searchProjects: async (query: string): Promise<Project[]> => {
    const response = await api.get(`/api/v1/projects/search?query=${query}`);
    return response.data;
  },

  getProjectsByOrganization: async (orgId: string): Promise<Project[]> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/projects`);
    return response.data;
  },

  createEnvironment: async (projectId: string, env: Partial<Environment>): Promise<Environment> => {
    const payload = {
      ...env,
      active: env.active ?? true
    };
    const response = await api.post(`/api/v1/projects/${projectId}/environments`, payload);
    return response.data;
  },

  createProject: async (orgId: string | null, project: Partial<Project>): Promise<Project> => {
    const payload = {
      ...project,
      eventId: project.eventId,
      active: project.active ?? true,
      description: project.description ?? ''
    };
    const response = orgId 
      ? await api.post(`/api/v1/organizations/${orgId}/projects`, payload)
      : await api.post('/api/v1/projects', payload);
    return response.data;
  },

  updateProject: async (orgId: string, id: string, project: Partial<Project>): Promise<Project> => {
    // Ensure primitive fields are present to avoid 400
    const payload = {
      ...project,
      active: project.active ?? true,
      description: project.description ?? ''
    };
    const response = await api.put(`/api/v1/organizations/${orgId}/projects/${id}`, payload);
    return response.data;
  },

  uploadProjectAvatar: async (projectId: string, file: File): Promise<Project> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/v1/projects/${projectId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteProject: async (orgId: string, id: string): Promise<void> => {
    await api.delete(`/api/v1/organizations/${orgId}/projects/${id}`);
  },

  updateEnvironment: async (projectId: string, id: string, env: Partial<Environment>): Promise<Environment> => {
    const payload = {
      ...env,
      active: env.active ?? true
    };
    const response = await api.put(`/api/v1/projects/${projectId}/environments/${id}`, payload);
    return response.data;
  },

  deleteEnvironment: async (projectId: string, id: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${projectId}/environments/${id}`);
  },

  getAvailableGitHubRepositories: async (projectId: string): Promise<string[]> => {
    const response = await api.get(`/api/v1/projects/${projectId}/github/available-repositories`);
    return response.data;
  },

  syncGitHubMetadata: async (projectId: string): Promise<void> => {
    await api.post(`/api/v1/projects/${projectId}/github/sync`);
  },

  getProjectCommits: async (projectId: string): Promise<GitHubCommit[]> => {
    const response = await api.get(`/api/v1/projects/${projectId}/github/commits`);
    return response.data;
  },

  getProjectGitHubInsights: async (projectId: string): Promise<GitHubInsights> => {
    const response = await api.get(`/api/v1/projects/${projectId}/github/insights`);
    return response.data;
  }
};
