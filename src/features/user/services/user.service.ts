import { api } from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  avatar?: string;
  id_role: string;
  active: boolean;
}

export const userService = {
  getUsers: async (options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }) => {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;
    const res = await api.get(`/v1/user/${all ? 'all' : ''}`, { 
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
  getUser: async (id: string) => {
    const res = await api.get(`/v1/user/${id}`);
    return res.data;
  },
  createUser: async (data: Omit<User, 'id' | 'active'> & { password?: string }) => {
    const res = await api.post('/v1/user', data);
    return res.data;
  },
  updateUser: async (id: string, data: Partial<User> & { password?: string }) => {
    const res = await api.put(`/v1/user/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/v1/user/${id}`);
    return res.data;
  },
  toggleStatus: async (id: string, active: boolean) => {
    const res = await api.patch(`/v1/user/${id}/status`, { active });
    return res.data;
  }
};
