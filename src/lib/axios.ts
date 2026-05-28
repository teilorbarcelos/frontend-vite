import { CONFIG } from '@/config/env';
import { useAuthStore } from '@/stores/auth';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: AxiosError | Error) => void }[] = [];

/**
 * Função interna para testes - não use em produção
 */
export const __resetInterceptorState = () => {
  isRefreshing = false;
  failedQueue = [];
};

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

export const api = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearSessionAndRedirect = () => {
  if (useAuthStore?.getState) {
    useAuthStore.getState().logout();
  }
  
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const handleRefreshToken = async (originalRequest: CustomAxiosRequestConfig) => {
  if (isRefreshing) {
    try {
      const newToken = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    clearSessionAndRedirect();
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    const res = await axios.post(`${CONFIG.API_URL}/v1/auth/refresh`, { refreshToken });
    const { token: newToken, refreshToken: newRefreshToken } = res.data;
    
    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    if (api.defaults && api.defaults.headers && api.defaults.headers.common) {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    
    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }
    
    processQueue(null, newToken);
    return api(originalRequest);
  } catch (refreshError) {
    const err = refreshError as AxiosError;
    console.error(`[Axios Interceptor] Refresh call failed:`, err.response?.status || err.message);
    processQueue(err, null);
    clearSessionAndRedirect();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isPublicAuthRequest = url.includes('/v1/auth/login') || 
                               url.includes('/v1/auth/password/validate') ||
                               url.includes('/v1/auth/password/change');

    if (error.response.status === 401 && !originalRequest._retry && !isPublicAuthRequest) {
      return handleRefreshToken(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
