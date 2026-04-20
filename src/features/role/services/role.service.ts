import { api } from '@/lib/axios';

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  RoleFeature: string;
}

export const roleService = {
  getRoles: async (options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
  }) => {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort } = options;
    const res = await api.get('/v1/role', { 
      params: { 
        page, 
        size,
        ...(searchWord ? { searchWord, searchFields: searchFields?.join(',') } : {}),
        ...filters,
        ...(sort?.orderBy ? { orderBy: sort.orderBy, orderDirection: sort.orderDirection } : {})
      } 
    });
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
