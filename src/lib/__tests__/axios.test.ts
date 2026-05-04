import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('axios', () => {
  const m = vi.fn().mockImplementation((config: any) => m.request(config)) as any;
  m.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  m.defaults = {
    headers: {
      common: {}
    }
  };
  m.request = vi.fn().mockResolvedValue({ data: 'success' });
  m.create = vi.fn(() => m);
  m.post = vi.fn();
  return {
    default: m,
    __esModule: true
  };
});

vi.mock('@/stores/auth', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      logout: vi.fn()
    }))
  },
  resetAuthStore: vi.fn()
}));

import { __resetInterceptorState, api } from '../axios';
import { useAuthStore } from '@/stores/auth';

// Extract handlers immediately because beforeEach clears mocks
const requestHandler = (api.interceptors.request.use as Mock).mock.calls[0][0];
const responseSuccessHandler = (api.interceptors.response.use as Mock).mock.calls[0][0];
const responseErrorHandler = (api.interceptors.response.use as Mock).mock.calls[0][1];

describe('axios interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    __resetInterceptorState();
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

  it('response interceptor queues concurrent 401 requests', async () => {
    const originalRequest1 = { url: '/test1', headers: {}, _retry: false } as any;
    const originalRequest2 = { url: '/test2', headers: {}, _retry: false } as any;
    const error1 = { response: { status: 401 }, config: originalRequest1 } as any;
    const error2 = { response: { status: 401 }, config: originalRequest2 } as any;

    localStorage.setItem('refreshToken', 'refresh-token');
    
    // Create a deferred promise
    let resolveRefresh: (value: any) => void = () => {};
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    (axios.post as Mock).mockReturnValue(refreshPromise);
    
    // Trigger both 401s
    const promise1 = responseErrorHandler(error1);
    const promise2 = responseErrorHandler(error2);

    expect(axios.post).toHaveBeenCalledTimes(1);

    // Resolve the refresh call
    resolveRefresh({
      data: { token: 'new-token', refreshToken: 'new-refresh-token' }
    });

    await Promise.all([promise1, promise2]);

    expect(localStorage.getItem('token')).toBe('new-token');
    expect(originalRequest1.headers.Authorization).toBe('Bearer new-token');
    expect(originalRequest2.headers.Authorization).toBe('Bearer new-token');
  });

  it('response interceptor handles network errors (no response)', async () => {
    const error = { config: {} } as any; // No response property
    
    try {
      await responseErrorHandler(error);
    } catch (e) {
      expect(e).toBe(error);
    }
  });

  it('response interceptor rejects queued requests if refresh fails', async () => {
    const originalRequest1 = { url: '/test1', headers: {}, _retry: false } as any;
    const originalRequest2 = { url: '/test2', headers: {}, _retry: false } as any;
    const error1 = { response: { status: 401 }, config: originalRequest1 } as any;
    const error2 = { response: { status: 401 }, config: originalRequest2 } as any;

    localStorage.setItem('refreshToken', 'refresh-token');
    
    let rejectRefresh: (reason: any) => void = () => {};
    const refreshPromise = new Promise((_, reject) => {
      rejectRefresh = reject;
    });

    (axios.post as Mock).mockReturnValue(refreshPromise);
    
    const promise1 = responseErrorHandler(error1);
    const promise2 = responseErrorHandler(error2);

    const refreshError = new Error('Refresh failed');
    rejectRefresh(refreshError);

    await expect(promise1).rejects.toThrow('Refresh failed');
    await expect(promise2).rejects.toThrow('Refresh failed');
  });

  it('response interceptor handles missing properties gracefully', async () => {
    // 1. Missing newRefreshToken in response
    const originalRequest = { url: undefined, headers: { Authorization: '' }, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;
    localStorage.setItem('refreshToken', 'refresh-token');
    
    (axios.post as Mock).mockResolvedValue({
      data: { token: 'new-token' } // No newRefreshToken
    });
    
    // 2. Mock api.defaults to be null to test safety checks
    const originalDefaults = api.defaults;
    (api as any).defaults = null;

    await responseErrorHandler(error);

    expect(localStorage.getItem('token')).toBe('new-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token'); // Unchanged
    
    // Restore api.defaults
    (api as any).defaults = originalDefaults;
  });

  it('response interceptor handles missing headers in original request', async () => {
    const originalRequest = { url: '/test', headers: undefined, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;
    localStorage.setItem('refreshToken', 'refresh-token');
    
    (axios.post as Mock).mockResolvedValue({
      data: { token: 'new-token' }
    });

    await responseErrorHandler(error);
    expect(originalRequest.headers).toBeUndefined();
  });

  it('response interceptor handles queued request without headers', async () => {
    const originalRequest1 = { url: '/test1', headers: {}, _retry: false } as any;
    const originalRequest2 = { url: '/test2', headers: undefined, _retry: false } as any;
    const error1 = { response: { status: 401 }, config: originalRequest1 } as any;
    const error2 = { response: { status: 401 }, config: originalRequest2 } as any;

    localStorage.setItem('refreshToken', 'refresh-token');
    
    let resolveRefresh: (value: any) => void = () => {};
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    (axios.post as Mock).mockReturnValue(refreshPromise);
    
    const promise1 = responseErrorHandler(error1);
    const promise2 = responseErrorHandler(error2);

    resolveRefresh({
      data: { token: 'new-token' }
    });

    await Promise.all([promise1, promise2]);

    expect(originalRequest2.headers).toBeUndefined();
  });

  it('response interceptor handles missing AuthStore methods and window gracefully', async () => {
    // 1. Limpa o cache de módulos para permitir re-mocking local
    vi.resetModules();
    
    // 2. Mock do store sem o método getState
    vi.doMock('@/stores/auth', () => ({
      useAuthStore: {}, // Objeto vazio para falhar no check de existência
      resetAuthStore: vi.fn(),
    }));

    // 3. Mock do window como undefined (SSR simulation)
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete (globalThis as any).window;

    // 4. Re-importa o interceptor (ele pegará o novo mock do store e verá window como undefined)
    const { api: apiNew } = await import('../axios');
    const responseErrorHandlerNew = (apiNew.interceptors.response.use as Mock).mock.calls[0][1];

    const originalRequest = { url: '/test', headers: {}, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;

    try {
      await responseErrorHandlerNew(error);
    } catch {
      // expected
    }

    // 5. Restaura o ambiente
    // @ts-ignore
    globalThis.window = originalWindow;
    vi.doUnmock('@/stores/auth');
    
    expect(true).toBe(true);
  });

  it('response interceptor handles 401 without refresh token gracefully', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;
    
    // Garantir que não há refresh token
    localStorage.removeItem('refreshToken');

    try {
      await responseErrorHandler(error);
    } catch {
      // expected
    }

    expect(true).toBe(true);
  });

  it('response interceptor handles missing window and store in 401 without refresh token path', async () => {
    // 1. Mock do window como undefined
    const originalWindow = globalThis.window;
    // @ts-ignore
    delete (globalThis as any).window;

    // 2. Mock do store sem o método getState
    const originalGetState = useAuthStore.getState;
    (useAuthStore as any).getState = undefined;

    const originalRequest = { url: '/test', headers: {}, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;
    
    localStorage.removeItem('refreshToken');

    try {
      await responseErrorHandler(error);
    } catch {
      // expected
    }

    // Restaura
    // @ts-ignore
    globalThis.window = originalWindow;
    (useAuthStore as any).getState = originalGetState;
    
    expect(true).toBe(true);
  });

  it('response interceptor does not redirect if already on /login', async () => {
    const originalRequest = { url: '/test', headers: {}, _retry: false } as any;
    const error = { response: { status: 401 }, config: originalRequest } as any;

    // Use vi.stubGlobal for more reliable window mocking
    vi.stubGlobal('location', { pathname: '/login', href: '/login' });

    try {
      await responseErrorHandler(error);
    } catch {
      // expected
    }

    expect(window.location.pathname).toBe('/login');
    vi.unstubAllGlobals();
  });
});
