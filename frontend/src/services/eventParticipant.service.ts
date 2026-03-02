import api from '../api/api';
import type { EventParticipant, EventRole } from '../types/app.types';

export const eventParticipantService = {
  getParticipants: async (eventId: string): Promise<EventParticipant[]> => {
    const response = await api.get(`/api/v1/events/${eventId}/participants`);
    return response.data;
  },

  addParticipant: async (eventId: string, userId: string, role: EventRole): Promise<EventParticipant> => {
    const response = await api.post(`/api/v1/events/${eventId}/participants/${userId}?role=${role}`);
    return response.data;
  },

  updateParticipantRole: async (eventId: string, userId: string, role: EventRole): Promise<EventParticipant> => {
    const response = await api.put(`/api/v1/events/${eventId}/participants/${userId}?role=${role}`);
    return response.data;
  },

  getUserEvents: async (userId: string): Promise<EventParticipant[]> => {
    const response = await api.get(`/api/v1/events/users/${userId}/participants`);
    return response.data;
  },

  removeParticipant: async (eventId: string, userId: string): Promise<void> => {
    await api.delete(`/api/v1/events/${eventId}/participants/${userId}`);
  }
};
