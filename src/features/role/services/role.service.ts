import { api } from '@/lib/axios';

export interface RoleFeature {
  id_feature: string;
  create: boolean;
  view: boolean;
  delete: boolean;
  activate: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  RoleFeature: RoleFeature[];
}

export const roleService = {
  getRoles: async (options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }) => {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;
    const res = await api.get(`/v1/role${all ? '/all' : ''}`, { 
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
  getFeatures: async (): Promise<Feature[]> => {
    const res = await api.get('/v1/role/features');
    return res.data;
  },
  createRole: async (data: { name: string; description: string; permissions: RoleFeature[] }) => {
    const res = await api.post('/v1/role', data);
    return res.data;
  },
  updateRole: async (id: string, data: { name: string; description: string; permissions: RoleFeature[] }) => {
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
