import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const m: any = vi.fn().mockImplementation((config: any) => m.request(config));
  m.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  m.request = vi.fn().mockResolvedValue({ data: 'success' });
  m.create = vi.fn(() => m);
  m.post = vi.fn();
  return {
    default: m,
    __esModule: true
  };
});

import axios from 'axios';
import { api } from '../axios';

describe('axios interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('request interceptor adds Authorization header', () => {
    localStorage.setItem('token', 'my-token');
    
    // @ts-ignore
    const handler = api.interceptors.request.use.mock.calls[0][0];
    const config = handler({ headers: {} });
    
    expect(config.headers.Authorization).toBe('Bearer my-token');
  });

  it('response interceptor handles 401 and refreshes token', async () => {
    const originalRequest = { url: '/test', headers: { Authorization: '' }, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    
    // @ts-ignore
    axios.post.mockResolvedValue({
      data: { token: 'new-token', refreshToken: 'new-refresh-token' }
    });

    // @ts-ignore
    const handler = api.interceptors.response.use.mock.calls[0][1];
    
    await handler(error);

    expect(axios.post).toHaveBeenCalledWith('http://localhost:8888/v1/auth/refresh', { refreshToken: 'refresh-token' });
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-token');
  });

  it('response interceptor handles 401 when no refresh token', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    // @ts-ignore
    const handler = api.interceptors.response.use.mock.calls[0][1];
    
    try {
      await handler(error);
    } catch (e) {
      // expected rejection
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  it('response interceptor handles success response', () => {
    // @ts-ignore
    const handler = api.interceptors.response.use.mock.calls[0][0];
    const response = { data: 'ok' };
    expect(handler(response)).toBe(response);
  });

  it('response interceptor handles refresh request failure', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    
    // @ts-ignore
    axios.post.mockRejectedValue(new Error('Refresh failed'));

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    // @ts-ignore
    const handler = api.interceptors.response.use.mock.calls[0][1];
    
    try {
      await handler(error);
    } catch (e) {
      // expected
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });
});
