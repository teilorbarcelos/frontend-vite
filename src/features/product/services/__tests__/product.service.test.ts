import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '../product.service';
import { api } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts calls correct endpoint with all options', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await productService.getProducts({
      all: true,
      searchWord: 'test',
      searchFields: ['name'],
      sort: { orderBy: 'price', orderDirection: 'desc' },
      filters: { category: 'C1' }
    });
    expect(api.get).toHaveBeenCalledWith('/v1/product/all', {
      params: expect.objectContaining({
        searchWord: 'test',
        searchFields: 'name',
        orderBy: 'price',
        orderDirection: 'desc',
        category: 'C1'
      })
    });
  });

  it('getProducts calls correct endpoint with minimal options', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await productService.getProducts({});
    expect(api.get).toHaveBeenCalledWith('/v1/product', {
      params: {
        page: 0,
        size: 25
      }
    });
  });

  it('getProduct calls correct endpoint', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await productService.getProduct('1');
    expect(api.get).toHaveBeenCalledWith('/v1/product/1');
  });

  it('createProduct calls correct endpoint', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: {} });
    await productService.createProduct({ name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1' });
    expect(api.post).toHaveBeenCalledWith('/v1/product', { name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1' });
  });

  it('updateProduct calls correct endpoint', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: {} });
    await productService.updateProduct('1', { name: 'P1' });
    expect(api.put).toHaveBeenCalledWith('/v1/product/1', { name: 'P1' });
  });

  it('deleteProduct calls correct endpoint', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await productService.deleteProduct('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/product/1');
  });

  it('toggleStatus calls correct endpoint', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await productService.toggleStatus('1', true);
    expect(api.patch).toHaveBeenCalledWith('/v1/product/1/status', { active: true });
  });
});
