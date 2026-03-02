import api from '../api/api';
import type { Skill, UserSkill, ProficiencyLevel } from '../types/app.types';

export const skillService = {
  getCatalog: async (): Promise<Skill[]> => {
    const response = await api.get('/api/v1/skills');
    return response.data;
  },

  getMySkills: async (): Promise<UserSkill[]> => {
    const response = await api.get('/api/v1/skills/me');
    return response.data;
  },

  addSkill: async (skillId: string, level: ProficiencyLevel): Promise<UserSkill> => {
    const response = await api.post(`/api/v1/skills/me/${skillId}`, { level });
    return response.data;
  },

  updateLevel: async (skillId: string, level: ProficiencyLevel): Promise<UserSkill> => {
    const response = await api.put(`/api/v1/skills/me/${skillId}`, { level });
    return response.data;
  },

  removeSkill: async (skillId: string): Promise<void> => {
    await api.delete(`/api/v1/skills/me/${skillId}`);
  },
};
