import api from '../api/api';
import type { Event, Project } from '../types/app.types';

export const eventService = {
  getOrganizationEvents: async (orgId: string): Promise<Event[]> => {
    const response = await api.get(`/api/v1/organizations/${orgId}/events`);
    return response.data;
  },

  createEvent: async (orgId: string, event: Partial<Event>): Promise<Event> => {
    const response = await api.post(`/api/v1/organizations/${orgId}/events`, event);
    return response.data;
  },

  getEventProjects: async (eventId: string): Promise<Project[]> => {
    const response = await api.get(`/api/v1/events/${eventId}/projects`);
    return response.data;
  },

  updateEvent: async (eventId: string, event: Partial<Event>): Promise<Event> => {
    const response = await api.put(`/api/v1/events/${eventId}`, event);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/api/v1/events/${eventId}`);
  }
};
