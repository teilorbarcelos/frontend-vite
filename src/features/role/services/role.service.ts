import { api } from '@/lib/axios';

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  RoleFeature: string;
}

export const roleService = {
  getRoles: async (page = 0, size = 15) => {
    const res = await api.get('/v1/role', { params: { page, size } });
    return res.data;
  },
  getRole: async (id: string) => {
    const res = await api.get(`/v1/role/${id}`);
    return res.data;
  },
  createRole: async (data: Omit<Role, 'id' | 'active'>) => {
    const res = await api.post('/v1/role', data);
    return res.data;
  },
  updateRole: async (id: string, data: Partial<Role>) => {
    const res = await api.put(`/v1/role/${id}`, data);
    return res.data;
  },
  deleteRole: async (id: string) => {
    const res = await api.delete(`/v1/role/${id}`);
    return res.data;
  },
  toggleStatus: async (id: string, active: boolean) => {
    const res = await api.patch(`/v1/role/${id}/status`, { active });
    return res.data;
  }
};
