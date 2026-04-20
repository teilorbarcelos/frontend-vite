import { api } from '@/lib/axios';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  active: boolean;
}

export const productService = {
  getProducts: async (page = 0, size = 15, searchWord?: string, searchFields?: string, filters: Record<string, unknown> = {}) => {
    const res = await api.get('/v1/product', { 
      params: { 
        page, 
        size,
        ...(searchWord ? { searchWord, searchFields } : {}),
        ...filters
      } 
    });
    return res.data;
  },
  getProduct: async (id: string) => {
    const res = await api.get(`/v1/product/${id}`);
    return res.data;
  },
  createProduct: async (data: Omit<Product, 'id' | 'active'>) => {
    const res = await api.post('/v1/product', data);
    return res.data;
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    const res = await api.put(`/v1/product/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string) => {
    const res = await api.delete(`/v1/product/${id}`);
    return res.data;
  },
  toggleStatus: async (id: string, active: boolean) => {
    const res = await api.patch(`/v1/product/${id}/status`, { active });
    return res.data;
  }
};
