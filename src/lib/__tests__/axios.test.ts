import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('axios', () => {
  const m = vi.fn().mockImplementation((config: AxiosRequestConfig) => m.request(config)) as any;
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

import { api } from '../axios';

// Extract handlers immediately because beforeEach clears mocks
const requestHandler = (api.interceptors.request.use as Mock).mock.calls[0][0];
const responseSuccessHandler = (api.interceptors.response.use as Mock).mock.calls[0][0];
const responseErrorHandler = (api.interceptors.response.use as Mock).mock.calls[0][1];

describe('axios interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('request interceptor adds Authorization header', () => {
    localStorage.setItem('token', 'my-token');
    const config = requestHandler({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBe('Bearer my-token');
  });

  it('request interceptor does not add Authorization header if no token', () => {
    const config = requestHandler({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('response interceptor handles 401 and refreshes token', async () => {
    const originalRequest = { url: '/test', headers: { Authorization: '' }, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    
    (axios.post as Mock).mockResolvedValue({
      data: { token: 'new-token', refreshToken: 'new-refresh-token' }
    });
    
    await responseErrorHandler(error);

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
    delete (window as Partial<Window>).location;
    window.location = { href: '' } as Location & string;
    
    try {
      await responseErrorHandler(error);
    } catch {
      // expected rejection
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation as Location & string;
  });

  it('response interceptor handles success response', () => {
    const response = { data: 'ok' };
    expect(responseSuccessHandler(response)).toBe(response);
  });

  it('response interceptor handles refresh request failure', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };

    localStorage.setItem('refreshToken', 'refresh-token');
    
    (axios.post as Mock).mockRejectedValue(new Error('Refresh failed'));

    const originalLocation = window.location;
    delete (window as Partial<Window>).location;
    window.location = { href: '' } as any;
    
    try {
      await responseErrorHandler(error);
    } catch {
      // expected
    }

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation as Location & string;
  });

  it('response interceptor does not refresh on login request 401', async () => {
    const originalRequest = { url: '/v1/auth/login', headers: {}, _retry: false };
    const error = {
      response: { status: 401 },
      config: originalRequest
    };
    
    try {
      await responseErrorHandler(error);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('response interceptor does not refresh if status is not 401', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false };
    const error = {
      response: { status: 500 },
      config: originalRequest
    };
    
    try {
      await responseErrorHandler(error);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(axios.post).not.toHaveBeenCalled();
  });
});
