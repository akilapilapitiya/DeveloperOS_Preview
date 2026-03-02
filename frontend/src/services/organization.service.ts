import api from '../api/api';
import type { Organization, Project } from '../types/app.types';

export const organizationService = {
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/api/v1/organizations');
    return response.data;
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const response = await api.get(`/api/v1/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (org: Partial<Organization>): Promise<Organization> => {
    const payload = {
      ...org,
      active: org.active ?? true,
      description: org.description ?? ''
    };
    const response = await api.post('/api/v1/organizations', payload);
    return response.data;
  },

  getOrganizationProjects: async (orgId: string): Promise<Project[]> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/projects`);
    return response.data;
  },
  
  createProject: async (orgId: string, project: Partial<Project>): Promise<Project> => {
      const payload = {
        ...project,
        active: project.active ?? true,
        description: project.description ?? ''
      };
      const response = await api.post(`/api/v1/organizations/${orgId}/projects`, payload);
      return response.data;
  },

  updateOrganization: async (id: string, org: Partial<Organization>): Promise<Organization> => {
    const payload = {
      ...org,
      active: org.active ?? true,
      description: org.description ?? ''
    };
    const response = await api.put(`/api/v1/organizations/${id}`, payload);
    return response.data;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/organizations/${id}`);
  },

  searchOrganizations: async (query: string): Promise<Organization[]> => {
    const response = await api.get(`/api/v1/organizations/search?query=${query}`);
    return response.data;
  },

  uploadBanner: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.fileName;
  }
};
