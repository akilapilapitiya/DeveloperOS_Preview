import api from '../api/api';
import type { ProjectMembership, ProjectRole } from '../types/app.types';

export const projectMembershipService = {
  getProjectMembers: async (projectId: string): Promise<ProjectMembership[]> => {
    const response = await api.get(`/api/v1/projects/${projectId}/members`);
    return response.data;
  },

  addProjectMember: async (projectId: string, email: string, role: ProjectRole): Promise<ProjectMembership> => {
    const response = await api.post(`/api/v1/projects/${projectId}/members`, { email, role });
    return response.data;
  },

  updateProjectMemberRole: async (projectId: string, membershipId: string, role: ProjectRole): Promise<ProjectMembership> => {
    const response = await api.put(`/api/v1/projects/${projectId}/members/${membershipId}/role`, { role });
    return response.data;
  },

  removeProjectMember: async (projectId: string, membershipId: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${projectId}/members/${membershipId}`);
  }
};
