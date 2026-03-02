import api from '../api/api';
import type { Membership, User } from '../types/app.types';

export const membershipService = {
  syncProfile: async (): Promise<User> => {
    const response = await api.post('/api/v1/profile/sync');
    return response.data;
  },

  getMembers: async (orgId: string): Promise<Membership[]> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/members`);
    return response.data;
  },

  addMember: async (orgId: string, email: string, role: string = 'DEVELOPER'): Promise<Membership> => {
    const response = await api.post(`/api/v1/organizations/${orgId}/members`, {
      userEmail: email,
      role: role
    });
    return response.data;
  },

  removeMember: async (orgId: string, membershipId: string): Promise<void> => {
    await api.delete(`/api/v1/organizations/${orgId}/members/${membershipId}`);
  },

  enrollInOrganization: async (orgId: string): Promise<Membership> => {
    const response = await api.post(`/api/v1/organizations/${orgId}/members/enroll`);
    return response.data;
  },

  getPendingRequests: async (orgId: string): Promise<Membership[]> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/members/pending`);
    return response.data;
  },

  updateStatus: async (orgId: string, membershipId: string, status: 'ACTIVE' | 'REJECTED'): Promise<Membership> => {
    const response = await api.put(`/api/v1/organizations/${orgId}/members/${membershipId}/status`, { status });
    return response.data;
  },

  updateRole: async (orgId: string, membershipId: string, role: string): Promise<Membership> => {
    const response = await api.put(`/api/v1/organizations/${orgId}/members/${membershipId}/role`, { role });
    return response.data;
  }
};
